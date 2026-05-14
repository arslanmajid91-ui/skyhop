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

export function PlaneCruiseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <path d="M61 33 L41 30 L33 16 L29 16 L33 28 L18 26 L13 20 L10 20 L11 28 L4 31 L4 33 L11 35 L10 43 L13 43 L18 37 L33 35 L29 47 L33 47 L41 33 L61 33 Z" />
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
