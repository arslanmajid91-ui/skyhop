import { AIRPORTS_GENERATED, AIRPORT_LATLNG_GENERATED, AIRPORT_ROUTE_COUNT_GENERATED } from "./airports.generated";

/** Per-airport route count (src+dst across all airlines in OpenFlights).
 *  Proxy for "busyness" — used to pick representative cities in cluster labels. */
export const AIRPORT_ROUTE_COUNT: Record<string, number> = AIRPORT_ROUTE_COUNT_GENERATED;

export type AirlineCode = "EK" | "EY" | "QR" | "TK";

export type Airline = {
  code: AirlineCode;
  name: string;
  hub: string;
  /** Brand accent color (Tailwind-friendly hex) */
  color: string;
  /** Public airline logo CDN */
  logoUrl: string;
};

const logo = (iata: AirlineCode) =>
  `https://images.kiwi.com/airlines/64x64/${iata}.png`;

export const AIRLINES: Record<AirlineCode, Airline> = {
  EK: { code: "EK", name: "Emirates",         hub: "DXB", color: "#d71921", logoUrl: logo("EK") },
  EY: { code: "EY", name: "Etihad Airways",   hub: "AUH", color: "#bd8b41", logoUrl: logo("EY") },
  QR: { code: "QR", name: "Qatar Airways",    hub: "DOH", color: "#5c0a32", logoUrl: logo("QR") },
  TK: { code: "TK", name: "Turkish Airlines", hub: "IST", color: "#c70a0c", logoUrl: logo("TK") },
};

export const AIRLINE_LIST: Airline[] = Object.values(AIRLINES);

/**
 * Each carrier's actual network — the cities they fly to from their hub.
 * Hand-curated for plausibility against our 150-airport catalog. A carrier
 * only offers a flight on a route when BOTH endpoints are in its set.
 * Real-world coverage as of recent timetables: TK has the largest network
 * (~340 dest), QR ~170, EK ~150, EY ~70.
 */
const EK_SERVES = new Set<string>([
  // Hub
  "DXB",
  // Americas
  "JFK","EWR","BOS","IAD","ORD","IAH","DFW","LAX","SFO","SEA","MIA","MCO","YYZ","MEX","GRU","EZE","SCL",
  // Europe
  "LHR","LGW","MAN","EDI","DUB","CDG","NCE","AMS","BRU","FRA","MUC","DUS","ZRH","GVA","VIE","MAD","BCN","LIS","FCO","MXP","ATH","CPH","ARN","OSL","HEL","WAW","PRG","BUD","IST","SVO","KBP",
  // Middle East / Africa
  "AUH","DOH","JED","RUH","MCT","KWI","BAH","AMM","BEY","TLV","IKA","CAI","CMN","TUN","JNB","CPT","ADD","NBO","LOS","ABV","DKR","ACC","LAD","DAR","KGL","HRE",
  // South / SE / East Asia
  "BOM","DEL","MAA","BLR","HYD","COK","CCU","KHI","ISB","LHE","CMB","MLE","KTM","DAC","BKK","HKT","KUL","SIN","MNL","CGK","DPS","HKG","TPE","ICN","NRT","HND","KIX","PEK","PVG","CAN","HAN","SGN","RGN","PNH",
  // Oceania
  "SYD","MEL","BNE","PER","AKL","CHC",
]);

const EY_SERVES = new Set<string>([
  // Hub
  "AUH",
  // Americas
  "JFK","EWR","IAD","ORD","YYZ",
  // Europe
  "LHR","MAN","DUB","CDG","AMS","BRU","FRA","MUC","DUS","ZRH","VIE","MAD","BCN","FCO","MXP","ATH","IST",
  // Middle East / Africa
  "DXB","DOH","JED","RUH","MCT","KWI","BAH","AMM","BEY","TLV","IKA","CAI","JNB","ADD","NBO",
  // South / SE / East Asia
  "BOM","DEL","MAA","BLR","HYD","COK","CCU","KHI","ISB","LHE","CMB","MLE","KTM","DAC","BKK","KUL","SIN","MNL","CGK","HKG","ICN","NRT","KIX","PEK","PVG","HAN","SGN",
  // Oceania
  "SYD","MEL","BNE","AKL",
]);

