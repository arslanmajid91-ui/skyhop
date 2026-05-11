# skyhop ✈

Flight search like Expedia, focused on **Emirates, Etihad, Qatar Airways, and Turkish Airlines** — the four major Middle East/Turkey long-haul carriers.

Built with **Next.js 16**, **React 19.2**, and **Tailwind v4**. No backend required — flight data is generated deterministically from a mock catalog so every demo run is reproducible.

## Features

- 🔍 Search by origin, destination, date, cabin, and passenger count
- 🏷️ Filter by airline, max stops, price; sort by price / duration / departure
- ✈️ Flight detail page with full segment / baggage / layover breakdown
- 💳 Mock booking flow: passenger form → fake checkout → confirmation with booking ref

## Run it

```bash
git clone https://github.com/arslanmajid91-ui/skyhop.git
cd skyhop
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No env vars needed — there's no real API or database.

## How "search" works

The four carriers all fly globally via their hubs:

| Code | Airline          | Hub                |
| ---- | ---------------- | ------------------ |
| EK   | Emirates         | Dubai (DXB)        |
| EY   | Etihad Airways   | Abu Dhabi (AUH)    |
| QR   | Qatar Airways    | Doha (DOH)         |
| TK   | Turkish Airlines | Istanbul (IST)     |

For any (`from`, `to`, `date`) we generate:
- **Nonstop** flights when `from` or `to` is the airline's hub (2 options per carrier)
- **1-stop via hub** otherwise (1–2 options per carrier)

Times and prices are seeded by `hash(airline, route, date)` so refreshing the same search returns the same results. See [`src/lib/flights.ts`](./src/lib/flights.ts).

## Project structure

```
src/
├── app/
│   ├── page.tsx                          # home with hero + search form
│   ├── flights/
│   │   ├── page.tsx                      # results (search params drive it)
│   │   └── [id]/page.tsx                 # single flight detail
│   └── book/
│       └── [id]/
│           ├── page.tsx                  # passenger details
│           ├── PassengerForm.tsx
│           ├── payment/
│           │   ├── page.tsx
│           │   └── PaymentForm.tsx
│           └── confirmation/page.tsx
├── components/
│   ├── SearchForm.tsx                    # used on home + results
│   ├── FlightCard.tsx
│   ├── FilterSidebar.tsx
│   └── AirlineLogo.tsx
└── lib/
    ├── airlines.ts                       # AIRLINES, AIRPORTS data tables
    ├── flights.ts                        # searchFlights() + findFlight()
    └── format.ts                         # price/duration/time formatters
```

## Swapping mock data for a real API

The single seam to replace is `searchFlights()` / `findFlight()` in [`src/lib/flights.ts`](./src/lib/flights.ts). Wire those to e.g. [Duffel](https://duffel.com) or [Amadeus Self-Service](https://developers.amadeus.com) — pages already pass typed `Flight` objects around so the UI doesn't need to change.

## Next steps

- [ ] Round-trip / multi-city search
- [ ] Real airport search (typeahead) instead of dropdown
- [ ] Seat selection in the booking flow
- [ ] Persist bookings (Supabase) so users can view trip history
- [ ] Real fares via Duffel sandbox

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19.2](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- TypeScript

## Heads up — Next.js 16 vs. older docs

If you search the web for help:
- `searchParams` and `params` in pages are **Promises** — must `await` them
- `cookies()`, `headers()` are async
- `middleware.ts` → `proxy.ts` (not used here, but useful to know)
- Turbopack is the default; no `--turbopack` flag needed
