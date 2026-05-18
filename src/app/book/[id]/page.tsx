import Link from "next/link";
import { notFound } from "next/navigation";
import { AIRPORTS, getAirline } from "@/lib/airlines";
import { findFlight } from "@/lib/flights";
import { formatPrice, formatTime } from "@/lib/format";
import PassengerForm from "./PassengerForm";
import Header from "@/components/Header";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const flight = findFlight(decodeURIComponent(id));
  if (!flight) notFound();

  const first = flight.segments[0];
  const last = flight.segments[flight.segments.length - 1];
  const airline = getAirline(flight.airline, flight.airlineName);

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href={`/flights/${encodeURIComponent(flight.id)}`}
          className="mb-4 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to flight details
        </Link>

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Passenger details
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Enter the lead traveler&apos;s information.
            </p>
            <PassengerForm flightId={flight.id} />
          </div>

          <aside className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 md:sticky md:top-6 md:self-start">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Your trip
            </h2>
            <div className="mt-3 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: airline.color }}
                >
                  {flight.airline}
                </div>
                <span>{airline.name}</span>
              </div>
              <div className="mt-3 text-zinc-900 dark:text-zinc-100">
                {AIRPORTS[first.from]?.city ?? first.from} →{" "}
                {AIRPORTS[last.to]?.city ?? last.to}
              </div>
              <div className="text-xs text-zinc-500">
                {formatTime(first.departure)} — {formatTime(last.arrival)} ·{" "}
                {flight.stops === 0 ? "Nonstop" : "1 stop"}
              </div>
            </div>
            <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Total</span>
                <span className="text-lg font-semibold">
                  {formatPrice(flight.price)}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">Includes taxes & fees</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
