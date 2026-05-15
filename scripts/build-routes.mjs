#!/usr/bin/env node
// Generate src/lib/routes.generated.ts from OpenFlights routes.dat.
//
// Source: jpatokal/openflights (CC-BY-SA 3.0). For each of our 4 carriers
// we build a directional adjacency map: ROUTES[airline][from] = [to, ...].
//
// Re-run after pulling a fresh routes.dat:
//   node scripts/build-routes.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROUTES_DAT = resolve(__dirname, "../src/lib/openflights/routes.dat");
const OUTPUT = resolve(__dirname, "../src/lib/routes.generated.ts");

const TRACKED = new Set(["EK", "EY", "QR", "TK"]);

const raw = readFileSync(ROUTES_DAT, "utf8");
const lines = raw.split("\n");

// adjacency: airline -> from -> Set<to>
const adj = new Map();
for (const a of TRACKED) adj.set(a, new Map());

let total = 0;
for (const line of lines) {
  if (!line) continue;
  // CSV columns: airline,airline_id,src,src_id,dst,dst_id,codeshare,stops,equipment
  const cols = line.split(",");
  if (cols.length < 6) continue;
  const airline = cols[0];
  if (!TRACKED.has(airline)) continue;
  const from = cols[2];
  const to = cols[4];
  // Filter to IATA codes (3 uppercase letters). The dataset occasionally
  // has ICAO 4-letter codes or "\N" placeholders.
  if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) continue;
  const fromMap = adj.get(airline);
  if (!fromMap.has(from)) fromMap.set(from, new Set());
  fromMap.get(from).add(to);
  total++;
}

function serializeAdj(airlineMap) {
  // Stable output: sorted from-codes, sorted to-codes.
  const fromKeys = [...airlineMap.keys()].sort();
  const parts = ["{"];
  for (const f of fromKeys) {
    const tos = [...airlineMap.get(f)].sort();
    parts.push(`  ${JSON.stringify(f)}: [${tos.map((t) => JSON.stringify(t)).join(",")}],`);
  }
  parts.push("}");
  return parts.join("\n");
}

const stats = {};
let body = "";
for (const a of TRACKED) {
  const m = adj.get(a);
  const fromCount = m.size;
  let routeCount = 0;
  let destSet = new Set();
  for (const tos of m.values()) {
    routeCount += tos.size;
    for (const t of tos) destSet.add(t);
  }
  stats[a] = { fromAirports: fromCount, destinations: destSet.size, routes: routeCount };
  body += `export const ${a}_ROUTES: Record<string, readonly string[]> = ${serializeAdj(m)};\n\n`;
}

const out = `// AUTO-GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/build-routes.mjs
//
// Source: OpenFlights routes.dat (CC-BY-SA 3.0)
//   https://github.com/jpatokal/openflights
//
// Each export is a directional adjacency map: from-IATA -> destination IATAs
// the carrier is recorded as flying to nonstop. Used by airlineServes()
// and the connecting-flight builder in src/lib/flights.ts.

import type { AirlineCode } from "./airlines";

${body}export const ROUTES: Record<AirlineCode, Record<string, readonly string[]>> = {
  EK: EK_ROUTES,
  EY: EY_ROUTES,
  QR: QR_ROUTES,
  TK: TK_ROUTES,
};
`;

writeFileSync(OUTPUT, out, "utf8");

console.log(`Wrote ${OUTPUT}`);
console.log(`Total parsed routes: ${total}`);
for (const a of TRACKED) {
  const s = stats[a];
  console.log(`  ${a}: ${s.routes} routes, ${s.fromAirports} origin airports, ${s.destinations} unique destinations`);
}
