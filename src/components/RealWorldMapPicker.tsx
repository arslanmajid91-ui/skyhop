"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath, geoInterpolate } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { select } from "d3-selection";
import "d3-transition";
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import Supercluster from "supercluster";
import type { ClusterFeature, PointFeature } from "supercluster";
import countries110m from "world-atlas/countries-110m.json";
import { AIRPORTS, AIRPORT_LIST, AIRPORT_LATLNG } from "@/lib/airlines";

type Props = {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
};

const WIDTH = 1000;
const HEIGHT = 520;
const MIN_K = 1;
const MAX_K = 8;
const CLUSTER_RADIUS_PX = 55;

type AirportProps = { code: string; city: string };

/**
 * Real-world Mercator picker. Powered by:
 *   - d3-geo + topojson (world-atlas) for the projection & coastlines
 *   - d3-zoom for pan / pinch / wheel / dblclick + smooth programmatic zoom
 *   - supercluster (KD-tree) for point clustering that stays stable across
 *     zoom levels and scales cleanly toward 1,000+ airports.
 */
export default function RealWorldMapPicker({ from, to, onChange }: Props) {
  const [mode, setMode] = useState<"from" | "to">("from");
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  const [hovered, setHovered] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // --- Projection + topojson land --------------------------------------------
  const { projection, pathGen, countries } = useMemo(() => {
    const proj = geoMercator()
      .scale(150)
      .center([10, 30])
      .translate([WIDTH / 2, HEIGHT / 2]);
    const pg = geoPath(proj);
    type Topo = typeof countries110m;
    const topo = countries110m as unknown as Topo & { objects: { countries: object } };
    const fc = feature(
      topo as unknown as Parameters<typeof feature>[0],
      topo.objects.countries as Parameters<typeof feature>[1]
    ) as unknown as FeatureCollection<Geometry>;
    return { projection: proj, pathGen: pg, countries: fc.features };
  }, []);

  // --- Supercluster index (built once) ---------------------------------------
  const index = useMemo(() => {
    const points: PointFeature<AirportProps>[] = [];
    for (const a of AIRPORT_LIST) {
      const ll = AIRPORT_LATLNG[a.code];
      if (!ll) continue;
      points.push({
        type: "Feature",
        properties: { code: a.code, city: a.city },
        geometry: { type: "Point", coordinates: [ll[0], ll[1]] },
      });
    }
    const sc = new Supercluster<AirportProps>({
      radius: CLUSTER_RADIUS_PX,
      maxZoom: 8,
      minPoints: 2,
    });
    sc.load(points);
    return sc;
  }, []);

  // Map our continuous d3-zoom k (1-8) to a supercluster integer zoom (0-8).
  // log2(k)*2 gives 8 discrete clustering levels across our range — enough
  // resolution that the cluster set changes smoothly as the user zooms.
  function kToClusterZoom(k: number) {
    return Math.max(0, Math.min(8, Math.floor(Math.log2(k) * 2)));
  }

  function clusterZoomToK(z: number) {
    return Math.max(MIN_K, Math.min(MAX_K, Math.pow(2, z / 2)));
  }

  // --- Clustering query (runs every transform change) ------------------------
  const clusterFeatures = useMemo(() => {
    // We always query the full world bbox — at 150 points it's cheap, and
    // supercluster's internal KD-tree handles up to ~1.2M points easily.
    return index.getClusters([-180, -85, 180, 85], kToClusterZoom(transform.k));
  }, [index, transform.k]);

  // Selected from/to should never disappear inside a cluster. Build a set of
  // codes that are currently part of a (real) cluster — if either selection
  // sits inside one, we drop that cluster and render every airport in it as
  // a solo pin instead. Keeps the active route always visible.
  const { soloPoints, displayedClusters } = useMemo(() => {
    const solos: Array<{ code: string; city: string; x: number; y: number }> = [];
    const clusters: Array<{
      id: number;
      count: number;
      x: number;
      y: number;
      lng: number;
      lat: number;
    }> = [];

    for (const f of clusterFeatures) {
      const [lng, lat] = f.geometry.coordinates;
      const xy = projection([lng, lat]);
      if (!xy) continue;
      const [x, y] = xy;

      const props = f.properties as { cluster?: boolean; cluster_id?: number; point_count?: number } & AirportProps;
      if (props.cluster) {
        const clusterId = (f as ClusterFeature<AirportProps>).properties.cluster_id;
        const leaves = index.getLeaves(clusterId, Infinity) as PointFeature<AirportProps>[];
        const hasSelected = leaves.some(
          (l) => l.properties.code === from || l.properties.code === to
        );
        if (hasSelected) {
          // Explode this cluster into solo pins so from/to remain visible.
          for (const l of leaves) {
            const lxy = projection(l.geometry.coordinates as [number, number]);
            if (!lxy) continue;
            solos.push({
              code: l.properties.code,
              city: l.properties.city,
              x: lxy[0],
              y: lxy[1],
            });
          }
        } else {
          clusters.push({
            id: clusterId,
            count: props.point_count ?? leaves.length,
            x,
            y,
            lng,
            lat,
          });
        }
      } else {
        solos.push({ code: props.code, city: props.city, x, y });
      }
    }
    return { soloPoints: solos, displayedClusters: clusters };
  }, [clusterFeatures, projection, index, from, to]);

  // --- d3-zoom wiring --------------------------------------------------------
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const z = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_K, MAX_K])
      .translateExtent([
        [0, 0],
        [WIDTH, HEIGHT],
      ])
      .filter((event) => {
        // Allow wheel + drag, ignore right-click drag.
        if (event.type === "mousedown" && event.button !== 0) return false;
        // Don't start a zoom-drag when the user is interacting with a
        // child element marked as interactive (pins, clusters). Without
        // this, d3-zoom's mousedown handler intercepts the gesture and
        // child onClick handlers never fire.
        const target = event.target as Element | null;
        if (target?.closest?.("[data-skyhop-interactive]")) return false;
        return !event.ctrlKey || event.type === "wheel";
      })
      .on("zoom", (event) => setTransform(event.transform));
    select(svg).call(z);
    // Suppress dblclick zoom — we use double-click to nothing currently,
    // but it can interfere with rapid pin selection.
    select(svg).on("dblclick.zoom", null);
    zoomBehaviorRef.current = z;
    return () => {
      select(svg).on(".zoom", null);
      zoomBehaviorRef.current = null;
    };
  }, []);

  function pickAirport(code: string) {
    if (mode === "from") {
      // Only swap when there's a real TO to swap with — avoids clobbering
      // FROM with an empty string when the user hasn't picked TO yet.
      if (to && code === to) onChange({ from: code, to: from });
      else onChange({ from: code, to });
      // After picking FROM, latch into TO mode and stay there — subsequent
      // taps update the destination, letting users browse arrival options
      // without flipping back to origin. Switching back requires an
      // explicit click on "Pick FROM" (or the blue FROM chip below).
      setMode("to");
    } else {
      if (from && code === from) onChange({ from: to, to: code });
      else onChange({ from, to: code });
      // Stay in TO mode (see comment above).
    }
  }

  function zoomTo(targetK: number, worldX: number, worldY: number, duration = 450) {
    const svg = svgRef.current;
    const z = zoomBehaviorRef.current;
    if (!svg || !z) return;
    const k = Math.max(MIN_K, Math.min(MAX_K, targetK));
    const tx = WIDTH / 2 - worldX * k;
    const ty = HEIGHT / 2 - worldY * k;
    select(svg)
      .transition()
      .duration(duration)
      .call(z.transform, zoomIdentity.translate(tx, ty).scale(k));
  }

  function expandCluster(clusterId: number, x: number, y: number) {
    const expansionZ = index.getClusterExpansionZoom(clusterId);
    const targetK = clusterZoomToK(expansionZ + 1);
    zoomTo(targetK, x, y);
  }

  function zoomByFactor(factor: number) {
    const svg = svgRef.current;
    const z = zoomBehaviorRef.current;
    if (!svg || !z) return;
    select(svg).transition().duration(220).call(z.scaleBy, factor);
  }

  function resetView() {
    const svg = svgRef.current;
    const z = zoomBehaviorRef.current;
    if (!svg || !z) return;
    select(svg).transition().duration(300).call(z.transform, zoomIdentity);
  }

  // --- Flight arc ------------------------------------------------------------
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

  // Projected endpoints — used for the arc gradient and as a fallback for
  // the plane glyph when the arc is missing.
  const fromXY = useMemo(() => {
    const ll = AIRPORT_LATLNG[from];
    return ll ? projection(ll) : null;
  }, [from, projection]);
  const toXY = useMemo(() => {
    const ll = AIRPORT_LATLNG[to];
    return ll ? projection(ll) : null;
  }, [to, projection]);

  // Visual sizes are kept stable in screen-space by dividing by k inside the
  // scaled group.
  const k = transform.k;
  const dashedStrokeWidth = 3 / k;
  const dashedDashArray = `${8 / k} ${6 / k}`;
  const labelFontSize = 11 / k;
  const labelHaloWidth = 3 / k;
  const labelOffsetY = -12 / k;

  return (
    <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50 to-sky-100 p-3 dark:border-indigo-900 dark:from-indigo-950 dark:to-sky-950">
      {/* Mode + zoom controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode("from");
              resetView();
            }}
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
        <div className="flex items-center gap-1.5">
          <ZoomBtn label="−" ariaLabel="Zoom out" onClick={() => zoomByFactor(1 / 1.4)} />
          <span className="min-w-[3.5rem] text-center text-[11px] font-bold tabular-nums text-zinc-600 dark:text-zinc-400">
            {k.toFixed(1)}×
          </span>
          <ZoomBtn label="+" ariaLabel="Zoom in" onClick={() => zoomByFactor(1.4)} />
          <button
            type="button"
            onClick={resetView}
            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"
            aria-label="Reset map view"
          >
            Reset
          </button>
        </div>
      </div>
      <p className="mb-2 px-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
        {mode === "from" ? "Tap a city for where you're flying from" : "Now tap where you'd like to go!"}{" "}
        <span className="text-zinc-400">· scroll / pinch to zoom, drag to pan, tap clusters to drill in</span>
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block h-auto w-full cursor-grab select-none touch-none active:cursor-grabbing"
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
          {/* Origin-to-destination gradient stroke for the great-circle arc */}
          <linearGradient
            id="arcGradient"
            gradientUnits="userSpaceOnUse"
            x1={fromXY?.[0] ?? 0}
            y1={fromXY?.[1] ?? 0}
            x2={toXY?.[0] ?? 0}
            y2={toXY?.[1] ?? 0}
          >
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <clipPath id="mapClipReal">
            <rect x="0" y="0" width={WIDTH} height={HEIGHT} rx="20" />
          </clipPath>
        </defs>

        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#oceanReal)" rx="20" />

        <g clipPath="url(#mapClipReal)">
          <g transform={transform.toString()}>
            {/* Countries */}
            <g pointerEvents="none">
              {countries.map((f, i) => {
                const d = pathGen(f as Feature<Geometry>);
                if (!d) return null;
                return (
                  <path
                    key={i}
                    d={d}
                    fill="#fef3c7"
                    stroke="#0c4a6e"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    strokeWidth="0.8"
                  />
                );
              })}
            </g>

            {/* Flight arc: dark halo + gradient dashed line + plane sprite
                riding the path. `key` forces React to remount on route change
                so the animation restarts cleanly. */}
            {arcPath && (
              <g key={`arc-${from}-${to}`} pointerEvents="none">
                {/* Soft halo for contrast over land */}
                <path
                  d={arcPath}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth={6 / k}
                  strokeLinecap="round"
                  opacity="0.18"
                />
                {/* Gradient origin → destination */}
                <path
                  id="skyhop-flight-arc"
                  d={arcPath}
                  fill="none"
                  stroke="url(#arcGradient)"
                  strokeWidth={dashedStrokeWidth}
                  strokeDasharray={dashedDashArray}
                  strokeLinecap="round"
                  opacity="0.95"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to={-28 / k}
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Plane glyph riding the arc */}
                <FlyingPlane k={k} />
              </g>
            )}

            {/* Cluster badges first, individual pins on top */}
            {displayedClusters.map((c) => {
              const radius = Math.min(20, 11 + Math.log2(c.count) * 2.6) / k;
              const fontSize = Math.min(14, 10 + Math.log2(c.count) * 1.4) / k;
              return (
                <g key={`c-${c.id}`} transform={`translate(${c.x.toFixed(3)} ${c.y.toFixed(3)})`} className="cursor-pointer">
                  <circle r={radius * 1.55} fill="#a855f7" opacity="0.18" pointerEvents="none" />
                  <circle
                    r={radius}
                    fill="#7c3aed"
                    stroke="#ffffff"
                    strokeWidth={2 / k}
                    data-skyhop-interactive
                    onClick={(e) => {
                      e.stopPropagation();
                      expandCluster(c.id, c.x, c.y);
                    }}
                  >
                    <title>{`${c.count} airports — click to zoom in`}</title>
                  </circle>
                  <text
                    x="0"
                    y={fontSize * 0.36}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontWeight="800"
                    fill="#ffffff"
                    pointerEvents="none"
                    style={{ userSelect: "none" }}
                  >
                    {c.count}
                  </text>
                </g>
              );
            })}

            {/* Individual airport pins */}
            {soloPoints.map((a) => {
              const isFrom = a.code === from;
              const isTo = a.code === to;
              const isActive = isFrom || isTo;
              const glow = isFrom
                ? "url(#pinFromGlowReal)"
                : isTo
                ? "url(#pinToGlowReal)"
                : "none";
              const color = isFrom ? "#0ea5e9" : isTo ? "#f97316" : "#1e293b";
              const baseR = isActive ? 7 : 4.5;
              return (
                <g key={a.code} transform={`translate(${a.x.toFixed(3)} ${a.y.toFixed(3)})`} className="cursor-pointer">
                  {isActive && <circle r={22 / k} fill={glow} pointerEvents="none" />}
                  <circle
                    r={18 / k}
                    fill="transparent"
                    data-skyhop-interactive
                    onPointerEnter={() => setHovered(a.code)}
                    onPointerLeave={() =>
                      setHovered((h) => (h === a.code ? null : h))
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      pickAirport(a.code);
                    }}
                  >
                    <title>{`${a.code} — ${a.city}`}</title>
                  </circle>
                  <circle
                    r={(hovered === a.code ? baseR * 1.5 : baseR) / k}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={2 / k}
                    pointerEvents="none"
                    style={{ transition: "r 0.15s ease, fill 0.2s ease" }}
                  />
                  {(isActive || hovered === a.code) && (
                    <text
                      x="0"
                      y={labelOffsetY}
                      textAnchor="middle"
                      fontSize={labelFontSize}
                      fontWeight="800"
                      fill="#0f172a"
                      pointerEvents="none"
                      style={{
                        paintOrder: "stroke",
                        stroke: "#ffffff",
                        strokeWidth: labelHaloWidth,
                        strokeLinejoin: "round",
                      }}
                    >
                      {isActive ? a.code : `${a.code} · ${a.city}`}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
        {/* FROM chip — picked: pill + clear (×); empty: dashed placeholder */}
        {from ? (
          <div className="inline-flex overflow-hidden rounded-full shadow-sm">
            <button
              type="button"
              onClick={() => {
                if (fromXY) zoomTo(4, fromXY[0], fromXY[1]);
                setMode("from");
              }}
              aria-label={`Fly map to ${AIRPORTS[from]?.city ?? from} and pick a new origin`}
              className="bg-sky-500 px-2.5 py-1 font-bold text-white transition hover:bg-sky-600 active:scale-95"
            >
              {from} — {AIRPORTS[from]?.city ?? "?"}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({ from: "", to });
                setMode("from");
                resetView();
              }}
              aria-label="Clear origin"
              className="flex items-center justify-center bg-sky-600 px-2 py-1 font-bold text-white transition hover:bg-sky-700 active:scale-95"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMode("from")}
            className="rounded-full border border-dashed border-sky-400 px-2.5 py-1 font-bold text-sky-600 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950"
          >
            + Pick origin
          </button>
        )}

        <span className="text-zinc-400" aria-hidden>
          ✈️
        </span>

        {/* TO chip */}
        {to ? (
          <div className="inline-flex overflow-hidden rounded-full shadow-sm">
            <button
              type="button"
              onClick={() => {
                if (toXY) zoomTo(4, toXY[0], toXY[1]);
                setMode("to");
              }}
              aria-label={`Fly map to ${AIRPORTS[to]?.city ?? to} and pick a new destination`}
              className="bg-orange-500 px-2.5 py-1 font-bold text-white transition hover:bg-orange-600 active:scale-95"
            >
              {to} — {AIRPORTS[to]?.city ?? "?"}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange({ from, to: "" });
                setMode("to");
              }}
              aria-label="Clear destination"
              className="flex items-center justify-center bg-orange-600 px-2 py-1 font-bold text-white transition hover:bg-orange-700 active:scale-95"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMode("to")}
            className="rounded-full border border-dashed border-orange-400 px-2.5 py-1 font-bold text-orange-600 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-950"
          >
            + Pick destination
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Plane sprite that flies the great-circle arc on a 6 s loop. Uses SVG
 * `<animateMotion>` with `mpath` so the browser does the heavy lifting
 * (constant arc-length traversal + rotate-along-tangent). The glyph is
 * drawn pointing +x so `rotate="auto"` aligns it with the path direction.
 * Size is divided by `k` so the plane stays visually constant across zoom.
 */
function FlyingPlane({ k }: { k: number }) {
  const s = 0.75 / k;
  return (
    <g>
      <g transform={`scale(${s})`}>
        {/* glow halo */}
        <circle r={14} fill="#fde047" opacity="0.6" />
        <circle r={9} fill="#fef9c3" opacity="0.9" />
        {/* plane body — nose at +x so animateMotion rotate=auto orients it */}
        <path
          d="M16 0 L-6 -7 L-2 -2.5 L-12 -2.5 L-14 -1 L-14 1 L-12 2.5 L-2 2.5 L-6 7 Z"
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </g>
      <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
        <mpath href="#skyhop-flight-arc" />
      </animateMotion>
    </g>
  );
}

function ZoomBtn({
  label,
  ariaLabel,
  onClick,
}: {
  label: string;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-bold leading-none text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700"
    >
      {label}
    </button>
  );
}
