import { promises as fs } from "fs";
import path from "path";
import { validateModerationText } from "@/lib/moderation/validateText";

export type LightRecord = {
  id: string;
  dateKey: string;
  cardName: string;
  message: string;
  createdAt: string;
};

type LightRecordStore = Record<string, LightRecord[]>;

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "light-records.json");

function normalizeUserKey(nickname: string): string {
  const trimmed = nickname.trim().toLowerCase();
  return trimmed.replace(/[^\w\-]/g, "_").slice(0, 80);
}

async function readStore(): Promise<LightRecordStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as LightRecordStore;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writeStore(store: LightRecordStore): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function saveLightRecord(
  nickname: string,
  payload: { dateKey: string; cardName: string; message: string }
): Promise<LightRecord> {
  const moderation = validateModerationText(payload.message, { maxLength: 500 });
  if (!moderation.ok) {
    throw new Error(moderation.error);
  }

  const userKey = normalizeUserKey(nickname);
  const store = await readStore();
  const current = store[userKey] ?? [];
  const record: LightRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    dateKey: payload.dateKey,
    cardName: payload.cardName,
    message: moderation.normalizedText,
    createdAt: new Date().toISOString(),
  };
  const next = [record, ...current].slice(0, 100);
  store[userKey] = next;
  await writeStore(store);
  return record;
}

export async function getLightRecords(nickname: string): Promise<LightRecord[]> {
  const userKey = normalizeUserKey(nickname);
  const store = await readStore();
  return store[userKey] ?? [];
}
