import Link from "next/link";
import { getTeam, type TeamId } from "@/lib/teams";

export function TeamBadge({
  teamId,
  size = "md",
  linked = true,
}: {
  teamId: TeamId;
  size?: "sm" | "md" | "lg";
  linked?: boolean;
}) {
  const team = getTeam(teamId);
  if (!team) return null;
  const textSize = size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm";
  const flagSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  const content = (
    <span className="inline-flex items-center gap-2">
      <span className={flagSize}>{team.flag}</span>
      <span className={`font-semibold ${textSize}`}>{team.name}</span>
    </span>
  );
  if (!linked) return content;
  return (
    <Link href={`/teams/${team.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
      {content}
    </Link>
  );
}

export function TeamStripe({ teamId }: { teamId: TeamId }) {
  const team = getTeam(teamId);
  if (!team) return null;
  return <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: team.primary }} />;
}
