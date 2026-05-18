import Link from "next/link";
import { notFound } from "next/navigation";
import { AIRPORTS, getAirline } from "@/lib/airlines";
import { findFlight } from "@/lib/flights";
import { formatDate, formatDuration, formatPrice, formatTime } from "@/lib/format";
import AirlineLogo from "@/components/AirlineLogo";
import Header from "@/components/Header";

export default async function FlightDetailPage({
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
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/flights"
          className="mb-4 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to results
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <AirlineLogo code={flight.airline} name={flight.airlineName} />
              <div>
                <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {airline.name}
                </div>
                <div className="text-sm text-zinc-500">
                  {AIRPORTS[first.from]?.city ?? first.from} →{" "}
                  {AIRPORTS[last.to]?.city ?? last.to}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {formatPrice(flight.price)}
              </div>
              <div className="text-xs text-zinc-500">total · all travelers</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {flight.segments.map((seg, idx) => (
              <div key={idx}>
                {idx > 0 && (
                  <div className="my-3 ml-3 border-l border-dashed border-zinc-300 pl-6 text-xs text-zinc-500 dark:border-zinc-700">
                    Layover in {AIRPORTS[seg.from]?.city ?? seg.from} ·{" "}
                    {formatDuration(
                      (new Date(seg.departure + "Z").getTime() -
                        new Date(flight.segments[idx - 1].arrival + "Z").getTime()) /
                        60000,
                    )}
                  </div>
                )}
                <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {seg.flightNumber} · {seg.aircraft}
                    </span>
                    <span>{formatDate(seg.departure)}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    <div>
                      <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatTime(seg.departure)}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {seg.from}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {AIRPORTS[seg.from]?.city}
                      </div>
                    </div>
                    <div className="text-center text-xs text-zinc-500">
                      <div>{formatDuration(seg.duration)}</div>
                      <div className="my-1 h-px w-24 bg-zinc-300 dark:bg-zinc-700" />
                      <div>direct</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatTime(seg.arrival)}
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {seg.to}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {AIRPORTS[seg.to]?.city}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-950">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Total duration
              </div>
              <div className="font-medium">{formatDuration(flight.totalDuration)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Cabin</div>
              <div className="font-medium capitalize">{flight.cabin}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Baggage</div>
              <div className="font-medium">
                {flight.baggage.carryOnKg}kg carry-on · {flight.baggage.checkedKg}kg
                checked
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Fare</div>
              <div className="font-medium">
                {flight.refundable ? "Refundable" : "Non-refundable"}
              </div>
            </div>
          </div>

          <Link
            href={`/book/${encodeURIComponent(flight.id)}`}
            className="mt-6 block w-full rounded-lg bg-zinc-900 py-3 text-center text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Continue to booking
          </Link>
          <p className="mt-2 text-center text-xs text-zinc-500">
            Demo only · no real booking is created
          </p>
        </div>
      </main>
    </div>
  );
}
