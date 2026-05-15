# skyhop ✈

Kid-friendly flight search focused on **Emirates, Etihad, Qatar Airways, and Turkish Airlines** — the four major Middle East / Turkey long-haul carriers. Pick a city on a colorful map, hop on a plane.

Built with **Next.js 16**, **React 19.2**, and **Tailwind v4**. No backend — flight data is generated deterministically from a mock catalog so every demo run is reproducible.

## Features

- 🗺️ **Two ways to pick a route**
  - 🗺️ **Real-world map** — d3-geo Mercator projection with pan / pinch-zoom, supercluster-powered cluster pins, and an animated plane riding the great-circle arc between FROM and TO
  - 🔤 **Type / list** — classic dropdown for power users
- 🔍 Search by origin, destination, date, cabin, and passenger count
- 🏷️ Filter by airline, max stops, price; sort by price / duration / departure
- ✈️ Flight detail page with full segment / baggage / layover breakdown
- 💳 Mock booking flow: passenger form → fake checkout → confirmation (with confetti 🎉)
- 🧸 Kid-friendly polish: bouncy +/- traveler counter, "Hoppy" mascot plane, drifting plane animation, gradient hero, wobble cards

## Run it

```bash
git clone https://github.com/arslanmajid91-ui/skyhop.git
cd skyhop
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No env vars needed — there's no real API or database.

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

Current city catalog: **~150 international airports** across Americas, Europe, Middle East, Africa, Asia/Pacific, Central Asia, and Oceania — defined in [`src/lib/airlines.ts`](./src/lib/airlines.ts) along with `AIRPORT_LATLNG` (real lat/lng for the Mercator map).

## Project structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # home: hero + search form + popular routes + carriers
│   ├── globals.css                       # Tailwind v4 + custom kid-friendly animations
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
│           └── confirmation/page.tsx     # booking ref + confetti burst
├── components/
│   ├── Header.tsx                        # sticky top nav
│   ├── SearchForm.tsx                    # picker-mode toggle + form state
│   ├── RealWorldMapPicker.tsx            # 🗺️ d3-geo + d3-zoom + supercluster + animated arc
│   ├── BouncyCounter.tsx                 # +/- traveler counter
│   ├── ConfettiBurst.tsx                 # canvas-confetti wrapper for the success page
│   ├── FlightCard.tsx
│   ├── FilterSidebar.tsx
│   ├── AirlineLogo.tsx
│   └── icons.tsx                         # SVG icons + Hoppy mascot + drifting plane
└── lib/
    ├── airlines.ts                       # AIRLINES, AIRPORTS, AIRPORT_LATLNG, airlineServes()
    ├── flights.ts                        # searchFlights() + findFlight()
    └── format.ts                         # price / duration / time formatters
```

## Swapping mock data for a real API

The single seam to replace is `searchFlights()` / `findFlight()` in [`src/lib/flights.ts`](./src/lib/flights.ts). Wire those to e.g. [Duffel](https://duffel.com) or [Amadeus Self-Service](https://developers.amadeus.com) — pages already pass typed `Flight` objects around so the UI doesn't need to change.

## Next steps

- [ ] Scale the airport catalog from ~21 to 1,200+ international airports (requires a zoomable / clustered map — see "Map at scale" below)
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
- [d3-geo](https://github.com/d3/d3-geo) + [topojson-client](https://github.com/topojson/topojson-client) + [world-atlas](https://github.com/topojson/world-atlas) — real-world Mercator map
- [canvas-confetti](https://github.com/catdad/canvas-confetti) — booking-confirmation celebration

## Heads up — Next.js 16 vs. older docs

If you search the web for help:
- `searchParams` and `params` in pages are **Promises** — must `await` them
- `cookies()`, `headers()` are async
- `middleware.ts` → `proxy.ts` (not used here, but useful to know)
- Turbopack is the default; no `--turbopack` flag needed
