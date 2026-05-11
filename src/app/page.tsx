import SearchForm from "@/components/SearchForm";
import { AIRLINE_LIST } from "@/lib/airlines";

export default function Home() {
  return (
    <div className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-700 via-sky-600 to-indigo-700 px-6 pt-20 pb-32 text-white">
        <div className="absolute inset-0 opacity-10 [background:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find the right flight, faster.
          </h1>
          <p className="mt-3 text-base text-sky-100 sm:text-lg">
            Compare Emirates, Etihad, Qatar Airways and Turkish Airlines in one place.
          </p>
        </div>
      </section>

      <section className="-mt-20 px-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <SearchForm />
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-6 pb-20">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Carriers we search
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AIRLINE_LIST.map((a) => (
            <div
              key={a.code}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold text-white"
                style={{ backgroundColor: a.color }}
              >
                {a.code}
              </div>
              <div>
                <div className="text-sm font-medium">{a.name}</div>
                <div className="text-xs text-zinc-500">Hub: {a.hub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
