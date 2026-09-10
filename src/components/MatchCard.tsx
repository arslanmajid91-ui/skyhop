import Link from "next/link";
import { formatDate, formatTime } from "@/lib/format";
import type { Match } from "@/lib/matches";
import { getTeam } from "@/lib/teams";
import { ScoreLine } from "./ScoreLine";
import { FormatBadge, StatusBadge } from "./StatusBadge";

export function MatchCard({ match }: { match: Match }) {
  const teamA = getTeam(match.teamAId);
  const teamB = getTeam(match.teamBId);
  if (!teamA || !teamB) return null;

  const inningsA = match.innings.find((i) => i.battingTeamId === teamA.id);
  const inningsB = match.innings.find((i) => i.battingTeamId === teamB.id);

  return (
    <Link
      href={`/matches/${match.id}`}
      className="group block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FormatBadge format={match.format} />
          <StatusBadge status={match.status} />
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {formatDate(match.date)}
        </span>
      </div>

      <p className="mb-3 truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">{match.seriesName}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-xl leading-none">{teamA.flag}</span>
            <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{teamA.name}</span>
          </span>
          {match.status === "UPCOMING" ? null : <ScoreLine innings={inningsA} compact />}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-xl leading-none">{teamB.flag}</span>
            <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{teamB.name}</span>
          </span>
          {match.status === "UPCOMING" ? null : <ScoreLine innings={inningsB} compact />}
        </div>
      </div>

      <div className="mt-3 border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        {match.status === "UPCOMING" ? (
          <span>{formatTime(match.date)} local &middot; {match.venue}</span>
        ) : (
          <span className="line-clamp-1 font-medium text-zinc-700 dark:text-zinc-300">{match.result}</span>
        )}
      </div>
    </Link>
  );
}
