import { resolveOneCardReadingContext, type LightGuidanceTheme } from "@/lib/fortune/light-guidance-one-card";
import { luminaDevError, luminaDevLog, luminaDevWarn } from "@/lib/config/lumina-dev";
import type { DrawnTarotCard } from "@/lib/tarot/deck";

export type LightGuidanceOneCardSections = {
  intro: string;
  readingShort: string;
  readingDetail: string;
  text: string;
};

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

function ensureSentenceEnding(text: string): string {
  const value = text.trim();
  if (!value) return "";
  return /[。！？]$/.test(value) ? value : `${value}。`;
}

function splitSentences(text: string): string[] {
  return normalize(text)
    .split(/(?<=[。！？])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function stripCodeFences(text: string): string {
  return text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
}

function trimSentenceCount(text: string, min: number, max: number): string {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return "";
  const count = Math.max(min, Math.min(max, sentences.length));
  return sentences.slice(0, count).map(ensureSentenceEnding).join("");
}

function inferIntro(theme: LightGuidanceTheme, message: string): string {
  const text = message.trim();
  if (/復縁|元[彼カレ女ジョ]|やり直|よりを戻|戻れ/.test(text)) {
    return "復縁の可能性を静かに見ていきますね。";
  }
  if (/結婚|結婚運|けっこん|婚活|入籍|プロポーズ/.test(text)) {
    return "結婚の流れについて見ていきましょう。";
  }
  if (/気持ち|本音|どう思/.test(text)) return "お相手のお気持ちの流れを見ていきますね。";
  if (/恋愛|恋|好き|片思い|彼氏|彼女/.test(text)) return "恋の流れを見ていきましょう。";
  if (/仕事|転職|職場|働/.test(text)) return "お仕事の流れですね。では、この一枚から読み解いていきますね。";
  if (/人間関係|友達|家族/.test(text)) return "その関わりの流れですね。では、カードから見ていきますね。";

  switch (theme) {
    case "love":
      return "恋の流れを見ていきましょう。";
    case "marriage":
      return "結婚の流れについて見ていきましょう。";
    case "work":
      return "お仕事の流れですね。では、この一枚から読み解いていきますね。";
    case "money":
      return "お金の流れですね。では、静かに見ていきますね。";
    case "relationship":
      return "その関係性ですね。では、カードから見ていきますね。";
    case "future":
      return "これからの流れですね。では、この一枚から読み解いていきますね。";
    case "health":
      return "心と体の流れですね。では、静かに見ていきますね。";
    default:
      return "その流れですね。では、カードから見ていきますね。";
  }
}

function buildFallbackReadingShort(card: DrawnTarotCard, theme: LightGuidanceTheme, message: string): string {
  const seed = `${theme ?? "general"}:${card.card.code}:${card.reversed ? "r" : "u"}:${message.trim()}`;
  const context = resolveOneCardReadingContext(card, theme, seed, message);
  const first = context.categoryReading[0] ?? context.selectedMode;

  return ensureSentenceEnding(
    card.reversed
      ? `${first}には、急がず整えたい気配が出ています`
      : `${first}には、静かに動き始める流れが出ています`
  );
}

function buildFallbackReadingDetail(card: DrawnTarotCard, theme: LightGuidanceTheme, message: string): string {
  const seed = `${theme ?? "general"}:${card.card.code}:${card.reversed ? "r" : "u"}:${message.trim()}`;
  const context = resolveOneCardReadingContext(card, theme, seed, message);
  const first = context.categoryReading[0] ?? context.selectedMode;
  const second = context.categoryReading[1] ?? context.selectedMode;
  const orientation = card.reversed ? "逆位置" : "正位置";

  return [
    `この一枚には、${first}が前に出ています。`,
    `${card.card.nameJa}の${orientation}は、${second}を急いで決めないほうがよい場面を映しやすいです。`,
    card.reversed
      ? "今は強く押すより、乱れた気持ちや段取りを静かに整えるほうが流れに合います。"
      : "今は無理に結論を急ぐより、自然に呼吸が合う形を選ぶほうが流れに乗れます。",
    theme === "work"
      ? "目の前の優先順位をひとつずつ整えるほど、判断もぶれにくくなりそうです。"
      : theme === "relationship"
        ? "相手を決めつけず、距離の取り方を少しやわらげるほど、見え方も落ち着いてきそうです。"
        : theme === "love" || theme === "marriage"
          ? "気持ちを確かめたくなっても、今は関係の温度を乱さないことが穏やかな追い風になります。"
          : "今日はひとつずつ整える意識が、心を落ち着かせてくれそうです。",
  ].join("");
}

function parseJsonObject(rawText: string): Partial<Record<"intro" | "readingShort" | "readingDetail", string>> | null {
  try {
    luminaDevLog("[lumina] parsing response...");
    const cleaned = stripCodeFences(rawText);
    const directTarget = cleaned.startsWith("{") ? cleaned : extractJsonObject(cleaned);
    const parsed = JSON.parse(directTarget) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      intro: typeof parsed.intro === "string" ? parsed.intro : "",
      readingShort: typeof parsed.readingShort === "string" ? parsed.readingShort : "",
      readingDetail: typeof parsed.readingDetail === "string" ? parsed.readingDetail : "",
    };
  } catch (error) {
    luminaDevError("[lumina] parse failed:", error);
    return null;
  }
}

function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  if (start < 0) return text;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return text;
}

