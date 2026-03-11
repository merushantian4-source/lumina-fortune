const GREETING_WORDS = [
  "こんにちは",
  "こんばんは",
  "こんばんはー",
  "こんばんはわ",
  "おはよう",
  "おはようございます",
  "はじめまして",
  "やあ",
  "hey",
  "hello",
  "hi",
] as const;

const TRAILING_MARKS = /[!！?？。、…\-\s]+$/g;

function normalizeInput(input: string): string {
  return input.trim().toLowerCase();
}

export function isGreetingOnlyInput(input: string): boolean {
  const normalized = normalizeInput(input);
  if (!normalized || normalized.length > 24) return false;

  const stripped = normalized.replace(TRAILING_MARKS, "");
  return GREETING_WORDS.includes(stripped as (typeof GREETING_WORDS)[number]);
}

const SHORT_THEME_REQUEST_RE =
  /^(恋愛|恋愛運|相手の気持ち|結婚|結婚運|けっこん運|仕事|仕事運|学業|金運|お金)(は)?(見て|みて|占って)?$/;
const FORTUNE_TRIGGER_RE =
  /(占って|占い|タロット|カード引いて|鑑定|リーディング|運勢)/;
const SHORT_FORTUNE_ACCEPT_RE = /^(占って|見て|みて|お願い|お願いします|おねがい)$/;

const DIALOGUE_HINT_RE =
  /(悩|つらい|しんどい|苦しい|不安|もやもや|モヤモヤ|疲れた|聞いて|相談|うまくいかない)/;

export function isFortuneRequestInput(input: string): boolean {
  const normalized = normalizeInput(input);
  if (!normalized) return false;

  const stripped = normalized.replace(TRAILING_MARKS, "");
  return (
    SHORT_THEME_REQUEST_RE.test(stripped) ||
    FORTUNE_TRIGGER_RE.test(normalized) ||
    SHORT_FORTUNE_ACCEPT_RE.test(stripped)
  );
}

export function isDialogueModeInput(input: string, maxChars = 40): boolean {
  const normalized = normalizeInput(input);
  if (!normalized || normalized.length > maxChars) return false;
  if (isGreetingOnlyInput(normalized)) return false;
  if (isFortuneRequestInput(normalized)) return false;
  if (DIALOGUE_HINT_RE.test(normalized)) return true;

  // Short situation statements also go through dialogue mode.
  return !/[?？]/.test(normalized);
}
