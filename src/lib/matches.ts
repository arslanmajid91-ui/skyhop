import { intBetween, pick, rngFor } from "./hash";
import { oversToBalls } from "./format";
import type { Format } from "./players";
import { playersByTeam, type Player } from "./players";
import type { TeamId } from "./teams";

export type MatchStatus = "LIVE" | "COMPLETED" | "UPCOMING";
export type Group = "A" | "B" | null;

export interface BattingEntry {
  playerId: string;
  name: string;
  dismissal: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  notOut: boolean;
}

export interface BowlingEntry {
  playerId: string;
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface Innings {
  battingTeamId: TeamId;
  bowlingTeamId: TeamId;
  runs: number;
  wickets: number;
  oversInt: number;
  ballsExtra: number;
  extras: number;
  inProgress: boolean;
  battingCard: BattingEntry[];
  bowlingCard: BowlingEntry[];
  didNotBat: string[];
}

export interface Match {
  id: string;
  format: Format;
  group: Group;
  seriesName: string;
  teamAId: TeamId;
  teamBId: TeamId;
  venue: string;
  date: string;
  status: MatchStatus;
  tossWinnerId: TeamId;
  tossDecision: "bat" | "bowl";
  innings: Innings[];
  result: string;
  motmPlayerId: string | null;
}

interface Fixture {
  format: Format;
  group: Group;
  seriesName: string;
  teamA: TeamId;
  teamB: TeamId;
  venue: string;
  dayOffset: number;
}

const GROUP_A: TeamId[] = ["IND", "AUS", "ENG", "PAK", "RSA"];
const GROUP_B: TeamId[] = ["NZ", "SL", "BAN", "WI", "AFG"];
const GLOBAL_CUP_VENUES = [
  "Dubai International Stadium, Dubai",
  "Sheikh Zayed Stadium, Abu Dhabi",
  "Sharjah Cricket Stadium, Sharjah",
];

function roundRobin(teams: TeamId[]): [TeamId, TeamId][] {
  const pairs: [TeamId, TeamId][] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairs.push([teams[i], teams[j]]);
    }
  }
  return pairs;
}

function buildGroupFixtures(): Fixture[] {
  const pairsA = roundRobin(GROUP_A);
  const pairsB = roundRobin(GROUP_B);
  const offsets = [-18, -16, -14, -12, -10, -8, -6, -4, -2, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
  const interleaved: Fixture[] = [];
  for (let i = 0; i < pairsA.length; i++) {
    const [a1, a2] = pairsA[i];
    interleaved.push({
      format: "T20I",
      group: "A",
      seriesName: "Global T20 Cup 2026 — Group A",
      teamA: a1,
      teamB: a2,
      venue: pick(rngFor(`venue-A-${i}`), GLOBAL_CUP_VENUES),
      dayOffset: 0,
    });
    const [b1, b2] = pairsB[i];
    interleaved.push({
      format: "T20I",
      group: "B",
      seriesName: "Global T20 Cup 2026 — Group B",
      teamA: b1,
      teamB: b2,
      venue: pick(rngFor(`venue-B-${i}`), GLOBAL_CUP_VENUES),
      dayOffset: 0,
    });
  }
  return interleaved.map((fixture, index) => ({ ...fixture, dayOffset: offsets[index] }));
}

const BILATERAL_FIXTURES: Fixture[] = [
  { format: "TEST", group: null, seriesName: "India tour of Australia 2026", teamA: "AUS", teamB: "IND", venue: "Melbourne Cricket Ground, Melbourne", dayOffset: -24 },
  { format: "ODI", group: null, seriesName: "England tour of New Zealand 2026", teamA: "NZ", teamB: "ENG", venue: "Eden Park, Auckland", dayOffset: -15 },
  { format: "T20I", group: null, seriesName: "Sri Lanka tour of Pakistan 2026", teamA: "PAK", teamB: "SL", venue: "Gaddafi Stadium, Lahore", dayOffset: -9 },
  { format: "ODI", group: null, seriesName: "Bangladesh tour of South Africa 2026", teamA: "RSA", teamB: "BAN", venue: "Wanderers Stadium, Johannesburg", dayOffset: -5 },
  { format: "TEST", group: null, seriesName: "West Indies tour of Australia 2026", teamA: "AUS", teamB: "WI", venue: "Sydney Cricket Ground, Sydney", dayOffset: -1 },
  { format: "ODI", group: null, seriesName: "England tour of India 2026", teamA: "IND", teamB: "ENG", venue: "Wankhede Stadium, Mumbai", dayOffset: 3 },
  { format: "T20I", group: null, seriesName: "Afghanistan tour of New Zealand 2026", teamA: "NZ", teamB: "AFG", venue: "Basin Reserve, Wellington", dayOffset: 7 },
  { format: "TEST", group: null, seriesName: "South Africa tour of Pakistan 2026", teamA: "PAK", teamB: "RSA", venue: "National Stadium, Karachi", dayOffset: 13 },
];

const FORMAT_MAX_OVERS: Record<Format, number> = { T20I: 20, ODI: 50, TEST: 100 };
const FORMAT_RUN_RATE: Record<Format, [number, number]> = { T20I: [60, 96], ODI: [42, 62], TEST: [24, 38] };
const DISMISSAL_KINDS = ["bowled", "caught", "lbw", "run out", "stumped", "caught & bowled"] as const;

function splitTotal(rng: () => number, total: number, parts: number, allowZero = true): number[] {
  if (parts <= 0) return [];
  if (total <= 0) return new Array(parts).fill(0);
  const weights = Array.from({ length: parts }, () => (allowZero ? rng() : rng() + 0.15));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / weightSum) * total);
  const floors = raw.map(Math.floor);
  let remainder = total - floors.reduce((a, b) => a + b, 0);
  const fracOrder = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  let idx = 0;
  while (remainder > 0 && idx < fracOrder.length) {
    result[fracOrder[idx].i] += 1;
    remainder -= 1;
    idx += 1;
  }
  return result;
}

