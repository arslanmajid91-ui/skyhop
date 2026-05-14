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

export type Airport = {
  code: string;
  city: string;
  country: string;
  /** UTC offset in hours (no DST handling — this is a demo) */
  utcOffset: number;
};

export const AIRPORTS: Record<string, Airport> = {
  // Hubs
  DXB: { code: "DXB", city: "Dubai", country: "UAE", utcOffset: 4 },
  AUH: { code: "AUH", city: "Abu Dhabi", country: "UAE", utcOffset: 4 },
  DOH: { code: "DOH", city: "Doha", country: "Qatar", utcOffset: 3 },
  IST: { code: "IST", city: "Istanbul", country: "Turkey", utcOffset: 3 },

  // Americas
  JFK: { code: "JFK", city: "New York", country: "USA", utcOffset: -5 },
  LAX: { code: "LAX", city: "Los Angeles", country: "USA", utcOffset: -8 },
  YYZ: { code: "YYZ", city: "Toronto", country: "Canada", utcOffset: -5 },
  GRU: { code: "GRU", city: "São Paulo", country: "Brazil", utcOffset: -3 },

  // Europe
  LHR: { code: "LHR", city: "London", country: "UK", utcOffset: 0 },
  CDG: { code: "CDG", city: "Paris", country: "France", utcOffset: 1 },
  FRA: { code: "FRA", city: "Frankfurt", country: "Germany", utcOffset: 1 },
  AMS: { code: "AMS", city: "Amsterdam", country: "Netherlands", utcOffset: 1 },
  MAD: { code: "MAD", city: "Madrid", country: "Spain", utcOffset: 1 },

  // Asia / Pacific
  BOM: { code: "BOM", city: "Mumbai", country: "India", utcOffset: 5.5 },
  DEL: { code: "DEL", city: "Delhi", country: "India", utcOffset: 5.5 },
  SIN: { code: "SIN", city: "Singapore", country: "Singapore", utcOffset: 8 },
  BKK: { code: "BKK", city: "Bangkok", country: "Thailand", utcOffset: 7 },
  HKG: { code: "HKG", city: "Hong Kong", country: "Hong Kong", utcOffset: 8 },
  NRT: { code: "NRT", city: "Tokyo", country: "Japan", utcOffset: 9 },
  SYD: { code: "SYD", city: "Sydney", country: "Australia", utcOffset: 11 },

  // Africa
  JNB: { code: "JNB", city: "Johannesburg", country: "South Africa", utcOffset: 2 },
  CAI: { code: "CAI", city: "Cairo", country: "Egypt", utcOffset: 2 },
};

export const AIRPORT_LIST: Airport[] = Object.values(AIRPORTS);

/** Geographic lat/lng for each airport (used by the real-world Mercator map). */
export const AIRPORT_LATLNG: Record<string, [lng: number, lat: number]> = {
  JFK: [-73.7781, 40.6413],
  LAX: [-118.4085, 33.9416],
  YYZ: [-79.6248, 43.6777],
  GRU: [-46.4731, -23.4356],
  LHR: [-0.4543, 51.47],
  CDG: [2.5479, 49.0097],
  FRA: [8.5622, 50.0379],
  AMS: [4.7683, 52.3105],
  MAD: [-3.5676, 40.4983],
  DXB: [55.3657, 25.2532],
  AUH: [54.6511, 24.433],
  DOH: [51.608, 25.2731],
  IST: [28.7519, 41.2753],
  CAI: [31.4056, 30.1219],
  BOM: [72.8656, 19.0896],
  DEL: [77.1, 28.5562],
  BKK: [100.7501, 13.69],
  HKG: [113.9185, 22.308],
  SIN: [103.9915, 1.3644],
  NRT: [140.3929, 35.772],
  SYD: [151.1753, -33.9399],
  JNB: [28.246, -26.1392],
};

/**
 * Hand-placed positions for each airport on the cartoon world map.
 * Coords are within a 1000 × 500 viewBox (Mercator-ish). Not geographically
 * accurate — just kid-friendly approximate.
 */
export const AIRPORT_MAP_POS: Record<string, { x: number; y: number }> = {
  // Americas
  YYZ: { x: 218, y: 142 },
  JFK: { x: 232, y: 168 },
  LAX: { x: 138, y: 198 },
  GRU: { x: 322, y: 340 },
  // Europe
  LHR: { x: 478, y: 132 },
  AMS: { x: 502, y: 130 },
  FRA: { x: 514, y: 144 },
  CDG: { x: 492, y: 150 },
  MAD: { x: 472, y: 172 },
  // Middle East
  IST: { x: 552, y: 170 },
  CAI: { x: 562, y: 218 },
  DOH: { x: 600, y: 220 },
  DXB: { x: 614, y: 215 },
  AUH: { x: 614, y: 226 },
  // Asia
  DEL: { x: 670, y: 215 },
  BOM: { x: 666, y: 240 },
  BKK: { x: 724, y: 248 },
  HKG: { x: 770, y: 232 },
  SIN: { x: 740, y: 290 },
  NRT: { x: 832, y: 198 },
  // Oceania
  SYD: { x: 858, y: 378 },
  // Africa
  JNB: { x: 568, y: 358 },
};

/** All four carriers fly globally — we treat every listed airport as reachable. */
export function airlineServes(airline: AirlineCode, airport: string): boolean {
  return airport in AIRPORTS;
}
