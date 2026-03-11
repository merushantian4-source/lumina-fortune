"use client";

export type ChatReadingHistoryItem = {
  id: string;
  dateKey: string;
  createdAt: string;
  question: string;
  userQuestion: string;
  cardName: string;
  orientation?: "upright" | "reversed";
  readingShort?: string;
  readingDetail?: string;
  readingText: string;
  memo?: string;
  saved?: boolean;
};

export const CHAT_READING_HISTORY_STORAGE_PREFIX = "lumina-light-guidance-history-";
export const LEGACY_CHAT_READING_HISTORY_STORAGE_KEY = "lumina_chat_reading_history";

function isHistoryItem(value: unknown): value is ChatReadingHistoryItem {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.dateKey === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.cardName === "string" &&
    typeof record.readingText === "string" &&
    (typeof record.question === "string" || typeof record.userQuestion === "string") &&
    (record.orientation === undefined ||
      record.orientation === "upright" ||
      record.orientation === "reversed") &&
    (record.readingShort === undefined || typeof record.readingShort === "string") &&
    (record.readingDetail === undefined || typeof record.readingDetail === "string") &&
    (record.memo === undefined || typeof record.memo === "string") &&
    (record.saved === undefined || typeof record.saved === "boolean")
  );
}

function normalizeHistoryItem(item: ChatReadingHistoryItem): ChatReadingHistoryItem {
  const question = item.question || item.userQuestion || "";

  return {
    ...item,
    question,
    userQuestion: item.userQuestion || question,
    readingShort: item.readingShort ?? "",
    readingDetail: item.readingDetail ?? "",
  };
}

export function getJstDateKey(base = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(base);
}

export function buildChatReadingHistoryStorageKey(dateKey: string) {
  return `${CHAT_READING_HISTORY_STORAGE_PREFIX}${dateKey}`;
}

function readHistoryBucket(dateKey: string): ChatReadingHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(buildChatReadingHistoryStorageKey(dateKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isHistoryItem)
      .map(normalizeHistoryItem)
      .filter((item) => item.dateKey === dateKey)
      .slice(0, 100);
  } catch {
    return [];
  }
}

function readLegacyHistory(): ChatReadingHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LEGACY_CHAT_READING_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isHistoryItem).map(normalizeHistoryItem).slice(0, 100);
  } catch {
    return [];
  }
}

function mergeUniqueHistory(items: ChatReadingHistoryItem[]) {
  const seen = new Set<string>();

  return items
    .map(normalizeHistoryItem)
    .sort((a, b) => {
      const dateDelta = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return Number.isNaN(dateDelta) ? 0 : dateDelta;
    })
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

function listStoredDateKeys() {
  if (typeof window === "undefined") return [];

  const keys: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(CHAT_READING_HISTORY_STORAGE_PREFIX)) continue;
    keys.push(key.slice(CHAT_READING_HISTORY_STORAGE_PREFIX.length));
  }

  return keys.sort((a, b) => b.localeCompare(a));
}

export function readChatReadingHistory(dateKey = getJstDateKey()): ChatReadingHistoryItem[] {
  return mergeUniqueHistory([...readHistoryBucket(dateKey), ...readLegacyHistory().filter((item) => item.dateKey === dateKey)]).slice(
    0,
    100
  );
}

export function readAllChatReadingHistory(): ChatReadingHistoryItem[] {
  const storedItems = listStoredDateKeys().flatMap((dateKey) => readHistoryBucket(dateKey));
  return mergeUniqueHistory([...storedItems, ...readLegacyHistory()]).slice(0, 300);
}

export function writeChatReadingHistory(
  items: ChatReadingHistoryItem[],
  dateKey = items[0]?.dateKey ?? getJstDateKey()
) {
  if (typeof window === "undefined") return;

  const normalized = mergeUniqueHistory(items)
    .filter((item) => item.dateKey === dateKey)
    .slice(0, 100);

  window.localStorage.setItem(
    buildChatReadingHistoryStorageKey(dateKey),
    JSON.stringify(normalized)
  );
}

export function appendChatReadingHistory(item: ChatReadingHistoryItem) {
  const normalized = normalizeHistoryItem(item);
  const current = readChatReadingHistory(normalized.dateKey);
  const next = [normalized, ...current.filter((entry) => entry.id !== normalized.id)].slice(0, 100);
  writeChatReadingHistory(next, normalized.dateKey);
  return next;
}

export function updateChatReadingMemo(id: string, memo: string) {
  const all = readAllChatReadingHistory();
  const target = all.find((entry) => entry.id === id);
  if (!target) return all;

  const currentBucket = readChatReadingHistory(target.dateKey);
  const nextBucket = currentBucket.map((entry) => (entry.id === id ? { ...entry, memo } : entry));
  writeChatReadingHistory(nextBucket, target.dateKey);

  return readAllChatReadingHistory();
}
