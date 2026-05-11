"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PassengerForm({ flightId }: { flightId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    // Mock: just move to payment. Real app would persist passenger data here.
    router.push(`/book/${encodeURIComponent(flightId)}/payment`);
  }

  const inputCls =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100";
  const labelCls = "mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>First name</label>
          <input required className={inputCls} autoComplete="given-name" />
        </div>
        <div>
          <label className={labelCls}>Last name</label>
          <input required className={inputCls} autoComplete="family-name" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Date of birth</label>
          <input required type="date" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Nationality</label>
          <input required className={inputCls} placeholder="e.g. American" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Email</label>
          <input
            required
            type="email"
            className={inputCls}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input
            required
            type="tel"
            className={inputCls}
            autoComplete="tel"
            placeholder="+1 555 …"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Passport number</label>
          <input required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Passport expiry</label>
          <input required type="date" className={inputCls} />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {submitting ? "Loading…" : "Continue to payment"}
      </button>
    </form>
  );
}
