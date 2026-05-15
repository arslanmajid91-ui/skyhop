import Link from "next/link";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import AirlineLogo from "@/components/AirlineLogo";
import { AIRLINE_LIST } from "@/lib/airlines";
import { PlaneCruiseIcon, A380Plane } from "@/components/icons";

const POPULAR_ROUTES: { from: string; to: string; label: string; emoji: string }[] = [
  { from: "JFK", to: "DXB", label: "New York → Dubai",       emoji: "🌃" },
  { from: "LHR", to: "DOH", label: "London → Doha",          emoji: "🇬🇧" },
  { from: "CDG", to: "IST", label: "Paris → Istanbul",       emoji: "🥐" },
  { from: "BOM", to: "AUH", label: "Mumbai → Abu Dhabi",     emoji: "🕌" },
  { from: "SIN", to: "DXB", label: "Singapore → Dubai",      emoji: "🌴" },
  { from: "JFK", to: "IST", label: "New York → Istanbul",    emoji: "🕌" },
];

function quickRouteHref(from: string, to: string) {
  const date = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const p = new URLSearchParams({ from, to, date, cabin: "economy", passengers: "1" });
  return `/flights?${p.toString()}`;
}

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950">
        {/* ----- Hero ----- */}
        <section
          className="relative overflow-hidden px-6 pb-32 pt-16 text-white"
          style={{
            background:
              "linear-gradient(135deg, #1e1b4b 0%, #4338ca 25%, #c026d3 55%, #f97316 95%)",
          }}
        >
          {/* Floating colored orbs */}
          <div
            className="float-orb"
            style={{
              width: 320,
              height: 320,
              top: "-60px",
              left: "10%",
              background: "rgba(244, 114, 182, 0.6)",
              animationDelay: "0s",
            }}
          />
          <div
            className="float-orb"
            style={{
              width: 260,
              height: 260,
              top: "20%",
              right: "5%",
              background: "rgba(56, 189, 248, 0.55)",
              animationDelay: "-3s",
            }}
          />
          <div
            className="float-orb"
            style={{
              width: 220,
              height: 220,
              bottom: "10%",
              left: "30%",
              background: "rgba(251, 191, 36, 0.45)",
              animationDelay: "-6s",
            }}
          />

          {/* Cruising airplane that drifts across the hero */}
          <PlaneCruiseIcon className="plane-drift" />

          {/* Hero A380 (right side, hidden on mobile) */}
          <A380Plane className="mascot-bob pointer-events-none absolute right-4 top-12 hidden h-40 w-40 md:block lg:right-12 lg:top-16 lg:h-56 lg:w-56" />

          {/* Headline */}
          <div className="relative mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Where to{" "}
              <span className="gradient-text">next?</span>
            </h1>
            <p className="mt-4 text-base text-white/90 sm:text-lg">
              Pick a city, hop on a plane! Compare <strong>Emirates</strong>,{" "}
              <strong>Etihad</strong>, <strong>Qatar</strong> and{" "}
              <strong>Turkish</strong> — all in one super-search.
            </p>
          </div>
        </section>

        {/* ----- Search card (overlaps hero) ----- */}
        <section className="px-6">
          <div className="mx-auto -mt-24 max-w-5xl rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl backdrop-blur dark:border-zinc-700/60 dark:bg-zinc-900/95">
            <SearchForm />
          </div>
        </section>

        {/* ----- Popular routes ----- */}
        <section className="mx-auto max-w-5xl px-6 pt-10 pb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">
            🔥 Popular routes
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {POPULAR_ROUTES.map((r) => (
              <Link
                key={`${r.from}-${r.to}`}
                href={quickRouteHref(r.from, r.to)}
                className="route-chip inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-pink-300 hover:text-pink-700 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-pink-500 dark:hover:text-pink-300"
              >
                <span aria-hidden>{r.emoji}</span>
                <span>{r.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ----- Carriers ----- */}
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">
            🛫 Carriers we search
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AIRLINE_LIST.map((a) => (
              <div
                key={a.code}
                className="carrier-card group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div
                  className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 transition group-hover:opacity-40 group-hover:scale-110"
                  style={{ backgroundColor: a.color }}
                />
                <div className="relative flex items-center gap-3">
                  <AirlineLogo code={a.code} size={44} />
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {a.name}
                    </div>
                    <div className="text-xs text-zinc-500">Hub: {a.hub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ----- Fun footer strip ----- */}
        <footer className="border-t border-zinc-200 bg-white/60 px-6 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60">
          Built with ✈️ + Next.js · <a href="https://github.com/arslanmajid91-ui/skyhop" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">source on GitHub</a>
        </footer>
      </main>
    </>
  );
}
