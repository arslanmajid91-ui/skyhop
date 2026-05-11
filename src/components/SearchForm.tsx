"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AIRPORT_LIST } from "@/lib/airlines";

const today = new Date().toISOString().split("T")[0];

export default function SearchForm({
  initial,
  compact = false,
}: {
  initial?: { from?: string; to?: string; date?: string; cabin?: string; passengers?: string };
  compact?: boolean;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(initial?.from ?? "JFK");
  const [to, setTo] = useState(initial?.to ?? "DXB");
  const [date, setDate] = useState(initial?.date ?? today);
  const [cabin, setCabin] = useState(initial?.cabin ?? "economy");
  const [passengers, setPassengers] = useState(initial?.passengers ?? "1");
  const [error, setError] = useState("");

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
    setFrom(to);
    setTo(from);
  }

  const inputCls =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100";
  const labelCls = "mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500";

  return (
    <form
      onSubmit={handleSubmit}
      className={`grid gap-3 ${compact ? "md:grid-cols-[1fr_1fr_1fr_auto_auto_auto]" : "md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto_auto]"}`}
    >
      <div>
        <label className={labelCls}>From</label>
        <select className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)}>
          {AIRPORT_LIST.map((a) => (
            <option key={a.code} value={a.code}>
              {a.code} — {a.city}
            </option>
          ))}
        </select>
      </div>
      <div className="relative">
        <label className={labelCls}>To</label>
        <select className={inputCls} value={to} onChange={(e) => setTo(e.target.value)}>
          {AIRPORT_LIST.map((a) => (
            <option key={a.code} value={a.code}>
              {a.code} — {a.city}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={swap}
          className="absolute -left-3 top-7 hidden h-7 w-7 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs shadow-sm hover:bg-zinc-50 md:flex dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          aria-label="Swap origin and destination"
        >
          ⇄
        </button>
      </div>
      <div>
        <label className={labelCls}>Departure</label>
        <input
          type="date"
          className={inputCls}
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div>
        <label className={labelCls}>Cabin</label>
        <select className={inputCls} value={cabin} onChange={(e) => setCabin(e.target.value)}>
          <option value="economy">Economy</option>
          <option value="premium">Premium economy</option>
          <option value="business">Business</option>
          <option value="first">First</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Travelers</label>
        <select
          className={inputCls}
          value={passengers}
          onChange={(e) => setPassengers(e.target.value)}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "passenger" : "passengers"}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Search flights
        </button>
      </div>
      {error && (
        <p className="md:col-span-full text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
