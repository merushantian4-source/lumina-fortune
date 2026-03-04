import { promises as fs } from "fs";
import path from "path";

export type WishEntry = {
  id: string;
  message: string;
  createdAt: string;
};

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "wish-garden.json");
const MAX_STORE_ITEMS = 300;

function normalizeMessage(input: string): string {
  return input.replace(/\r\n/g, "\n").trim();
}

function countChars(input: string): number {
  return Array.from(input).length;
}

async function readStore(): Promise<WishEntry[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is WishEntry => {
        return (
          !!item &&
          typeof item === "object" &&
          typeof (item as WishEntry).id === "string" &&
          typeof (item as WishEntry).message === "string" &&
          typeof (item as WishEntry).createdAt === "string"
        );
      })
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  } catch {
    return [];
  }
}

async function writeStore(entries: WishEntry[]): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(entries, null, 2), "utf-8");
}

export async function listLatestWishes(limit = 24): Promise<WishEntry[]> {
  const entries = await readStore();
  return entries.slice(0, Math.max(1, limit));
}

export async function addWish(messageInput: string): Promise<WishEntry> {
  const message = normalizeMessage(messageInput);
  if (!message) {
    throw new Error("message is required");
  }
  if (countChars(message) > 100) {
    throw new Error("message is too long");
  }

  const entry: WishEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    message,
    createdAt: new Date().toISOString(),
  };

  const current = await readStore();
  const next = [entry, ...current].slice(0, MAX_STORE_ITEMS);
  await writeStore(next);
  return entry;
}
