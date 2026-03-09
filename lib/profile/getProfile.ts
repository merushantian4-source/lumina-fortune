export const PROFILE_STORAGE_KEY = "lumina_profile";
export const BIRTHDATE_STORAGE_KEY = "lumina_birthdate";

type StoredProfile = {
  birthdate?: unknown;
};

export function getClientProfileBirthdate(): string {
  if (typeof window === "undefined") return "";

  try {
    const direct = localStorage.getItem(BIRTHDATE_STORAGE_KEY)?.trim() ?? "";
    if (direct) return direct;

    const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!rawProfile) return "";

    const parsed = JSON.parse(rawProfile) as StoredProfile;
    return typeof parsed.birthdate === "string" ? parsed.birthdate.trim() : "";
  } catch {
    return "";
  }
}

export function getInitialBirthdate(serverBirthdate: string | null): string {
  if (serverBirthdate) return serverBirthdate;
  return getClientProfileBirthdate();
}
