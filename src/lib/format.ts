export function formatOvers(oversInt: number, ballsExtra: number): string {
  return ballsExtra === 0 ? `${oversInt}.0` : `${oversInt}.${ballsExtra}`;
}

export function oversToBalls(oversInt: number, ballsExtra: number): number {
  return oversInt * 6 + ballsExtra;
}

export function runRate(runs: number, oversInt: number, ballsExtra: number): number {
  const balls = oversToBalls(oversInt, ballsExtra);
  if (balls === 0) return 0;
  return Math.round((runs / balls) * 6 * 100) / 100;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
