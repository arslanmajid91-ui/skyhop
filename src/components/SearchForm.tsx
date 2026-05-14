"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AIRPORT_LIST } from "@/lib/airlines";
import { GlobeIcon, PinIcon, PaperPlaneIcon, SwapIcon } from "./icons";

const today = new Date().toISOString().split("T")[0];

export default function SearchForm({
  initial,
}: {
  initial?: { from?: string; to?: string; date?: string; cabin?: string; passengers?: string };
}) {
  const router = useRouter();
  const [from, setFrom] = useState(initial?.from ?? "JFK");
  const [to, setTo] = useState(initial?.to ?? "DXB");
  const [date, setDate] = useState(initial?.date ?? today);
  const [cabin, setCabin] = useState(initial?.cabin ?? "economy");
  const [passengers, setPassengers] = useState(initial?.passengers ?? "1");
  const [error, setError] = useState("");
  const [swapping, setSwapping] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (from === to) {
      setError("Origin and destination must differ.");
      return;
    }
    setError("");
    const params = new URLSearchParams({ from, to, date, cabin, passengers });
    router.push(`/flights?${params.toString()}`);
  }

  function swap() {
    setSwapping(true);
    setFrom(to);
    setTo(from);
    setTimeout(() => setSwapping(false), 400);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_1fr_1fr]">
        {/* FROM */}
        <FunField label="From" icon={<GlobeIcon className="h-4 w-4" />} accent="from-sky-500 to-cyan-400">
          <select className="fun-field" value={from} onChange={(e) => setFrom(e.target.value)}>
            {AIRPORT_LIST.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code} — {a.city}
              </option>
            ))}
          </select>
        </FunField>

        {/* SWAP — between From and To */}
        <div className="hidden items-end justify-center pb-1 lg:flex">
          <button
            type="button"
            onClick={swap}
            aria-label="Swap origin and destination"
            className={`flex h-11 w-11 items-center justify-center rounded-full bg-white text-sky-600 shadow-md ring-1 ring-sky-100 transition hover:scale-110 hover:bg-sky-50 active:scale-95 dark:bg-zinc-800 dark:text-sky-400 dark:ring-zinc-700 ${swapping ? "rotate-180" : ""}`}
            style={{ transitionDuration: "300ms" }}
          >
            <SwapIcon className="h-5 w-5" />
          </button>
        </div>

        {/* TO */}
        <FunField label="To" icon={<PinIcon className="h-4 w-4" />} accent="from-pink-500 to-orange-400">
          <select className="fun-field" value={to} onChange={(e) => setTo(e.target.value)}>
            {AIRPORT_LIST.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code} — {a.city}
              </option>
            ))}
          </select>
        </FunField>

        {/* DATE */}
        <FunField label="Departure" icon={<CalIcon />} accent="from-violet-500 to-fuchsia-500">
          <input
            type="date"
            className="fun-field"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
          />
        </FunField>

        {/* CABIN */}
        <FunField label="Cabin" icon={<SeatIcon />} accent="from-amber-500 to-orange-500">
          <select className="fun-field" value={cabin} onChange={(e) => setCabin(e.target.value)}>
            <option value="economy">Economy</option>
            <option value="premium">Premium economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </FunField>

        {/* TRAVELERS */}
        <FunField label="Travelers" icon={<PeopleIcon />} accent="from-emerald-500 to-teal-400">
          <select className="fun-field" value={passengers} onChange={(e) => setPassengers(e.target.value)}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "passenger" : "passengers"}
              </option>
            ))}
          </select>
        </FunField>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className={`text-sm ${error ? "text-red-600 dark:text-red-400" : "text-zinc-500"}`}>
          {error || "✨ Mock data — explore freely, no booking is actually made"}
        </p>
        <button type="submit" className="plane-cta group">
          <span className="plane-cta__label">Search flights</span>
          <span className="plane-cta__plane">
            <PaperPlaneIcon className="h-5 w-5" />
          </span>
        </button>
      </div>
    </form>
  );
}

function FunField({
  label,
  icon,
  accent,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <label className="group block">
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className={`inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br ${accent} text-white shadow-sm`}
        >
          {icon}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
      </div>
      {children}
    </label>
  );
}

function CalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10h16M9 4v4M15 4v4" />
    </svg>
  );
}

function SeatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v8a2 2 0 0 0 2 2h8" />
      <path d="M6 14l-2 6h16l-2-3H8" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 20c0-2 1.5-3.5 3.5-3.5S22 18 22 20" />
    </svg>
  );
}
