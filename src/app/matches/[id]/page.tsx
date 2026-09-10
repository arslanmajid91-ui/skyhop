import Link from "next/link";
import { notFound } from "next/navigation";
import { ScorecardInnings } from "@/components/Scorecard";
import { FormatBadge, StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatTime } from "@/lib/format";
import { getMatch, MATCHES } from "@/lib/matches";
import { getPlayer } from "@/lib/players";
import { getTeam } from "@/lib/teams";

export function generateStaticParams() {
  return MATCHES.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) return { title: "Match not found — Boundary" };
  const teamA = getTeam(match.teamAId);
  const teamB = getTeam(match.teamBId);
  return { title: `${teamA?.name} vs ${teamB?.name} — Boundary` };
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) notFound();

  const teamA = getTeam(match.teamAId);
  const teamB = getTeam(match.teamBId);
  const tossWinner = getTeam(match.tossWinnerId);
  const motm = match.motmPlayerId ? getPlayer(match.motmPlayerId) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/matches" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400">
        ← All matches
      </Link>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-2">
          <FormatBadge format={match.format} />
          <StatusBadge status={match.status} />
        </div>
        <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">{match.seriesName}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {teamA?.flag} {teamA?.name} vs {teamB?.flag} {teamB?.name}
        </h1>

        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
          <div>
            <dt className="inline font-semibold text-zinc-800 dark:text-zinc-200">Venue: </dt>
            <dd className="inline">{match.venue}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-zinc-800 dark:text-zinc-200">Date: </dt>
            <dd className="inline">
              {formatDate(match.date)} · {formatTime(match.date)}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold text-zinc-800 dark:text-zinc-200">Toss: </dt>
            <dd className="inline">
              {tossWinner?.name} won the toss, chose to {match.tossDecision}
            </dd>
          </div>
          {motm && (
            <div>
              <dt className="inline font-semibold text-zinc-800 dark:text-zinc-200">Player of the match: </dt>
              <dd className="inline">
                <Link href={`/players/${motm.id}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                  {motm.name}
                </Link>
              </dd>
            </div>
          )}
        </dl>

        {match.status !== "UPCOMING" && (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            {match.result}
          </p>
        )}
      </div>

      {match.innings.length > 0 && (
        <div className="mt-6 space-y-6">
          {match.innings.map((innings, index) => (
            <ScorecardInnings key={`${innings.battingTeamId}-${index}`} innings={innings} />
          ))}
        </div>
      )}

      {match.status === "UPCOMING" && (
        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Scorecard will be available once the match begins.
        </p>
      )}
    </div>
  );
}
