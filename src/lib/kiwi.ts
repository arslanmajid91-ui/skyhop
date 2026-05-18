/**
 * Kiwi Tequila flight search — minimal client.
 *
 * Sign up at https://tequila.kiwi.com/portal/login/registration to get a
 * Tequila Solution + API key (free tier available). Paste the key on the
 * /settings page or set KIWI_API_KEY in .env.local.
 *
 * Endpoint: https://tequila-api.kiwi.com/v2/search
 * Auth: `apikey` request header.
 */

import type { CabinClass, Flight, Segment, SearchQuery } from "./flights";

const ENDPOINT = "https://tequila-api.kiwi.com/v2/search";

type KiwiRouteSeg = {
  flyFrom: string;
  flyTo: string;
  /** ISO datetime in UTC; we strip the trailing Z to match our local-string convention. */
  local_departure: string;
  local_arrival: string;
  airline: string;
  flight_no: number | string;
  equipment?: string | null;
  /** Duration not given per-segment; we compute from arrival - departure. */
};

type KiwiOffer = {
  id: string;
  price: number;
  airlines: string[];
  flyFrom: string;
  flyTo: string;
  local_departure: string;
  local_arrival: string;
  /** Total trip duration including layovers, in seconds. */
  duration?: { total?: number; departure?: number };
  route: KiwiRouteSeg[];
};

type KiwiResponse = {
  data: KiwiOffer[];
  currency?: string;
};

const CABIN_TO_KIWI: Record<CabinClass, "M" | "W" | "C" | "F"> = {
  economy: "M",
  premium: "W",
  business: "C",
  first: "F",
};

/** "YYYY-MM-DD" → "DD/MM/YYYY" (Tequila's required format). */
function toKiwiDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Drop trailing "Z" so the string matches our "local at airport" convention
 *  used by mock + Amadeus. Kiwi returns the local clock time but tags it Z. */
function stripZ(iso: string): string {
  return iso.endsWith("Z") ? iso.slice(0, -1) : iso;
}

function minutesBetween(start: string, end: string): number {
  const a = Date.parse(start.endsWith("Z") ? start : start + "Z");
  const b = Date.parse(end.endsWith("Z") ? end : end + "Z");
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 60000));
}

export async function kiwiSearchFlights(
  query: SearchQuery,
  apiKey: string,
): Promise<{ flights: Omit<Flight, "id">[]; carrierNames: Record<string, string> } | null> {
  if (!apiKey) return null;

  const cabin = query.cabin ?? "economy";
  const adults = Math.max(1, query.passengers ?? 1);

  const url = new URL(ENDPOINT);
  url.searchParams.set("fly_from", query.from);
  url.searchParams.set("fly_to", query.to);
  url.searchParams.set("date_from", toKiwiDate(query.date));
  url.searchParams.set("date_to", toKiwiDate(query.date));
  url.searchParams.set("adults", String(adults));
  url.searchParams.set("selected_cabins", CABIN_TO_KIWI[cabin]);
  url.searchParams.set("curr", "USD");
  url.searchParams.set("limit", "20");
  url.searchParams.set("flight_type", "oneway");
  url.searchParams.set("sort", "price");

  const res = await fetch(url.toString(), {
    headers: { apikey: apiKey, accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[kiwi] search ${res.status}: ${text.slice(0, 300)}`);
    return null;
  }
  const json = (await res.json()) as KiwiResponse;

  const flights: Omit<Flight, "id">[] = [];
  for (const offer of json.data ?? []) {
    if (!offer.route || offer.route.length === 0) continue;

    const segments: Segment[] = offer.route.map((r) => {
      const dep = stripZ(r.local_departure);
      const arr = stripZ(r.local_arrival);
      return {
        from: r.flyFrom,
        to: r.flyTo,
        departure: dep,
        arrival: arr,
        duration: minutesBetween(r.local_departure, r.local_arrival),
        flightNumber: `${r.airline}${r.flight_no}`,
        aircraft: r.equipment || "—",
      };
    });

    const totalSec = offer.duration?.total ?? 0;
    const totalDuration =
      totalSec > 0
        ? Math.round(totalSec / 60)
        : minutesBetween(offer.local_departure, offer.local_arrival);

    const marketing = offer.route[0].airline;
    flights.push({
      airline: marketing,
      segments,
      totalDuration,
      stops: segments.length - 1,
      // Kiwi prices are already total for the trip in the requested currency,
      // for the requested adult count.
      price: Math.round(offer.price),
      cabin,
      baggage: { carryOnKg: 7, checkedKg: cabin === "economy" ? 0 : 23 },
      refundable: false,
    });
  }

  return { flights, carrierNames: {} };
}
