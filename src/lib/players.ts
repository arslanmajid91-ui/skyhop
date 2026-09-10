import { intBetween, pickUnique, rngFor } from "./hash";
import { TEAMS, type TeamId } from "./teams";

export type Role = "Batter" | "Bowler" | "All-rounder" | "Wicketkeeper";
export type Format = "TEST" | "ODI" | "T20I";

export const FORMATS: Format[] = ["TEST", "ODI", "T20I"];

export const FORMAT_LABEL: Record<Format, string> = {
  TEST: "Test",
  ODI: "ODI",
  T20I: "T20I",
};

export interface BattingStats {
  matches: number;
  innings: number;
  runs: number;
  average: number;
  strikeRate: number;
  hundreds: number;
  fifties: number;
  highScore: number;
}

export interface BowlingStats {
  matches: number;
  wickets: number;
  average: number;
  economy: number;
  bestFigures: string;
}

export interface Player {
  id: string;
  name: string;
  teamId: TeamId;
  role: Role;
  battingStyle: string;
  bowlingStyle: string;
  jersey: number;
  batting: Record<Format, BattingStats>;
  bowling: Record<Format, BowlingStats>;
}

const NAME_POOLS: Record<TeamId, { first: string[]; last: string[] }> = {
  IND: {
    first: ["Rohan", "Aryan", "Vikram", "Karan", "Rahul", "Suresh", "Anil", "Rajesh", "Devansh", "Yash", "Kabir", "Nikhil", "Arjun", "Sanjay", "Mohit"],
    last: ["Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Chauhan", "Malhotra", "Kapoor", "Bhatt", "Rao", "Mehta", "Joshi", "Pillai", "Gill"],
  },
  AUS: {
    first: ["Jack", "Liam", "Ethan", "Cameron", "Nathan", "Connor", "Mitchell", "Ryan", "Dean", "Trent", "Scott", "Lachlan", "Ben", "Josh", "Cooper"],
    last: ["Walsh", "Carter", "Harper", "Beck", "Turner", "Hardy", "Mackenzie", "Doyle", "Ferguson", "Whitfield", "Sutton", "Pearce", "Grady", "Sinclair", "Adler"],
  },
  ENG: {
    first: ["Oliver", "Harry", "George", "Charlie", "Thomas", "Freddie", "William", "James", "Edward", "Alfie", "Daniel", "Sam", "Ben", "Joe", "Toby"],
    last: ["Ashby", "Harrington", "Pemberton", "Fairweather", "Holloway", "Radcliffe", "Whitmore", "Barrington", "Ellery", "Marsh", "Drummond", "Wren", "Stanton", "Colby", "Rutherford"],
  },
  PAK: {
    first: ["Hamza", "Usman", "Ahmed", "Bilal", "Zeeshan", "Faisal", "Imran", "Waqar", "Shoaib", "Adeel", "Kamran", "Junaid", "Salman", "Tariq", "Danish"],
    last: ["Malik", "Butt", "Sheikh", "Raza", "Iqbal", "Farooq", "Chaudhry", "Aslam", "Hussain", "Qureshi", "Baig", "Siddiqui", "Anwar", "Gul", "Yousafzai"],
  },
  RSA: {
    first: ["Pieter", "Johan", "Kyle", "Dean", "Marco", "Ruan", "Wayne", "Lance", "Theo", "Grant", "Riley", "Chad", "Stefan", "Cole", "Devon"],
    last: ["Botha", "Coetzee", "Pretorius", "Kruger", "Nel", "Fourie", "Viljoen", "Els", "Marais", "Burger", "Roux", "Venter", "Naude", "Human", "Jonker"],
  },
  NZ: {
    first: ["Liam", "Jack", "Cole", "Riley", "Hayden", "Mitchell", "Corey", "Finn", "Reuben", "Zac", "Logan", "Isaac", "Dylan", "Caleb", "Ollie"],
    last: ["Grant", "Fisher", "Bennett", "Harkness", "Mackay", "Sutherland", "Dunstan", "Chapman", "Sherwood", "Petrie", "Wallis", "Lang", "Ashworth", "Dobbie", "Innes"],
  },
  SL: {
    first: ["Kasun", "Dinesh", "Nuwan", "Chamara", "Lahiru", "Isuru", "Dhananjaya", "Sachith", "Kavindu", "Tharindu", "Ravindu", "Sahan", "Amila", "Janith", "Chathura"],
    last: ["Perera", "Fernando", "Silva", "Rathnayake", "Gunawardena", "Wickramasinghe", "Bandara", "Dias", "Weerasinghe", "Abeysinghe", "Gamage", "Jayawardena", "Herath", "Kumara", "Senanayake"],
  },
  BAN: {
    first: ["Rakibul", "Shafiul", "Mahmudul", "Tanvir", "Arafat", "Nasum", "Shoriful", "Ziaur", "Rakib", "Foysal", "Imtiaz", "Sabbir", "Rubaiyat", "Anisur", "Kamrul"],
    last: ["Islam", "Rahman", "Hossain", "Ahmed", "Chowdhury", "Hasan", "Alam", "Karim", "Uddin", "Molla", "Sarkar", "Talukder", "Mia", "Khan", "Haque"],
  },
  WI: {
    first: ["Marlon", "Kemar", "Rovman", "Keacy", "Odean", "Romario", "Akeem", "Justin", "Terrance", "Delano", "Quincy", "Rashad", "Tevin", "Jerdon", "Shervon"],
    last: ["Hamilton", "Joseph", "Charles", "Forde", "Providence", "Bishop", "Edwards", "Douglas", "Phillip", "Greaves", "Lewis", "Alexander", "Weekes", "Cadogan", "Bonner"],
  },
  AFG: {
    first: ["Mohammad", "Ibrahim", "Karim", "Naveed", "Yamin", "Sharafuddin", "Zubair", "Farhan", "Wafadar", "Sediqullah", "Ansari", "Jawad", "Rafiullah", "Baseer", "Ehsan"],
    last: ["Khan", "Stanikzai", "Noori", "Amiri", "Sultani", "Popal", "Wardak", "Rahimi", "Khil", "Barakzai", "Faizi", "Rasooli", "Anwari", "Habibi", "Sarwari"],
  },
};

