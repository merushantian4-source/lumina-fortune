import "server-only";

import OpenAI from "openai";
import { getDailyWhisperByDate, getJstDateKey, saveDailyWhisper, type DailyWhisperRecord } from "@/lib/daily-whispers";

const generationLocks = new Map<string, Promise<DailyWhisperRecord>>();

const FALLBACK_WHISPERS = [
  "今日は、急いで答えを出すよりも、心の水面を静かに整えることが似合いそうです。\n小さな違和感に気づけたなら、それだけで流れはやわらかく変わっていきます。",
  "言葉にする前の気持ちにも、やさしい輪郭があります。\n今日は少しだけ間を置くことで、本当に大切な想いが見えやすくなりそうです。",
  "目立つ出来事がなくても、見えないところで流れが整っている日があります。\n今日は静かな手応えを信じて、呼吸をひとつ深くしてみてください。",
  "気持ちが散らばる日は、ひとつだけ丁寧に整えることが光になります。\n小さな落ち着きが戻ると、次の景色も自然に見えてきます。",
  "やさしさは大きな出来事ではなく、ふとした受け取り方の中にも宿ります。\n今日は少しだけ視線をゆるめると、心にやわらかな余白が生まれそうです。",
];

const FORBIDDEN_TERMS = [
  "カード",
  "タロット",
  "ルノルマン",
  "大アルカナ",
  "小アルカナ",
  "ワンド",
  "カップ",
  "ソード",
  "ペンタクル",
  "愚者",
  "魔術師",
  "女教皇",
  "女帝",
  "皇帝",
  "法王",
  "恋人",
  "戦車",
  "力",
  "隠者",
  "運命の輪",
  "正義",
  "吊るされた男",
  "死神",
  "節制",
  "悪魔",
  "塔",
  "星",
  "月",
  "太陽",
  "審判",
  "世界",
];

const DAILY_WHISPER_SYSTEM_PROMPT = [
  "あなたは「白の館 LUMINA」のトップページに表示する短い日替わりメッセージを書きます。",
  "これは「今日のルミナのささやき」であり、毎日の占い本文とは別物です。",
  "JSONのみを返してください。",
].join("\n");

function getSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["message"],
    properties: {
      message: { type: "string" },
    },
  } as const;
}

function buildUserPrompt(dateKey: string): string {
  return [
    `対象日: ${dateKey}`,
    "",
    "次の条件を守って、日本語で1つだけ生成してください。",
    "- トップページ用の「今日のルミナのささやき」",
    "- 毎日の占い本文とは別物",
    "- 鑑定の結論ではなく、静かな気づきや心の整え方を伝える",
    "- 2〜3文",
    "- 全体で60〜120文字程度",
    "- 1文ごとに改行",
    "- 改行しすぎない",
    "- 静かでやさしい語り口",
    "- 読みやすい",
    "- 世界観に合う",
    "- 断定しすぎない",
    "- 命令しすぎない",
    "- 説教くさくしない",
    "- 不安を煽らない",
    "- 恋愛や仕事など特定テーマに寄せすぎない",
    "- カード名や具体的な鑑定結果は出さない",
    "- 「光」「静けさ」「流れ」「気づき」「整える」などの語感は歓迎",
    "- PCで読んだときに縦長になりすぎないこと",
    "- 返答はJSONの message に本文だけを入れる",
  ].join("\n");
}

function normalizeGeneratedMessage(message: string): string {
  const normalized = message
    .replace(/\r\n/g, "\n")
    .replace(/[「」"]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const sentenceChunks = normalized
    .split(/\n+/)
    .flatMap((line) =>
      line
        .split(/(?<=[。！？])/)
        .map((chunk) => chunk.trim())
        .filter(Boolean)
    )
    .slice(0, 3);

  return sentenceChunks.join("\n").trim();
}

function isValidWhisper(message: string): boolean {
  const compactLength = message.replace(/\n/g, "").trim().length;
  const lineCount = message.split("\n").filter(Boolean).length;

  if (compactLength < 60 || compactLength > 120) {
    return false;
  }
  if (lineCount < 2 || lineCount > 3) {
    return false;
  }
  if (FORBIDDEN_TERMS.some((term) => message.includes(term))) {
    return false;
  }
  return true;
}

function getFallbackWhisper(dateKey: string): string {
  const numeric = Number(dateKey.replace(/-/g, ""));
  const index = Number.isFinite(numeric) ? numeric % FALLBACK_WHISPERS.length : 0;
  return FALLBACK_WHISPERS[index];
}

async function generateWhisperText(dateKey: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return getFallbackWhisper(dateKey);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "daily_whisper",
          schema: getSchema(),
          strict: true,
        },
      },
      messages: [
        { role: "system", content: DAILY_WHISPER_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(dateKey) },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      return getFallbackWhisper(dateKey);
    }

    const parsed = JSON.parse(rawContent) as { message?: string };
    const normalized = normalizeGeneratedMessage(parsed.message ?? "");
    if (!isValidWhisper(normalized)) {
      return getFallbackWhisper(dateKey);
    }
    return normalized;
  } catch {
    return getFallbackWhisper(dateKey);
  }
}

async function createDailyWhisper(dateKey: string): Promise<DailyWhisperRecord> {
  const existing = await getDailyWhisperByDate(dateKey);
  if (existing) {
    return existing;
  }

  const message = await generateWhisperText(dateKey);
  return saveDailyWhisper({
    date: dateKey,
    message,
    created_at: new Date().toISOString(),
  });
}

export async function getOrCreateDailyWhisper(dateKey = getJstDateKey()): Promise<DailyWhisperRecord> {
  const existing = await getDailyWhisperByDate(dateKey);
  if (existing) {
    return existing;
  }

  const inFlight = generationLocks.get(dateKey);
  if (inFlight) {
    return inFlight;
  }

  const pending = createDailyWhisper(dateKey).finally(() => {
    generationLocks.delete(dateKey);
  });

  generationLocks.set(dateKey, pending);
  return pending;
}
