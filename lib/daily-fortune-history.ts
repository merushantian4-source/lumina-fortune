import { promises as fs } from "fs";
import path from "path";

type StoredDailyCard = {
  dateKey: string;
  cardName: string;
  reversed: boolean;
};

type UserDailyCardMap = Record<string, Omit<StoredDailyCard, "dateKey">>;
type DailyFortuneHistoryStore = Record<string, UserDailyCardMap>;

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "daily-fortune-history.json");

function normalizeUserKey(userKey: string): string {
  const trimmed = userKey.trim().toLowerCase();
  if (!trimmed) return "guest";
  return trimmed.replace(/[^\w\-]/g, "_").slice(0, 80) || "guest";
}

async function readStore(): Promise<DailyFortuneHistoryStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};

    const normalized: DailyFortuneHistoryStore = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!value || typeof value !== "object") continue;

      // Backward compatibility: old shape { dateKey, cardName, reversed }
      if (
        "dateKey" in value &&
        "cardName" in value &&
        typeof (value as StoredDailyCard).dateKey === "string" &&
        typeof (value as StoredDailyCard).cardName === "string" &&
        typeof (value as StoredDailyCard).reversed === "boolean"
      ) {
        const legacy = value as StoredDailyCard;
        normalized[key] = {
          [legacy.dateKey]: {
            cardName: legacy.cardName,
            reversed: legacy.reversed,
          },
        };
        continue;
      }

      const dateMap: UserDailyCardMap = {};
      for (const [dateKey, card] of Object.entries(value as Record<string, unknown>)) {
        if (!card || typeof card !== "object") continue;
        const record = card as { cardName?: unknown; reversed?: unknown };
        if (typeof record.cardName !== "string" || typeof record.reversed !== "boolean") continue;
        dateMap[dateKey] = { cardName: record.cardName, reversed: record.reversed };
      }
      normalized[key] = dateMap;
    }

    return normalized;
  } catch {
    return {};
  }
}

async function writeStore(store: DailyFortuneHistoryStore): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function getPreviousDateKey(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00+09:00`);
  date.setUTCDate(date.getUTCDate() - 1);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDateKey(dateKey: string, deltaDays: number): string {
  const date = new Date(`${dateKey}T00:00:00+09:00`);
  date.setUTCDate(date.getUTCDate() + deltaDays);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getPreviousDailyCard(
  userKey: string,
  dateKey: string
): Promise<StoredDailyCard | null> {
  const normalizedKey = normalizeUserKey(userKey);
  const store = await readStore();
  const current = store[normalizedKey] ?? {};
  const previousDateKey = getPreviousDateKey(dateKey);
  const previous = current[previousDateKey];
  if (!previous) return null;
  return {
    dateKey: previousDateKey,
    cardName: previous.cardName,
    reversed: previous.reversed,
  };
}

export async function saveDailyCardForDate(
  userKey: string,
  payload: StoredDailyCard
): Promise<void> {
  const normalizedKey = normalizeUserKey(userKey);
  const store = await readStore();
  const current = store[normalizedKey] ?? {};
  current[payload.dateKey] = {
    cardName: payload.cardName,
    reversed: payload.reversed,
  };

  // Keep lightweight history (about 30 days)
  const keys = Object.keys(current).sort((a, b) => b.localeCompare(a));
  const trimmed: UserDailyCardMap = {};
  for (const key of keys.slice(0, 30)) {
    trimmed[key] = current[key];
  }

  store[normalizedKey] = trimmed;
  await writeStore(store);
}

export async function getRecentDailyCards(
  userKey: string,
  dateKey: string,
  days: number
): Promise<StoredDailyCard[]> {
  const normalizedKey = normalizeUserKey(userKey);
  const store = await readStore();
  const current = store[normalizedKey] ?? {};
  const out: StoredDailyCard[] = [];

  for (let i = 0; i < days; i += 1) {
    const targetDateKey = shiftDateKey(dateKey, -i);
    const found = current[targetDateKey];
    if (!found) continue;
    out.push({
      dateKey: targetDateKey,
      cardName: found.cardName,
      reversed: found.reversed,
    });
  }

  return out;
}
