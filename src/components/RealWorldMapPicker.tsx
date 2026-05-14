"use client";

import { useMemo, useState } from "react";
import { geoMercator, geoPath, geoInterpolate } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import countries110m from "world-atlas/countries-110m.json";
import { AIRPORTS, AIRPORT_LIST, AIRPORT_LATLNG } from "@/lib/airlines";

type Props = {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
};

const WIDTH = 1000;
const HEIGHT = 520;

/**
 * Real-world Mercator-projection map picker. Built on d3-geo + topojson
 * (world-atlas countries-110m, ~100 kB). Same tap-to-pick UX as the
 * cartoon variant — but with actual geography.
 */
export default function RealWorldMapPicker({ from, to, onChange }: Props) {
  const [mode, setMode] = useState<"from" | "to">("from");

  // Build projection + path generator once.
  const { projection, pathGen, countries } = useMemo(() => {
    const proj = geoMercator()
      .scale(150)
      .center([10, 30])
      .translate([WIDTH / 2, HEIGHT / 2]);
    const pg = geoPath(proj);

    // topojson "countries" object → GeoJSON FeatureCollection
    type Topo = typeof countries110m;
    const topo = countries110m as unknown as Topo & { objects: { countries: object } };
    const fc = feature(
      topo as Parameters<typeof feature>[0],
      topo.objects.countries as Parameters<typeof feature>[1]
    ) as unknown as FeatureCollection<Geometry>;
    return { projection: proj, pathGen: pg, countries: fc.features };
  }, []);

  function pickAirport(code: string) {
    if (mode === "from") {
      if (code === to) onChange({ from: code, to: from });
      else onChange({ from: code, to });
      setMode("to");
    } else {
      if (code === from) onChange({ from: to, to: code });
      else onChange({ from, to: code });
      setMode("from");
    }
  }

  // Arc — sampled along a great-circle interpolator, projected to screen space.
  const arcPath = useMemo(() => {
    const a = AIRPORT_LATLNG[from];
    const b = AIRPORT_LATLNG[to];
    if (!a || !b) return null;
    const interp = geoInterpolate(a, b);
    const steps = 64;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const pt = projection(interp(i / steps));
      if (!pt) continue;
      d += (i === 0 ? "M " : " L ") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
    }
    return d;
  }, [from, to, projection]);

  return (
    <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50 to-sky-100 p-3 dark:border-indigo-900 dark:from-indigo-950 dark:to-sky-950">
      {/* Mode toggle */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setMode("from")}
            className={
              "rounded-full px-3 py-1.5 text-xs font-bold transition " +
              (mode === "from"
                ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-md"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-sky-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700")
            }
          >
            🌐 Pick FROM
          </button>
          <button
            type="button"
            onClick={() => setMode("to")}
            className={
              "rounded-full px-3 py-1.5 text-xs font-bold transition " +
              (mode === "to"
                ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-md"
                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-pink-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700")
            }
          >
            📍 Pick TO
          </button>
        </div>
        <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
          {mode === "from"
            ? "Tap a city on the map for where you're flying from"
            : "Now tap where you'd like to go!"}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block h-auto w-full select-none"
        role="img"
        aria-label="World map flight picker"
      >
        <defs>
          <linearGradient id="oceanReal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <radialGradient id="pinFromGlowReal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pinToGlowReal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ocean */}
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#oceanReal)" rx="20" />

        {/* Countries */}
        <g>
          {countries.map((f, i) => {
            const d = pathGen(f as Feature<Geometry>);
            if (!d) return null;
            return (
              <path
                key={i}
                d={d}
                fill="#fef3c7"
                stroke="#0c4a6e"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
            );
          })}
        </g>

        {/* Flight arc */}
        {arcPath && (
          <path
            d={arcPath}
            fill="none"
            stroke="#0f172a"
            strokeWidth="3"
            strokeDasharray="8 6"
            strokeLinecap="round"
            opacity="0.85"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-28"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </path>
        )}

        {/* Airport pins */}
        {AIRPORT_LIST.map((a) => {
          const lnglat = AIRPORT_LATLNG[a.code];
          if (!lnglat) return null;
          const xy = projection(lnglat);
          if (!xy) return null;
          const [x, y] = xy;
          const isFrom = a.code === from;
          const isTo = a.code === to;
          const isActive = isFrom || isTo;
          const glow = isFrom
            ? "url(#pinFromGlowReal)"
            : isTo
            ? "url(#pinToGlowReal)"
            : "none";
          const color = isFrom ? "#0ea5e9" : isTo ? "#f97316" : "#1e293b";
          return (
            <g key={a.code} transform={`translate(${x} ${y})`} className="cursor-pointer">
              {isActive && <circle r="22" fill={glow} />}
              <circle
                r="18"
                fill="transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  pickAirport(a.code);
                }}
              >
                <title>{`${a.code} — ${a.city}`}</title>
              </circle>
              <circle
                r={isActive ? 7 : 4.5}
                fill={color}
                stroke="#ffffff"
                strokeWidth="2"
                style={{ pointerEvents: "none", transition: "r 0.2s ease, fill 0.2s ease" }}
              />
              <text
                x="0"
                y={-12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill="#0f172a"
                style={{
                  paintOrder: "stroke",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                  strokeLinejoin: "round",
                  opacity: isActive ? 1 : 0,
                  pointerEvents: "none",
                  transition: "opacity 0.2s ease",
                }}
              >
                {a.code}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="rounded-full bg-sky-500 px-2.5 py-1 font-bold text-white shadow-sm">
          {from} — {AIRPORTS[from]?.city ?? "?"}
        </span>
        <span className="text-zinc-400">✈️</span>
        <span className="rounded-full bg-orange-500 px-2.5 py-1 font-bold text-white shadow-sm">
          {to} — {AIRPORTS[to]?.city ?? "?"}
        </span>
      </div>
    </div>
  );
}
