import {
  AIRLINES,
  AIRPORTS,
  AIRLINE_LIST,
  findRoute,
  type AirlineCode,
} from "./airlines";

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
  segments: Segment[];
  /** Total minutes including layovers */
  totalDuration: number;
  stops: number;
  /** USD */
  price: number;
  cabin: CabinClass;
  baggage: { carryOnKg: number; checkedKg: number };
  refundable: boolean;
};

// --- Deterministic PRNG ----------------------------------------------------
// We need search results to be stable for a given (from, to, date) — refreshing
// the page should not shuffle prices or times. Tiny seeded LCG suffices.

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

// --- Time/duration helpers -------------------------------------------------

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

/**
 * Great-circle-ish flight time. We don't have lat/long, so approximate from
 * UTC offset difference + a base scale — wrong but plausible, which is all the
 * mock UI needs.
 */
function approxFlightMinutes(from: string, to: string): number {
  const f = AIRPORTS[from];
  const t = AIRPORTS[to];
  if (!f || !t) return 240;
  const tz = Math.abs(f.utcOffset - t.utcOffset);
  // 50 minutes per hour of timezone difference + 90 minute baseline,
  // clamped to a believable 60–960 minute range.
  return Math.max(60, Math.min(960, Math.round(90 + tz * 50)));
}

// --- Pricing ---------------------------------------------------------------

const BASE_PRICE: Record<CabinClass, number> = {
  economy: 380,
  premium: 720,
  business: 1750,
  first: 4200,
};

function priceFor(
  airline: AirlineCode,
  totalMinutes: number,
  stops: number,
  cabin: CabinClass,
  rng: () => number,
): number {
  const base = BASE_PRICE[cabin];
  // Longer flights cost more; nonstop carries a small premium; airlines vary
  // by ~10%.
  const durationMultiplier = 0.55 + totalMinutes / 700;
  const stopDiscount = stops === 0 ? 1.0 : 0.85;
  const carrierAdjust: Record<AirlineCode, number> = {
    EK: 1.05,
    EY: 1.0,
    QR: 1.08,
    TK: 0.92,
  };
  const jitter = 0.85 + rng() * 0.3;
  const price = base * durationMultiplier * stopDiscount * carrierAdjust[airline] * jitter;
  // Round to nearest $5 to look like real fares.
  return Math.round(price / 5) * 5;
}

// --- Flight construction ---------------------------------------------------

const AIRCRAFT: Record<AirlineCode, string[]> = {
  EK: ["Boeing 777-300ER", "Airbus A380-800"],
  EY: ["Boeing 787-9", "Airbus A350-1000"],
  QR: ["Boeing 777-300ER", "Airbus A350-900"],
  TK: ["Boeing 777-300ER", "Airbus A330-300", "Boeing 787-9"],
};

function flightNumber(airline: AirlineCode, rng: () => number): string {
  return `${airline}${100 + Math.floor(rng() * 899)}`;
}

function aircraftFor(airline: AirlineCode, rng: () => number): string {
  const fleet = AIRCRAFT[airline];
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
): Flight {
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
    id: `${airline}-${from}-${to}-${date}-${departureMin}-${cabin}`,
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
  via: string,
  to: string,
  date: string,
  cabin: CabinClass,
  departureMin: number,
  rng: () => number,
): Flight {
  const leg1Duration = approxFlightMinutes(from, via);
  const leg2Duration = approxFlightMinutes(via, to);
  const layoverMin = 90 + Math.floor(rng() * 180);

  const leg1End = departureMin + leg1Duration;
  const leg2Start = leg1End + layoverMin;
  const leg2End = leg2Start + leg2Duration;

  const seg1: Segment = {
    from,
    to: via,
    departure: minutesToIso(date, departureMin),
    arrival: minutesToIso(date, leg1End),
    duration: leg1Duration,
    flightNumber: flightNumber(airline, rng),
    aircraft: aircraftFor(airline, rng),
  };
  const seg2: Segment = {
    from: via,
    to,
    departure: minutesToIso(date, leg2Start),
    arrival: minutesToIso(date, leg2End),
    duration: leg2Duration,
    flightNumber: flightNumber(airline, rng),
    aircraft: aircraftFor(airline, rng),
  };

  const totalDuration = leg2End - departureMin;
  return {
    id: `${airline}-${from}-${via}-${to}-${date}-${departureMin}-${cabin}`,
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

// --- Public search API -----------------------------------------------------

export type SearchQuery = {
  from: string;
  to: string;
  date: string; // YYYY-MM-DD
  cabin?: CabinClass;
  passengers?: number;
};

export function searchFlights(query: SearchQuery): Flight[] {
  const { from, to, date } = query;
  const cabin = query.cabin ?? "economy";
  const passengers = Math.max(1, query.passengers ?? 1);

  if (from === to) return [];
  if (!(from in AIRPORTS) || !(to in AIRPORTS)) return [];

  const flights: Flight[] = [];

  for (const airline of AIRLINE_LIST) {
    const route = findRoute(airline.code, from, to);
    if (!route) continue;

    // Seed per (airline, route, date) so identical searches return identical
    // results, but each carrier/route gets its own offering.
    const seed = hashString(`${airline.code}|${from}-${to}|${date}`);
    const rng = makeRng(seed);

    if (route.type === "direct") {
      // Direct routes get two daily options.
      for (let i = 0; i < 2; i++) {
        const depMin = 360 + Math.floor(rng() * 800); // ~06:00 to ~19:20
        flights.push(buildDirect(airline.code, from, to, date, cabin, depMin, rng));
      }
    } else {
      // 1-stop via the resolved waypoint. Two options at different times.
      const depMin1 = 360 + Math.floor(rng() * 800);
      flights.push(
        buildOneStop(airline.code, from, route.via, to, date, cabin, depMin1, rng)
      );
      const depMin2 = 900 + Math.floor(rng() * 360); // ~15:00 to ~21:00
      flights.push(
        buildOneStop(airline.code, from, route.via, to, date, cabin, depMin2, rng)
      );
    }
  }

  // Apply passenger multiplier to price
  for (const f of flights) {
    f.price = f.price * passengers;
  }

  return flights;
}

export function findFlight(id: string): Flight | null {
  // Reconstruct from id: AIRLINE-FROM-(HUB-)?TO-DATE-DEPMIN-CABIN
  const parts = id.split("-");
  if (parts.length < 6) return null;

  // Dates are YYYY-MM-DD → 3 of those parts are date. Pull it out from a known
  // position by reverse-walking: last is cabin, before that is depMin, before
  // that 3 parts are date, rest is route.
  const cabin = parts[parts.length - 1] as CabinClass;
  const depMin = Number(parts[parts.length - 2]);
  const date = `${parts[parts.length - 5]}-${parts[parts.length - 4]}-${parts[parts.length - 3]}`;
  const route = parts.slice(0, parts.length - 5);
  if (route.length < 3) return null;
  const airline = route[0] as AirlineCode;
  const from = route[1];
  const to = route[route.length - 1];

  if (!Number.isFinite(depMin)) return null;
  if (!(airline in AIRLINES)) return null;

  const results = searchFlights({ from, to, date, cabin });
  return results.find((f) => f.id === id) ?? null;
}
