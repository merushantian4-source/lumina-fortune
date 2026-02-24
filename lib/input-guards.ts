const GREETING_WORDS = [
  "こんにちは",
  "こんばんは",
  "こんばんわ",
  "おはよう",
  "おはようございます",
  "はじめまして",
  "初めまして",
  "やあ",
  "やぁ",
  "もしもし",
  "hi",
  "hello",
  "hey",
] as const;

const TRAILING_MARKS = /[!！?？。、，.\-ー〜～…\s]+$/g;

function normalizeGreetingInput(input: string): string {
  return input.trim().toLowerCase();
}

export function isGreetingOnlyInput(input: string): boolean {
  const normalized = normalizeGreetingInput(input);
  if (!normalized || normalized.length > 24) return false;

  const stripped = normalized.replace(TRAILING_MARKS, "");
  return GREETING_WORDS.includes(stripped as (typeof GREETING_WORDS)[number]);
}

const FORTUNE_TRIGGER_RE =
  /(占って|占い|鑑定|リーディング|タロット|カード引いて|相性|運勢|総合運|恋愛運|仕事運|金運|健康運|学業運|(?:仕事|恋愛|金|総合|学業|健康)運を見て|見てもらえませんか|見てほしい|みてほしい|どう思う)/;
const SHORT_FORTUNE_ACCEPT_RE =
  /^(占って|お願いします|おねがいします|お願い|おねがい|見て|みて)$/;

const DIALOGUE_HINT_RE =
  /(気になる|好き|不安|心配|つらい|しんどい|悲しい|落ち込|もやもや|迷って|悩んで|困って|緊張|寂しい)/;

export function isFortuneRequestInput(input: string): boolean {
  const normalized = normalizeGreetingInput(input);
  const stripped = normalized.replace(TRAILING_MARKS, "");
  return FORTUNE_TRIGGER_RE.test(normalized) || SHORT_FORTUNE_ACCEPT_RE.test(stripped);
}

export function isDialogueModeInput(input: string, maxChars = 40): boolean {
  const normalized = normalizeGreetingInput(input);
  if (!normalized || normalized.length > maxChars) return false;
  if (isGreetingOnlyInput(normalized)) return false;
  if (isFortuneRequestInput(normalized)) return false;
  if (DIALOGUE_HINT_RE.test(normalized)) return true;

  // Short situation statements also go through dialogue mode.
  return !/[?？]/.test(normalized);
}