function salvageFreeformSections(
  rawText: string,
  theme: LightGuidanceTheme,
  card: DrawnTarotCard,
  message: string
): Partial<Record<"intro" | "readingShort" | "readingDetail", string>> {
  const sentences = splitSentences(stripCodeFences(rawText)).filter(Boolean);
  const cleaned = sentences.filter(
    (sentence) =>
      !/ありがとうございます|お待ちください|シャッフル|カードを引き|ぜひまた|教えてください/.test(sentence)
  );

  if (cleaned.length === 0) {
    return {};
  }

  if (cleaned.length === 1) {
    return {
      intro: inferIntro(theme, message),
      readingShort: buildFallbackReadingShort(card, theme, message),
      readingDetail: cleaned[0],
    };
  }

  if (cleaned.length === 2) {
    return {
      intro: cleaned[0],
      readingShort: cleaned[1],
      readingDetail: buildFallbackReadingDetail(card, theme, message),
    };
  }

  return {
    intro: cleaned[0],
    readingShort: cleaned[1],
    readingDetail: cleaned.slice(2).join(""),
  };
}

export function ensureLightGuidanceOneCardOutput(
  rawText: string,
  card: DrawnTarotCard,
  theme: LightGuidanceTheme,
  message: string
): LightGuidanceOneCardSections {
  const parsed = parseJsonObject(rawText) ?? salvageFreeformSections(rawText, theme, card, message);
  luminaDevLog("[lumina] parsed response:", parsed);

  const inferredIntro = inferIntro(theme, message);
  const introSource =
    theme === "love" || theme === "marriage"
      ? inferredIntro
      : parsed?.intro?.trim() || inferredIntro;
  const intro = ensureSentenceEnding(introSource);
  const readingShort = trimSentenceCount(parsed?.readingShort ?? "", 1, 1) || buildFallbackReadingShort(card, theme, message);
  const readingDetail = trimSentenceCount(parsed?.readingDetail ?? "", 3, 5) || buildFallbackReadingDetail(card, theme, message);

  if (!parsed) {
    luminaDevWarn("[lumina] fallback route: json-parse-failed");
  } else if (!parsed.intro || !parsed.readingShort || !parsed.readingDetail) {
    luminaDevWarn("[lumina] fallback route: missing-required-fields", parsed);
  }

  return {
    intro,
    readingShort,
    readingDetail,
    text: [intro, readingShort, readingDetail].join("\n\n"),
  };
}
