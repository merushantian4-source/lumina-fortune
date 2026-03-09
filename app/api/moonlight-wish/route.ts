import { NextResponse } from "next/server";
import {
  getJstDateKey,
  getLatestWishForUser,
  getMoonlightWishState,
  saveMoonlightWish,
} from "@/lib/moonlight-wishes";

type Body = {
  user_id?: string;
  wish_text?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id")?.trim() ?? "";
    const dateKey = getJstDateKey();
    const state = getMoonlightWishState(dateKey);
    const wish = state.canReview ? await getLatestWishForUser(user_id) : null;
    return NextResponse.json(
      {
        ok: true,
        dateKey,
        phaseLabel: state.moon.phaseLabel,
        majorPhase: state.moon.majorPhase,
        canWrite: state.canWrite,
        canReview: state.canReview,
        wish,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const record = await saveMoonlightWish({
      user_id: typeof body.user_id === "string" ? body.user_id : "",
      wish_text: typeof body.wish_text === "string" ? body.wish_text : "",
      newmoon_date: getJstDateKey(),
    });
    return NextResponse.json({ ok: true, wish: record }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "user_id is required" ||
        error.message === "wish_text is required" ||
        error.message === "wish_text is too long" ||
        error.message === "newmoon_date is invalid" ||
        error.message === "new moon only"
      ) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ ok: false, error: "failed to save moonlight wish" }, { status: 500 });
  }
}