const ROLE_PLAN: Role[] = [
  "Wicketkeeper",
  "Wicketkeeper",
  "Batter",
  "Batter",
  "Batter",
  "Batter",
  "Batter",
  "All-rounder",
  "All-rounder",
  "All-rounder",
  "Bowler",
  "Bowler",
  "Bowler",
  "Bowler",
  "Bowler",
];

const BATTING_STYLES = ["Right-hand bat", "Left-hand bat"];
const PACE_STYLES = ["Right-arm fast", "Right-arm fast-medium", "Left-arm fast", "Left-arm fast-medium"];
const SPIN_STYLES = ["Right-arm off break", "Left-arm orthodox", "Leg break googly"];

function battingStatsFor(rng: () => number, role: Role, format: Format): BattingStats {
  const isBowlerOnly = role === "Bowler";
  const formatFactor = format === "T20I" ? 1.35 : format === "ODI" ? 1.0 : 0.72;
  const matches = intBetween(rng, isBowlerOnly ? 20 : 35, isBowlerOnly ? 70 : 140);
  const innings = Math.max(1, Math.round(matches * (isBowlerOnly ? 0.55 : 0.92)));
  const baseAvg = isBowlerOnly ? intBetween(rng, 8, 18) : role === "Wicketkeeper" ? intBetween(rng, 28, 44) : role === "All-rounder" ? intBetween(rng, 24, 38) : intBetween(rng, 32, 52);
  const average = Math.round(baseAvg * 10) / 10;
  const strikeRate = Math.round((isBowlerOnly ? intBetween(rng, 55, 85) : intBetween(rng, 68, 98)) * formatFactor * 10) / 10;
  const runs = Math.max(0, Math.round(average * innings * intBetween(rng, 82, 96) / 100));
  const hundreds = isBowlerOnly ? 0 : Math.max(0, Math.round((runs / (format === "TEST" ? 900 : 1400)) * intBetween(rng, 6, 12) / 10));
  const fifties = isBowlerOnly ? intBetween(rng, 0, 2) : Math.max(hundreds, Math.round((runs / (format === "TEST" ? 260 : 420)) * intBetween(rng, 5, 9) / 10));
  const highScore = Math.min(runs, intBetween(rng, average + 20, average * 3 + 40));
  return { matches, innings, runs, average, strikeRate, hundreds, fifties, highScore };
}

