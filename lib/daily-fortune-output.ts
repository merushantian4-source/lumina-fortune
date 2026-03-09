type LiteCard = {
  name: string;
  reversed?: boolean;
};

type DailyFortuneOutputContext = {
  nickname?: string;
  job?: string;
  loveStatus?: "single" | "married" | "complicated" | "unrequited" | string;
  weekdayJa: string;
  previousCard?: {
    name: string;
    reversed?: boolean;
  } | null;
};

const MIN_CHARS = 600;
const MAX_CHARS = 900;

const FORBIDDEN_HEADING_PATTERNS = [
  /^\s*【[^】]+】\s*$/gm,
  /^\s*(導入|運勢|回収|全体運|仕事運|恋愛運|人間関係運|金運|今日の小さなアクション|心理メッセージ)\s*[:：]?\s*$/gm,
];

function cardText(card?: LiteCard | null): string {
  if (!card) return "前日のカード情報はありません";
  return `${card.name}の${card.reversed ? "逆位置" : "正位置"}`;
}

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

function stripForbiddenHeadings(text: string): string {
  let next = text;
  for (const pattern of FORBIDDEN_HEADING_PATTERNS) {
    next = next.replace(pattern, "");
  }
  return next
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[ \t]+/gm, "")
    .trim();
}

function uniqueParagraphs(text: string): string {
  const parts = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of parts) {
    const key = part.replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(part);
  }
  return result.join("\n\n");
}

function resolveDisplayName(nickname?: string): string {
  const trimmed = nickname?.trim();
  return trimmed ? `${trimmed}さん` : "ゲストさん";
}

function loveGuidance(loveStatus?: string): string {
  if (loveStatus === "married") {
    return "恋愛面では、近しい相手の気持ちを決めつけず、ひと呼吸おいて受け止めるほど空気がやわらかくなりそうです。";
  }
  if (loveStatus === "complicated") {
    return "恋愛面では、答えを急がずに今の距離感を丁寧に扱うことで、見えにくかった本音が少しずつ整っていきそうです。";
  }
  if (loveStatus === "unrequited") {
    return "恋愛面では、相手の反応ばかりを追うよりも、自分の心が穏やかでいられる言葉選びを意識すると安心感が戻りそうです。";
  }
  return "恋愛面では、誰かに向けるやさしさと同じくらい、自分の心にも静かな余白を残しておくことが助けになりそうです。";
}

function buildStructuredFallback(cards: LiteCard[], context: DailyFortuneOutputContext): string {
  const main = cards[0] ?? { name: "星", reversed: false };
  const displayName = resolveDisplayName(context.nickname);
  const previous = cardText(context.previousCard);
  const workLead = context.job?.trim()
    ? `${context.job.trim()}に向き合う場面では、`
    : "仕事では、";

  const text = [
    `こんにちは、${displayName}。今日は${context.weekdayJa}ですね。今日のカードは「${main.name}」の${main.reversed ? "逆位置" : "正位置"}です。`,
    `このカードは、${main.reversed ? "見直し、静かな修復、心の整え直し" : "調和、気づき、流れを整えること"}を象徴します。昨日の${previous}から続く流れとして、今日は勢いよりも、足元の感覚をたしかめながら進む意味がやや強まっていそうです。今日のテーマは「静かに整えてから動くこと」です。`,
    `全体運は、目立つ出来事がなくても内側ではきちんと流れが動いている日です。急いで結論を出すより、ひとつずつ手元を整えるほうが安心につながるでしょう。${workLead}優先順位をひとつだけ先に決めておくと、気持ちが散らばりにくくなりそうです。${loveGuidance(context.loveStatus)}`,
    `人間関係では、すぐに正しさを示すよりも、まず相手の立場を想像することで会話が穏やかに進みそうです。もし金銭面が気になるなら、大きく動かすより小さな無駄を見直すほうが心が落ち着くでしょう。今日は机の上や鞄の中を3分だけ整えてから、最初の用事に向かうと流れに乗りやすくなります。`,
    `あなたは大丈夫です。立ち止まって整える時間も、前へ進む力を静かに育てています。今日もあなたの歩みが、やわらかな光に守られますように。`,
  ].join("\n\n");

  return text;
}

function clampParagraphLength(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  const paragraphs = text.split(/\n{2,}/);
  while (paragraphs.join("\n\n").length > MAX_CHARS && paragraphs.length > 1) {
    const last = paragraphs[paragraphs.length - 1] ?? "";
    if (last.length > 90) {
      paragraphs[paragraphs.length - 1] = `${last.slice(0, Math.max(0, last.length - 40)).trim()}。`;
      continue;
    }
    paragraphs.pop();
  }
  const merged = paragraphs.join("\n\n").trim();
  return merged.length <= MAX_CHARS ? merged : `${merged.slice(0, MAX_CHARS - 1).trimEnd()}…`;
}

function looksValid(text: string, cards: LiteCard[], context: DailyFortuneOutputContext): boolean {
  const displayName = resolveDisplayName(context.nickname);
  const compact = text.replace(/\n/g, "");

  if (compact.length < MIN_CHARS || compact.length > MAX_CHARS) return false;
  if (!text.includes(displayName)) return false;
  if (!text.includes(context.weekdayJa)) return false;
  if (!cards.some((card) => text.includes(card.name))) return false;
  if (!/全体|仕事|恋愛|人間関係/.test(text)) return false;
  if (!/大丈夫/.test(text)) return false;
  if (FORBIDDEN_HEADING_PATTERNS.some((pattern) => pattern.test(text))) return false;
  return true;
}

export function ensureFortuneOutputFormat(
  text: string,
  cards: LiteCard[],
  context: DailyFortuneOutputContext
): string {
  const cleaned = uniqueParagraphs(stripForbiddenHeadings(normalize(text)));
  if (looksValid(cleaned, cards, context)) {
    return clampParagraphLength(cleaned);
  }
  return buildStructuredFallback(cards, context);
}
