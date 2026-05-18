/**
 * LetsFG flight search — no signup, no API key.
 *
 * LetsFG (https://github.com/LetsFG/LetsFG) runs ~140 airline scrapers locally
 * via Playwright/Chromium. We shell out to its CLI from a Node child process.
 *
 * Prerequisites (one-time):
 *   pip install letsfg
 *   python -m playwright install chromium
 *
 * Limitations: unauthenticated search returns offer summaries only —
 * price/airline/duration/stops are real, but per-segment departure/arrival
 * times require an API key (paid "unlock" flow). We synthesize plausible
 * times deterministically from the offer id so the UI has something to show.
 */

import { spawn } from "node:child_process";
import type { CabinClass, Flight, Segment, SearchQuery } from "./flights";

/** Per-search timeout — LetsFG fires ~140 connectors and can take a while. */
const TIMEOUT_MS = 90_000;

type LetsfgOffer = {
  id: string;
  price: number;
  currency: string;
  airlines: string[];
  owner_airline?: string;
  route: string;
  duration_seconds: number;
  stopovers: number;
};

type LetsfgResponse = {
  total_results: number;
  offers: LetsfgOffer[];
};

/** Spawn `npx letsfg search ...` and collect stdout. Rejects on timeout
 *  or non-zero exit. */
function runCli(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
    const child = spawn(cmd, ["--yes", "letsfg", ...args], {
      windowsHide: true,
      shell: false,
    });
    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`letsfg timed out after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);

    child.stdout.on("data", (b: Buffer) => (out += b.toString("utf8")));
    child.stderr.on("data", (b: Buffer) => (err += b.toString("utf8")));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(out);
      else reject(new Error(`letsfg exit ${code}: ${err.slice(0, 500)}`));
    });
  });
}

/** Extract the JSON object from CLI stdout — letsfg may emit progress lines
 *  before the final JSON payload. */
function parseCliJson(stdout: string): LetsfgResponse | null {
  const start = stdout.indexOf("{");
  const end = stdout.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(stdout.slice(start, end + 1)) as LetsfgResponse;
  } catch {
    return null;
  }
}

/** Tiny string-hash → 32-bit unsigned int, for deterministic time spreading. */
function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** "2026-06-15" + minute-of-day → "2026-06-15T18:30:00" (UTC-day rollover safe). */
function isoAt(date: string, minutesFromMidnight: number): string {
  const [y, mo, d] = date.split("-").map(Number);
  const h = Math.floor(minutesFromMidnight / 60) % 24;
  const m = minutesFromMidnight % 60;
  const dayOffset = Math.floor(minutesFromMidnight / 60 / 24);
  const dt = new Date(Date.UTC(y, mo - 1, d + dayOffset));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}T${pad2(h)}:${pad2(m)}:00`;
}

/** Map an /CityCode → /CityCode/ route string back to [origin, dest] codes.
 *  LetsFG renders "JFK → LAX" with an em-dash and arrow — we tolerate both. */
function parseRoute(route: string, fallback: [string, string]): [string, string] {
  const m = /^\s*([A-Z]{3})\s*[→\-—>]+\s*([A-Z]{3})\s*$/.exec(route);
  if (m) return [m[1], m[2]];
  return fallback;
}

/** Build synthetic per-leg segments. We have only total duration + stop count
 *  from LetsFG, so we split duration evenly across legs and insert ~120-min
 *  layovers; the price/airline are the load-bearing real bits. */
function synthesizeSegments(
  date: string,
  from: string,
  to: string,
  airline: string,
  totalMinutes: number,
  stops: number,
  seedKey: string,
): Segment[] {
  const rng = hash32(seedKey);
  // Departure spread across 06:00–21:00, deterministic from offer id.
  const depMin = 360 + (rng % 900);
  const layoverMin = 120;
  const legs = stops + 1;
  const flyingMinutes = Math.max(60, totalMinutes - layoverMin * stops);
  const perLeg = Math.round(flyingMinutes / legs);

  const segments: Segment[] = [];
  let cursor = depMin;
  for (let i = 0; i < legs; i++) {
    const legFrom = i === 0 ? from : `STOP${i}`;
    const legTo = i === legs - 1 ? to : `STOP${i + 1}`;
    const start = cursor;
    const end = start + perLeg;
    segments.push({
      from: legFrom,
      to: legTo,
      departure: isoAt(date, start),
      arrival: isoAt(date, end),
      duration: perLeg,
      flightNumber: `${airline}${100 + ((rng + i * 37) % 899)}`,
      aircraft: "—",
    });
    cursor = end + layoverMin;
  }
  return segments;
}

/** IATA-ish? Two- or three-letter all-caps. LetsFG mixes "B6" with "jetBlue"
 *  / "Delta Airlines" — we use the short ones as airline codes and stash the
 *  rest as the display name. */
function pickAirlineCode(value: string, fallback: string): { code: string; name?: string } {
  const trimmed = value.trim();
  if (/^[A-Z0-9]{2,3}$/.test(trimmed)) return { code: trimmed };
  // Likely a display name; keep the original code (if any) and use this for label.
  return { code: fallback, name: trimmed };
}

export async function letsfgSearchFlights(
  query: SearchQuery,
): Promise<{ flights: Omit<Flight, "id">[]; carrierNames: Record<string, string> } | null> {
  const args = ["search", query.from, query.to, query.date, "--json"];

  let stdout: string;
  try {
    stdout = await runCli(args);
  } catch (err) {
    console.error("[letsfg]", err);
    return null;
  }
  const parsed = parseCliJson(stdout);
  if (!parsed) {
    console.error("[letsfg] failed to parse stdout");
    return null;
  }

  const cabin: CabinClass = query.cabin ?? "economy";
  const passengers = Math.max(1, query.passengers ?? 1);
  const carrierNames: Record<string, string> = {};

  const flights: Omit<Flight, "id">[] = [];
  for (const offer of parsed.offers ?? []) {
    if (!offer.airlines || offer.airlines.length === 0) continue;
    if (!Number.isFinite(offer.price) || offer.price <= 0) continue;
    // Skip non-USD offers — converting fairly would need a live FX rate.
    if (offer.currency && offer.currency !== "USD") continue;

    const ownerRaw = offer.owner_airline ?? offer.airlines[0];
    const { code, name } = pickAirlineCode(ownerRaw, offer.airlines[0] ?? "??");
    if (name) carrierNames[code] = name;

    const [from, to] = parseRoute(offer.route, [query.from, query.to]);
    const totalMinutes = Math.max(60, Math.round(offer.duration_seconds / 60));
    const segments = synthesizeSegments(
      query.date,
      from,
      to,
      code,
      totalMinutes,
      offer.stopovers,
      offer.id,
    );

    flights.push({
      airline: code,
      airlineName: name,
      segments,
      totalDuration: totalMinutes,
      stops: offer.stopovers,
      price: Math.round(offer.price * passengers),
      cabin,
      baggage: { carryOnKg: 7, checkedKg: cabin === "economy" ? 0 : 23 },
      refundable: false,
    });
  }

  return { flights, carrierNames };
}
