import {
  getCategoryReadings,
  pickTarotMode,
  resolveTarotCardProfile,
  type TarotReadingCategory,
} from "@/lib/fortune/tarot-profiles";
import type { DrawnTarotCard } from "@/lib/tarot/deck";

export type LightGuidanceTheme =
  | "love"
  | "marriage"
  | "work"
  | "money"
  | "relationship"
  | "future"
  | "health"
  | null;

export type ReadingViewpoint =
  | "相手の気持ち"
  | "恋の流れ"
  | "問題の原因"
  | "未来"
  | "アドバイス"
  | "今の流れ";

function mapThemeToCategory(theme: LightGuidanceTheme): TarotReadingCategory {
  switch (theme) {
    case "love":
    case "marriage":
      return "love";
    case "work":
      return "work";
    case "money":
      return "money";
    case "relationship":
      return "relation";
    case "health":
      return "health";
    default:
      return "general";
  }
}

function themeLabel(theme: LightGuidanceTheme): string {
  switch (theme) {
    case "love":
      return "恋愛";
    case "marriage":
      return "復縁・結婚";
    case "work":
      return "仕事";
    case "money":
      return "金運";
    case "relationship":
      return "人間関係";
    case "future":
      return "これから";
    case "health":
      return "心と体";
    default:
      return "全体";
  }
}

function determineViewpoint(message: string, theme: LightGuidanceTheme): ReadingViewpoint {
  const text = message.trim();

  if (/気持ち|本音|どう思/.test(text)) return "相手の気持ち";
  if (/原因|なぜ|どうして/.test(text)) return "問題の原因";
  if (/未来|これから|先|どうなる|いつ頃/.test(text)) return "未来";
  if (/どうすれば|何をしたら|気をつけ|助言|アドバイス/.test(text)) return "アドバイス";
  if (theme === "love" || theme === "marriage") return "恋の流れ";
  return "今の流れ";
}

export function buildOneCardReadingSeed(message: string, card: DrawnTarotCard, theme: LightGuidanceTheme): string {
  return `${theme ?? "general"}:${card.card.code}:${card.reversed ? "r" : "u"}:${message.trim()}`;
}

export function resolveOneCardReadingContext(
  card: DrawnTarotCard,
  theme: LightGuidanceTheme,
  seed: string,
  message = ""
) {
  const profile = resolveTarotCardProfile(card);
  const category = mapThemeToCategory(theme);
  const categoryReading = getCategoryReadings(profile, category);
  const selectedMode = pickTarotMode(profile, seed);
  const viewpoint = determineViewpoint(message, theme);

  return {
    profile,
    category,
    categoryReading,
    selectedMode,
    viewpoint,
    themeLabel: themeLabel(theme),
  };
}

export function buildLightGuidanceOneCardSystemPrompt(): string {
  return [
    "あなたは白の魔女ルミナです。",
    "これは『光の導きタロット占い』専用です。",
    "必ず1枚引きとして読み、3枚引きの表現は一切しません。",
    "返答は相談への鑑定として自然な日本語で書きます。",
    "上品で静か、やわらかいが芯のある口調にしてください。",
    "感謝から始めないでください。",
    "『カードをシャッフルします』『カードを引きます』などの説明は禁止です。",
    "長い前置きは禁止です。",
    "営業的な締めは禁止です。",
    "未来を100%断定せず、ただし曖昧語の連発にもならないようにしてください。",
    "恋愛では相手の気持ちを断定しすぎず、温度感や距離感として伝えてください。",
    "人間関係では相手を悪く決めつけないでください。",
    "仕事では押す、整える、待つなどの進め方が伝わるようにしてください。",
    "医療、法律、妊娠、生死、事故、失踪、浮気などの断定は禁止です。",
    "出力は必ずJSONのみです。",
    "JSONの形式は以下に厳密に従ってください。",
    '{',
    '  "intro": "",',
    '  "readingShort": "",',
    '  "readingDetail": ""',
    '}',
    "introは1文のみ。質問を受け取る短い一言にしてください。",
    "readingShortは1文のみ。カードの第一印象だけを短く伝えてください。",
    "readingDetailは3〜5文。1枚のカードを深く読み、相談内容に自然に重ねてください。",
    "readingShortとreadingDetailで同じ内容を繰り返さないでください。",
    "JSON以外の文字、見出し、説明、コードブロックを一切出してはいけません。",
  ].join("\n");
}

export function buildLightGuidanceOneCardPrompt(
  message: string,
  card: DrawnTarotCard,
  theme: LightGuidanceTheme = null
): string {
  const seed = buildOneCardReadingSeed(message, card, theme);
  const context = resolveOneCardReadingContext(card, theme, seed, message);
  const orientation = card.reversed ? "逆位置" : "正位置";

  return [
    `相談内容: ${message}`,
    `テーマ: ${context.themeLabel}`,
    `読みの視点: ${context.viewpoint}`,
    `カード: ${card.card.nameJa}（${orientation}）`,
    `カードの声: ${context.profile.voice}`,
    `読みの材料: ${context.categoryReading.join(" / ")}`,
    `今回の出方: ${context.selectedMode}`,
  ].join("\n");
}
