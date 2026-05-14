import Link from "next/link";
import { notFound } from "next/navigation";
import { AIRLINES, AIRPORTS } from "@/lib/airlines";
import { findFlight } from "@/lib/flights";
import { formatDate, formatPrice, formatTime } from "@/lib/format";
import Header from "@/components/Header";
import ConfettiBurst from "@/components/ConfettiBurst";
import { MascotPlane } from "@/components/icons";

function bookingRef(id: string): string {
  // Six-char A-Z + 0-9, deterministic from id
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "";
  let n = Math.abs(hash);
  for (let i = 0; i < 6; i++) {
    ref += chars[n % chars.length];
    n = Math.floor(n / chars.length);
  }
  return ref;
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const flight = findFlight(decodeURIComponent(id));
  if (!flight) notFound();

  const ref = bookingRef(flight.id);
  const first = flight.segments[0];
  const last = flight.segments[flight.segments.length - 1];

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <ConfettiBurst />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-7 text-center dark:border-emerald-900 dark:from-emerald-950 dark:to-cyan-950">
          <MascotPlane className="mascot-bob pointer-events-none absolute -right-2 -top-2 h-24 w-24 opacity-90" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-emerald-900 dark:text-emerald-100">
            🎉 You&rsquo;re going!
          </h1>
          <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
            Show this code at the gate:
          </p>
          <div className="mt-3 flex items-center justify-center">
            <span className="stamp text-base sm:text-lg">{ref}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="badge-fly">🏅 First trip unlocked</span>
            <span className="badge-fly">✈️ {AIRPORTS[first.from]?.city ?? first.from} → {AIRPORTS[last.to]?.city ?? last.to}</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Itinerary
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold text-white"
              style={{ backgroundColor: AIRLINES[flight.airline].color }}
            >
              {flight.airline}
            </div>
            <div>
              <div className="font-medium">{AIRLINES[flight.airline].name}</div>
              <div className="text-xs text-zinc-500">
                {flight.segments.map((s) => s.flightNumber).join(" · ")}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
            <div>
              <div className="text-xl font-semibold">{formatTime(first.departure)}</div>
              <div className="text-sm text-zinc-600">{AIRPORTS[first.from]?.city}</div>
              <div className="text-xs text-zinc-500">{formatDate(first.departure)}</div>
            </div>
            <div className="text-center text-xs text-zinc-500">
              <div>{flight.stops === 0 ? "Nonstop" : "1 stop"}</div>
              <div className="my-1 h-px w-16 bg-zinc-300 dark:bg-zinc-700" />
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold">{formatTime(last.arrival)}</div>
              <div className="text-sm text-zinc-600">{AIRPORTS[last.to]?.city}</div>
              <div className="text-xs text-zinc-500">{formatDate(last.arrival)}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <span className="text-sm text-zinc-500">Total charged</span>
            <span className="text-lg font-semibold">{formatPrice(flight.price)}</span>
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 block w-full rounded-lg border border-zinc-300 py-3 text-center text-sm font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Book another trip
        </Link>
      </main>
    </div>
  );
}
