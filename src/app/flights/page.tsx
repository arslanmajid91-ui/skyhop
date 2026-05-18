import { AIRPORTS, getAirline, type AirlineCode, type Airline } from "@/lib/airlines";
import { searchFlights, type Flight } from "@/lib/flights";
import FlightCard from "@/components/FlightCard";
import FilterSidebar, { type Filters } from "@/components/FilterSidebar";
import SearchForm from "@/components/SearchForm";
import Header from "@/components/Header";

type SearchParams = {
  from?: string;
  to?: string;
  date?: string;
  cabin?: string;
  passengers?: string;
  airlines?: string;
  stops?: string;
  maxPrice?: string;
  sort?: string;
};

function applyFilters(flights: Flight[], filters: Filters): Flight[] {
  let out = flights.filter((f) => f.stops <= filters.maxStops);
  if (filters.airlines.length > 0) {
    out = out.filter((f) => filters.airlines.includes(f.airline));
  }
  out = out.filter((f) => f.price <= filters.maxPrice);
  out.sort((a, b) => {
    if (filters.sort === "price") return a.price - b.price;
    if (filters.sort === "duration") return a.totalDuration - b.totalDuration;
    return a.segments[0].departure.localeCompare(b.segments[0].departure);
  });
  return out;
}

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const from = params.from ?? "JFK";
  const to = params.to ?? "DXB";
  const date = params.date ?? new Date().toISOString().split("T")[0];
  const cabin = (params.cabin ?? "economy") as "economy" | "premium" | "business" | "first";
  const passengers = Math.max(1, Number(params.passengers ?? 1));

  const allResults = await searchFlights({ from, to, date, cabin, passengers });

  // Build the airline filter list from what's actually in the results — with
  // a real-API backend, the carriers are dynamic (could be BA, AA, LH, …).
  const airlinesInResults = (() => {
    const seen = new Map<string, Airline>();
    for (const f of allResults) {
      if (!seen.has(f.airline)) seen.set(f.airline, getAirline(f.airline, f.airlineName));
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  })();

  const priceBounds = allResults.length
    ? {
        min: Math.floor(Math.min(...allResults.map((f) => f.price))),
        max: Math.ceil(Math.max(...allResults.map((f) => f.price))),
      }
    : { min: 0, max: 5000 };

  const presentCodes = new Set(airlinesInResults.map((a) => a.code));
  const filters: Filters = {
    airlines: params.airlines
      ? (params.airlines.split(",").filter((c) => presentCodes.has(c)) as AirlineCode[])
      : [],
    maxStops: params.stops === "0" ? 0 : 1,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : priceBounds.max,
    sort: (params.sort as Filters["sort"]) ?? "price",
  };

  const filtered = applyFilters(allResults, filters);

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <div className="border-b border-zinc-200 bg-white px-6 py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl">
          <SearchForm
            initial={{
              from,
              to,
              date,
              cabin,
              passengers: String(passengers),
            }}
          />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {AIRPORTS[from]?.city ?? from} → {AIRPORTS[to]?.city ?? to}
          </h1>
          <p className="text-sm text-zinc-500">
            {new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}{" "}
            · {passengers} {passengers === 1 ? "traveler" : "travelers"} ·{" "}
            <span className="capitalize">{cabin}</span> · {filtered.length} of{" "}
            {allResults.length} results
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <FilterSidebar
            filters={filters}
            priceBounds={priceBounds}
            airlines={airlinesInResults}
          />

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
                {allResults.length === 0
                  ? "No flights match this route — try a different city pair."
                  : "No flights match the current filters. Try relaxing them."}
              </div>
            ) : (
              filtered.map((f) => <FlightCard key={f.id} flight={f} />)
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
