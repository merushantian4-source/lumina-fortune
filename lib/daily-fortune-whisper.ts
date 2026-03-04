import { promises as fs } from "fs";
import path from "path";

type WhisperEntry = {
  message: string;
  updatedAt: string;
};

type WhisperStore = Record<string, Record<string, WhisperEntry>>;

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "daily-fortune-whispers.json");
const SAFE_DEFAULT_WHISPER = `今日は「整えること」が鍵になる日。
小さな違和感を見逃さないことで、
次の選択が静かに見えてきます。`;

function normalizeUserKey(userKey?: string): string {
  const raw = (userKey ?? "").trim().toLowerCase();
  if (!raw) return "guest";
  return raw.replace(/[^\w\-]/g, "_").slice(0, 80) || "guest";
}

async function readStore(): Promise<WhisperStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as WhisperStore;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

async function writeStore(store: WhisperStore): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function sanitizeWhisperForTop(message: string): string {
  const normalized = message.replace(/\r\n/g, "\n").trim();
  if (!normalized) return SAFE_DEFAULT_WHISPER;

  const spoilerRe =
    /(今日のカード|引いたカード|カード名|カードは|タロット|正位置|逆位置|ワンド|カップ|ソード|ペンタクル|大アルカナ|小アルカナ)/i;
  if (spoilerRe.test(normalized)) {
    return SAFE_DEFAULT_WHISPER;
  }

  const firstThreeLines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join("\n")
    .trim();

  return firstThreeLines || SAFE_DEFAULT_WHISPER;
}

export async function saveDailyWhisperForDate(
  userKey: string | undefined,
  dateKey: string,
  message: string
): Promise<void> {
  const normalized = normalizeUserKey(userKey);
  const store = await readStore();
  const current = store[normalized] ?? {};

  current[dateKey] = {
    message: sanitizeWhisperForTop(message),
    updatedAt: new Date().toISOString(),
  };

  const keys = Object.keys(current).sort((a, b) => b.localeCompare(a));
  const trimmed: Record<string, WhisperEntry> = {};
  for (const key of keys.slice(0, 30)) {
    trimmed[key] = current[key];
  }

  store[normalized] = trimmed;
  await writeStore(store);
}

export async function getDailyWhisperForDate(
  userKey: string | undefined,
  dateKey: string
): Promise<string | null> {
  const normalized = normalizeUserKey(userKey);
  const store = await readStore();
  const raw = store[normalized]?.[dateKey]?.message;
  if (!raw) return SAFE_DEFAULT_WHISPER;
  return sanitizeWhisperForTop(raw);
}
