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
 * ~150 major international airports. Originally 22 hand-picked hubs; expanded
 * for the real-world Mercator map. The cartoon map only renders airports that
 * also appear in AIRPORT_MAP_POS, so adding entries here is safe.
 */
export const AIRPORTS: Record<string, Airport> = {
  // --- Carrier hubs ---------------------------------------------------------
  DXB: { code: "DXB", city: "Dubai",        country: "UAE",    utcOffset: 4 },
  AUH: { code: "AUH", city: "Abu Dhabi",    country: "UAE",    utcOffset: 4 },
  DOH: { code: "DOH", city: "Doha",         country: "Qatar",  utcOffset: 3 },
  IST: { code: "IST", city: "Istanbul",     country: "Turkey", utcOffset: 3 },

  // --- North America --------------------------------------------------------
  JFK: { code: "JFK", city: "New York",        country: "USA",    utcOffset: -5 },
  EWR: { code: "EWR", city: "Newark",          country: "USA",    utcOffset: -5 },
  LAX: { code: "LAX", city: "Los Angeles",     country: "USA",    utcOffset: -8 },
  SFO: { code: "SFO", city: "San Francisco",   country: "USA",    utcOffset: -8 },
  SEA: { code: "SEA", city: "Seattle",         country: "USA",    utcOffset: -8 },
  ORD: { code: "ORD", city: "Chicago",         country: "USA",    utcOffset: -6 },
  DFW: { code: "DFW", city: "Dallas",          country: "USA",    utcOffset: -6 },
  IAH: { code: "IAH", city: "Houston",         country: "USA",    utcOffset: -6 },
  ATL: { code: "ATL", city: "Atlanta",         country: "USA",    utcOffset: -5 },
  MIA: { code: "MIA", city: "Miami",           country: "USA",    utcOffset: -5 },
  MCO: { code: "MCO", city: "Orlando",         country: "USA",    utcOffset: -5 },
  BOS: { code: "BOS", city: "Boston",          country: "USA",    utcOffset: -5 },
  IAD: { code: "IAD", city: "Washington",      country: "USA",    utcOffset: -5 },
  PHL: { code: "PHL", city: "Philadelphia",    country: "USA",    utcOffset: -5 },
  DEN: { code: "DEN", city: "Denver",          country: "USA",    utcOffset: -7 },
  LAS: { code: "LAS", city: "Las Vegas",       country: "USA",    utcOffset: -8 },
  PHX: { code: "PHX", city: "Phoenix",         country: "USA",    utcOffset: -7 },
  MSP: { code: "MSP", city: "Minneapolis",     country: "USA",    utcOffset: -6 },
  DTW: { code: "DTW", city: "Detroit",         country: "USA",    utcOffset: -5 },
  HNL: { code: "HNL", city: "Honolulu",        country: "USA",    utcOffset: -10 },
  YYZ: { code: "YYZ", city: "Toronto",         country: "Canada", utcOffset: -5 },
  YVR: { code: "YVR", city: "Vancouver",       country: "Canada", utcOffset: -8 },
  YUL: { code: "YUL", city: "Montreal",        country: "Canada", utcOffset: -5 },
  YYC: { code: "YYC", city: "Calgary",         country: "Canada", utcOffset: -7 },
  MEX: { code: "MEX", city: "Mexico City",     country: "Mexico", utcOffset: -6 },
  CUN: { code: "CUN", city: "Cancún",          country: "Mexico", utcOffset: -5 },
  HAV: { code: "HAV", city: "Havana",          country: "Cuba",   utcOffset: -5 },

  // --- Central / South America ---------------------------------------------
  PTY: { code: "PTY", city: "Panama City",     country: "Panama",     utcOffset: -5 },
  SJO: { code: "SJO", city: "San José",        country: "Costa Rica", utcOffset: -6 },
  BOG: { code: "BOG", city: "Bogotá",          country: "Colombia",   utcOffset: -5 },
  UIO: { code: "UIO", city: "Quito",           country: "Ecuador",    utcOffset: -5 },
  LIM: { code: "LIM", city: "Lima",            country: "Peru",       utcOffset: -5 },
  CCS: { code: "CCS", city: "Caracas",         country: "Venezuela",  utcOffset: -4 },
  GRU: { code: "GRU", city: "São Paulo",       country: "Brazil",     utcOffset: -3 },
  GIG: { code: "GIG", city: "Rio de Janeiro",  country: "Brazil",     utcOffset: -3 },
  EZE: { code: "EZE", city: "Buenos Aires",    country: "Argentina",  utcOffset: -3 },
  SCL: { code: "SCL", city: "Santiago",        country: "Chile",      utcOffset: -4 },
  MVD: { code: "MVD", city: "Montevideo",      country: "Uruguay",    utcOffset: -3 },

  // --- Europe ---------------------------------------------------------------
  LHR: { code: "LHR", city: "London",           country: "UK",          utcOffset: 0 },
  LGW: { code: "LGW", city: "London Gatwick",   country: "UK",          utcOffset: 0 },
  MAN: { code: "MAN", city: "Manchester",       country: "UK",          utcOffset: 0 },
  EDI: { code: "EDI", city: "Edinburgh",        country: "UK",          utcOffset: 0 },
  DUB: { code: "DUB", city: "Dublin",           country: "Ireland",     utcOffset: 0 },
  CDG: { code: "CDG", city: "Paris",            country: "France",      utcOffset: 1 },
  NCE: { code: "NCE", city: "Nice",             country: "France",      utcOffset: 1 },
  AMS: { code: "AMS", city: "Amsterdam",        country: "Netherlands", utcOffset: 1 },
  BRU: { code: "BRU", city: "Brussels",         country: "Belgium",     utcOffset: 1 },
  FRA: { code: "FRA", city: "Frankfurt",        country: "Germany",     utcOffset: 1 },
  MUC: { code: "MUC", city: "Munich",           country: "Germany",     utcOffset: 1 },
  BER: { code: "BER", city: "Berlin",           country: "Germany",     utcOffset: 1 },
  DUS: { code: "DUS", city: "Düsseldorf",       country: "Germany",     utcOffset: 1 },
  ZRH: { code: "ZRH", city: "Zurich",           country: "Switzerland", utcOffset: 1 },
  GVA: { code: "GVA", city: "Geneva",           country: "Switzerland", utcOffset: 1 },
  VIE: { code: "VIE", city: "Vienna",           country: "Austria",     utcOffset: 1 },
  MAD: { code: "MAD", city: "Madrid",           country: "Spain",       utcOffset: 1 },
  BCN: { code: "BCN", city: "Barcelona",        country: "Spain",       utcOffset: 1 },
  LIS: { code: "LIS", city: "Lisbon",           country: "Portugal",    utcOffset: 0 },
  FCO: { code: "FCO", city: "Rome",             country: "Italy",       utcOffset: 1 },
  MXP: { code: "MXP", city: "Milan",            country: "Italy",       utcOffset: 1 },
  VCE: { code: "VCE", city: "Venice",           country: "Italy",       utcOffset: 1 },
  ATH: { code: "ATH", city: "Athens",           country: "Greece",      utcOffset: 2 },
  CPH: { code: "CPH", city: "Copenhagen",       country: "Denmark",     utcOffset: 1 },
  ARN: { code: "ARN", city: "Stockholm",        country: "Sweden",      utcOffset: 1 },
  OSL: { code: "OSL", city: "Oslo",             country: "Norway",      utcOffset: 1 },
  HEL: { code: "HEL", city: "Helsinki",         country: "Finland",     utcOffset: 2 },
  KEF: { code: "KEF", city: "Reykjavík",        country: "Iceland",     utcOffset: 0 },
  WAW: { code: "WAW", city: "Warsaw",           country: "Poland",      utcOffset: 1 },
  PRG: { code: "PRG", city: "Prague",           country: "Czechia",     utcOffset: 1 },
  BUD: { code: "BUD", city: "Budapest",         country: "Hungary",     utcOffset: 1 },
  OTP: { code: "OTP", city: "Bucharest",        country: "Romania",     utcOffset: 2 },
  SOF: { code: "SOF", city: "Sofia",            country: "Bulgaria",    utcOffset: 2 },
  BEG: { code: "BEG", city: "Belgrade",         country: "Serbia",      utcOffset: 1 },
  RIX: { code: "RIX", city: "Riga",             country: "Latvia",      utcOffset: 2 },
  TLL: { code: "TLL", city: "Tallinn",          country: "Estonia",     utcOffset: 2 },
  SVO: { code: "SVO", city: "Moscow",           country: "Russia",      utcOffset: 3 },
  LED: { code: "LED", city: "St. Petersburg",   country: "Russia",      utcOffset: 3 },
  KBP: { code: "KBP", city: "Kyiv",             country: "Ukraine",     utcOffset: 2 },

  // --- Middle East ----------------------------------------------------------
  JED: { code: "JED", city: "Jeddah",           country: "Saudi Arabia", utcOffset: 3 },
  RUH: { code: "RUH", city: "Riyadh",           country: "Saudi Arabia", utcOffset: 3 },
  KWI: { code: "KWI", city: "Kuwait City",      country: "Kuwait",       utcOffset: 3 },
  BAH: { code: "BAH", city: "Manama",           country: "Bahrain",      utcOffset: 3 },
  MCT: { code: "MCT", city: "Muscat",           country: "Oman",         utcOffset: 4 },
  AMM: { code: "AMM", city: "Amman",            country: "Jordan",       utcOffset: 3 },
  BEY: { code: "BEY", city: "Beirut",           country: "Lebanon",      utcOffset: 2 },
  TLV: { code: "TLV", city: "Tel Aviv",         country: "Israel",       utcOffset: 2 },
  IKA: { code: "IKA", city: "Tehran",           country: "Iran",         utcOffset: 3.5 },
  BGW: { code: "BGW", city: "Baghdad",          country: "Iraq",         utcOffset: 3 },
  SAW: { code: "SAW", city: "Istanbul Sabiha",  country: "Turkey",       utcOffset: 3 },
  EVN: { code: "EVN", city: "Yerevan",          country: "Armenia",      utcOffset: 4 },
  TBS: { code: "TBS", city: "Tbilisi",          country: "Georgia",      utcOffset: 4 },
  GYD: { code: "GYD", city: "Baku",             country: "Azerbaijan",   utcOffset: 4 },

  // --- Africa ---------------------------------------------------------------
  CAI: { code: "CAI", city: "Cairo",            country: "Egypt",       utcOffset: 2 },
  CMN: { code: "CMN", city: "Casablanca",       country: "Morocco",     utcOffset: 1 },
  RAK: { code: "RAK", city: "Marrakesh",        country: "Morocco",     utcOffset: 1 },
  TUN: { code: "TUN", city: "Tunis",            country: "Tunisia",     utcOffset: 1 },
  ALG: { code: "ALG", city: "Algiers",          country: "Algeria",     utcOffset: 1 },
  DKR: { code: "DKR", city: "Dakar",            country: "Senegal",     utcOffset: 0 },
  ACC: { code: "ACC", city: "Accra",            country: "Ghana",       utcOffset: 0 },
  LOS: { code: "LOS", city: "Lagos",            country: "Nigeria",     utcOffset: 1 },
  ABV: { code: "ABV", city: "Abuja",            country: "Nigeria",     utcOffset: 1 },
  ADD: { code: "ADD", city: "Addis Ababa",      country: "Ethiopia",    utcOffset: 3 },
  NBO: { code: "NBO", city: "Nairobi",          country: "Kenya",       utcOffset: 3 },
  DAR: { code: "DAR", city: "Dar es Salaam",    country: "Tanzania",    utcOffset: 3 },
  KGL: { code: "KGL", city: "Kigali",           country: "Rwanda",      utcOffset: 2 },
  LAD: { code: "LAD", city: "Luanda",           country: "Angola",      utcOffset: 1 },
  HRE: { code: "HRE", city: "Harare",           country: "Zimbabwe",    utcOffset: 2 },
  JNB: { code: "JNB", city: "Johannesburg",     country: "South Africa", utcOffset: 2 },
  CPT: { code: "CPT", city: "Cape Town",        country: "South Africa", utcOffset: 2 },

  // --- South Asia -----------------------------------------------------------
  KHI: { code: "KHI", city: "Karachi",          country: "Pakistan",   utcOffset: 5 },
  ISB: { code: "ISB", city: "Islamabad",        country: "Pakistan",   utcOffset: 5 },
  LHE: { code: "LHE", city: "Lahore",           country: "Pakistan",   utcOffset: 5 },
  DEL: { code: "DEL", city: "Delhi",            country: "India",      utcOffset: 5.5 },
  BOM: { code: "BOM", city: "Mumbai",           country: "India",      utcOffset: 5.5 },
  MAA: { code: "MAA", city: "Chennai",          country: "India",      utcOffset: 5.5 },
  BLR: { code: "BLR", city: "Bangalore",        country: "India",      utcOffset: 5.5 },
  HYD: { code: "HYD", city: "Hyderabad",        country: "India",      utcOffset: 5.5 },
  CCU: { code: "CCU", city: "Kolkata",          country: "India",      utcOffset: 5.5 },
  COK: { code: "COK", city: "Kochi",            country: "India",      utcOffset: 5.5 },
  CMB: { code: "CMB", city: "Colombo",          country: "Sri Lanka",  utcOffset: 5.5 },
  MLE: { code: "MLE", city: "Malé",             country: "Maldives",   utcOffset: 5 },
  KTM: { code: "KTM", city: "Kathmandu",        country: "Nepal",      utcOffset: 5.75 },
  DAC: { code: "DAC", city: "Dhaka",            country: "Bangladesh", utcOffset: 6 },

  // --- East / Southeast Asia ------------------------------------------------
  PEK: { code: "PEK", city: "Beijing",          country: "China",       utcOffset: 8 },
  PKX: { code: "PKX", city: "Beijing Daxing",   country: "China",       utcOffset: 8 },
  PVG: { code: "PVG", city: "Shanghai",         country: "China",       utcOffset: 8 },
  CAN: { code: "CAN", city: "Guangzhou",        country: "China",       utcOffset: 8 },
  SZX: { code: "SZX", city: "Shenzhen",         country: "China",       utcOffset: 8 },
  CTU: { code: "CTU", city: "Chengdu",          country: "China",       utcOffset: 8 },
  HKG: { code: "HKG", city: "Hong Kong",        country: "Hong Kong",   utcOffset: 8 },
  TPE: { code: "TPE", city: "Taipei",           country: "Taiwan",      utcOffset: 8 },
  ICN: { code: "ICN", city: "Seoul",            country: "South Korea", utcOffset: 9 },
  NRT: { code: "NRT", city: "Tokyo Narita",     country: "Japan",       utcOffset: 9 },
  HND: { code: "HND", city: "Tokyo Haneda",     country: "Japan",       utcOffset: 9 },
  KIX: { code: "KIX", city: "Osaka",            country: "Japan",       utcOffset: 9 },
  MNL: { code: "MNL", city: "Manila",           country: "Philippines", utcOffset: 8 },
  BKK: { code: "BKK", city: "Bangkok",          country: "Thailand",    utcOffset: 7 },
  HKT: { code: "HKT", city: "Phuket",           country: "Thailand",    utcOffset: 7 },
  KUL: { code: "KUL", city: "Kuala Lumpur",     country: "Malaysia",    utcOffset: 8 },
  SIN: { code: "SIN", city: "Singapore",        country: "Singapore",   utcOffset: 8 },
  CGK: { code: "CGK", city: "Jakarta",          country: "Indonesia",   utcOffset: 7 },
  DPS: { code: "DPS", city: "Bali (Denpasar)",  country: "Indonesia",   utcOffset: 8 },
  HAN: { code: "HAN", city: "Hanoi",            country: "Vietnam",     utcOffset: 7 },
  SGN: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam",     utcOffset: 7 },
  RGN: { code: "RGN", city: "Yangon",           country: "Myanmar",     utcOffset: 6.5 },
  PNH: { code: "PNH", city: "Phnom Penh",       country: "Cambodia",    utcOffset: 7 },

  // --- Central Asia ---------------------------------------------------------
  TAS: { code: "TAS", city: "Tashkent",         country: "Uzbekistan",  utcOffset: 5 },
  ALA: { code: "ALA", city: "Almaty",           country: "Kazakhstan",  utcOffset: 6 },
  NQZ: { code: "NQZ", city: "Astana",           country: "Kazakhstan",  utcOffset: 6 },
  ULN: { code: "ULN", city: "Ulaanbaatar",      country: "Mongolia",    utcOffset: 8 },

  // --- Oceania --------------------------------------------------------------
  SYD: { code: "SYD", city: "Sydney",           country: "Australia",        utcOffset: 11 },
  MEL: { code: "MEL", city: "Melbourne",        country: "Australia",        utcOffset: 11 },
  BNE: { code: "BNE", city: "Brisbane",         country: "Australia",        utcOffset: 10 },
  PER: { code: "PER", city: "Perth",            country: "Australia",        utcOffset: 8 },
  AKL: { code: "AKL", city: "Auckland",         country: "New Zealand",      utcOffset: 13 },
  CHC: { code: "CHC", city: "Christchurch",     country: "New Zealand",      utcOffset: 13 },
  NAN: { code: "NAN", city: "Nadi",             country: "Fiji",             utcOffset: 12 },
  PPT: { code: "PPT", city: "Papeete",          country: "French Polynesia", utcOffset: -10 },
};

