# Boundary 🏏

Live-style cricket scores, stats and standings — the kind of home page you'd expect from a
dedicated cricket site, covering ten international sides across Test, ODI and T20I cricket.

Built with **Next.js 16**, **React 19.2**, and **Tailwind v4**. No backend — every score, scorecard,
player stat and points table is generated deterministically from a seeded mock dataset, so the
same match always produces the same result on every run.

## Features

- 🔴 **Live scores** — a match "in progress" right now, with a partial second-innings scorecard
  and required-run-rate framing
- 📅 **Match centre** — filter by status (live / upcoming / completed) and format (Test / ODI / T20I)
- 🧾 **Full scorecards** — innings-by-innings batting and bowling cards with dismissals, strike
  rates and economy
- 🏆 **Global T20 Cup 2026** — a two-group, round-robin points table with net run rate
- 🌍 **Teams** — squads grouped by role, recent form (W/L strip), and upcoming fixtures
- 📊 **Player stats** — sortable batting/bowling leaderboards per format, plus full career pages

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No env vars or API keys needed — there's no
real data source.

## How the data works

There is no live feed. Instead, [`src/lib/hash.ts`](./src/lib/hash.ts) provides a seeded
pseudo-random generator: every team, player, match and scorecard entry is derived from a stable
string seed (e.g. `player-IND-3`, `match-07-inn1`), so reloading the site — or rebuilding it —
always produces the exact same numbers. Team names are real ICC full member sides; squads use
generated player names rather than real athletes, since the stats attached to them are simulated,
not actual career records.

Match scheduling is anchored to "today": completed matches sit in the past, one match is always
mid-innings ("live"), and the rest are upcoming fixtures — so the live scores strip and standings
always have something to show.

## Project structure

```
src/
├── app/
│   ├── layout.tsx                 # shared header/footer shell
│   ├── page.tsx                   # home: hero, live, results, fixtures, standings, stat leaders
│   ├── matches/
│   │   ├── page.tsx               # match centre (status/format filters)
│   │   └── [id]/page.tsx          # full scorecard
│   ├── teams/
│   │   ├── page.tsx               # team grid
│   │   └── [id]/page.tsx          # squad, form, fixtures
│   ├── players/
│   │   ├── page.tsx               # batting/bowling leaderboards
│   │   └── [id]/page.tsx          # player career page
│   └── standings/page.tsx         # Global T20 Cup points tables
├── components/                    # MatchCard, Scorecard, StandingsTable, LeaderboardTable, ...
└── lib/
    ├── hash.ts                    # seeded RNG helpers
    ├── teams.ts                   # the 10 sides
    ├── players.ts                 # generated squads + career stats
    ├── matches.ts                 # fixtures, scorecards, results
    ├── standings.ts               # points table computation
    └── format.ts                  # overs / run-rate / date formatting
```

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19.2](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript

## Heads up — Next.js 16 vs. older docs

If you search the web for help:
- `searchParams` and `params` in pages are **Promises** — must `await` them
- `cookies()`, `headers()` are async
- `middleware.ts` → `proxy.ts` (not used here, but useful to know)
- Turbopack is the default; no `--turbopack` flag needed
