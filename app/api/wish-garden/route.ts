import { NextResponse } from "next/server";
import { addWish, listLatestWishes } from "@/lib/wish-garden";
import { checkModerationPostInterval, resolveModerationUserKey } from "@/lib/moderation/rateLimit";

type CreateWishBody = {
  message?: string;
  userKey?: string;
};

export async function GET() {
  try {
    const wishes = await listLatestWishes(24);
    return NextResponse.json({ wishes });
  } catch {
    return NextResponse.json({ error: "failed to load wishes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateWishBody;
    const rateLimit = await checkModerationPostInterval(
      resolveModerationUserKey(request, [body.userKey])
    );
    if (!rateLimit.ok) {
      return NextResponse.json({ error: rateLimit.error }, { status: 400 });
    }

    const rawMessage = typeof body.message === "string" ? body.message : "";
    const wish = await addWish(rawMessage);
    return NextResponse.json({ wish }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "message is required" ||
        error.message === "message is too long" ||
        error.message === "文章が長すぎます" ||
        error.message.includes("リンクはここには置けない") ||
        error.message.includes("その内容はここには置けない") ||
        error.message.includes("庭には置けない") ||
        error.message.includes("同じ言葉が続いている")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "failed to save wish" }, { status: 500 });
  }
}