function bowlingStatsFor(rng: () => number, role: Role, format: Format): BowlingStats {
  const bowlsRegularly = role === "Bowler" || role === "All-rounder";
  const matches = intBetween(rng, bowlsRegularly ? 25 : 10, bowlsRegularly ? 130 : 40);
  if (!bowlsRegularly) {
    return { matches, wickets: intBetween(rng, 0, 6), average: intBetween(rng, 45, 70), economy: Math.round(intBetween(rng, 55, 75) / 10 * 10) / 10, bestFigures: "1/12" };
  }
  const wicketsPerMatch = role === "Bowler" ? intBetween(rng, 12, 22) / 10 : intBetween(rng, 7, 15) / 10;
  const wickets = Math.max(1, Math.round(matches * wicketsPerMatch));
  const average = Math.round(intBetween(rng, format === "T20I" ? 180 : 220, format === "T20I" ? 260 : 340) / 10 * 10) / 10;
  const economy = Math.round(intBetween(rng, format === "T20I" ? 65 : format === "ODI" ? 42 : 26, format === "T20I" ? 92 : format === "ODI" ? 58 : 38) / 10 * 10) / 10;
  const bestWickets = Math.min(9, intBetween(rng, 3, 7));
  const bestRuns = intBetween(rng, 8, 45);
  return { matches, wickets, average, economy, bestFigures: `${bestWickets}/${bestRuns}` };
}

function buildPlayer(teamId: TeamId, index: number): Player {
  const pool = NAME_POOLS[teamId];
  const rng = rngFor(`player-${teamId}-${index}`);
  const [first] = pickUnique(rng, pool.first, 1);
  const [last] = pickUnique(rng, pool.last, 1);
  const name = `${first} ${last}`;
  const role = ROLE_PLAN[index % ROLE_PLAN.length];
  const battingStyle = pool.first.includes(first) && rng() < 0.32 ? BATTING_STYLES[1] : BATTING_STYLES[0];
  const bowlingStyle =
    role === "Batter" || role === "Wicketkeeper"
      ? rng() < 0.4
        ? pickUnique(rng, [...PACE_STYLES, ...SPIN_STYLES], 1)[0]
        : "—"
      : rng() < 0.55
        ? pickUnique(rng, PACE_STYLES, 1)[0]
        : pickUnique(rng, SPIN_STYLES, 1)[0];

  const batting = {} as Record<Format, BattingStats>;
  const bowling = {} as Record<Format, BowlingStats>;
  for (const format of FORMATS) {
    batting[format] = battingStatsFor(rngFor(`bat-${teamId}-${index}-${format}`), role, format);
    bowling[format] = bowlingStatsFor(rngFor(`bowl-${teamId}-${index}-${format}`), role, format);
  }

  return {
    id: `${teamId.toLowerCase()}-${index + 1}`,
    name,
    teamId,
    role,
    battingStyle,
    bowlingStyle,
    jersey: intBetween(rng, 1, 99),
    batting,
    bowling,
  };
}

export const PLAYERS: Player[] = TEAMS.flatMap((team) =>
  ROLE_PLAN.map((_, index) => buildPlayer(team.id, index)),
);

export function getPlayer(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export function playersByTeam(teamId: TeamId): Player[] {
  return PLAYERS.filter((p) => p.teamId === teamId);
}

export function topRunScorers(format: Format, limit = 10): Player[] {
  return [...PLAYERS].sort((a, b) => b.batting[format].runs - a.batting[format].runs).slice(0, limit);
}

export function topWicketTakers(format: Format, limit = 10): Player[] {
  return [...PLAYERS].sort((a, b) => b.bowling[format].wickets - a.bowling[format].wickets).slice(0, limit);
}
