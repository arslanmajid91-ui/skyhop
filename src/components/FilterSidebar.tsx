"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AIRLINE_LIST, type AirlineCode } from "@/lib/airlines";

export type Filters = {
  airlines: AirlineCode[];
  maxStops: number; // 0 = nonstop only, 1 = up to 1 stop
  maxPrice: number;
  sort: "price" | "duration" | "departure";
};

export default function FilterSidebar({
  filters,
  priceBounds,
}: {
  filters: Filters;
  priceBounds: { min: number; max: number };
}) {
  const router = useRouter();
  const sp = useSearchParams();

  function update(updates: Partial<Filters>) {
    const next = new URLSearchParams(sp.toString());
    if (updates.airlines !== undefined) {
      if (updates.airlines.length === 0) next.delete("airlines");
      else next.set("airlines", updates.airlines.join(","));
    }
    if (updates.maxStops !== undefined) next.set("stops", String(updates.maxStops));
    if (updates.maxPrice !== undefined) next.set("maxPrice", String(updates.maxPrice));
    if (updates.sort !== undefined) next.set("sort", updates.sort);
    router.replace(`/flights?${next.toString()}`, { scroll: false });
  }

  function toggleAirline(code: AirlineCode) {
    const has = filters.airlines.includes(code);
    update({
      airlines: has
        ? filters.airlines.filter((a) => a !== code)
        : [...filters.airlines, code],
    });
  }

  return (
    <aside className="space-y-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Sort by
        </h3>
        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as Filters["sort"] })}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="price">Price (low to high)</option>
          <option value="duration">Duration (shortest)</option>
          <option value="departure">Departure time</option>
        </select>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Stops
        </h3>
        <div className="space-y-1.5 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="stops"
              checked={filters.maxStops === 0}
              onChange={() => update({ maxStops: 0 })}
            />
            Nonstop only
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="stops"
              checked={filters.maxStops === 1}
              onChange={() => update({ maxStops: 1 })}
            />
            Up to 1 stop
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Airlines
        </h3>
        <div className="space-y-1.5 text-sm">
          {AIRLINE_LIST.map((a) => (
            <label key={a.code} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.airlines.includes(a.code)}
                onChange={() => toggleAirline(a.code)}
              />
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: a.color }}
              />
              {a.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Max price{" "}
          <span className="font-normal text-zinc-500">
            ${filters.maxPrice}
          </span>
        </h3>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={10}
          value={filters.maxPrice}
          onChange={(e) => update({ maxPrice: Number(e.target.value) })}
          className="w-full"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>${priceBounds.min}</span>
          <span>${priceBounds.max}</span>
        </div>
      </div>
    </aside>
  );
}
