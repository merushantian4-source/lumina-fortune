import { NextResponse } from "next/server";
import { getJstDateKey, listDeliveredFutureLetters, saveFutureLetter } from "@/lib/future-letters";

type Body = {
  user?: string;
  message?: string;
  date?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get("user")?.trim() ?? "";
    const date = searchParams.get("date")?.trim() || getJstDateKey();
    const letters = await listDeliveredFutureLetters(user, date);
    return NextResponse.json({ ok: true, letters }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, letters: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const record = await saveFutureLetter({
      user: typeof body.user === "string" ? body.user : "",
      message: typeof body.message === "string" ? body.message : "",
      date: typeof body.date === "string" ? body.date : "",
    });
    return NextResponse.json({ ok: true, letter: record }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "user is required" ||
        error.message === "message is required" ||
        error.message === "message is too long" ||
        error.message === "date is invalid" ||
        error.message === "date must be today or later"
      ) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ ok: false, error: "failed to save future letter" }, { status: 500 });
  }
}