const QR_SERVES = new Set<string>([
  // Hub
  "DOH",
  // Americas
  "JFK","EWR","BOS","IAD","ORD","IAH","DFW","LAX","SFO","SEA","MIA","YYZ","YUL","MEX","GRU","EZE","SCL",
  // Europe
  "LHR","LGW","MAN","EDI","DUB","CDG","NCE","AMS","BRU","FRA","MUC","DUS","BER","ZRH","GVA","VIE","MAD","BCN","LIS","FCO","MXP","VCE","ATH","CPH","ARN","OSL","HEL","WAW","PRG","BUD","OTP","SOF","BEG","IST","SAW","KBP",
  // Middle East / Africa
  "DXB","AUH","JED","RUH","MCT","KWI","BAH","AMM","BEY","TLV","IKA","EVN","TBS","CAI","CMN","RAK","TUN","ALG","JNB","CPT","ADD","NBO","LOS","ABV","ACC","DKR","DAR","KGL","LAD","HRE",
  // South / SE / East Asia
  "BOM","DEL","MAA","BLR","HYD","COK","CCU","KHI","ISB","LHE","CMB","MLE","KTM","DAC","BKK","HKT","KUL","SIN","MNL","CGK","DPS","HKG","TPE","ICN","NRT","HND","KIX","PEK","PVG","CAN","SZX","CTU","HAN","SGN","RGN","PNH",
  // Oceania
  "SYD","MEL","BNE","PER","AKL",
]);

const TK_SERVES = new Set<string>([
  // Hub + secondary
  "IST","SAW",
  // Americas (TK has the broadest US/CA network of the four)
  "JFK","EWR","BOS","IAD","ATL","ORD","IAH","DFW","LAX","SFO","SEA","MIA","MCO","DEN","LAS","PHL","DTW","MSP","YYZ","YUL","YVR","MEX","CUN","HAV","PTY","BOG","LIM","CCS","UIO","GRU","GIG","EZE","SCL","MVD",
  // Europe (TK serves almost every European capital)
  "LHR","LGW","MAN","EDI","DUB","CDG","NCE","AMS","BRU","FRA","MUC","DUS","BER","ZRH","GVA","VIE","MAD","BCN","LIS","FCO","MXP","VCE","ATH","CPH","ARN","OSL","HEL","KEF","WAW","PRG","BUD","OTP","SOF","BEG","RIX","TLL","SVO","LED","KBP",
  // Middle East / Africa
  "DXB","AUH","DOH","JED","RUH","MCT","KWI","BAH","AMM","BEY","TLV","BGW","IKA","EVN","TBS","GYD","CAI","CMN","RAK","TUN","ALG","JNB","CPT","ADD","NBO","LOS","ABV","ACC","DKR","DAR","KGL","LAD","HRE",
  // South / SE / East Asia (TK's network spans every major Asian hub)
  "BOM","DEL","MAA","BLR","HYD","COK","CCU","KHI","ISB","LHE","CMB","MLE","KTM","DAC","BKK","HKT","KUL","SIN","MNL","CGK","DPS","HKG","TPE","ICN","NRT","HND","KIX","PEK","PKX","PVG","CAN","SZX","CTU","HAN","SGN","RGN","PNH",
  // Central Asia (TK is the dominant carrier here)
  "TAS","ALA","NQZ","ULN",
  // Oceania
  "SYD","MEL",
]);

const SERVES_BY_AIRLINE: Record<AirlineCode, Set<string>> = {
  EK: EK_SERVES,
  EY: EY_SERVES,
  QR: QR_SERVES,
  TK: TK_SERVES,
};

export type Airport = {
  code: string;
  city: string;
  country: string;
  /** UTC offset in hours (no DST handling — this is a demo) */
  utcOffset: number;
};

/**
 * ~1,700 international airports — sourced from OpenFlights airports.dat
 * (CC-BY-SA 3.0), filtered to entries that have a real IATA code and are
 * referenced by ≥8 routes in OpenFlights routes.dat (i.e. actual airline
 * service, not a regional airstrip). Three post-2014 airports (BER, PKX,
 * NQZ) are manually merged in because they post-date the snapshot.
 *
 * See scripts/build-airports.mjs.
 */
export const AIRPORTS: Record<string, Airport> = AIRPORTS_GENERATED;
export const AIRPORT_LIST: Airport[] = Object.values(AIRPORTS);

/** Geographic lat/lng for each airport (used by the real-world Mercator map). */
export const AIRPORT_LATLNG: Record<string, [number, number]> = AIRPORT_LATLNG_GENERATED;

// ─── Top countries by airport count, for the map's quick-jump chips ────────

/** OpenFlights uses full country names; map them to 2-letter ISO codes
 *  for the emoji-flag formula. Only entries we display need to be here. */
