import {
  AIRLINES,
  AIRPORTS,
  AIRLINE_LIST,
  airlineServes,
  type AirlineCode,
} from "./airlines";
import { amadeusSearchFlights } from "./amadeus";
import { kiwiSearchFlights } from "./kiwi";
import { letsfgSearchFlights } from "./letsfg";
import { getConfig, resolveProvider } from "./config";

export type CabinClass = "economy" | "premium" | "business" | "first";

export type Segment = {
  from: string;
  to: string;
  /** ISO local-time string in the origin airport's local timezone */
  departure: string;
  arrival: string;
  /** Minutes */
  duration: number;
  flightNumber: string;
  aircraft: string;
};

export type Flight = {
  id: string;
  airline: AirlineCode;
  /** Optional display name when the carrier isn't in the curated AIRLINES table
   *  (e.g. Amadeus returns BA, AA, LH, …). Populated from the API's carrier
   *  dictionary so UIs don't have to ship a 700-airline name table. */
  airlineName?: string;
  segments: Segment[];
  /** Total minutes including layovers */
  totalDuration: number;
  stops: number;
  /** Total price in USD for all travelers in the search */
  price: number;
  cabin: CabinClass;
  baggage: { carryOnKg: number; checkedKg: number };
  refundable: boolean;
};

