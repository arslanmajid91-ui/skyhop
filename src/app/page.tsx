import Link from "next/link";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import AirlineLogo from "@/components/AirlineLogo";
import { AIRLINE_LIST, type AirlineCode } from "@/lib/airlines";
import { PlaneCruiseIcon, A380Plane } from "@/components/icons";

const POPULAR_ROUTES = [
  { from: "JFK", to: "DXB", label: "New York → Dubai",    emoji: "🌃" },
  { from: "LHR", to: "DOH", label: "London → Doha",       emoji: "🇬🇧" },
  { from: "CDG", to: "IST", label: "Paris → Istanbul",    emoji: "🥐" },
  { from: "BOM", to: "AUH", label: "Mumbai → Abu Dhabi",  emoji: "🕌" },
  { from: "SIN", to: "DXB", label: "Singapore → Dubai",   emoji: "🌴" },
  { from: "JFK", to: "IST", label: "New York → Istanbul", emoji: "🕌" },
];

const HOT_DEALS: {
  from: string; to: string; fromCity: string; toCity: string;
  price: number; airline: AirlineCode; airlineName: string;
  badge: string; bg: string; emoji: string;
}[] = [
  {
    from: "JFK", to: "DXB", fromCity: "New York", toCity: "Dubai",
    price: 389, airline: "EK", airlineName: "Emirates",
    badge: "Best seller",
    bg: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
    emoji: "🏙️",
  },
  {
    from: "LHR", to: "DOH", fromCity: "London", toCity: "Doha",
    price: 445, airline: "QR", airlineName: "Qatar Airways",
    badge: "Award-winning",
    bg: "linear-gradient(135deg, #7e22ce 0%, #db2777 100%)",
    emoji: "🌟",
  },
  {
    from: "CDG", to: "IST", fromCity: "Paris", toCity: "Istanbul",
    price: 312, airline: "TK", airlineName: "Turkish Airlines",
    badge: "Hot deal",
    bg: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
    emoji: "🕌",
  },
  {
    from: "BOM", to: "AUH", fromCity: "Mumbai", toCity: "Abu Dhabi",
    price: 199, airline: "EY", airlineName: "Etihad Airways",
    badge: "Flash sale",
    bg: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    emoji: "🌇",
  },
];

const TRENDING = [
  {
    to: "DXB", from: "JFK", city: "Dubai",    country: "UAE",
    emoji: "🏙️", bg: "linear-gradient(135deg, #f59e0b, #f97316, #dc2626)", price: 389,
  },
  {
    to: "IST", from: "JFK", city: "Istanbul", country: "Turkey",
    emoji: "🕌", bg: "linear-gradient(135deg, #991b1b, #7e22ce)", price: 520,
  },
  {
    to: "DOH", from: "LHR", city: "Doha",     country: "Qatar",
    emoji: "🌟", bg: "linear-gradient(135deg, #6b21a8, #be185d)", price: 445,
  },
  {
    to: "BKK", from: "DXB", city: "Bangkok",  country: "Thailand",
    emoji: "🌺", bg: "linear-gradient(135deg, #065f46, #0e7490)", price: 380,
  },
  {
    to: "DPS", from: "SIN", city: "Bali",     country: "Indonesia",
    emoji: "🌴", bg: "linear-gradient(135deg, #15803d, #0891b2)", price: 280,
  },
  {
    to: "MLE", from: "DXB", city: "Malé",     country: "Maldives",
    emoji: "🐠", bg: "linear-gradient(135deg, #0284c7, #4f46e5)", price: 340,
  },
];

