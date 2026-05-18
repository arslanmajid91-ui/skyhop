import { getConfig, toView, type ProviderId } from "@/lib/config";
import Header from "@/components/Header";
import { saveSettings } from "./actions";

const PROVIDER_LABELS: Record<ProviderId, string> = {
  auto: "Auto (first configured)",
  amadeus: "Amadeus Self-Service",
  kiwi: "Kiwi Tequila",
  letsfg: "LetsFG (no signup — local scrapers)",
  mock: "Bundled mock data",
};

export default async function SettingsPage() {
  const cfg = await getConfig();
  const view = toView(cfg);

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Flight data settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Choose which API to use for real flights, and paste your keys here.
          Settings are saved to{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">.skyhop-config.json</code>{" "}
          at the project root (gitignored).
        </p>

        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Currently using</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {PROVIDER_LABELS[view.effective === "mock" ? "mock" : view.effective]}
            </span>
          </div>
          {view.provider !== "auto" && view.provider !== view.effective && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              You selected {PROVIDER_LABELS[view.provider]} but its credentials
              are missing — falling back to mock data.
            </p>
          )}
        </div>

        <form
          action={saveSettings}
          className="mt-6 space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          {/* Provider picker */}
          <fieldset>
            <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Provider
            </legend>
            <div className="mt-2 space-y-1.5 text-sm">
              {(Object.keys(PROVIDER_LABELS) as ProviderId[]).map((p) => (
                <label key={p} className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="provider"
                    value={p}
                    defaultChecked={cfg.provider === p}
                    className="mt-1"
                  />
                  <span>
                    {PROVIDER_LABELS[p]}
                    {p === "auto" && (
                      <span className="ml-1 text-xs text-zinc-500">
                        — picks Amadeus first, then Kiwi, then mock
                      </span>
                    )}
                    {p === "letsfg" && (
                      <span className="ml-1 text-xs text-zinc-500">
                        — real prices, ~30–60s per search, times approximate
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Amadeus credentials */}
          <fieldset className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <legend className="px-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Amadeus Self-Service
            </legend>
            <p className="text-xs text-zinc-500">
              Sign up at{" "}
              <a
                href="https://developers.amadeus.com/register"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                developers.amadeus.com/register
              </a>{" "}
              → create a Self-Service app to get a key + secret.
            </p>
            <div className="mt-3 space-y-3">
              <CredField
                label="API Key (Client ID)"
                name="amadeus_client_id"
                present={view.amadeus.clientIdPresent}
                tail={view.amadeus.clientIdTail}
              />
              <CredField
                label="API Secret"
                name="amadeus_client_secret"
                present={view.amadeus.clientSecretPresent}
              />
            </div>
          </fieldset>

          {/* Kiwi credentials */}
          <fieldset className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <legend className="px-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Kiwi Tequila
            </legend>
            <p className="text-xs text-zinc-500">
              Sign up at{" "}
              <a
                href="https://tequila.kiwi.com/portal/login/registration"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                tequila.kiwi.com
              </a>
              , create a Solution, then copy your API key from the Solutions
              page.
            </p>
            <div className="mt-3 space-y-3">
              <CredField
                label="API Key"
                name="kiwi_api_key"
                present={view.kiwi.apiKeyPresent}
                tail={view.kiwi.apiKeyTail}
              />
            </div>
          </fieldset>

          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Leave a field blank to keep the saved value.
            </p>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Save settings
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function CredField({
  label,
  name,
  present,
  tail,
}: {
  label: string;
  name: string;
  present: boolean;
  tail?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 flex items-center justify-between">
        <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
        {present && (
          <span className="text-xs text-emerald-700 dark:text-emerald-400">
            ✓ saved{tail ? ` · …${tail}` : ""}
          </span>
        )}
      </span>
      <input
        type="password"
        name={name}
        autoComplete="off"
        spellCheck={false}
        placeholder={present ? "•••••••• (saved — leave blank to keep)" : "Paste here"}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </label>
  );
}