// --- Deterministic PRNG ----------------------------------------------------
// Mock fallback: search results must be stable for a given (from, to, date) —
// refreshing the page should not shuffle prices or times. Tiny seeded LCG.

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function minutesToIso(date: string, minutesFromMidnight: number): string {
  const h = Math.floor(minutesFromMidnight / 60) % 24;
  const dayOffset = Math.floor(minutesFromMidnight / 60 / 24);
  const m = minutesFromMidnight % 60;
  const [y, mo, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d + dayOffset));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}T${pad(h)}:${pad(m)}:00`;
}

function approxFlightMinutes(from: string, to: string): number {
  const f = AIRPORTS[from];
  const t = AIRPORTS[to];
  if (!f || !t) return 240;
  const tz = Math.abs(f.utcOffset - t.utcOffset);
  return Math.max(60, Math.min(960, Math.round(90 + tz * 50)));
}

const BASE_PRICE: Record<CabinClass, number> = {
  economy: 380,
  premium: 720,
  business: 1750,
  first: 4200,
};

const MOCK_CARRIER_ADJUST: Record<string, number> = {
  EK: 1.05,
  EY: 1.0,
  QR: 1.08,
  TK: 0.92,
};

function priceFor(
  airline: AirlineCode,
  totalMinutes: number,
  stops: number,
  cabin: CabinClass,
  rng: () => number,
): number {
  const base = BASE_PRICE[cabin];
  const durationMultiplier = 0.55 + totalMinutes / 700;
  const stopDiscount = stops === 0 ? 1.0 : 0.85;
  const carrierAdjust = MOCK_CARRIER_ADJUST[airline] ?? 1.0;
  const jitter = 0.85 + rng() * 0.3;
  const price = base * durationMultiplier * stopDiscount * carrierAdjust * jitter;
  return Math.round(price / 5) * 5;
}

const AIRCRAFT: Record<string, string[]> = {
  EK: ["Boeing 777-300ER", "Airbus A380-800"],
  EY: ["Boeing 787-9", "Airbus A350-1000"],
  QR: ["Boeing 777-300ER", "Airbus A350-900"],
  TK: ["Boeing 777-300ER", "Airbus A330-300", "Boeing 787-9"],
};

function flightNumber(airline: AirlineCode, rng: () => number): string {
  return `${airline}${100 + Math.floor(rng() * 899)}`;
}

function aircraftFor(airline: AirlineCode, rng: () => number): string {
  const fleet = AIRCRAFT[airline] ?? ["Boeing 787-9"];
  return fleet[Math.floor(rng() * fleet.length)];
}

function buildDirect(
  airline: AirlineCode,
  from: string,
  to: string,
  date: string,
  cabin: CabinClass,
  departureMin: number,
  rng: () => number,
): Omit<Flight, "id"> {
  const duration = approxFlightMinutes(from, to);
  const segment: Segment = {
    from,
    to,
    departure: minutesToIso(date, departureMin),
    arrival: minutesToIso(date, departureMin + duration),
    duration,
    flightNumber: flightNumber(airline, rng),
    aircraft: aircraftFor(airline, rng),
  };
  return {
    airline,
    segments: [segment],
    totalDuration: duration,
    stops: 0,
    price: priceFor(airline, duration, 0, cabin, rng),
    cabin,
    baggage: { carryOnKg: 7, checkedKg: cabin === "economy" ? 30 : 40 },
    refundable: cabin !== "economy",
  };
}

function buildOneStop(
  airline: AirlineCode,
  from: string,
  to: string,
  date: string,
  cabin: CabinClass,
  departureMin: number,
  rng: () => number,
): Omit<Flight, "id"> {
  const hub = AIRLINES[airline]?.hub ?? "DXB";
  const leg1Duration = approxFlightMinutes(from, hub);
  const leg2Duration = approxFlightMinutes(hub, to);
  const layoverMin = 90 + Math.floor(rng() * 180);

  const leg1End = departureMin + leg1Duration;
  const leg2Start = leg1End + layoverMin;
  const leg2End = leg2Start + leg2Duration;

  const seg1: Segment = {
    from,
    to: hub,
    departure: minutesToIso(date, departureMin),
    arrival: minutesToIso(date, leg1End),
    duration: leg1Duration,
    flightNumber: flightNumber(airline, rng),
    aircraft: aircraftFor(airline, rng),
  };
  const seg2: Segment = {
    from: hub,
    to,
    departure: minutesToIso(date, leg2Start),
    arrival: minutesToIso(date, leg2End),
    duration: leg2Duration,
    flightNumber: flightNumber(airline, rng),
    aircraft: aircraftFor(airline, rng),
  };

  const totalDuration = leg2End - departureMin;
  return {
    airline,
    segments: [seg1, seg2],
    totalDuration,
    stops: 1,
    price: priceFor(airline, totalDuration, 1, cabin, rng),
    cabin,
    baggage: { carryOnKg: 7, checkedKg: cabin === "economy" ? 30 : 40 },
    refundable: cabin !== "economy",
  };
}

// --- Mock generator (fallback when no Amadeus creds) ----------------------

function mockSearchFlights(query: SearchQuery): Omit<Flight, "id">[] {
  const { from, to, date } = query;
  const cabin = query.cabin ?? "economy";
  const passengers = Math.max(1, query.passengers ?? 1);

  if (from === to) return [];
  if (!(from in AIRPORTS) || !(to in AIRPORTS)) return [];

  const flights: Omit<Flight, "id">[] = [];

  for (const airline of AIRLINE_LIST) {
    if (!airlineServes(airline.code, from) || !airlineServes(airline.code, to)) {
      continue;
    }
    const hub = airline.hub!;
    const isDirectRoute = from === hub || to === hub;

    const seed = hashString(`${airline.code}|${from}-${to}|${date}`);
    const rng = makeRng(seed);

    const offerings = isDirectRoute ? 2 : 1;
    for (let i = 0; i < offerings; i++) {
      const depMin = 360 + Math.floor(rng() * 800);
      if (isDirectRoute) {
        flights.push(buildDirect(airline.code, from, to, date, cabin, depMin, rng));
      } else {
        flights.push(buildOneStop(airline.code, from, to, date, cabin, depMin, rng));
      }
    }

    if (!isDirectRoute) {
      const depMin = 900 + Math.floor(rng() * 360);
      flights.push(buildOneStop(airline.code, from, to, date, cabin, depMin, rng));
    }
  }

  for (const f of flights) f.price = f.price * passengers;
  return flights;
}

// --- ID encoding ----------------------------------------------------------
// We encode the whole flight payload into the URL slug so the detail and
// booking pages can decode it without re-querying Amadeus (offers from the
// search endpoint aren't individually re-fetchable, and each search returns
// fresh opaque IDs). Compact JSON → base64url.

function toBase64Url(s: string): string {
  // Server-only (Node) — Buffer is fine here; pages calling this are RSCs.
  return Buffer.from(s, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(s: string): string | null {
  try {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64").toString("utf8");
  } catch {
    return null;
  }
}

/** Round-trip: take a flight payload (everything but the id), serialize it,
 *  and produce a URL-safe slug. */
function encodeFlight(f: Omit<Flight, "id">): string {
  return toBase64Url(JSON.stringify(f));
}

function withId(f: Omit<Flight, "id">): Flight {
  return { ...f, id: encodeFlight(f) };
}

// --- Public search API ----------------------------------------------------

export type SearchQuery = {
  from: string;
  to: string;
  date: string; // YYYY-MM-DD
  cabin?: CabinClass;
  passengers?: number;
};

export async function searchFlights(query: SearchQuery): Promise<Flight[]> {
  const cfg = await getConfig();
  const provider = resolveProvider(cfg);

  if (provider === "amadeus") {
    const result = await amadeusSearchFlights(query, cfg.amadeus);
    if (result && result.flights.length > 0) return result.flights.map(withId);
    // Fall through to mock when the test environment has no coverage for the
    // requested route/date — better to show *something* than a blank page.
  } else if (provider === "kiwi") {
    const result = await kiwiSearchFlights(query, cfg.kiwi.apiKey);
    if (result && result.flights.length > 0) return result.flights.map(withId);
  } else if (provider === "letsfg") {
    const result = await letsfgSearchFlights(query);
    if (result && result.flights.length > 0) return result.flights.map(withId);
  }
  return mockSearchFlights(query).map(withId);
}

export function findFlight(id: string): Flight | null {
  const json = fromBase64Url(id);
  if (!json) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const f = parsed as Partial<Flight>;
  if (
    typeof f.airline !== "string" ||
    !Array.isArray(f.segments) ||
    f.segments.length === 0 ||
    typeof f.price !== "number" ||
    typeof f.totalDuration !== "number" ||
    typeof f.stops !== "number" ||
    typeof f.cabin !== "string"
  ) {
    return null;
  }
  return { ...(f as Omit<Flight, "id">), id };
}
