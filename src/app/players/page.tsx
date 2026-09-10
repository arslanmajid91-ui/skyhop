import Link from "next/link";
import { BattingLeaderboard, BowlingLeaderboard } from "@/components/LeaderboardTable";
import { FORMAT_LABEL, FORMATS, topRunScorers, topWicketTakers, type Format } from "@/lib/players";

export const metadata = {
  title: "Players — Boundary",
};

type Mode = "batting" | "bowling";

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; format?: string }>;
}) {
  const params = await searchParams;
  const mode: Mode = params.mode === "bowling" ? "bowling" : "batting";
  const format: Format = FORMATS.includes(params.format as Format) ? (params.format as Format) : "T20I";

  const players = mode === "batting" ? topRunScorers(format, 25) : topWicketTakers(format, 25);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Player stats</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Leaderboards across all ten squads.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <TabPill active={mode === "batting"} href={buildHref("batting", format)}>
          Batting
        </TabPill>
        <TabPill active={mode === "bowling"} href={buildHref("bowling", format)}>
          Bowling
        </TabPill>
        <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-800" />
        {FORMATS.map((f) => (
          <TabPill key={f} active={format === f} href={buildHref(mode, f)}>
            {FORMAT_LABEL[f]}
          </TabPill>
        ))}
      </div>

      <div className="mt-6">
        {mode === "batting" ? (
          <BattingLeaderboard players={players} format={format} />
        ) : (
          <BowlingLeaderboard players={players} format={format} />
        )}
      </div>
    </div>
  );
}

function buildHref(mode: Mode, format: Format) {
  return `/players?mode=${mode}&format=${format}`;
}

function TabPill({ active, href, children }: { active: boolean; href: string; children: React.ReactNode }) {
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