export const AIRPORT_LIST: Airport[] = Object.values(AIRPORTS);

/** Geographic lat/lng for each airport (used by the real-world Mercator map). */
export const AIRPORT_LATLNG: Record<string, [lng: number, lat: number]> = {
  // North America
  JFK: [-73.7781, 40.6413],
  EWR: [-74.1687, 40.6925],
  LAX: [-118.4085, 33.9416],
  SFO: [-122.379, 37.6213],
  SEA: [-122.3088, 47.4502],
  ORD: [-87.9048, 41.9742],
  DFW: [-97.0403, 32.8998],
  IAH: [-95.3414, 29.9902],
  ATL: [-84.428, 33.6407],
  MIA: [-80.2906, 25.7959],
  MCO: [-81.309, 28.4312],
  BOS: [-71.0096, 42.3656],
  IAD: [-77.4558, 38.9531],
  PHL: [-75.2421, 39.8729],
  DEN: [-104.6737, 39.8561],
  LAS: [-115.1537, 36.084],
  PHX: [-112.0078, 33.4342],
  MSP: [-93.2218, 44.882],
  DTW: [-83.3554, 42.2124],
  HNL: [-157.9249, 21.3187],
  YYZ: [-79.6248, 43.6777],
  YVR: [-123.1839, 49.1947],
  YUL: [-73.7408, 45.4706],
  YYC: [-114.0203, 51.1138],
  MEX: [-99.0721, 19.4361],
  CUN: [-86.8771, 21.0365],
  HAV: [-82.4111, 22.9892],

  // Central / South America
  PTY: [-79.3833, 9.0714],
  SJO: [-84.2089, 9.9938],
  BOG: [-74.1469, 4.7016],
  UIO: [-78.3575, -0.1292],
  LIM: [-77.1143, -12.0219],
  CCS: [-66.9911, 10.6031],
  GRU: [-46.4731, -23.4356],
  GIG: [-43.2436, -22.8089],
  EZE: [-58.5358, -34.8222],
  SCL: [-70.7858, -33.393],
  MVD: [-56.0307, -34.8384],

  // Europe
  LHR: [-0.4543, 51.47],
  LGW: [-0.1903, 51.1537],
  MAN: [-2.2727, 53.3537],
  EDI: [-3.3725, 55.95],
  DUB: [-6.27, 53.4213],
  CDG: [2.5479, 49.0097],
  NCE: [7.215, 43.6584],
  AMS: [4.7683, 52.3105],
  BRU: [4.4844, 50.9014],
  FRA: [8.5622, 50.0379],
  MUC: [11.7861, 48.3538],
  BER: [13.5033, 52.3667],
  DUS: [6.7668, 51.2895],
  ZRH: [8.5492, 47.4582],
  GVA: [6.1089, 46.2381],
  VIE: [16.5697, 48.1102],
  MAD: [-3.5676, 40.4983],
  BCN: [2.0833, 41.2974],
  LIS: [-9.1342, 38.7813],
  FCO: [12.2389, 41.8003],
  MXP: [8.7281, 45.6306],
  VCE: [12.3519, 45.5053],
  ATH: [23.9445, 37.9364],
  CPH: [12.6561, 55.6181],
  ARN: [17.9186, 59.6519],
  OSL: [11.1004, 60.1939],
  HEL: [24.9633, 60.3172],
  KEF: [-22.6056, 63.985],
  WAW: [20.9671, 52.1657],
  PRG: [14.26, 50.1008],
  BUD: [19.2611, 47.4369],
  OTP: [26.1025, 44.5711],
  SOF: [23.4114, 42.6967],
  BEG: [20.3091, 44.8184],
  RIX: [23.9711, 56.9236],
  TLL: [24.8328, 59.4133],
  SVO: [37.4146, 55.9726],
  LED: [30.2625, 59.8003],
  KBP: [30.8945, 50.345],

  // Middle East
  DXB: [55.3657, 25.2532],
  AUH: [54.6511, 24.433],
  DOH: [51.608, 25.2731],
  IST: [28.7519, 41.2753],
  JED: [39.1564, 21.6796],
  RUH: [46.6989, 24.9576],
  KWI: [47.9689, 29.2267],
  BAH: [50.6336, 26.2708],
  MCT: [58.2844, 23.5933],
  AMM: [35.9931, 31.7226],
  BEY: [35.4914, 33.8208],
  TLV: [34.8854, 32.0114],
  IKA: [51.3134, 35.4161],
  BGW: [44.2347, 33.2625],
  SAW: [29.3092, 40.8986],
  EVN: [44.3959, 40.1473],
  TBS: [44.9547, 41.6692],
  GYD: [50.0467, 40.4675],

  // Africa
  CAI: [31.4056, 30.1219],
  CMN: [-7.5897, 33.3675],
  RAK: [-8.0367, 31.6069],
  TUN: [10.2272, 36.851],
  ALG: [3.215, 36.6911],
  DKR: [-17.4734, 14.6708],
  ACC: [-0.1668, 5.6052],
  LOS: [3.3211, 6.5774],
  ABV: [7.2632, 9.0068],
  ADD: [38.7997, 8.9779],
  NBO: [36.9278, -1.3192],
  DAR: [39.2026, -6.8781],
  KGL: [30.1395, -1.9686],
  LAD: [13.2312, -8.8584],
  HRE: [31.0928, -17.9319],
  JNB: [28.246, -26.1392],
  CPT: [18.6017, -33.9649],

  // South Asia
  KHI: [67.1608, 24.9056],
  ISB: [72.8253, 33.5491],
  LHE: [74.4036, 31.5216],
  DEL: [77.1, 28.5562],
  BOM: [72.8656, 19.0896],
  MAA: [80.1707, 12.9941],
  BLR: [77.7066, 13.1979],
  HYD: [78.4294, 17.2403],
  CCU: [88.4467, 22.6547],
  COK: [76.4019, 10.152],
  CMB: [79.8842, 7.1808],
  MLE: [73.5294, 4.1918],
  KTM: [85.3592, 27.6961],
  DAC: [90.4006, 23.8431],

  // East / Southeast Asia
  PEK: [116.5975, 40.0801],
  PKX: [116.4108, 39.5097],
  PVG: [121.8083, 31.1443],
  CAN: [113.2988, 23.3924],
  SZX: [113.8108, 22.6393],
  CTU: [103.9471, 30.5781],
  HKG: [113.9185, 22.308],
  TPE: [121.2342, 25.0797],
  ICN: [126.4505, 37.4602],
  NRT: [140.3929, 35.772],
  HND: [139.7798, 35.5494],
  KIX: [135.2442, 34.4347],
  MNL: [121.0198, 14.5086],
  BKK: [100.7501, 13.69],
  HKT: [98.3068, 8.1132],
  KUL: [101.7099, 2.7456],
  SIN: [103.9915, 1.3644],
  CGK: [106.6559, -6.1256],
  DPS: [115.1672, -8.7482],
  HAN: [105.8067, 21.2187],
  SGN: [106.6519, 10.8189],
  RGN: [96.1332, 16.9073],
  PNH: [104.8444, 11.5466],

  // Central Asia
  TAS: [69.2811, 41.2579],
  ALA: [77.0103, 43.3521],
  NQZ: [71.4669, 51.0222],
  ULN: [106.7667, 47.6433],

  // Oceania
  SYD: [151.1753, -33.9399],
  MEL: [144.8431, -37.6733],
  BNE: [153.1175, -27.3942],
  PER: [115.9672, -31.9403],
  AKL: [174.7917, -37.0082],
  CHC: [172.5375, -43.4894],
  NAN: [177.4439, -17.7553],
  PPT: [-149.6111, -17.5536],
};

/**
 * Hand-placed positions for each airport on the cartoon world map.
 * Coords are within a 1000 × 500 viewBox (Mercator-ish). Not geographically
 * accurate — just kid-friendly approximate. The cartoon picker only renders
 * airports listed here; new entries in AIRPORTS won't show up on it.
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
