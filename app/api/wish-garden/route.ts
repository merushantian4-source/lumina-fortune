import { NextResponse } from "next/server";
import { addWish, listLatestWishes } from "@/lib/wish-garden";

type CreateWishBody = {
  message?: string;
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
    const rawMessage = typeof body.message === "string" ? body.message : "";
    const wish = await addWish(rawMessage);
    return NextResponse.json({ wish }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "message is required" || error.message === "message is too long") {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "failed to save wish" }, { status: 500 });
  }
}
