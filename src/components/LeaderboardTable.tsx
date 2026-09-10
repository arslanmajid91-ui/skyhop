import Link from "next/link";
import { getTeam } from "@/lib/teams";
import type { Format, Player } from "@/lib/players";

export function BattingLeaderboard({ players, format }: { players: Player[]; format: Format }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Player</th>
            <th className="px-4 py-3 font-semibold">Team</th>
            <th className="px-4 py-3 text-right font-semibold">M</th>
            <th className="px-4 py-3 text-right font-semibold">Runs</th>
            <th className="px-4 py-3 text-right font-semibold">Avg</th>
            <th className="px-4 py-3 text-right font-semibold">SR</th>
            <th className="px-4 py-3 text-right font-semibold">100s</th>
            <th className="px-4 py-3 text-right font-semibold">50s</th>
            <th className="px-4 py-3 text-right font-semibold">HS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {players.map((player, index) => {
            const stats = player.batting[format];
            const team = getTeam(player.teamId);
            return (
              <tr key={player.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                <td className="px-4 py-3 text-zinc-400">{index + 1}</td>
                <td className="px-4 py-3 font-semibold">
                  <Link href={`/players/${player.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                    {player.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {team?.flag} {player.teamId}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{stats.matches}</td>
                <td className="px-4 py-3 text-right font-bold tabular-nums">{stats.runs}</td>
                <td className="px-4 py-3 text-right tabular-nums">{stats.average.toFixed(1)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{stats.strikeRate.toFixed(1)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{stats.hundreds}</td>
                <td className="px-4 py-3 text-right tabular-nums">{stats.fifties}</td>
                <td className="px-4 py-3 text-right tabular-nums">{stats.highScore}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function BowlingLeaderboard({ players, format }: { players: Player[]; format: Format }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-[600px] text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Player</th>
            <th className="px-4 py-3 font-semibold">Team</th>
            <th className="px-4 py-3 text-right font-semibold">M</th>
            <th className="px-4 py-3 text-right font-semibold">Wkts</th>
            <th className="px-4 py-3 text-right font-semibold">Avg</th>
            <th className="px-4 py-3 text-right font-semibold">Econ</th>
            <th className="px-4 py-3 text-right font-semibold">Best</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {players.map((player, index) => {
            const stats = player.bowling[format];
            const team = getTeam(player.teamId);
            return (
              <tr key={player.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                <td className="px-4 py-3 text-zinc-400">{index + 1}</td>
                <td className="px-4 py-3 font-semibold">
                  <Link href={`/players/${player.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                    {player.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {team?.flag} {player.teamId}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{stats.matches}</td>
                <td className="px-4 py-3 text-right font-bold tabular-nums">{stats.wickets}</td>
                <td className="px-4 py-3 text-right tabular-nums">{stats.average.toFixed(1)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{stats.economy.toFixed(1)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{stats.bestFigures}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
