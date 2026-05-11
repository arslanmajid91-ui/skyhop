import Link from "next/link";
import { AIRLINES } from "@/lib/airlines";
import type { Flight } from "@/lib/flights";
import { formatDuration, formatPrice, formatTime } from "@/lib/format";
import AirlineLogo from "./AirlineLogo";

export default function FlightCard({ flight }: { flight: Flight }) {
  const first = flight.segments[0];
  const last = flight.segments[flight.segments.length - 1];

  return (
    <Link
      href={`/flights/${encodeURIComponent(flight.id)}`}
      className="block rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AirlineLogo code={flight.airline} />
          <div className="text-sm">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">
              {AIRLINES[flight.airline].name}
            </div>
            <div className="text-xs text-zinc-500">
              {flight.segments.map((s) => s.flightNumber).join(" · ")}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {formatPrice(flight.price)}
          </div>
          <div className="text-xs text-zinc-500">per traveler</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-left">
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {formatTime(first.departure)}
          </div>
          <div className="text-xs text-zinc-500">{first.from}</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xs text-zinc-500">{formatDuration(flight.totalDuration)}</div>
          <div className="relative my-1 h-px w-32 bg-zinc-300 dark:bg-zinc-700">
            {flight.stops > 0 && (
              <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400" />
            )}
          </div>
          <div className="text-xs text-zinc-500">
            {flight.stops === 0 ? "Nonstop" : `1 stop · ${flight.segments[0].to}`}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {formatTime(last.arrival)}
          </div>
          <div className="text-xs text-zinc-500">{last.to}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
        <span className="capitalize">{flight.cabin}</span>
        <span>·</span>
        <span>{flight.baggage.checkedKg}kg checked</span>
        {flight.refundable && (
          <>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400">Refundable</span>
          </>
        )}
      </div>
    </Link>
  );
}
