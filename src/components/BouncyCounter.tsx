"use client";

import { PlusIcon, MinusIcon } from "./icons";

export default function BouncyCounter({
  value,
  onChange,
  min = 1,
  max = 6,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border-[1.5px] border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
      <button
        type="button"
        aria-label={`Decrease ${label ?? "count"}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="bouncy-btn h-9 w-9 text-base"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <span className="bouncy-counter-value text-lg leading-none">{value}</span>
      <button
        type="button"
        aria-label={`Increase ${label ?? "count"}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="bouncy-btn h-9 w-9 text-base"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