export const COUNTRY_META: Record<string, { iso: string; display: string }> = {
  "United States": { iso: "US", display: "USA" },
  "China": { iso: "CN", display: "China" },
  "Canada": { iso: "CA", display: "Canada" },
  "Russia": { iso: "RU", display: "Russia" },
  "Brazil": { iso: "BR", display: "Brazil" },
  "India": { iso: "IN", display: "India" },
  "Mexico": { iso: "MX", display: "Mexico" },
  "Indonesia": { iso: "ID", display: "Indonesia" },
  "France": { iso: "FR", display: "France" },
  "Japan": { iso: "JP", display: "Japan" },
  "Australia": { iso: "AU", display: "Australia" },
  "United Kingdom": { iso: "GB", display: "UK" },
  "Italy": { iso: "IT", display: "Italy" },
  "Spain": { iso: "ES", display: "Spain" },
  "Germany": { iso: "DE", display: "Germany" },
  "Norway": { iso: "NO", display: "Norway" },
  "Greece": { iso: "GR", display: "Greece" },
  "Turkey": { iso: "TR", display: "Turkey" },
  "Iran": { iso: "IR", display: "Iran" },
  "Malaysia": { iso: "MY", display: "Malaysia" },
  "Philippines": { iso: "PH", display: "Philippines" },
  "Sweden": { iso: "SE", display: "Sweden" },
  "Colombia": { iso: "CO", display: "Colombia" },
  "Argentina": { iso: "AR", display: "Argentina" },
  "Papua New Guinea": { iso: "PG", display: "PNG" },
};

function isoToFlag(iso: string): string {
  return iso
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

export type CountryChip = {
  country: string;
  display: string;
  flag: string;
  lng: number;
  lat: number;
  k: number;
  airportCount: number;
};

/** Top 20 countries by airport count in the catalog, with centroid + a
 *  zoom level derived from the airports' bounding-box span. */
export const TOP_COUNTRIES: CountryChip[] = (() => {
  type Acc = { count: number; sumLng: number; sumLat: number; minLng: number; maxLng: number; minLat: number; maxLat: number };
  const byCountry = new Map<string, Acc>();
  for (const code in AIRPORTS) {
    const country = AIRPORTS[code].country;
    const ll = AIRPORT_LATLNG[code];
    if (!ll) continue;
    const [lng, lat] = ll;
    let a = byCountry.get(country);
    if (!a) {
      a = { count: 0, sumLng: 0, sumLat: 0, minLng: lng, maxLng: lng, minLat: lat, maxLat: lat };
      byCountry.set(country, a);
    }
    a.count++;
    a.sumLng += lng;
    a.sumLat += lat;
    if (lng < a.minLng) a.minLng = lng;
    if (lng > a.maxLng) a.maxLng = lng;
    if (lat < a.minLat) a.minLat = lat;
    if (lat > a.maxLat) a.maxLat = lat;
  }
  const out: CountryChip[] = [];
  for (const [country, a] of byCountry) {
    const meta = COUNTRY_META[country];
    if (!meta) continue;
    const lngSpan = a.maxLng - a.minLng;
    const latSpan = a.maxLat - a.minLat;
    // Derive zoom from the larger axis; clamped to a sane on-map range.
    const span = Math.max(lngSpan, latSpan * 1.6);
    const k = Math.max(2.2, Math.min(7, 65 / Math.max(span, 5)));
    out.push({
      country,
      display: meta.display,
      flag: isoToFlag(meta.iso),
      lng: a.sumLng / a.count,
      lat: a.sumLat / a.count,
      k: Number(k.toFixed(2)),
      airportCount: a.count,
    });
  }
  out.sort((x, y) => y.airportCount - x.airportCount);
  return out.slice(0, 20);
})();

/**
 * True if `airline` actually flies to `airport` (per the hand-curated served
 * sets above). Used by the flight generator to decide whether each carrier
 * can offer a route — when a carrier serves neither endpoint, it offers
 * nothing on that search.
 */
export function airlineServes(airline: AirlineCode, airport: string): boolean {
  if (!(airport in AIRPORTS)) return false;
  return SERVES_BY_AIRLINE[airline].has(airport);
}

/** List of all carriers that serve a given airport. Useful for UI hints. */
export function carriersForAirport(airport: string): AirlineCode[] {
  return AIRLINE_LIST
    .filter((a) => SERVES_BY_AIRLINE[a.code].has(airport))
    .map((a) => a.code);
}
