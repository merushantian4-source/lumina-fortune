import "server-only";

import { promises as fs } from "fs";
import path from "path";

export type DailyWhisperRecord = {
  date: string;
  message: string;
  created_at: string;
};

type DailyWhisperStore = Record<string, DailyWhisperRecord>;

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "daily-whispers.json");

export function getJstDateKey(date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

async function readStore(): Promise<DailyWhisperStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as DailyWhisperStore;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

async function writeStore(store: DailyWhisperStore): Promise<void> {
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // Ignore persistence failures in read-only/serverless environments.
  }
}

export async function getDailyWhisperByDate(dateKey: string): Promise<DailyWhisperRecord | null> {
  const store = await readStore();
  const record = store[dateKey];
  if (!record) {
    return null;
  }
  if (typeof record.message !== "string" || typeof record.created_at !== "string") {
    return null;
  }
  return record;
}

export async function saveDailyWhisper(record: DailyWhisperRecord): Promise<DailyWhisperRecord> {
  const store = await readStore();
  store[record.date] = record;

  const trimmedEntries = Object.entries(store)
    .sort(([left], [right]) => right.localeCompare(left))
    .slice(0, 90);

  await writeStore(Object.fromEntries(trimmedEntries));
  return record;
}
