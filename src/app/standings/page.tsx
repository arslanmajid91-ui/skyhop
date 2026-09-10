import { StandingsTable } from "@/components/StandingsTable";
import { standingsFor } from "@/lib/standings";

export const metadata = {
  title: "Standings — Boundary",
};

export default function StandingsPage() {
  const groupA = standingsFor("A");
  const groupB = standingsFor("B");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
        Global T20 Cup 2026 — Standings
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Top 4 in each group (highlighted) advance to the knockout stage. Win = 2 pts, tie/no result = 1 pt.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StandingsTable rows={groupA} title="Group A" />
        <StandingsTable rows={groupB} title="Group B" />
      </div>
    </div>
  );
}
