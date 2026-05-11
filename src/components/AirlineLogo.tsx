import { AIRLINES, type AirlineCode } from "@/lib/airlines";

export default function AirlineLogo({
  code,
  showName = false,
}: {
  code: AirlineCode;
  showName?: boolean;
}) {
  const a = AIRLINES[code];
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold text-white"
        style={{ backgroundColor: a.color }}
        aria-label={a.name}
      >
        {code}
      </div>
      {showName && (
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {a.name}
        </span>
      )}
    </div>
  );
}
