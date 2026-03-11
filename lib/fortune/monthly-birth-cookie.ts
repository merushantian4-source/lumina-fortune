import "server-only";

import { cookies } from "next/headers";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";

export const MONTHLY_BIRTH_COOKIE_NAME = "lumina_birth";
export const MONTHLY_BIRTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

const PROFILE_COOKIE_KEYS = ["lumina_birthdate", "lumina_profile_birthdate"] as const;

export async function getValidMonthlyBirthFromCookie(): Promise<string | null> {
  const cookieStore = await cookies().catch(() => null);
  if (!cookieStore) {
    return null;
  }

  const candidates = [
    ...PROFILE_COOKIE_KEYS,
    MONTHLY_BIRTH_COOKIE_NAME,
  ] as const;

  for (const key of candidates) {
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
