import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildLuminaPrompt, type RomanceFeature, type InterpretationFrameInput } from "@/lib/ai/lumina-prompts";

type RequestBody = {
  feature: RomanceFeature;
  templateReading: Record<string, unknown>;
  context?: string;
  interpretationFrame?: InterpretationFrameInput;
};

const VALID_FEATURES: RomanceFeature[] = [
  "fukuen",
  "kare-no-kimochi",
  "kataomoi",
  "compatibility",
  "marriage-timing",
];

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { feature, templateReading, context, interpretationFrame } = body;

    if (!feature || !templateReading) {
      return NextResponse.json({ ok: false, error: "missing required fields" }, { status: 400 });
    }

    if (!VALID_FEATURES.includes(feature)) {
      return NextResponse.json({ ok: false, error: "unknown feature" }, { status: 400 });
    }

    // API キーがない場合はテンプレートをそのまま返す
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("[api/romance-reading] ANTHROPIC_API_KEY not set; returning template");
      return NextResponse.json({ ok: true, reading: templateReading });
    }

    const prompt = buildLuminaPrompt({ feature, templateReading, context, interpretationFrame });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
    });

    const block = response.content[0];
    const text = block?.type === "text" ? block.text.trim() : "";

    if (!text) {
      return NextResponse.json({ ok: true, reading: templateReading });
    }

    // JSON を抽出（コードブロックで囲まれている場合にも対応）
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonText = (jsonMatch ? jsonMatch[1]! : text).trim();

    try {
      const enhanced = JSON.parse(jsonText) as Record<string, unknown>;
      // テンプレートをベースに Claude の結果をマージ（非テキストフィールドの欠落を防ぐ）
      const merged = { ...templateReading, ...enhanced };
      return NextResponse.json({ ok: true, reading: merged });
    } catch {
      console.warn("[api/romance-reading] failed to parse Claude JSON; returning template");
      return NextResponse.json({ ok: true, reading: templateReading });
    }
  } catch (error) {
    console.error("[api/romance-reading] error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ ok: false, error: "reading generation failed" }, { status: 500 });
  }
}
