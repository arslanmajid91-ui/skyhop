import { TeamBadge } from "./TeamBadge";
import type { StandingRow } from "@/lib/standings";

export function StandingsTable({ rows, title }: { rows: StandingRow[]; title: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
        {title}
      </div>
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Team</th>
            <th className="px-4 py-3 text-right font-semibold">P</th>
            <th className="px-4 py-3 text-right font-semibold">W</th>
            <th className="px-4 py-3 text-right font-semibold">L</th>
            <th className="px-4 py-3 text-right font-semibold">T</th>
            <th className="px-4 py-3 text-right font-semibold">NRR</th>
            <th className="px-4 py-3 text-right font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((row, index) => (
            <tr key={row.teamId} className={index < 4 ? "bg-emerald-50/50 dark:bg-emerald-950/20" : undefined}>
              <td className="px-4 py-3 text-zinc-400">{index + 1}</td>
              <td className="px-4 py-3">
                <TeamBadge teamId={row.teamId} size="sm" />
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{row.played}</td>
              <td className="px-4 py-3 text-right tabular-nums">{row.won}</td>
              <td className="px-4 py-3 text-right tabular-nums">{row.lost}</td>
              <td className="px-4 py-3 text-right tabular-nums">{row.tied}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {row.netRunRate > 0 ? "+" : ""}
                {row.netRunRate.toFixed(3)}
              </td>
              <td className="px-4 py-3 text-right font-bold tabular-nums">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
