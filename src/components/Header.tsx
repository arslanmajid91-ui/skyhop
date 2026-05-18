import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          <span className="text-2xl">✈</span>
          <span>skyhop</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-zinc-600 dark:text-zinc-400 sm:flex">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Search</Link>
          <Link href="/settings" className="hover:text-zinc-900 dark:hover:text-zinc-100">Settings</Link>
          <a href="https://github.com/arslanmajid91-ui/skyhop" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-100">GitHub</a>
        </nav>
      </div>
    </header>
  );
}
