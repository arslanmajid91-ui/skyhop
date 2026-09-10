import { formatOvers } from "@/lib/format";
import type { Innings } from "@/lib/matches";

export function ScoreLine({ innings, compact = false }: { innings: Innings | undefined; compact?: boolean }) {
  if (!innings) {
    return <span className="text-sm text-zinc-400 dark:text-zinc-500">yet to bat</span>;
  }
  const wicketsLabel = innings.wickets >= 10 ? "" : `/${innings.wickets}`;
  return (
    <span className={`font-mono tabular-nums ${compact ? "text-sm" : "text-base"} font-bold`}>
      {innings.runs}
      {wicketsLabel}
      <span className="ml-1.5 font-sans text-xs font-medium text-zinc-500 dark:text-zinc-400">
        ({formatOvers(innings.oversInt, innings.ballsExtra)} ov{innings.inProgress ? "*" : ""})
      </span>
    </span>
  );
}
