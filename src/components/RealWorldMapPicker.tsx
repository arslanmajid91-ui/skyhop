"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const DRAG_THRESHOLD_PX = 4;

/**
 * Real-world Mercator-projection map picker with pan + zoom. Built on
 * d3-geo + topojson (world-atlas countries-110m, ~100 kB). At ~150
 * airports the un-zoomed view is dense, so users can scroll-wheel /
 * +- to zoom and drag to pan around to a region of interest.
 */
export default function RealWorldMapPicker({ from, to, onChange }: Props) {
  const [mode, setMode] = useState<"from" | "to">("from");
  const [view, setView] = useState({ tx: 0, ty: 0, zoom: 1 });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
    moved: boolean;
  } | null>(null);

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

  // Convert a client (mouse) position into viewBox/world space.
  function clientToViewBox(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * WIDTH;
    const y = ((clientY - rect.top) / rect.height) * HEIGHT;
    return { x, y };
  }

  function clampView(next: { tx: number; ty: number; zoom: number }) {
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next.zoom));
    // The transformed map covers screen rect (tx, ty) → (tx + WIDTH*z, ty + HEIGHT*z).
    // Keep at least the full viewbox covered.
    const minTx = WIDTH - WIDTH * z;
    const maxTx = 0;
    const minTy = HEIGHT - HEIGHT * z;
    const maxTy = 0;
    return {
      tx: Math.min(maxTx, Math.max(minTx, next.tx)),
      ty: Math.min(maxTy, Math.max(minTy, next.ty)),
      zoom: z,
    };
  }

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const { x: sx, y: sy } = clientToViewBox(clientX, clientY);
    setView((v) => {
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * factor));
      if (newZoom === v.zoom) return v;
      // Keep the world point under cursor stationary.
      // screen = world * zoom + t  ⇒  t' = screen - world * newZoom
      const wx = (sx - v.tx) / v.zoom;
      const wy = (sy - v.ty) / v.zoom;
      return clampView({
        tx: sx - wx * newZoom,
        ty: sy - wy * newZoom,
        zoom: newZoom,
      });
    });
  }

  // React's onWheel is passive by default — can't preventDefault page-scroll
  // from there. Attach a native non-passive listener on the SVG.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      zoomAt(e.clientX, e.clientY, factor);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    // Ignore non-primary buttons.
    if (e.button !== 0) return;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTx: view.tx,
      startTy: view.ty,
      moved: false,
    };
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = (WIDTH / rect.width) * (e.clientX - d.startX);
    const sy = (HEIGHT / rect.height) * (e.clientY - d.startY);
    if (!d.moved && Math.hypot(sx, sy) > DRAG_THRESHOLD_PX) {
      d.moved = true;
    }
    if (d.moved) {
      setView((v) => clampView({ tx: d.startTx + sx, ty: d.startTy + sy, zoom: v.zoom }));
    }
  }

  function onPointerUp(e: React.PointerEvent<SVGSVGElement>) {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
  }

  function handlePinClick(code: string) {
    // Suppress click if the user was actually dragging.
    if (dragRef.current?.moved) return;
    pickAirport(code);
  }

  // Visual sizes are kept stable in screen-space by dividing by zoom inside
  // the scaled group.
  const z = view.zoom;
  const dashedStrokeWidth = 3 / z;
  const dashedDashArray = `${8 / z} ${6 / z}`;
  const labelFontSize = 11 / z;
  const labelHaloWidth = 3 / z;
  const labelOffsetY = -12 / z;

  return (
    <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50 to-sky-100 p-3 dark:border-indigo-900 dark:from-indigo-950 dark:to-sky-950">
      {/* Mode + zoom controls */}
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
        <div className="flex items-center gap-1.5">
          <ZoomBtn
            label="−"
            ariaLabel="Zoom out"
            onClick={() => zoomAt((svgRef.current?.getBoundingClientRect().left ?? 0) + (svgRef.current?.getBoundingClientRect().width ?? WIDTH) / 2, (svgRef.current?.getBoundingClientRect().top ?? 0) + (svgRef.current?.getBoundingClientRect().height ?? HEIGHT) / 2, 1 / 1.4)}
          />
          <span className="min-w-[3.5rem] text-center text-[11px] font-bold tabular-nums text-zinc-600 dark:text-zinc-400">
            {z.toFixed(1)}×
          </span>
          <ZoomBtn
            label="+"
            ariaLabel="Zoom in"
            onClick={() => zoomAt((svgRef.current?.getBoundingClientRect().left ?? 0) + (svgRef.current?.getBoundingClientRect().width ?? WIDTH) / 2, (svgRef.current?.getBoundingClientRect().top ?? 0) + (svgRef.current?.getBoundingClientRect().height ?? HEIGHT) / 2, 1.4)}
          />
          <button
            type="button"
            onClick={() => setView({ tx: 0, ty: 0, zoom: 1 })}
            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"
            aria-label="Reset map view"
          >
            Reset
          </button>
        </div>
      </div>
      <p className="mb-2 px-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
        {mode === "from"
          ? "Tap a city for where you're flying from"
          : "Now tap where you'd like to go!"} <span className="text-zinc-400">· scroll to zoom, drag to pan</span>
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={`block h-auto w-full select-none touch-none ${dragRef.current?.moved ? "cursor-grabbing" : "cursor-grab"}`}
        role="img"
        aria-label="World map flight picker"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
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
          <clipPath id="mapClipReal">
            <rect x="0" y="0" width={WIDTH} height={HEIGHT} rx="20" />
          </clipPath>
        </defs>

        {/* Ocean fills the visible viewBox even when panned/zoomed */}
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#oceanReal)" rx="20" />

        {/* Zoomable / pannable content, clipped to the rounded viewBox */}
        <g clipPath="url(#mapClipReal)">
          <g transform={`translate(${view.tx} ${view.ty}) scale(${view.zoom})`}>
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
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    strokeWidth="0.8"
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
                strokeWidth={dashedStrokeWidth}
                strokeDasharray={dashedDashArray}
                strokeLinecap="round"
                opacity="0.85"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to={-28 / z}
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
              const baseR = isActive ? 7 : 4.5;
              return (
                <g key={a.code} transform={`translate(${x} ${y})`} className="cursor-pointer">
                  {isActive && <circle r={22 / z} fill={glow} />}
                  <circle
                    r={18 / z}
                    fill="transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePinClick(a.code);
                    }}
                  >
                    <title>{`${a.code} — ${a.city}`}</title>
                  </circle>
                  <circle
                    r={baseR / z}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={2 / z}
                    style={{ pointerEvents: "none", transition: "fill 0.2s ease" }}
                  />
                  {isActive && (
                    <text
                      x="0"
                      y={labelOffsetY}
                      textAnchor="middle"
                      fontSize={labelFontSize}
                      fontWeight="800"
                      fill="#0f172a"
                      style={{
                        paintOrder: "stroke",
                        stroke: "#ffffff",
                        strokeWidth: labelHaloWidth,
                        strokeLinejoin: "round",
                        pointerEvents: "none",
                      }}
                    >
                      {a.code}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </g>
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
