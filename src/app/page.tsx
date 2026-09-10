import Link from "next/link";
import { MatchCard } from "@/components/MatchCard";
import { StandingsTable } from "@/components/StandingsTable";
import { ChevronRightIcon, TrophyIcon } from "@/components/icons";
import { liveMatches, recentResults, upcomingFixtures } from "@/lib/matches";
import { topRunScorers, topWicketTakers } from "@/lib/players";
import { standingsFor } from "@/lib/standings";
import { getTeam, type TeamId } from "@/lib/teams";

export default function Home() {
  const live = liveMatches();
  const recent = recentResults(6);
  const upcoming = upcomingFixtures(6);
  const runScorers = topRunScorers("T20I", 5);
  const wicketTakers = topWicketTakers("T20I", 5);
  const groupA = standingsFor("A").slice(0, 4);
  const groupB = standingsFor("B").slice(0, 4);

  return (
    <div>
      <section className="pitch-hero px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="relative mx-auto max-w-6xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur">
            <TrophyIcon className="h-4 w-4" /> Global T20 Cup 2026
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            Every run. Every wicket. Every team.
          </h1>
          <p className="mt-3 max-w-xl text-emerald-50/90">
            Live scores, full scorecards, and stats across Test, ODI and T20I cricket — ten teams, one
            scoreboard.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/matches"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              See all matches
            </Link>
            <Link
              href="/standings"
              className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              View standings
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
        {live.length > 0 && (
          <section>
            <SectionHeading title="Live now" href="/matches?status=LIVE" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeading title="Recent results" href="/matches?status=COMPLETED" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="Upcoming fixtures" href="/matches?status=UPCOMING" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeading title="Global T20 Cup standings" href="/standings" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <StandingsTable rows={groupA} title="Group A" />
            <StandingsTable rows={groupB} title="Group B" />
          </div>
        </section>

        <section>
          <SectionHeading title="T20I stat leaders" href="/players" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatList
              heading="Most runs"
              rows={runScorers.map((p) => ({
                id: p.id,
                teamId: p.teamId,
                name: p.name,
                value: `${p.batting.T20I.runs} runs`,
              }))}
            />
            <StatList
              heading="Most wickets"
              rows={wicketTakers.map((p) => ({
                id: p.id,
                teamId: p.teamId,
                name: p.name,
                value: `${p.bowling.T20I.wickets} wkts`,
              }))}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
      >
        View all <ChevronRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}

function StatList({
  heading,
  rows,
}: {
  heading: string;
  rows: { id: string; teamId: TeamId; name: string; value: string }[];
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{heading}</h3>
      <ul className="space-y-2.5">
        {rows.map((row, index) => (
          <li key={row.id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-100">
              <span className="w-4 text-xs text-zinc-400">{index + 1}</span>
              <span>{getTeam(row.teamId)?.flag}</span>
              <Link href={`/players/${row.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                {row.name}
              </Link>
            </span>
            <span className="font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
