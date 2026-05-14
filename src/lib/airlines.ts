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

/** All four carriers fly globally — we treat every listed airport as reachable. */
export function airlineServes(airline: AirlineCode, airport: string): boolean {
  return airport in AIRPORTS;
}
