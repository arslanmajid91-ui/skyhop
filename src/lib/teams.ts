export type TeamId =
  | "IND"
  | "AUS"
  | "ENG"
  | "PAK"
  | "RSA"
  | "NZ"
  | "SL"
  | "BAN"
  | "WI"
  | "AFG";

export interface Team {
  id: TeamId;
  name: string;
  flag: string;
  primary: string;
  secondary: string;
}

export const TEAMS: Team[] = [
  { id: "IND", name: "India", flag: "🇮🇳", primary: "#1d4ed8", secondary: "#f97316" },
  { id: "AUS", name: "Australia", flag: "🇦🇺", primary: "#eab308", secondary: "#065f46" },
  { id: "ENG", name: "England", flag: "🏴", primary: "#1e3a8a", secondary: "#dc2626" },
  { id: "PAK", name: "Pakistan", flag: "🇵🇰", primary: "#15803d", secondary: "#f0fdf4" },
  { id: "RSA", name: "South Africa", flag: "🇿🇦", primary: "#15803d", secondary: "#facc15" },
  { id: "NZ", name: "New Zealand", flag: "🇳🇿", primary: "#18181b", secondary: "#f8fafc" },
  { id: "SL", name: "Sri Lanka", flag: "🇱🇰", primary: "#1e40af", secondary: "#facc15" },
  { id: "BAN", name: "Bangladesh", flag: "🇧🇩", primary: "#065f46", secondary: "#dc2626" },
  { id: "WI", name: "West Indies", flag: "🏆", primary: "#7f1d1d", secondary: "#facc15" },
  { id: "AFG", name: "Afghanistan", flag: "🇦🇫", primary: "#0369a1", secondary: "#dc2626" },
];

export function getTeam(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function requireTeam(id: string): Team {
  const t = getTeam(id);
  if (!t) throw new Error(`Unknown team id: ${id}`);
  return t;
}
