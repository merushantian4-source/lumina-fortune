import path from "path";
import { promises as fs } from "fs";

type DailyUsageMap = Record<string, true>;
type LightGuidanceUsageStore = Record<string, DailyUsageMap>;

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "light-guidance-usage.json");

function normalizeUserKey(userKey: string): string {
  const trimmed = userKey.trim().toLowerCase();
  if (!trimmed) return "guest";
  return trimmed.replace(/[^\w\-]/g, "_").slice(0, 80) || "guest";
}

async function readStore(): Promise<LightGuidanceUsageStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};

    const normalized: LightGuidanceUsageStore = {};
    for (const [userKey, value] of Object.entries(parsed)) {
      if (!value || typeof value !== "object") continue;
      const next: DailyUsageMap = {};
      for (const [dateKey, used] of Object.entries(value as Record<string, unknown>)) {
        if (used === true) next[dateKey] = true;
      }
      normalized[userKey] = next;
    }
    return normalized;
  } catch {
    return {};
  }
}

async function writeStore(store: LightGuidanceUsageStore): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function hasUsedLightGuidanceToday(userKey: string, dateKey: string): Promise<boolean> {
  const normalizedKey = normalizeUserKey(userKey);
  const store = await readStore();
  return Boolean(store[normalizedKey]?.[dateKey]);
}

export async function markLightGuidanceUsed(userKey: string, dateKey: string): Promise<void> {
  const normalizedKey = normalizeUserKey(userKey);
  const store = await readStore();
  const current = store[normalizedKey] ?? {};
  current[dateKey] = true;

  const trimmed: DailyUsageMap = {};
  for (const key of Object.keys(current).sort((a, b) => b.localeCompare(a)).slice(0, 45)) {
    trimmed[key] = true;
  }

  store[normalizedKey] = trimmed;
  await writeStore(store);
}
