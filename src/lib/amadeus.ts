/**
 * Amadeus Self-Service flight offers — minimal client.
 *
 * Sign up at https://developers.amadeus.com → create a "Self-Service" app to
 * get an API key + secret. Put them in `.env.local` as:
 *
 *   AMADEUS_CLIENT_ID=...
 *   AMADEUS_CLIENT_SECRET=...
 *
 * The test environment (test.api.amadeus.com) returns live GDS offers but
 * with a smaller route catalog and quotas. To switch to production, set
 * AMADEUS_HOSTNAME=api.amadeus.com.
 */

import type { CabinClass, Flight, Segment, SearchQuery } from "./flights";

// Type-only import keeps this side of a circular dependency safe — flights.ts
// imports the search function from this module, and we only need its types.

const HOST = process.env.AMADEUS_HOSTNAME ?? "test.api.amadeus.com";

export type AmadeusCreds = { clientId: string; clientSecret: string };

// ─── OAuth token (cached in-process per credential pair) ───────────────────
// Amadeus tokens live ~30 min. Cache and refresh ~1 min before expiry so a
// burst of concurrent searches doesn't fan out N token requests. Key the
// cache on credentials so a settings-page swap invalidates cleanly.

const tokenCache = new Map<string, { token: string; expiresAt: number }>();
const inflight = new Map<string, Promise<string>>();

async function fetchToken(creds: AmadeusCreds): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
  });
  const res = await fetch(`https://${HOST}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Amadeus token failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache.set(creds.clientId, {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  });
  return json.access_token;
}

async function getToken(creds: AmadeusCreds): Promise<string> {
  const cached = tokenCache.get(creds.clientId);
  if (cached && cached.expiresAt > Date.now()) return cached.token;
  const pending = inflight.get(creds.clientId);
  if (pending) return pending;
  const p = fetchToken(creds).finally(() => inflight.delete(creds.clientId));
  inflight.set(creds.clientId, p);
  return p;
}

// ─── Response types (only the fields we read) ──────────────────────────────

type AmadeusSegment = {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  aircraft?: { code: string };
  duration: string;
  operating?: { carrierCode: string };
};

type AmadeusItinerary = {
  duration: string;
  segments: AmadeusSegment[];
};

type AmadeusOffer = {
  id: string;
  itineraries: AmadeusItinerary[];
  price: { total: string; currency: string };
  travelerPricings: Array<{
    fareDetailsBySegment: Array<{
      cabin: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
      includedCheckedBags?: { quantity?: number; weight?: number; weightUnit?: string };
    }>;
  }>;
  numberOfBookableSeats?: number;
  validatingAirlineCodes?: string[];
};

type AmadeusResponse = {
  data: AmadeusOffer[];
  dictionaries?: {
    carriers?: Record<string, string>;
    aircraft?: Record<string, string>;
    currencies?: Record<string, string>;
    locations?: Record<string, { cityCode?: string; countryCode?: string }>;
  };
};

// ─── Parsing helpers ───────────────────────────────────────────────────────

/** "PT11H30M" → 690 minutes. Handles PT#H, PT#M, PT#H#M; days unsupported (no
 *  commercial flight is >24h door-to-door anyway). */
function parseIsoDuration(s: string): number {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?$/.exec(s);
  if (!m) return 0;
  const h = m[1] ? Number(m[1]) : 0;
  const min = m[2] ? Number(m[2]) : 0;
  return h * 60 + min;
}

const CABIN_FROM_AMADEUS: Record<string, CabinClass> = {
  ECONOMY: "economy",
  PREMIUM_ECONOMY: "premium",
  BUSINESS: "business",
  FIRST: "first",
};

const CABIN_TO_AMADEUS: Record<CabinClass, string> = {
  economy: "ECONOMY",
  premium: "PREMIUM_ECONOMY",
  business: "BUSINESS",
  first: "FIRST",
};

// ─── Search ────────────────────────────────────────────────────────────────

/** Returns mapped Flight[]. Caller is responsible for falling back to mock
 *  data when this returns null (no creds) or empty (no offers / API error). */
export async function amadeusSearchFlights(
  query: SearchQuery,
  creds: AmadeusCreds,
): Promise<{ flights: Omit<Flight, "id">[]; carrierNames: Record<string, string> } | null> {
  if (!creds.clientId || !creds.clientSecret) return null;

  const cabin = query.cabin ?? "economy";
  const adults = Math.max(1, query.passengers ?? 1);

  const url = new URL(`https://${HOST}/v2/shopping/flight-offers`);
  url.searchParams.set("originLocationCode", query.from);
  url.searchParams.set("destinationLocationCode", query.to);
  url.searchParams.set("departureDate", query.date);
  url.searchParams.set("adults", String(adults));
  url.searchParams.set("travelClass", CABIN_TO_AMADEUS[cabin]);
  url.searchParams.set("currencyCode", "USD");
  url.searchParams.set("max", "20");
  url.searchParams.set("nonStop", "false");

  let token: string;
  try {
    token = await getToken(creds);
  } catch (err) {
    console.error("[amadeus] token error", err);
    return null;
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[amadeus] search ${res.status}: ${text.slice(0, 300)}`);
    return null;
  }
  const json = (await res.json()) as AmadeusResponse;
  const carriers = json.dictionaries?.carriers ?? {};
  const aircraft = json.dictionaries?.aircraft ?? {};

  const flights: Omit<Flight, "id">[] = [];
  for (const offer of json.data ?? []) {
    // Outbound only — round-trip support would be a separate UI flow.
    const itin = offer.itineraries[0];
    if (!itin || itin.segments.length === 0) continue;

    const segments: Segment[] = itin.segments.map((s) => ({
      from: s.departure.iataCode,
      to: s.arrival.iataCode,
      departure: s.departure.at,
      arrival: s.arrival.at,
      duration: parseIsoDuration(s.duration),
      flightNumber: `${s.carrierCode}${s.number}`,
      aircraft: s.aircraft?.code ? (aircraft[s.aircraft.code] ?? s.aircraft.code) : "—",
    }));

    const marketingCarrier = itin.segments[0].carrierCode;
    const totalDuration = parseIsoDuration(itin.duration);
    const stops = segments.length - 1;
    const priceNum = Number(offer.price.total);
    if (!Number.isFinite(priceNum)) continue;
    const cabinFromOffer =
      CABIN_FROM_AMADEUS[
        offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ?? "ECONOMY"
      ] ?? cabin;
    const bag = offer.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags;
    const checkedKg =
      bag?.weight && bag?.weightUnit === "KG"
        ? bag.weight
        : bag?.quantity && bag.quantity > 0
          ? 23 * bag.quantity
          : cabinFromOffer === "economy"
            ? 0
            : 32;

    flights.push({
      airline: marketingCarrier,
      segments,
      totalDuration: totalDuration > 0 ? totalDuration : segments.reduce((n, s) => n + s.duration, 0),
      stops,
      // price.total in Amadeus is already for `adults` travelers (per the docs).
      price: priceNum,
      cabin: cabinFromOffer,
      baggage: { carryOnKg: 7, checkedKg },
      refundable: false,
      airlineName: carriers[marketingCarrier],
    });
  }

  return { flights, carrierNames: carriers };
}
