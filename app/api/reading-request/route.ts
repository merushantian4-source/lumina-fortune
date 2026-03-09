import { NextResponse } from "next/server";

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

    return NextResponse.json({
      ok: true,
      requestId: `RR-${Date.now()}`,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
}
