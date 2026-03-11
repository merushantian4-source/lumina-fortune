type LiteCard = {
  name: string;
  reversed?: boolean;
};

const MIN_CHARS = 400;
const MAX_CHARS = 600;

const LEGACY_HEADER_RE =
  /^(A\)|B\)|C\)|D\)|E\)|F\)|引いたカード：|カードの象徴:|今日の読み:|注意点:|今日の行動ヒント:|ひと言:)/;

const GENTLE_CLOSING = "ゆっくりで、ちゃんと届きます。";

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeOrientationMentions(text: string, card?: LiteCard): string {
  if (!card || !card.name) return text;
  const opposite = card.reversed ? "正位置" : "逆位置";
  const expected = card.reversed ? "逆位置" : "正位置";
  const escapedName = escapeRegExp(card.name);
  const directPattern = new RegExp(`${escapedName}\\s*[（(]\\s*${opposite}\\s*[）)]`, "g");
  return text.replace(directPattern, `${card.name}（${expected}）`);
}

function cardLabel(card?: LiteCard): string {
  if (!card) return "カード（正位置）";
  return `${card.name}（${card.reversed ? "逆位置" : "正位置"}）`;
}

function removeQuestions(text: string): string {
  return text
    .replace(/[？?]/g, "。")
    .replace(/でしょうか/g, "です")
    .replace(/ませんか/g, "ます")
    .replace(/かもしれませんか/g, "かもしれません");
}

function softenAnxiety(text: string): string {
  return text
    .replace(/最悪/g, "重たく")
    .replace(/危険/g, "注意")
    .replace(/不吉/g, "落ち着かない")
    .replace(/取り返しがつかない/g, "整え直せる")
    .replace(/絶対に/g, "無理のない範囲で");
}

function splitBodyAndHints(text: string): { bodyParagraphs: string[]; hints: string[]; closing: string | null } {
  const lines = normalizeText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !LEGACY_HEADER_RE.test(line));

  const hints: string[] = [];
  const bodyLines: string[] = [];
  let closing: string | null = null;

  for (const line of lines) {
    if (/^[・\-•]\s*/.test(line)) {
      hints.push(line.replace(/^[・\-•]\s*/, "").trim());
      continue;
    }
    if (/^(🌿\s*今日の一枚|🌿\s*今日のヒント|🌿\s*ひとこと)$/.test(line)) {
      continue;
    }
    if (/^(今日の一枚|今日のヒント|ひとこと)$/.test(line)) {
      continue;
    }
    bodyLines.push(line);
  }

  if (bodyLines.length > 0) {
    const last = bodyLines[bodyLines.length - 1];
    if (last.length <= 28) {
      closing = last;
      bodyLines.pop();
    }
  }

  const merged = bodyLines.join("\n");
  const paragraphs = merged
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean)
    .slice(0, 3);

  return { bodyParagraphs: paragraphs, hints: hints.slice(0, 2), closing };
}

function dedupeParagraphs(paragraphs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const paragraph of paragraphs) {
    const key = paragraph.replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(paragraph);
  }
  return out;
}

function ensureBodyLength(paragraphs: string[]): string[] {
  const out = dedupeParagraphs(paragraphs);
  const fallbackLine = "今日は急がず、静かな順番を選ぶほど、流れがやわらかく整っていきます。";
  while (out.join("\n\n").length < MIN_CHARS - 140) {
    if (!out.includes(fallbackLine)) {
      out.push(fallbackLine);
    } else {
      break;
    }
    if (out.length >= 3) break;
  }
  return out.slice(0, 3);
}

function clampText(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  return `${text.slice(0, MAX_CHARS - 1).trimEnd()}…`;
}

export function ensureFortuneOutputFormat(text: string, cards: LiteCard[]): string {
  const orientationAligned = normalizeOrientationMentions(normalizeText(text), cards[0]);
  const normalized = softenAnxiety(removeQuestions(orientationAligned));
  const { bodyParagraphs, hints, closing } = splitBodyAndHints(normalized);
  const legacyHeading = `引いたカード：${cardLabel(cards[0])}`;

  const paragraphs = ensureBodyLength(
    bodyParagraphs.length > 0
      ? bodyParagraphs
      : ["今日は、気持ちの速度を少し緩めるほど、言葉と行動が穏やかにそろっていく一日です。"]
  );

  const safeHints =
    hints.length > 0
      ? hints
      : ["急いで返事をしなくて大丈夫", "ひと呼吸おいてから言葉にする"];

  const finalLine = closing && closing.length <= 28 ? closing : GENTLE_CLOSING;

  const composed = [
    legacyHeading,
    "",
    "🌿 今日の一枚",
    "",
    cardLabel(cards[0]),
    "",
    paragraphs.join("\n\n"),
    "",
    "🌿 今日のヒント",
    "",
    ...safeHints.slice(0, 2).map((h) => `・${h}`),
    "",
    "🌿 ひとこと",
    "",
    finalLine,
  ].join("\n");

  const clamped = clampText(composed);
  return clamped.length < MIN_CHARS
    ? `${clamped}\n\n静かな歩幅で進むほど、今日の空気はあなたに優しく寄り添います。`
    : clamped;
}
