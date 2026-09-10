import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchCard } from "@/components/MatchCard";
import { matchesForTeam, winnerOf } from "@/lib/matches";
import { playersByTeam, type Role } from "@/lib/players";
import { getTeam, TEAMS } from "@/lib/teams";

export function generateStaticParams() {
  return TEAMS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = getTeam(id.toUpperCase());
  return { title: team ? `${team.name} — Boundary` : "Team not found — Boundary" };
}

const ROLE_ORDER: Role[] = ["Batter", "Wicketkeeper", "All-rounder", "Bowler"];

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = getTeam(id.toUpperCase());
  if (!team) notFound();

  const squad = playersByTeam(team.id);
  const matches = matchesForTeam(team.id);
  const completed = matches.filter((m) => m.status === "COMPLETED").slice(-5).reverse();
  const upcoming = matches.filter((m) => m.status === "UPCOMING").slice(0, 3);
  const live = matches.filter((m) => m.status === "LIVE");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/teams" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400">
        ← All teams
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl"
          style={{ backgroundColor: `${team.primary}1a` }}
        >
          {team.flag}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{team.name}</h1>
          <div className="mt-1 flex items-center gap-1.5">
            {completed.map((m) => {
              const result = winnerOf(m);
              const isWin = result === team.id;
              const isLoss = result !== null && result !== team.id;
              return (
                <span
                  key={m.id}
                  title={m.result}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    isWin ? "bg-emerald-600" : isLoss ? "bg-red-500" : "bg-zinc-400"
                  }`}
                >
                  {isWin ? "W" : isLoss ? "L" : "D"}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {live.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">Live</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {live.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">Upcoming</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">Squad</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ROLE_ORDER.map((role) => {
            const players = squad.filter((p) => p.role === role);
            if (players.length === 0) return null;
            return (
              <div key={role} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {role}s
                </h3>
                <ul className="space-y-1.5">
                  {players.map((player) => (
                    <li key={player.id} className="flex items-center justify-between text-sm">
                      <Link href={`/players/${player.id}`} className="font-medium hover:text-emerald-600 dark:hover:text-emerald-400">
                        {player.name}
                      </Link>
                      <span className="text-xs text-zinc-400">#{player.jersey}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {completed.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">Recent results</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
