import { NextResponse } from "next/server";
import OpenAI from "openai";
import { saveConsultationLetter } from "@/lib/consultation-letters";
import { checkModerationPostInterval, resolveModerationUserKey } from "@/lib/moderation/rateLimit";

type Body = {
  nickname?: string;
  message?: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LUMINA_LETTER_SYSTEM_PROMPT = `あなたは「ルミナ」として返信します。
相手の悩みを占わずに受け止め、安心感と小さな前向きさを渡す文章を書いてください。

必須ルール:
- 占い・予言・カード・霊視などの表現は使わない
- 診断や断定をしない
- 優しく自然な日本語で2〜4文
- まず気持ちの受容、次に励まし
- 1つだけ、今日できる小さな行動を提案する
`;

function buildFallbackReply(nickname: string, message: string): string {
  const name = nickname.trim() ? `${nickname.trim()}さん` : "あなた";
  const shortMessage = message.trim().slice(0, 120);
  return `${name}、言葉にして届けてくれてありがとう。${shortMessage ? `「${shortMessage}」という気持ち、ちゃんと受け取りました。` : "その気持ち、ちゃんと受け取りました。"}無理に元気を出さなくて大丈夫。今日は深呼吸を3回して、温かい飲み物をひと口だけゆっくり飲んでみてください。`;
}

async function buildLuminaLetterReply(nickname: string, message: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackReply(nickname, message);
  }

  const name = nickname.trim() || "（ニックネームなし）";
  const userPrompt = [
    `ニックネーム: ${name}`,
    "手紙本文:",
    message,
    "",
    "上記に対して、ルミナとして返信してください。",
  ].join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: LUMINA_LETTER_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      return buildFallbackReply(nickname, message);
    }
    return text;
  } catch {
    return buildFallbackReply(nickname, message);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const message = typeof body.message === "string" ? body.message : "";
    const nickname = typeof body.nickname === "string" ? body.nickname : "";
    const rateLimit = await checkModerationPostInterval(
      resolveModerationUserKey(request, [nickname])
    );
    if (!rateLimit.ok) {
      return NextResponse.json({ ok: false, error: rateLimit.error }, { status: 400 });
    }
    const letter = await saveConsultationLetter({ nickname, message });
    const reply = await buildLuminaLetterReply(nickname, letter.message);
    return NextResponse.json({ ok: true, letter, reply }, { status: 201 });
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
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json({ ok: false, error: "failed to save letter" }, { status: 500 });
  }
}
