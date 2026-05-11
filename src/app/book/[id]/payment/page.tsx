import Link from "next/link";
import { notFound } from "next/navigation";
import { findFlight } from "@/lib/flights";
import { formatPrice } from "@/lib/format";
import PaymentForm from "./PaymentForm";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const flight = findFlight(decodeURIComponent(id));
  if (!flight) notFound();

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href={`/book/${encodeURIComponent(flight.id)}`}
          className="mb-4 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to passenger details
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Payment
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Total due: <strong>{formatPrice(flight.price)}</strong> · Demo only — no
            real charge.
          </p>
          <PaymentForm flightId={flight.id} />
        </div>
      </main>
    </div>
  );
}
