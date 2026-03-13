const GREETING_WORDS = [
  "こんにちは",
  "こんばんは",
  "おはよう",
  "はじめまして",
  "やあ",
  "hey",
  "hello",
  "hi",
] as const;

const TRAILING_MARKS = /[!！?？。、「」…\-\s]+$/g;

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
  /^(恋愛|相手の気持ち|結婚|けっこん運|仕事|金運|お金)(を)?(見て|みて|占って|占い|お願い|おねがい)$/;

const FORTUNE_TRIGGER_RE =
  /(占って|占い|見て|みて|タロット|リーディング|鑑定|お願いします|おねがい)/;

const SHORT_FORTUNE_ACCEPT_RE = /^(占って|見て|みて|お願い|おねがい|はい)$/;

const DIALOGUE_HINT_RE =
  /(悩み|つらい|モヤモヤ|不安|どうしたら|聞いて|相談|気になって|落ち込んで|迷って)/;

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

  return !/[?？]/.test(normalized);
}
