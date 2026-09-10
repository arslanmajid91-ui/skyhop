import Link from "next/link";
import { liveMatches } from "@/lib/matches";
import { CricketBallIcon } from "./icons";

const NAV_LINKS = [
  { href: "/matches", label: "Matches" },
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/standings", label: "Standings" },
];

export function Header() {
  const hasLive = liveMatches().length > 0;
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white">
            <CricketBallIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Boundary
          </span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {hasLive && (
            <Link
              href="/matches?status=LIVE"
              className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Live
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
