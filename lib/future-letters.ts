import { promises as fs } from "fs";
import path from "path";

export type FutureLetterRecord = {
  id: string;
  date: string;
  message: string;
  user: string;
  created_at: string;
};

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "future-letters.json");
const MAX_ITEMS = 1000;

async function readStore(): Promise<FutureLetterRecord[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as FutureLetterRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeStore(items: FutureLetterRecord[]): Promise<void> {
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

export async function saveFutureLetter(payload: {
  user?: string;
  message: string;
  date: string;
}): Promise<FutureLetterRecord> {
  const user = payload.user?.trim();
  const message = payload.message.trim();
  const date = payload.date.trim();

  if (!user) {
    throw new Error("user is required");
  }
  if (!message) {
    throw new Error("message is required");
  }
  if (Array.from(message).length > 500) {
    throw new Error("message is too long");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("date is invalid");
  }
  if (date < getJstDateKey()) {
    throw new Error("date must be today or later");
  }

  const record: FutureLetterRecord = {
    id: `FL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    message,
    user: user.slice(0, 40),
    created_at: new Date().toISOString(),
  };

  const current = await readStore();
  const next = [record, ...current].slice(0, MAX_ITEMS);
  await writeStore(next);
  return record;
}

export async function listDeliveredFutureLetters(user: string, date = getJstDateKey()): Promise<FutureLetterRecord[]> {
  const trimmed = user.trim();
  if (!trimmed) return [];
  const current = await readStore();
  return current.filter((item) => item.user === trimmed && item.date === date);
}
