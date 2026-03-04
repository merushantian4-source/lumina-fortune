import { NextResponse } from "next/server";
import { getLightRecords, saveLightRecord } from "@/lib/light-records";

type SaveBody = {
  action: "save";
  profile?: {
    nickname?: string;
  };
  payload?: {
    dateKey?: string;
    cardName?: string;
    message?: string;
  };
};

type ListBody = {
  action: "list";
  profile?: {
    nickname?: string;
  };
};

type RequestBody = SaveBody | ListBody;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const nickname = body.profile?.nickname?.trim();
    if (!nickname) {
      return NextResponse.json({ error: "nickname is required" }, { status: 400 });
    }

    if (body.action === "list") {
      const records = await getLightRecords(nickname);
      return NextResponse.json({ records });
    }

    if (body.action === "save") {
      const dateKey = body.payload?.dateKey?.trim();
      const cardName = body.payload?.cardName?.trim();
      const message = body.payload?.message?.trim();
      if (!dateKey || !cardName || !message) {
        return NextResponse.json({ error: "invalid payload" }, { status: 400 });
      }
      const record = await saveLightRecord(nickname, { dateKey, cardName, message });
      return NextResponse.json({ record });
    }

    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

