"use server";

import { revalidatePath } from "next/cache";
import { setConfig, type ProviderId } from "@/lib/config";

const PROVIDERS: ProviderId[] = ["auto", "amadeus", "kiwi", "mock"];

/** Server action wired up by /settings page form. Stores everything to the
 *  on-disk config file so the choice survives restarts. */
export async function saveSettings(formData: FormData): Promise<void> {
  const providerRaw = String(formData.get("provider") ?? "auto");
  const provider: ProviderId = (PROVIDERS as string[]).includes(providerRaw)
    ? (providerRaw as ProviderId)
    : "auto";

  // Blank inputs mean "leave the existing value alone" — credentials are
  // never echoed back to the form, so re-submitting without retyping should
  // keep the saved key intact.
  const patch = {
    provider,
    amadeus: {
      clientId: nonBlank(formData.get("amadeus_client_id")),
      clientSecret: nonBlank(formData.get("amadeus_client_secret")),
    },
    kiwi: {
      apiKey: nonBlank(formData.get("kiwi_api_key")),
    },
  };

  await setConfig(patch);
  revalidatePath("/settings");
  revalidatePath("/flights");
}

function nonBlank(v: FormDataEntryValue | null): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length === 0 ? undefined : s;
}
