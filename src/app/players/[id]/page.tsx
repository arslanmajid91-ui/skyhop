import Link from "next/link";
import { notFound } from "next/navigation";
import { FORMAT_LABEL, FORMATS, getPlayer, PLAYERS } from "@/lib/players";
import { getTeam } from "@/lib/teams";

export function generateStaticParams() {
  return PLAYERS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayer(id);
  return { title: player ? `${player.name} — Boundary` : "Player not found — Boundary" };
}

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = getPlayer(id);
  if (!player) notFound();

  const team = getTeam(player.teamId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/players" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400">
        ← Player stats
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-extrabold text-white"
          style={{ backgroundColor: team?.primary }}
        >
          {player.jersey}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{player.name}</h1>
          <Link
            href={`/teams/${player.teamId}`}
            className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
          >
            {team?.flag} {team?.name}
          </Link>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-400">Role</dt>
          <dd className="font-semibold text-zinc-800 dark:text-zinc-200">{player.role}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-400">Batting</dt>
          <dd className="font-semibold text-zinc-800 dark:text-zinc-200">{player.battingStyle}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-zinc-400">Bowling</dt>
          <dd className="font-semibold text-zinc-800 dark:text-zinc-200">{player.bowlingStyle}</dd>
        </div>
      </dl>

      <div className="mt-8 space-y-8">
        <div>
          <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">Batting career</h2>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Format</th>
                  <th className="px-4 py-3 text-right font-semibold">M</th>
                  <th className="px-4 py-3 text-right font-semibold">Inn</th>
                  <th className="px-4 py-3 text-right font-semibold">Runs</th>
                  <th className="px-4 py-3 text-right font-semibold">Avg</th>
                  <th className="px-4 py-3 text-right font-semibold">SR</th>
                  <th className="px-4 py-3 text-right font-semibold">HS</th>
                  <th className="px-4 py-3 text-right font-semibold">100s</th>
                  <th className="px-4 py-3 text-right font-semibold">50s</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {FORMATS.map((format) => {
                  const s = player.batting[format];
                  return (
                    <tr key={format}>
                      <td className="px-4 py-3 font-semibold">{FORMAT_LABEL[format]}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.matches}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.innings}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">{s.runs}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.average.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.strikeRate.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.highScore}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.hundreds}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.fifties}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">Bowling career</h2>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Format</th>
                  <th className="px-4 py-3 text-right font-semibold">M</th>
                  <th className="px-4 py-3 text-right font-semibold">Wkts</th>
                  <th className="px-4 py-3 text-right font-semibold">Avg</th>
                  <th className="px-4 py-3 text-right font-semibold">Econ</th>
                  <th className="px-4 py-3 text-right font-semibold">Best</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {FORMATS.map((format) => {
                  const s = player.bowling[format];
                  return (
                    <tr key={format}>
                      <td className="px-4 py-3 font-semibold">{FORMAT_LABEL[format]}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.matches}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">{s.wickets}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.average.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.economy.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{s.bestFigures}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
