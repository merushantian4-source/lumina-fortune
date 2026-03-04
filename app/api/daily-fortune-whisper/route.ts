import { NextResponse } from "next/server";
import { getDailyWhisperForDate, saveDailyWhisperForDate } from "@/lib/daily-fortune-whisper";

type RequestBody =
  | {
      action: "get";
      profile?: { nickname?: string };
      dateKey?: string;
    }
  | {
      action: "save";
      profile?: { nickname?: string };
      payload?: { dateKey?: string; message?: string };
    };

function getJstDateKey(date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const nickname = body.profile?.nickname?.trim();

    if (body.action === "get") {
      const dateKey = body.dateKey ?? getJstDateKey();
      const message = await getDailyWhisperForDate(nickname, dateKey);
      return NextResponse.json({ message });
    }

    if (body.action === "save") {
      const dateKey = body.payload?.dateKey?.trim();
      const message = body.payload?.message?.trim();
      if (!dateKey || !message) {
        return NextResponse.json({ error: "invalid payload" }, { status: 400 });
      }
      await saveDailyWhisperForDate(nickname, dateKey, message);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

