"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PaymentForm({ flightId }: { flightId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // Fake a small network delay so it feels like a real charge.
    await new Promise((r) => setTimeout(r, 800));
    router.push(`/book/${encodeURIComponent(flightId)}/confirmation`);
  }

  const inputCls =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100";
  const labelCls = "mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className={labelCls}>Card number</label>
        <input
          required
          className={inputCls}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Expiry</label>
          <input
            required
            className={inputCls}
            autoComplete="cc-exp"
            placeholder="MM / YY"
          />
        </div>
        <div>
          <label className={labelCls}>CVC</label>
          <input
            required
            className={inputCls}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
          />
        </div>
        <div>
          <label className={labelCls}>ZIP / postal</label>
          <input
            required
            className={inputCls}
            autoComplete="postal-code"
            placeholder="10001"
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Name on card</label>
        <input required className={inputCls} autoComplete="cc-name" />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {submitting ? "Processing…" : "Confirm and pay"}
      </button>
      <p className="text-center text-xs text-zinc-500">
        🔒 This is a mock checkout. No data is sent or stored.
      </p>
    </form>
  );
}
