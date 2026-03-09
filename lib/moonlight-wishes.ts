import { promises as fs } from "fs";
import path from "path";
import { getMoonPhaseForDateKey } from "@/lib/moon-phase";

export type MoonlightWishRecord = {
  id: string;
  user_id: string;
  wish_text: string;
  newmoon_date: string;
  created_at: string;
};

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "moonlight-wishes.json");
const MAX_ITEMS = 1000;

async function readStore(): Promise<MoonlightWishRecord[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as MoonlightWishRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeStore(items: MoonlightWishRecord[]): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(items, null, 2), "utf-8");
}

export function getJstDateKey(base = new Date()): string {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(base);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export function getMoonlightWishState(dateKey = getJstDateKey()) {
  const moon = getMoonPhaseForDateKey(dateKey);
  return {
    dateKey,
    moon,
    canWrite: moon.majorPhase === "new_moon",
    canReview: moon.majorPhase === "full_moon",
  };
}

export async function saveMoonlightWish(payload: {
  user_id?: string;
  wish_text: string;
  newmoon_date?: string;
}): Promise<MoonlightWishRecord> {
  const user_id = payload.user_id?.trim();
  const wish_text = payload.wish_text.trim();
  const newmoon_date = payload.newmoon_date?.trim() || getJstDateKey();

  if (!user_id) {
    throw new Error("user_id is required");
  }
  if (!wish_text) {
    throw new Error("wish_text is required");
  }
  if (Array.from(wish_text).length > 200) {
    throw new Error("wish_text is too long");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newmoon_date)) {
    throw new Error("newmoon_date is invalid");
  }
  if (!getMoonlightWishState(newmoon_date).canWrite) {
    throw new Error("new moon only");
  }

  const current = await readStore();
  const duplicate = current.find((item) => item.user_id === user_id && item.newmoon_date === newmoon_date);
  if (duplicate) {
    return duplicate;
  }

  const record: MoonlightWishRecord = {
    id: `MW-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user_id: user_id.slice(0, 60),
    wish_text,
    newmoon_date,
    created_at: new Date().toISOString(),
  };

  const next = [record, ...current].slice(0, MAX_ITEMS);
  await writeStore(next);
  return record;
}

export async function getLatestWishForUser(user_id: string): Promise<MoonlightWishRecord | null> {
  const trimmed = user_id.trim();
  if (!trimmed) return null;
  const current = await readStore();
  return (
    current
      .filter((item) => item.user_id === trimmed)
      .sort((a, b) => b.newmoon_date.localeCompare(a.newmoon_date))[0] ?? null
  );
}