function battingLineup(players: Player[]): Player[] {
  const wk = players.filter((p) => p.role === "Wicketkeeper");
  const batters = players.filter((p) => p.role === "Batter");
  const allrounders = players.filter((p) => p.role === "All-rounder");
  const bowlers = players.filter((p) => p.role === "Bowler");
  return [...batters, wk[0], ...allrounders, wk[1], ...bowlers].filter(Boolean).slice(0, 11);
}

function bowlingPool(players: Player[]): Player[] {
  return players.filter((p) => p.role === "Bowler" || p.role === "All-rounder").slice(0, 6);
}

function generateInnings(
  seed: string,
  battingTeamId: TeamId,
  bowlingTeamId: TeamId,
  format: Format,
  options: { inProgress?: boolean; targetOvers?: number; forceRuns?: number } = {},
): Innings {
  const rng = rngFor(seed);
  const maxOvers = options.targetOvers ?? FORMAT_MAX_OVERS[format];
  const [rrMin, rrMax] = FORMAT_RUN_RATE[format];
  const runRateTenths = intBetween(rng, rrMin, rrMax);

  const wickets = options.inProgress ? intBetween(rng, 2, 7) : intBetween(rng, 4, 10);
  const oversInt = options.inProgress
    ? intBetween(rng, Math.max(1, Math.floor(maxOvers * 0.2)), Math.floor(maxOvers * 0.75))
    : wickets >= 10
      ? intBetween(rng, Math.floor(maxOvers * 0.45), maxOvers)
      : maxOvers;
  const ballsExtra = oversInt >= maxOvers ? 0 : intBetween(rng, 0, 5);
  const extras = intBetween(rng, 2, 16);
  const balls = oversToBalls(oversInt, ballsExtra);
  const runs =
    options.forceRuns ?? Math.max(extras + wickets, Math.round((runRateTenths / 10) * (balls / 6)));
  const battingRuns = Math.max(0, runs - extras);

  const battingTeam = playersByTeam(battingTeamId);
  const bowlingTeam = playersByTeam(bowlingTeamId);
  const lineup = battingLineup(battingTeam);
  const bowlers = bowlingPool(bowlingTeam);

  const battedCount = Math.min(11, wickets + (options.inProgress ? 2 : intBetween(rng, 1, 2)));
  const outCount = Math.min(wickets, battedCount);
  const runShares = splitTotal(rng, battingRuns, battedCount);
  runShares.sort((a, b) => b - a);

  const battingCard: BattingEntry[] = [];
  for (let i = 0; i < battedCount; i++) {
    const player = lineup[i];
    if (!player) continue;
    const isOut = i < outCount;
    const runsScored = runShares[i] ?? 0;
    const ballsFaced = Math.max(runsScored > 0 ? Math.ceil(runsScored * (intBetween(rng, 70, 145) / 100)) : intBetween(rng, 0, 6), isOut ? 1 : 0);
    const sixes = Math.floor(runsScored / intBetween(rng, 14, 26));
    const fours = Math.max(0, Math.floor((runsScored - sixes * 6) / intBetween(rng, 7, 11)));
    let dismissal = "not out";
    if (isOut) {
      const kind = pick(rngFor(`${seed}-dismissal-${i}`), DISMISSAL_KINDS);
      const bowler = pick(rngFor(`${seed}-bowler-${i}`), bowlers.length ? bowlers : bowlingTeam);
      const fielder = pick(rngFor(`${seed}-fielder-${i}`), bowlingTeam);
      if (kind === "bowled") dismissal = `b ${bowler.name}`;
      else if (kind === "lbw") dismissal = `lbw b ${bowler.name}`;
      else if (kind === "caught") dismissal = `c ${fielder.name} b ${bowler.name}`;
      else if (kind === "stumped") dismissal = `st ${fielder.name} b ${bowler.name}`;
      else if (kind === "caught & bowled") dismissal = `c & b ${bowler.name}`;
      else dismissal = "run out";
    }
    battingCard.push({
      playerId: player.id,
      name: player.name,
      dismissal,
      runs: runsScored,
      balls: ballsFaced,
      fours,
      sixes,
      strikeRate: ballsFaced > 0 ? Math.round((runsScored / ballsFaced) * 10000) / 100 : 0,
      notOut: !isOut,
    });
  }
  const didNotBat = lineup.slice(battedCount).map((p) => p?.name).filter((n): n is string => Boolean(n));

  const activeBowlers = bowlers.slice(0, Math.min(6, Math.max(4, bowlers.length)));
  const bowlerOverShares = splitTotal(rng, balls, activeBowlers.length, false);
  const bowlerWicketShares = splitTotal(rng, wickets, activeBowlers.length);
  const bowlerRunShares = splitTotal(rng, runs, activeBowlers.length, false);
  const bowlingCard: BowlingEntry[] = activeBowlers.map((bowler, i) => {
    const bowlerBalls = bowlerOverShares[i] ?? 0;
    const bOversInt = Math.floor(bowlerBalls / 6);
    const bBallsExtra = bowlerBalls % 6;
    const bRuns = bowlerRunShares[i] ?? 0;
    return {
      playerId: bowler.id,
      name: bowler.name,
      overs: bBallsExtra === 0 ? `${bOversInt}` : `${bOversInt}.${bBallsExtra}`,
      maidens: format === "TEST" ? intBetween(rngFor(`${seed}-maiden-${i}`), 0, Math.min(4, bOversInt)) : intBetween(rngFor(`${seed}-maiden-${i}`), 0, Math.min(1, bOversInt)),
      runs: bRuns,
      wickets: bowlerWicketShares[i] ?? 0,
      economy: bowlerBalls > 0 ? Math.round((bRuns / bowlerBalls) * 6 * 100) / 100 : 0,
    };
  });

  return {
    battingTeamId,
    bowlingTeamId,
    runs,
    wickets: Math.min(wickets, 10),
    oversInt,
    ballsExtra,
    extras,
    inProgress: Boolean(options.inProgress),
    battingCard,
    bowlingCard,
    didNotBat,
  };
}

