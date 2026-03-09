import "server-only";

import { cookies } from "next/headers";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";

const SERVER_BIRTHDATE_COOKIE_KEYS = ["lumina_birthdate", "lumina_profile_birthdate"] as const;

export async function getServerProfileBirthdate(): Promise<string | null> {
  const cookieStore = await cookies();

  for (const key of SERVER_BIRTHDATE_COOKIE_KEYS) {
    const value = cookieStore.get(key)?.value?.trim();
    if (!value) continue;

    try {
      destinyNumberFromBirthdate(value);
      return value;
    } catch {
      continue;
    }
  }

  return null;
}
