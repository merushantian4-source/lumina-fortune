import { NextResponse } from "next/server";
import { checkModerationPostInterval, resolveModerationUserKey } from "@/lib/moderation/rateLimit";
import { validateModerationText } from "@/lib/moderation/validateText";

type Body = {
  memo?: string;
  userKey?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const memo = typeof body.memo === "string" ? body.memo : "";
    const moderation = validateModerationText(memo, { maxLength: 500 });
    if (!moderation.ok) {
      return NextResponse.json({ ok: false, error: moderation.error }, { status: 400 });
    }

    const rateLimit = await checkModerationPostInterval(
      resolveModerationUserKey(request, [body.userKey])
    );
    if (!rateLimit.ok) {
      return NextResponse.json({ ok: false, error: rateLimit.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, memo: moderation.normalizedText });
  } catch {
    return NextResponse.json({ ok: false, error: "failed to validate memo" }, { status: 400 });
  }
}
