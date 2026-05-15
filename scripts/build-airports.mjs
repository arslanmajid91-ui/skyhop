#!/usr/bin/env node
// Generate src/lib/airports.generated.ts from OpenFlights airports.dat,
// intersected with routes.dat so we only keep airports that real airlines
// actually fly to.
//
// Source: jpatokal/openflights (CC-BY-SA 3.0)
//
// Re-run with: node scripts/build-airports.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AIRPORTS_DAT = resolve(__dirname, "../src/lib/openflights/airports.dat");
const ROUTES_DAT = resolve(__dirname, "../src/lib/openflights/routes.dat");
const OUTPUT = resolve(__dirname, "../src/lib/airports.generated.ts");

// Tiny CSV row parser that respects double-quoted fields. Each row in
// airports.dat looks like:
//   1,"Goroka","Goroka","Papua New Guinea","GKA","AYGA",-6.08,145.39,5282,10,"U","Pacific/Port_Moresby","airport","OurAirports"
function parseRow(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // CSV-style escaped quote: "" inside a quoted field
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// Busyness threshold — keep airports referenced by at least this many routes
// (counting src + dst). Tuned to land around ~1,500 airports, which keeps the
// world map browsable without dumping every regional airstrip.
const MIN_ROUTES = 8;

// Airports that opened or got renamed after the OpenFlights snapshot (~2014)
// and therefore won't appear in airports.dat. Hand-added so our existing
// catalog stays complete.
const MANUAL_ADDITIONS = [
  { code: "BER", city: "Berlin", country: "Germany",    utcOffset: 1,    lat: 52.3667, lng: 13.5033, name: "Berlin Brandenburg Airport" },
  { code: "PKX", city: "Beijing Daxing", country: "China", utcOffset: 8, lat: 39.5098, lng: 116.4107, name: "Beijing Daxing International Airport" },
  { code: "NQZ", city: "Astana", country: "Kazakhstan", utcOffset: 6,    lat: 51.0222, lng: 71.4669, name: "Nursultan Nazarbayev International Airport" },
];

// --- Step 1: collect routes-per-airport from routes.dat -------------------
const routesRaw = readFileSync(ROUTES_DAT, "utf8");
const routeCount = new Map(); // iata -> n
for (const line of routesRaw.split("\n")) {
  if (!line) continue;
  const cols = line.split(",");
  if (cols.length < 6) continue;
  const src = cols[2];
  const dst = cols[4];
  if (/^[A-Z]{3}$/.test(src)) routeCount.set(src, (routeCount.get(src) ?? 0) + 1);
  if (/^[A-Z]{3}$/.test(dst)) routeCount.set(dst, (routeCount.get(dst) ?? 0) + 1);
}
const referenced = new Set();
for (const [code, n] of routeCount) {
  if (n >= MIN_ROUTES) referenced.add(code);
}

// --- Step 2: filter airports.dat ------------------------------------------
const airportsRaw = readFileSync(AIRPORTS_DAT, "utf8");
const airports = []; // { code, city, country, utcOffset, lat, lng, name }
for (const line of airportsRaw.split("\n")) {
  if (!line) continue;
  const cols = parseRow(line);
  if (cols.length < 13) continue;
  const name = cols[1];
  const city = cols[2];
  const country = cols[3];
  const iata = cols[4];
  const lat = Number(cols[6]);
  const lng = Number(cols[7]);
  const utcOffset = Number(cols[9]);
  const type = cols[12];
  if (type !== "airport") continue;
  if (!/^[A-Z]{3}$/.test(iata)) continue;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
  if (!Number.isFinite(utcOffset)) continue;
  if (!referenced.has(iata)) continue;
  airports.push({ code: iata, city, country, utcOffset, lat, lng, name });
}

// --- Step 3: dedupe + merge in manual post-2014 additions -----------------
const byCode = new Map();
for (const a of airports) {
  if (!byCode.has(a.code)) byCode.set(a.code, a);
}
for (const a of MANUAL_ADDITIONS) {
  byCode.set(a.code, a); // overwrite any older entry
}
const final = [...byCode.values()].sort((x, y) => x.code.localeCompare(y.code));

// --- Step 4: emit TypeScript ----------------------------------------------
function js(str) {
  return JSON.stringify(str);
}

let body = "";
body += "/** Airport metadata (city/country/UTC offset). */\n";
body += "export const AIRPORTS_GENERATED: Record<string, {\n";
body += "  code: string;\n  city: string;\n  country: string;\n  utcOffset: number;\n}> = {\n";
for (const a of final) {
  body += `  ${a.code}: { code: ${js(a.code)}, city: ${js(a.city)}, country: ${js(a.country)}, utcOffset: ${a.utcOffset} },\n`;
}
body += "};\n\n";

body += "/** Geographic lat/lng [longitude, latitude] for the Mercator map. */\n";
body += "export const AIRPORT_LATLNG_GENERATED: Record<string, [number, number]> = {\n";
for (const a of final) {
  body += `  ${a.code}: [${a.lng.toFixed(4)}, ${a.lat.toFixed(4)}],\n`;
}
body += "};\n";

const out = `// AUTO-GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/build-airports.mjs
//
// Source: OpenFlights airports.dat (CC-BY-SA 3.0)
//   https://github.com/jpatokal/openflights
//
// Filtered to airports that are (a) of type "airport", (b) have a valid
// 3-letter IATA code, (c) have valid lat/lng + UTC offset, and (d) appear
// as a real route endpoint in routes.dat — i.e. at least one airline
// actually flies there.

${body}`;

writeFileSync(OUTPUT, out, "utf8");

console.log(`Wrote ${OUTPUT}`);
console.log(`Airports kept: ${final.length}`);
console.log(`Referenced in routes.dat: ${referenced.size}`);
console.log(`Raw airports.dat rows: ${airportsRaw.split("\n").length - 1}`);
