export function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function PaperPlaneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M2.5 11.5L21.5 4l-7.5 19-3.5-8.5-8-3z" opacity="0.95" />
    </svg>
  );
}

/**
 * Cruising commercial jet silhouette — side view, nose pointing right.
 * Sized for the 56×56 .plane-drift slot in the hero. Renders as a single
 * currentColor fill (white in the hero) so it reads against the gradient.
 */
export function PlaneCruiseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      {/* Vertical stabilizer (tail fin) */}
      <path d="M 14 27 L 8 7 L 14 7 L 22 27 Z" />
      {/* Horizontal stabilizer */}
      <path d="M 14 33 L 4 37 L 13 37 L 22 33 Z" />
      {/* Main wing — swept back, extending down to wingtip */}
      <path d="M 50 34 L 22 55 L 33 55 L 42 34 Z" />
      {/* Engine pod under wing */}
      <ellipse cx="37" cy="42" rx="5.5" ry="2.4" />
      {/* Fuselage with rounded nose / tapered tail */}
      <path d="M 5 30 Q 5 26 16 26 L 56 26 Q 60 26 60 30 Q 60 34 56 34 L 16 34 Q 5 34 5 30 Z" />
      {/* Cockpit window hint near the nose */}
      <path d="M 56 28 Q 59 28 60 30 L 55 30 Z" opacity="0.55" />
    </svg>
  );
}

export function SwapIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4L3 8l4 4" />
      <path d="M3 8h14" />
      <path d="M17 20l4-4-4-4" />
      <path d="M21 16H7" />
    </svg>
  );
}

export function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

/**
 * Stylized top-down view of an Airbus A380 — the largest passenger
 * aircraft in the world and the flagship of three of skyhop's four
 * carriers (EK, EY, QR all fly the A380). Colors are tuned to the
 * hero gradient: cream fuselage, indigo→fuchsia gradient wings,
 * sky-blue cockpit, dark navy engines.
 */
export function A380Plane({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="a380-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="a380-wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="60%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <radialGradient id="a380-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft halo */}
      <ellipse cx="120" cy="100" rx="120" ry="95" fill="url(#a380-glow)" />

      {/* Main wings (delta, swept back) — top */}
      <path
        d="M 150 92 L 80 92 L 38 30 L 55 30 Z"
        fill="url(#a380-wing)"
        stroke="#1e1b4b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Main wings — bottom */}
      <path
        d="M 150 108 L 80 108 L 38 170 L 55 170 Z"
        fill="url(#a380-wing)"
        stroke="#1e1b4b"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Horizontal stabilizers at tail */}
      <path
        d="M 35 94 L 12 64 L 25 64 L 50 94 Z"
        fill="url(#a380-wing)"
        stroke="#1e1b4b"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M 35 106 L 12 136 L 25 136 L 50 106 Z"
        fill="url(#a380-wing)"
        stroke="#1e1b4b"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Vertical stabilizer (visible as a small fin atop the rear fuselage) */}
      <path
        d="M 28 100 L 18 88 L 18 112 Z"
        fill="#4c1d95"
        stroke="#1e1b4b"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Fuselage */}
      <path
        d="M 22 100 Q 22 91 32 90 L 200 90 Q 220 90 224 100 Q 220 110 200 110 L 32 110 Q 22 109 22 100 Z"
        fill="url(#a380-body)"
        stroke="#1e1b4b"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Cockpit windscreen */}
      <path
        d="M 200 94 Q 218 94 222 100 Q 218 106 200 106 Z"
        fill="#0ea5e9"
        opacity="0.85"
        stroke="#1e1b4b"
        strokeWidth="1.2"
      />

      {/* Window strip — twin rows hint at the A380's iconic double deck */}
      <g fill="#0c4a6e" opacity="0.55">
        {[58, 72, 86, 100, 114, 128, 142, 156, 170, 184].map((x) => (
          <rect key={`top-${x}`} x={x} y="95" width="6" height="2" rx="1" />
        ))}
        {[58, 72, 86, 100, 114, 128, 142, 156, 170, 184].map((x) => (
          <rect key={`bot-${x}`} x={x} y="103" width="6" height="2" rx="1" />
        ))}
      </g>

      {/* Engines — 4 on wings (inner + outer, both sides) */}
      <g stroke="#1e1b4b" strokeWidth="1.5">
        <ellipse cx="125" cy="58" rx="11" ry="5.5" fill="#312e81" />
        <ellipse cx="92" cy="46" rx="11" ry="5.5" fill="#312e81" />
        <ellipse cx="125" cy="142" rx="11" ry="5.5" fill="#312e81" />
        <ellipse cx="92" cy="154" rx="11" ry="5.5" fill="#312e81" />
      </g>
      {/* Engine intake highlights */}
      <g fill="#fbbf24">
        <circle cx="135" cy="58" r="2.5" />
        <circle cx="102" cy="46" r="2.5" />
        <circle cx="135" cy="142" r="2.5" />
        <circle cx="102" cy="154" r="2.5" />
      </g>
    </svg>
  );
}

// Hoppy the smiling mascot airplane — used on the hero & confirmation page.
export function MascotPlane({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <ellipse cx="100" cy="100" rx="80" ry="42" fill="#fde047" />
      <ellipse cx="100" cy="100" rx="80" ry="42" fill="none" stroke="#0c4a6e" strokeWidth="4" />
      {/* nose */}
      <path d="M180 100 q14 -6 16 0 q-2 6 -16 0 z" fill="#fb923c" stroke="#0c4a6e" strokeWidth="3" />
      {/* tail */}
      <path d="M22 100 L4 70 L20 85 L26 95 Z" fill="#fb7185" stroke="#0c4a6e" strokeWidth="3" />
      {/* wing top */}
      <path d="M60 75 q40 -34 80 -10 q-10 4 -20 0 q-30 12 -60 10 Z" fill="#22d3ee" stroke="#0c4a6e" strokeWidth="3" />
      {/* wing bottom */}
      <path d="M60 122 q40 30 80 8 q-10 -2 -20 0 q-30 -8 -60 -8 Z" fill="#a78bfa" stroke="#0c4a6e" strokeWidth="3" />
      {/* windows */}
      <circle cx="80" cy="98" r="6" fill="#bae6fd" stroke="#0c4a6e" strokeWidth="2.5" />
      <circle cx="105" cy="98" r="6" fill="#bae6fd" stroke="#0c4a6e" strokeWidth="2.5" />
      <circle cx="130" cy="98" r="6" fill="#bae6fd" stroke="#0c4a6e" strokeWidth="2.5" />
      {/* big friendly eye */}
      <circle cx="158" cy="92" r="10" fill="#ffffff" stroke="#0c4a6e" strokeWidth="3" />
      <circle cx="161" cy="93" r="4.5" fill="#0c4a6e" />
      <circle cx="163" cy="91" r="1.6" fill="#ffffff" />
      {/* smile */}
      <path d="M150 112 q12 10 22 -2" fill="none" stroke="#0c4a6e" strokeWidth="3.5" strokeLinecap="round" />
      {/* cheek blush */}
      <circle cx="148" cy="108" r="4" fill="#fda4af" opacity="0.85" />
    </svg>
  );
}

export function CloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} fill="currentColor">
      <path d="M48 22a10 10 0 0 0-19-3 8 8 0 0 0-13 8h0a8 8 0 0 0 0 16h32a10 10 0 0 0 0-21z" />
    </svg>
  );
}
