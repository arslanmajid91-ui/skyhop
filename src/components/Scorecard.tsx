import { formatOvers, runRate } from "@/lib/format";
import type { Innings } from "@/lib/matches";
import { getTeam } from "@/lib/teams";

export function ScorecardInnings({ innings }: { innings: Innings }) {
  const team = getTeam(innings.battingTeamId);
  const rr = runRate(innings.runs, innings.oversInt, innings.ballsExtra);
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-100">
          <span className="text-xl">{team?.flag}</span>
          {team?.name}
          {innings.inProgress && (
            <span className="text-xs font-semibold uppercase text-red-600">batting</span>
          )}
        </span>
        <span className="font-mono text-lg font-extrabold tabular-nums">
          {innings.runs}
          {innings.wickets < 10 ? `/${innings.wickets}` : ""}
          <span className="ml-1.5 font-sans text-xs font-medium text-zinc-500 dark:text-zinc-400">
            ({formatOvers(innings.oversInt, innings.ballsExtra)} ov, RR {rr.toFixed(2)})
          </span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2 font-semibold">Batter</th>
              <th className="px-4 py-2 font-semibold">Dismissal</th>
              <th className="px-4 py-2 text-right font-semibold">R</th>
              <th className="px-4 py-2 text-right font-semibold">B</th>
              <th className="px-4 py-2 text-right font-semibold">4s</th>
              <th className="px-4 py-2 text-right font-semibold">6s</th>
              <th className="px-4 py-2 text-right font-semibold">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {innings.battingCard.map((entry) => (
              <tr key={entry.playerId}>
                <td className="px-4 py-2 font-semibold">{entry.name}</td>
                <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">{entry.dismissal}</td>
                <td className="px-4 py-2 text-right font-bold tabular-nums">{entry.runs}{entry.notOut ? "*" : ""}</td>
                <td className="px-4 py-2 text-right tabular-nums">{entry.balls}</td>
                <td className="px-4 py-2 text-right tabular-nums">{entry.fours}</td>
                <td className="px-4 py-2 text-right tabular-nums">{entry.sixes}</td>
                <td className="px-4 py-2 text-right tabular-nums">{entry.strikeRate.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {innings.didNotBat.length > 0 && (
        <p className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Did not bat: {innings.didNotBat.join(", ")}
        </p>
      )}
      <p className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        Extras: {innings.extras}
      </p>

      <div className="overflow-x-auto border-t border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2 font-semibold">Bowler</th>
              <th className="px-4 py-2 text-right font-semibold">O</th>
              <th className="px-4 py-2 text-right font-semibold">M</th>
              <th className="px-4 py-2 text-right font-semibold">R</th>
              <th className="px-4 py-2 text-right font-semibold">W</th>
              <th className="px-4 py-2 text-right font-semibold">Econ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {innings.bowlingCard.map((entry) => (
              <tr key={entry.playerId}>
                <td className="px-4 py-2 font-semibold">{entry.name}</td>
                <td className="px-4 py-2 text-right tabular-nums">{entry.overs}</td>
                <td className="px-4 py-2 text-right tabular-nums">{entry.maidens}</td>
                <td className="px-4 py-2 text-right tabular-nums">{entry.runs}</td>
                <td className="px-4 py-2 text-right font-bold tabular-nums">{entry.wickets}</td>
                <td className="px-4 py-2 text-right tabular-nums">{entry.economy.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
