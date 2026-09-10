import { oversToBalls } from "./format";
import { MATCHES, winnerOf, type Group } from "./matches";
import { TEAMS, type TeamId } from "./teams";

export interface StandingRow {
  teamId: TeamId;
  played: number;
  won: number;
  lost: number;
  tied: number;
  points: number;
  runsFor: number;
  ballsFor: number;
  runsAgainst: number;
  ballsAgainst: number;
  netRunRate: number;
}

function emptyRow(teamId: TeamId): StandingRow {
  return { teamId, played: 0, won: 0, lost: 0, tied: 0, points: 0, runsFor: 0, ballsFor: 0, runsAgainst: 0, ballsAgainst: 0, netRunRate: 0 };
}

export function standingsFor(group: Group): StandingRow[] {
  const teamIds = TEAMS.map((t) => t.id).filter((id) =>
    MATCHES.some((m) => m.group === group && (m.teamAId === id || m.teamBId === id)),
  );
  const rows = new Map<TeamId, StandingRow>(teamIds.map((id) => [id, emptyRow(id)]));

  for (const match of MATCHES) {
    if (match.group !== group || match.status !== "COMPLETED" || match.innings.length < 2) continue;
    const [inn1, inn2] = match.innings;
    for (const inn of [inn1, inn2]) {
      const row = rows.get(inn.battingTeamId);
      if (!row) continue;
      row.runsFor += inn.runs;
      row.ballsFor += oversToBalls(inn.oversInt, inn.ballsExtra);
    }
    for (const inn of [inn1, inn2]) {
      const opponentId = inn.battingTeamId === match.teamAId ? match.teamBId : match.teamAId;
      const row = rows.get(opponentId);
      if (!row) continue;
      row.runsAgainst += inn.runs;
      row.ballsAgainst += oversToBalls(inn.oversInt, inn.ballsExtra);
    }
    const winner = winnerOf(match);
    const rowA = rows.get(match.teamAId);
    const rowB = rows.get(match.teamBId);
    if (rowA) rowA.played += 1;
    if (rowB) rowB.played += 1;
    if (winner === null) {
      if (rowA) { rowA.tied += 1; rowA.points += 1; }
      if (rowB) { rowB.tied += 1; rowB.points += 1; }
    } else {
      const loserRow = winner === match.teamAId ? rowB : rowA;
      const winnerRow = winner === match.teamAId ? rowA : rowB;
      if (winnerRow) { winnerRow.won += 1; winnerRow.points += 2; }
      if (loserRow) { loserRow.lost += 1; }
    }
  }

  for (const row of rows.values()) {
    const rateFor = row.ballsFor > 0 ? (row.runsFor / row.ballsFor) * 6 : 0;
    const rateAgainst = row.ballsAgainst > 0 ? (row.runsAgainst / row.ballsAgainst) * 6 : 0;
    row.netRunRate = Math.round((rateFor - rateAgainst) * 1000) / 1000;
  }

  return [...rows.values()].sort((a, b) => b.points - a.points || b.netRunRate - a.netRunRate);
}
