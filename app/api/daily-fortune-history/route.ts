import { NextResponse } from "next/server";
import { getRecentDailyCards } from "@/lib/daily-fortune-history";

type RequestBody = {
  profile?: {
    nickname?: string;
  };
};

const JA_WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

function getJstDateKey(base = new Date()): string {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = formatter.formatToParts(base);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const weekdayRaw = parts.find((p) => p.type === "weekday")?.value ?? "日";
  const weekday = JA_WEEKDAYS.find((v) => weekdayRaw.includes(v)) ?? "日";
  void weekday;
  return `${year}-${month}-${day}`;
}

function resolveUserKey(profile?: RequestBody["profile"]): string {
  const nickname = profile?.nickname?.trim();
  if (!nickname) return "guest";
  return `nickname:${nickname.toLowerCase()}`;
}

function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [yearText, monthText, dayText] = dateKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return dateKey;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - deltaDays);
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const dateKey = getJstDateKey();
    const userKey = resolveUserKey(body.profile);
    const recent = await getRecentDailyCards(userKey, dateKey, 3);
    const map = new Map(recent.map((v) => [v.dateKey, v.cardName]));

    const labels = [
      { offset: 0, label: "今日" },
      { offset: 1, label: "昨日" },
      { offset: 2, label: "一昨日" },
    ];

    const history = labels.map((item) => {
      const key = shiftDateKey(dateKey, item.offset);
      return {
        label: item.label,
        dateKey: key,
        cardName: map.get(key) ?? null,
      };
    });

    return NextResponse.json({ history });
  } catch {
    return NextResponse.json({ history: [] }, { status: 200 });
  }
}
