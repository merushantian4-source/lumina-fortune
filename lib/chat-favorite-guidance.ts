export type FavoriteGuidanceItem = {
  id: string;
  savedAt: string;
  userQuestion: string;
  cardName: string;
  readingText: string;
};

export const FAVORITE_GUIDANCE_STORAGE_KEY = "lumina_favorite_guidance";

export function readFavoriteGuidance(): FavoriteGuidanceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITE_GUIDANCE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is FavoriteGuidanceItem => {
      if (!item || typeof item !== "object") return false;
      const record = item as Record<string, unknown>;
      return (
        typeof record.id === "string" &&
        typeof record.savedAt === "string" &&
        typeof record.userQuestion === "string" &&
        typeof record.cardName === "string" &&
        typeof record.readingText === "string"
      );
    });
  } catch {
    return [];
  }
}

export function writeFavoriteGuidance(items: FavoriteGuidanceItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITE_GUIDANCE_STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
}

export function saveFavoriteGuidance(item: FavoriteGuidanceItem): FavoriteGuidanceItem[] {
  const current = readFavoriteGuidance();
  if (current.some((entry) => entry.id === item.id)) {
    return current;
  }
  const next = [item, ...current].slice(0, 50);
  writeFavoriteGuidance(next);
  return next;
}