const WHY_ITEMS = [
  {
    icon: "✈️",
    title: "4 Airlines, 1 Search",
    desc: "Compare Emirates, Etihad, Qatar Airways and Turkish Airlines side-by-side — in seconds.",
  },
  {
    icon: "💰",
    title: "No Hidden Fees",
    desc: "The price you see includes all taxes and carrier fees. No unpleasant surprises at checkout.",
  },
  {
    icon: "🔒",
    title: "Secure Booking",
    desc: "Bank-grade encryption protects your payment data end-to-end, every time.",
  },
  {
    icon: "⚡",
    title: "Instant Confirmation",
    desc: "Book in minutes and get your e-ticket immediately — no waiting, no phone calls.",
  },
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
          <div className="float-orb" style={{ width: 320, height: 320, top: "-60px", left: "10%", background: "rgba(244, 114, 182, 0.6)", animationDelay: "0s" }} />
          <div className="float-orb" style={{ width: 260, height: 260, top: "20%", right: "5%", background: "rgba(56, 189, 248, 0.55)", animationDelay: "-3s" }} />
          <div className="float-orb" style={{ width: 220, height: 220, bottom: "10%", left: "30%", background: "rgba(251, 191, 36, 0.45)", animationDelay: "-6s" }} />
          <PlaneCruiseIcon className="plane-drift" />
          <A380Plane className="mascot-bob pointer-events-none absolute right-4 top-12 hidden h-40 w-40 md:block lg:right-12 lg:top-16 lg:h-56 lg:w-56" />

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

        {/* ----- Trust bar ----- */}
        <section className="mx-auto max-w-5xl px-6 pt-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { stat: "150+", label: "Destinations",       icon: "🌍" },
              { stat: "4",    label: "Premium Airlines",   icon: "✈️" },
              { stat: "$0",   label: "Booking Fees",       icon: "💸" },
              { stat: "5★",   label: "Avg. Airline Rating",icon: "⭐" },
            ].map(({ stat, label, icon }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-xl">{icon}</span>
                <span className="mt-1 text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{stat}</span>
                <span className="text-xs text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ----- Hot deals ----- */}
        <section className="mx-auto max-w-5xl px-6 pt-10 pb-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              🔥 Today&apos;s hot deals
            </h2>
            <Link
              href="/flights"
              className="text-xs font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOT_DEALS.map((deal) => (
              <Link
                key={`${deal.from}-${deal.to}`}
                href={quickRouteHref(deal.from, deal.to)}
                className="group relative overflow-hidden rounded-2xl text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: deal.bg }}
              >
                <div className="p-5">
                  <span className="inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-bold backdrop-blur-sm">
                    {deal.badge}
                  </span>
                  <div className="mt-4 text-4xl leading-none">{deal.emoji}</div>
                  <div className="mt-3">
                    <div className="text-xs opacity-75">{deal.fromCity} → {deal.toCity}</div>
                    <div className="text-lg font-bold leading-tight">{deal.toCity}</div>
                    <div className="mt-0.5 text-xs opacity-75">{deal.airlineName}</div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-xs opacity-75">from</span>
                    <span className="text-2xl font-extrabold">${deal.price}</span>
                    <span className="text-xs opacity-75">/ person</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ----- Trending destinations ----- */}
        <section className="mx-auto max-w-5xl px-6 pt-8 pb-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">
            🌍 Trending destinations
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TRENDING.map((d) => (
              <Link
                key={d.to}
                href={quickRouteHref(d.from, d.to)}
                className="group relative overflow-hidden rounded-2xl text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                style={{ minHeight: 160 }}
              >
                <div
                  className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                  style={{ background: d.bg }}
                />
                <div className="relative flex flex-col justify-between p-4" style={{ minHeight: 160 }}>
                  <div className="text-3xl">{d.emoji}</div>
                  <div>
                    <div className="text-lg font-bold leading-tight">{d.city}</div>
                    <div className="text-xs opacity-75">{d.country}</div>
                    <div className="mt-1 inline-block rounded-full bg-black/25 px-2 py-0.5 text-xs font-semibold">
                      from ${d.price}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ----- Why Skyhop? ----- */}
        <section className="mx-auto max-w-5xl px-6 pt-8 pb-4">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">
            💡 Why Skyhop?
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="text-3xl">{item.icon}</div>
                <div className="mt-3 font-bold text-zinc-900 dark:text-zinc-100">{item.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ----- Popular routes ----- */}
        <section className="mx-auto max-w-5xl px-6 pt-8 pb-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">
            🛫 Popular routes
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

        {/* ----- Newsletter strip ----- */}
        <section className="mx-auto max-w-5xl px-6 pt-8 pb-4">
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-10 text-white"
            style={{
              background:
                "linear-gradient(135deg, #4338ca 0%, #c026d3 60%, #f97316 100%)",
            }}
          >
            <div
              className="float-orb pointer-events-none"
              style={{ width: 200, height: 200, top: "-50px", right: "8%", background: "rgba(255,255,255,0.12)", animationDelay: "-2s" }}
            />
            <div className="relative max-w-2xl">
              <h3 className="text-2xl font-extrabold">Never miss a deal</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Get exclusive flash sales, seat upgrades, and limited-time fares from Emirates, Qatar,
                Etihad and Turkish delivered straight to your inbox.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-white/30 bg-white/20 px-4 py-3 text-sm text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="button"
                  className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 transition hover:bg-white/90 active:scale-95"
                >
                  Subscribe — it&apos;s free
                </button>
              </div>
              <p className="mt-3 text-xs text-white/55">No spam. Unsubscribe any time.</p>
            </div>
          </div>
        </section>

        {/* ----- Carriers we search ----- */}
        <section className="mx-auto max-w-5xl px-6 pt-8 pb-4">
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
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{a.name}</div>
                    <div className="text-xs text-zinc-500">Hub: {a.hub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ----- Footer ----- */}
        <footer className="mt-12 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  <span>✈</span>
                  <span>skyhop</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  Compare flights across four premium Middle East &amp; Turkey carriers.
                  One search. Best fares. Zero fees.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Flights</h4>
                <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <li><Link href="/flights?cabin=economy" className="hover:text-zinc-900 dark:hover:text-zinc-100">Economy Flights</Link></li>
                  <li><Link href="/flights?cabin=premium" className="hover:text-zinc-900 dark:hover:text-zinc-100">Premium Economy</Link></li>
                  <li><Link href="/flights?cabin=business" className="hover:text-zinc-900 dark:hover:text-zinc-100">Business Class</Link></li>
                  <li><Link href="/flights?cabin=first" className="hover:text-zinc-900 dark:hover:text-zinc-100">First Class</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Popular Routes</h4>
                <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {POPULAR_ROUTES.slice(0, 4).map((r) => (
                    <li key={`footer-${r.from}-${r.to}`}>
                      <Link
                        href={quickRouteHref(r.from, r.to)}
                        className="hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Company</h4>
                <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">About</a></li>
                  <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Blog</a></li>
                  <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Terms of Service</a></li>
                  <li>
                    <a
                      href="https://github.com/arslanmajid91-ui/skyhop"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <div className="flex flex-col items-center gap-2 text-center text-xs text-zinc-500 sm:flex-row sm:justify-between">
                <span>© {new Date().getFullYear()} Skyhop · Built with ✈️ + Next.js</span>
                <a
                  href="https://github.com/arslanmajid91-ui/skyhop"
                  className="underline hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  source on GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
