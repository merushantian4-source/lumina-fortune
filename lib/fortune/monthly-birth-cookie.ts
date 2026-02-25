import "server-only";

import { cookies } from "next/headers";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";

export const MONTHLY_BIRTH_COOKIE_NAME = "lumina_birth";
export const MONTHLY_BIRTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

export async function getValidMonthlyBirthFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const birth = cookieStore.get(MONTHLY_BIRTH_COOKIE_NAME)?.value?.trim();

  if (!birth) {
    return null;
  }

  try {
    destinyNumberFromBirthdate(birth);
    return birth;
  } catch {
    return null;
  }
}
