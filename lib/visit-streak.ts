export type VisitStreakRecord = {
  streak: number;
  lastVisited: string; // YYYY-MM-DD in Asia/Tokyo
  monthKey: string; // YYYY-MM in Asia/Tokyo
  monthlyVisitCount: number; // unique visit days in current month
  monthlyClaimed: boolean;
};

const STORAGE_KEY = "lumina_visit_streaks_v1";

function getDatePartsInJst(date: Date): { year: string; month: string; day: string } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return { year, month, day };
}

function toUtcDateFromDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map((v) => Number(v));
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

function diffDays(fromDateKey: string, toDateKey: string): number {
  const from = toUtcDateFromDateKey(fromDateKey).getTime();
  const to = toUtcDateFromDateKey(toDateKey).getTime();
  return Math.round((to - from) / 86400000);
}

export function getJstDateKey(now = new Date()): string {
  const { year, month, day } = getDatePartsInJst(now);
  return `${year}-${month}-${day}`;
}

export function getJstMonthKey(now = new Date()): string {
  const { year, month } = getDatePartsInJst(now);
  return `${year}-${month}`;
}

export function makeVisitorKey(nickname: string | null | undefined): string {
  const normalized = typeof nickname === "string" ? nickname.trim().toLowerCase() : "";
  return normalized ? `profile:${normalized}` : "guest";
}

export function computeNextVisitStreak(previous: VisitStreakRecord | null, todayDateKey: string, todayMonthKey: string): VisitStreakRecord {
  if (!previous?.lastVisited) {
    return {
      streak: 1,
      lastVisited: todayDateKey,
      monthKey: todayMonthKey,
      monthlyVisitCount: 1,
      monthlyClaimed: false,
    };
  }

  const dayDelta = diffDays(previous.lastVisited, todayDateKey);
  const sameMonth = previous.monthKey === todayMonthKey;

  const nextStreak = dayDelta <= 0 ? previous.streak : dayDelta === 1 ? previous.streak + 1 : 1;
  const nextMonthlyCount = sameMonth
    ? dayDelta <= 0
      ? previous.monthlyVisitCount
      : previous.monthlyVisitCount + 1
    : 1;
  const nextMonthlyClaimed = sameMonth ? previous.monthlyClaimed : false;

  return {
    streak: nextStreak,
    lastVisited: dayDelta <= 0 ? previous.lastVisited : todayDateKey,
    monthKey: todayMonthKey,
    monthlyVisitCount: nextMonthlyCount,
    monthlyClaimed: nextMonthlyClaimed,
  };
}

type VisitStreakStore = Record<string, VisitStreakRecord>;

function readStore(storage: Storage): VisitStreakStore {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as VisitStreakStore) : {};
  } catch {
    return {};
  }
}

function writeStore(storage: Storage, store: VisitStreakStore): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function normalizeForCurrentMonth(record: VisitStreakRecord | null, now = new Date()): VisitStreakRecord | null {
  if (!record) return null;
  const currentMonth = getJstMonthKey(now);
  if (record.monthKey === currentMonth) return record;
  return {
    ...record,
    monthKey: currentMonth,
    monthlyVisitCount: 0,
    monthlyClaimed: false,
  };
}

export function getVisitStreakForVisitor(storage: Storage, visitorKey: string, now = new Date()): VisitStreakRecord | null {
  const safeKey = visitorKey.trim() || "guest";
  const store = readStore(storage);
  return normalizeForCurrentMonth(store[safeKey] ?? null, now);
}

export function updateVisitStreakForVisitor(storage: Storage, visitorKey: string, now = new Date()): VisitStreakRecord {
  const safeKey = visitorKey.trim() || "guest";
  const todayDateKey = getJstDateKey(now);
  const todayMonthKey = getJstMonthKey(now);
  const store = readStore(storage);
  const previous = store[safeKey] ?? null;
  const next = computeNextVisitStreak(previous, todayDateKey, todayMonthKey);
  store[safeKey] = next;
  writeStore(storage, store);
  return next;
}

export function claimMonthlyGiftForVisitor(storage: Storage, visitorKey: string, now = new Date()): VisitStreakRecord | null {
  const safeKey = visitorKey.trim() || "guest";
  const store = readStore(storage);
  const current = normalizeForCurrentMonth(store[safeKey] ?? null, now);
  if (!current) return null;
  const next: VisitStreakRecord = {
    ...current,
    monthlyClaimed: current.monthlyVisitCount >= 7 ? true : current.monthlyClaimed,
  };
  store[safeKey] = next;
  writeStore(storage, store);
  return next;
}
