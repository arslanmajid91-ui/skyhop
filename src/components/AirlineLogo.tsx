import { getAirline, type AirlineCode } from "@/lib/airlines";

export default function AirlineLogo({
  code,
  name,
  size = 40,
  showName = false,
}: {
  code: AirlineCode;
  name?: string;
  size?: number;
  showName?: boolean;
}) {
  const a = getAirline(code, name);
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex flex-shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200 shadow-sm overflow-hidden dark:bg-white dark:ring-zinc-300"
        style={{ width: size, height: size }}
        aria-label={a.name}
      >
        {/* Plain <img> avoids next/image remotePatterns config. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={a.logoUrl}
          alt={`${a.name} logo`}
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: "contain" }}
          loading="lazy"
        />
      </div>
      {showName && (
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {a.name}
        </span>
      )}
    </div>
  );
}
