import { NextResponse } from "next/server";
import { checkModerationPostInterval, resolveModerationUserKey } from "@/lib/moderation/rateLimit";
import { validateModerationText } from "@/lib/moderation/validateText";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      nickname?: string;
      birthdate?: string;
      partnerBirthdate?: string;
      bloodType?: string;
      gender?: string;
      email?: string;
      category?: string;
      content?: string;
      agreed?: boolean;
    };

    if (!payload.nickname || !payload.email || !payload.category || !payload.content || !payload.agreed) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }
    if (payload.category === "相性" && !payload.partnerBirthdate) {
      return NextResponse.json({ ok: false, error: "Missing partner birthdate" }, { status: 400 });
    }

    const moderation = validateModerationText(payload.content, { maxLength: 500 });
    if (!moderation.ok) {
      return NextResponse.json({ ok: false, error: moderation.error }, { status: 400 });
    }

    const rateLimit = await checkModerationPostInterval(
      resolveModerationUserKey(request, [payload.email, payload.nickname])
    );
    if (!rateLimit.ok) {
      return NextResponse.json({ ok: false, error: rateLimit.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      requestId: `RR-${Date.now()}`,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
}
