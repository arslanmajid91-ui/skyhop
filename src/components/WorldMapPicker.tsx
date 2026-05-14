"use client";

import { useMemo, useState } from "react";
import { AIRPORTS, AIRPORT_LIST, AIRPORT_MAP_POS } from "@/lib/airlines";

type Props = {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
};

/**
 * Cartoon flat world map picker. Tap-a-pin for FROM, tap another for TO.
 * The active picking mode is highlighted; selected pins glow. An animated
 * dashed great-circle-ish arc draws between FROM and TO once both are set.
 */
export default function WorldMapPicker({ from, to, onChange }: Props) {
  const [mode, setMode] = useState<"from" | "to">("from");

  function pickAirport(code: string) {
    if (mode === "from") {
      // Don't allow picking the same as 'to'; if matches, swap.
      if (code === to) {
        onChange({ from: code, to: from });
      } else {
        onChange({ from: code, to });
      }
      setMode("to");
    } else {
      if (code === from) {
        onChange({ from: to, to: code });
      } else {
        onChange({ from, to: code });
      }
      setMode("from");
    }
  }

  const fromPos = AIRPORT_MAP_POS[from];
  const toPos = AIRPORT_MAP_POS[to];

  // Curved arc between from -> to. Control point pulled "up" so the path
  // bows northward like a real-world great-circle on a Mercator projection.
  const arcPath = useMemo(() => {
    if (!fromPos || !toPos) return null;
    const cx = (fromPos.x + toPos.x) / 2;
    const cy = Math.min(fromPos.y, toPos.y) - 60;
    return `M ${fromPos.x} ${fromPos.y} Q ${cx} ${cy} ${toPos.x} ${toPos.y}`;
  }, [fromPos, toPos]);

  return (
    <div className="rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-cyan-50 p-3 dark:border-sky-900 dark:from-sky-950 dark:to-cyan-950">
      {/* Toggle which one we're picking */}
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
            🌍 Pick FROM
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
        viewBox="0 0 1000 500"
        className="block h-auto w-full select-none"
        role="img"
        aria-label="World map flight picker"
      >
        {/* Ocean background */}
        <defs>
          <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <radialGradient id="pinFromGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pinToGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1000" height="500" fill="url(#ocean)" rx="20" />

        {/* Continents — chunky cartoon blobs, NOT geographically accurate */}
        <g stroke="#0c4a6e" strokeWidth="2.5" strokeLinejoin="round">
          {/* North America */}
          <path
            d="M 80 120 q 30 -55 100 -50 q 40 -10 90 5 q 25 30 5 70 q 25 30 -5 70 q -40 30 -100 25 q -55 0 -75 -30 q -25 -25 -25 -55 q -10 -15 10 -35 z"
            fill="#fbbf24"
          />
          {/* South America */}
          <path
            d="M 280 270 q 25 -25 60 -10 q 25 20 22 60 q 10 40 -15 70 q -15 35 -45 30 q -30 -5 -38 -45 q -15 -45 16 -105 z"
            fill="#a3e635"
          />
          {/* Europe */}
          <path
            d="M 450 110 q 35 -30 95 -15 q 45 5 45 35 q 5 30 -30 45 q -50 20 -90 5 q -35 -10 -40 -35 q -5 -25 20 -35 z"
            fill="#f472b6"
          />
          {/* Africa */}
          <path
            d="M 510 195 q 25 -20 80 -8 q 35 5 38 50 q 15 35 -10 90 q -20 65 -55 70 q -35 5 -50 -45 q -30 -45 -25 -100 q -5 -30 22 -57 z"
            fill="#fb923c"
          />
          {/* Middle East / West Asia (joins Africa, but cartoonized as a small lobe) */}
          <path
            d="M 590 175 q 30 -10 60 5 q 20 20 5 45 q -15 30 -55 30 q -25 -5 -30 -30 q -5 -25 20 -50 z"
            fill="#fcd34d"
          />
          {/* South + East Asia */}
          <path
            d="M 640 165 q 60 -45 160 -30 q 65 5 80 40 q 10 35 -25 70 q -40 50 -125 50 q -75 5 -110 -35 q -25 -35 -10 -65 q 5 -20 30 -30 z"
            fill="#86efac"
          />
          {/* Australia */}
          <path
            d="M 800 340 q 30 -22 85 -10 q 30 10 25 45 q -10 30 -55 35 q -45 5 -65 -20 q -15 -20 10 -50 z"
            fill="#fde68a"
          />
        </g>

        {/* Cute clouds */}
        <g fill="#ffffff" opacity="0.85">
          <ellipse cx="100" cy="60" rx="30" ry="10" />
          <ellipse cx="120" cy="55" rx="22" ry="9" />
          <ellipse cx="400" cy="50" rx="34" ry="11" />
          <ellipse cx="420" cy="45" rx="24" ry="9" />
          <ellipse cx="880" cy="80" rx="36" ry="11" />
          <ellipse cx="900" cy="74" rx="22" ry="8" />
        </g>

        {/* Flight arc */}
        {arcPath && (
          <g>
            <path
              d={arcPath}
              fill="none"
              stroke="#0f172a"
              strokeWidth="3"
              strokeDasharray="8 6"
              strokeLinecap="round"
              opacity="0.85"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="1.2s" repeatCount="indefinite" />
            </path>
          </g>
        )}

        {/* Airports */}
        {AIRPORT_LIST.map((a) => {
          const p = AIRPORT_MAP_POS[a.code];
          if (!p) return null;
          const isFrom = a.code === from;
          const isTo = a.code === to;
          const isActive = isFrom || isTo;
          const glow = isFrom ? "url(#pinFromGlow)" : isTo ? "url(#pinToGlow)" : "none";
          const color = isFrom ? "#0ea5e9" : isTo ? "#f97316" : "#1e293b";
          return (
            <g key={a.code} transform={`translate(${p.x} ${p.y})`} className="cursor-pointer">
              {/* glow halo when selected */}
              {isActive && <circle r="28" fill={glow} />}
              {/* invisible hit target for easier clicking */}
              <circle
                r="22"
                fill="transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  pickAirport(a.code);
                }}
              >
                <title>{`${a.code} — ${a.city}`}</title>
              </circle>
              {/* pin dot */}
              <circle
                r={isActive ? 9 : 6}
                fill={color}
                stroke="#ffffff"
                strokeWidth="2.5"
                style={{ pointerEvents: "none", transition: "r 0.2s ease, fill 0.2s ease" }}
              />
              {/* label on hover or when selected */}
              <text
                x="0"
                y={-14}
                textAnchor="middle"
                fontSize="13"
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
                className="group-hover:opacity-100"
              >
                {a.code}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selection summary */}
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
