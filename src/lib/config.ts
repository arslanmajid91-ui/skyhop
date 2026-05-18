/**
 * Runtime config persisted at the project root in `.skyhop-config.json`.
 *
 * The settings page (server action) writes here so users can switch flight
 * providers and paste credentials from the browser without restarting dev.
 *
 * Env vars (`.env.local`) still win when present — useful for prod/CI where
 * the JSON file is absent. Mock is the universal fallback.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

export type ProviderId = "auto" | "amadeus" | "kiwi" | "letsfg" | "mock";

export type RuntimeConfig = {
  provider: ProviderId;
  amadeus: { clientId: string; clientSecret: string };
  kiwi: { apiKey: string };
};

const CONFIG_PATH = path.join(process.cwd(), ".skyhop-config.json");

const EMPTY: RuntimeConfig = {
  provider: "auto",
  amadeus: { clientId: "", clientSecret: "" },
  kiwi: { apiKey: "" },
};

async function readFile(): Promise<Partial<RuntimeConfig>> {
  try {
    const text = await fs.readFile(CONFIG_PATH, "utf8");
    return JSON.parse(text) as Partial<RuntimeConfig>;
  } catch {
    return {};
  }
}

/** Read effective config: file overlayed on defaults, with env-var fallback
 *  for any credential field left blank in the file. */
export async function getConfig(): Promise<RuntimeConfig> {
  const file = await readFile();
  const cfg: RuntimeConfig = {
    provider: file.provider ?? EMPTY.provider,
    amadeus: {
      clientId: file.amadeus?.clientId || process.env.AMADEUS_CLIENT_ID || "",
      clientSecret: file.amadeus?.clientSecret || process.env.AMADEUS_CLIENT_SECRET || "",
    },
    kiwi: {
      apiKey: file.kiwi?.apiKey || process.env.KIWI_API_KEY || "",
    },
  };
  return cfg;
}

/** Decide which provider to actually use. `auto` picks the first one whose
 *  credentials are present, in preference order; explicit choices fall back
 *  to mock when their creds are missing. LetsFG needs no creds — it shells
 *  out to a locally-installed CLI. */
export function resolveProvider(
  cfg: RuntimeConfig,
): "amadeus" | "kiwi" | "letsfg" | "mock" {
  const hasAmadeus = Boolean(cfg.amadeus.clientId && cfg.amadeus.clientSecret);
  const hasKiwi = Boolean(cfg.kiwi.apiKey);
  if (cfg.provider === "amadeus") return hasAmadeus ? "amadeus" : "mock";
  if (cfg.provider === "kiwi") return hasKiwi ? "kiwi" : "mock";
  if (cfg.provider === "letsfg") return "letsfg";
  if (cfg.provider === "mock") return "mock";
  // auto: prefer paid/structured providers when keys exist, else letsfg, else mock.
  if (hasAmadeus) return "amadeus";
  if (hasKiwi) return "kiwi";
  return "mock";
}

export type ConfigPatch = {
  provider?: ProviderId;
  amadeus?: Partial<RuntimeConfig["amadeus"]>;
  kiwi?: Partial<RuntimeConfig["kiwi"]>;
};

/** Merge a patch into the on-disk config. Only writes fields the caller
 *  provided — leaving Amadeus untouched when only Kiwi is being updated. */
export async function setConfig(patch: ConfigPatch): Promise<void> {
  const current = await readFile();
  const next: RuntimeConfig = {
    provider: patch.provider ?? current.provider ?? EMPTY.provider,
    amadeus: {
      clientId: patch.amadeus?.clientId ?? current.amadeus?.clientId ?? "",
      clientSecret: patch.amadeus?.clientSecret ?? current.amadeus?.clientSecret ?? "",
    },
    kiwi: {
      apiKey: patch.kiwi?.apiKey ?? current.kiwi?.apiKey ?? "",
    },
  };
  await fs.writeFile(CONFIG_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
}

/** "View" of the config safe to render — credentials reduced to a boolean
 *  "present" plus the last 4 chars (for "did I paste the right key?"). */
export type ConfigView = {
  provider: ProviderId;
  effective: "amadeus" | "kiwi" | "letsfg" | "mock";
  amadeus: { clientIdPresent: boolean; clientIdTail: string; clientSecretPresent: boolean };
  kiwi: { apiKeyPresent: boolean; apiKeyTail: string };
};

export function toView(cfg: RuntimeConfig): ConfigView {
  const tail = (s: string) => (s.length > 4 ? s.slice(-4) : "");
  return {
    provider: cfg.provider,
    effective: resolveProvider(cfg),
    amadeus: {
      clientIdPresent: Boolean(cfg.amadeus.clientId),
      clientIdTail: tail(cfg.amadeus.clientId),
      clientSecretPresent: Boolean(cfg.amadeus.clientSecret),
    },
    kiwi: {
      apiKeyPresent: Boolean(cfg.kiwi.apiKey),
      apiKeyTail: tail(cfg.kiwi.apiKey),
    },
  };
}
