import Link from "next/link";
import { MatchCard } from "@/components/MatchCard";
import { MATCHES, type MatchStatus } from "@/lib/matches";
import type { Format } from "@/lib/players";

export const metadata = {
  title: "Matches — Boundary",
};

const STATUS_FILTERS: { label: string; value: MatchStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Live", value: "LIVE" },
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Completed", value: "COMPLETED" },
];

const FORMAT_FILTERS: { label: string; value: Format | "ALL" }[] = [
  { label: "All formats", value: "ALL" },
  { label: "Test", value: "TEST" },
  { label: "ODI", value: "ODI" },
  { label: "T20I", value: "T20I" },
];

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; format?: string }>;
}) {
  const params = await searchParams;
  const status = (params.status?.toUpperCase() as MatchStatus | undefined) ?? "ALL";
  const format = (params.format?.toUpperCase() as Format | undefined) ?? "ALL";

  const filtered = [...MATCHES]
    .filter((m) => status === "ALL" || m.status === status)
    .filter((m) => format === "ALL" || m.format === format)
    .sort((a, b) => {
      const rank = { LIVE: 0, UPCOMING: 1, COMPLETED: 2 } as const;
      if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return a.status === "COMPLETED" ? -diff : diff;
    });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Matches</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {filtered.length} match{filtered.length === 1 ? "" : "es"}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <FilterPill key={f.value} active={status === f.value} href={buildHref(f.value, format)}>
            {f.label}
          </FilterPill>
        ))}
        <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
        {FORMAT_FILTERS.map((f) => (
          <FilterPill key={f.value} active={format === f.value} href={buildHref(status, f.value)}>
            {f.label}
          </FilterPill>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">No matches match these filters.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

function buildHref(status: MatchStatus | "ALL", format: Format | "ALL") {
  const params = new URLSearchParams();
  if (status !== "ALL") params.set("status", status);
  if (format !== "ALL") params.set("format", format);
  const qs = params.toString();
  return qs ? `/matches?${qs}` : "/matches";
}

function FilterPill({ active, href, children }: { active: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-emerald-700 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </Link>
  );
}
