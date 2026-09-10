import Link from "next/link";
import { matchesForTeam, winnerOf } from "@/lib/matches";
import { TEAMS } from "@/lib/teams";

export const metadata = {
  title: "Teams — Boundary",
};

export default function TeamsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Teams</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">All ten international sides.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEAMS.map((team) => {
          const played = matchesForTeam(team.id).filter((m) => m.status === "COMPLETED");
          const won = played.filter((m) => winnerOf(m) === team.id).length;
          const lost = played.filter((m) => winnerOf(m) !== null && winnerOf(m) !== team.id).length;

          return (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${team.primary}1a` }}
              >
                {team.flag}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-bold text-zinc-900 dark:text-zinc-100">{team.name}</span>
                <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                  {played.length} played · {won}W {lost}L
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
