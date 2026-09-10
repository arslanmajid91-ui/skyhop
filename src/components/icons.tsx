export function CricketBallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" />
      <path
        d="M6 6c2.5 1.5 4 3.6 4 6s-1.5 4.5-4 6M18 6c-2.5 1.5-4 3.6-4 6s1.5 4.5 4 6"
        stroke="white"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
}

export function BatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="13.5" y="2.5" width="4.2" height="10.5" rx="2.1" fill="currentColor" transform="rotate(35 13.5 2.5)" />
      <path
        d="M7.6 12.8 4.2 16.2a2 2 0 0 0 0 2.8l0.8 0.8a2 2 0 0 0 2.8 0l3.4-3.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 4h10v4.5A5 5 0 0 1 12 13.5 5 5 0 0 1 7 8.5V4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M7 5H4.5a2 2 0 0 0-2 2.2c.2 1.9 1.6 3.5 4 3.9M17 5h2.5a2 2 0 0 1 2 2.2c-.2 1.9-1.6 3.5-4 3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 13.5V17M8.5 20.5h7M9.5 17.5h5l.5 3h-6l.5-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function StumpsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 3v17M12 3v17M18 3v17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 21h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.5 3.5h1M11.5 3.5h1M17.5 3.5h1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M7.5 4.5 13 10l-5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