function buildMatch(fixture: Fixture, index: number): Match {
  const id = `match-${String(index + 1).padStart(2, "0")}`;
  const seed = `${id}-${fixture.teamA}-${fixture.teamB}-${fixture.format}`;
  const rng = rngFor(seed);
  const date = new Date();
  date.setHours(14, 30, 0, 0);
  date.setDate(date.getDate() + fixture.dayOffset);

  const status: MatchStatus = fixture.dayOffset < 0 ? "COMPLETED" : fixture.dayOffset === 0 ? "LIVE" : "UPCOMING";
  const tossWinnerId = pick(rng, [fixture.teamA, fixture.teamB]);
  const tossDecision = pick(rng, ["bat", "bowl"] as const);
  const battingFirst = tossDecision === "bat" ? tossWinnerId : tossWinnerId === fixture.teamA ? fixture.teamB : fixture.teamA;
  const battingSecond = battingFirst === fixture.teamA ? fixture.teamB : fixture.teamA;

  if (status === "UPCOMING") {
    return {
      id,
      format: fixture.format,
      group: fixture.group,
      seriesName: fixture.seriesName,
      teamAId: fixture.teamA,
      teamBId: fixture.teamB,
      venue: fixture.venue,
      date: date.toISOString(),
      status,
      tossWinnerId,
      tossDecision,
      innings: [],
      result: "",
      motmPlayerId: null,
    };
  }

  const innings1 = generateInnings(`${seed}-inn1`, battingFirst, battingSecond, fixture.format);

  if (status === "LIVE") {
    const remainingOvers = Math.max(4, FORMAT_MAX_OVERS[fixture.format] - Math.round(FORMAT_MAX_OVERS[fixture.format] * 0.35));
    const innings2 = generateInnings(`${seed}-inn2`, battingSecond, battingFirst, fixture.format, {
      inProgress: true,
      targetOvers: remainingOvers,
    });
    return {
      id,
      format: fixture.format,
      group: fixture.group,
      seriesName: fixture.seriesName,
      teamAId: fixture.teamA,
      teamBId: fixture.teamB,
      venue: fixture.venue,
      date: date.toISOString(),
      status,
      tossWinnerId,
      tossDecision,
      innings: [innings1, innings2],
      result: `${battingSecond} need ${Math.max(0, innings1.runs + 1 - innings2.runs)} runs to win`,
      motmPlayerId: null,
    };
  }

  const target = innings1.runs + 1;
  const innings2 = generateInnings(`${seed}-inn2`, battingSecond, battingFirst, fixture.format);
  const isTest = fixture.format === "TEST";
  const drawRoll = isTest ? rng() : 1;

  let result: string;
  if (isTest && drawRoll < 0.22) {
    result = "Match drawn";
  } else if (innings2.runs >= target) {
    const marginWickets = 10 - innings2.wickets;
    result = `${battingSecond} won by ${Math.max(1, marginWickets)} wicket${marginWickets === 1 ? "" : "s"}`;
  } else if (innings2.runs === innings1.runs) {
    result = "Match tied";
  } else {
    const margin = innings1.runs - innings2.runs;
    result = `${battingFirst} won by ${margin} run${margin === 1 ? "" : "s"}`;
  }

  const allBatters = [...innings1.battingCard, ...innings2.battingCard];
  const allBowlers = [...innings1.bowlingCard, ...innings2.bowlingCard];
  const topBat = [...allBatters].sort((a, b) => b.runs - a.runs)[0];
  const topBowl = [...allBowlers].sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];
  const motmPlayerId = pick(rng, [topBat?.playerId, topBowl?.playerId].filter(Boolean) as string[]) ?? null;

  return {
    id,
    format: fixture.format,
    group: fixture.group,
    seriesName: fixture.seriesName,
    teamAId: fixture.teamA,
    teamBId: fixture.teamB,
    venue: fixture.venue,
    date: date.toISOString(),
    status,
    tossWinnerId,
    tossDecision,
    innings: [innings1, innings2],
    result,
    motmPlayerId,
  };
}

const ALL_FIXTURES: Fixture[] = [...buildGroupFixtures(), ...BILATERAL_FIXTURES];

export const MATCHES: Match[] = ALL_FIXTURES.map(buildMatch).sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
);

export function getMatch(id: string): Match | undefined {
  return MATCHES.find((m) => m.id === id);
}

export function liveMatches(): Match[] {
  return MATCHES.filter((m) => m.status === "LIVE");
}

export function recentResults(limit = 6): Match[] {
  return MATCHES.filter((m) => m.status === "COMPLETED")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function upcomingFixtures(limit = 6): Match[] {
  return MATCHES.filter((m) => m.status === "UPCOMING")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}

export function matchesForTeam(teamId: TeamId): Match[] {
  return MATCHES.filter((m) => m.teamAId === teamId || m.teamBId === teamId);
}

export function winnerOf(match: Match): TeamId | null {
  if (match.status !== "COMPLETED" || match.innings.length < 2) return null;
  const [inn1, inn2] = match.innings;
  if (inn2.runs > inn1.runs) return inn2.battingTeamId;
  if (inn1.runs > inn2.runs) return inn1.battingTeamId;
  return null;
}
