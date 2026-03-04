import { NextResponse } from "next/server";
import { saveConsultationLetter } from "@/lib/consultation-letters";

type Body = {
  nickname?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const message = typeof body.message === "string" ? body.message : "";
    const nickname = typeof body.nickname === "string" ? body.nickname : "";
    const letter = await saveConsultationLetter({ nickname, message });
    return NextResponse.json({ ok: true, letter }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "message is required" || error.message === "message is too long") {
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ ok: false, error: "failed to save letter" }, { status: 500 });
  }
}
