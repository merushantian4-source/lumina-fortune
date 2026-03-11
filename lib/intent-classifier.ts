import { isFortuneRequestInput, isGreetingOnlyInput } from "./input-guards";

export type ConsultationTopic = "love" | "marriage" | "work" | "money";

export type IntentType =
  | "greeting"
  | "fortune_request"
  | "love"
  | "marriage"
  | "work"
  | "money"
  | "unknown_problem"
  | "nonsense_or_offtopic"
  | "other";

export type IntentClassificationContext = {
  lastTopic?: ConsultationTopic | null;
};

const MARRIAGE_RE =
  /(結婚|結婚運|けっこん運|入籍|婚活|結婚相手|夫|妻|プロポーズ|将来を考える|同棲|親への挨拶|誰と結婚|結婚したらいい)/;
const LOVE_RE =
  /(恋愛|恋愛運|相性|脈(あり|なし)?|告白|好き|気になる|片思い|両思い|付き合う|デート|line|ライン|相手の気持ち|距離|進展|復縁|彼氏|彼女)/;
const WORK_RE = /(仕事|仕事運|転職|職場|上司|同僚|就活|学業|勉強|受験|学校|進路)/;
const MONEY_RE = /(金運|お金|収入|出費|貯金|投資|ローン|家計)/;
const UNKNOWN_PROBLEM_RE =
  /(悩みで|悩んで|悩んでます|不安|つらい|しんどい|うまくいかない|もやもや|モヤモヤ)/;
const CONSULT_SIGNAL_RE =
  /(悩|相談|不安|つらい|しんどい|もやもや|モヤモヤ|うまくいかない|占|運勢|恋愛|結婚|仕事|人間関係|金運)/;
const OFFTOPIC_WORD_RE = /^(どう|え|ラーメン|そのへん|パスタ|カレー|旅行|雑談|テスト)$/i;
const SHORT_FORTUNE_ACCEPT_RE = /^(占って|お願いします|おねがい|お願い|みて|見て)$/;
const AFFIRMATIVE_RE = /^(うん|はい|お願い(します)?|おねがい|みて|見て|ok)$/i;
const ACK_RE = /^(うん|はい|そう|そうです|なるほど|たしかに)$/;
const ACK_FOLLOWUP_RE = /^(結果は|結果は？|見てみる|どうかな)$/;
const TRAILING_MARKS_RE = /[!！?？。、…\-\s]+$/g;

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

function stripTrailingMarks(input: string): string {
  return input.replace(TRAILING_MARKS_RE, "");
}

export function isAcknowledgementInput(input: string): boolean {
  const normalized = normalize(input);
  if (!normalized) return false;
  const stripped = stripTrailingMarks(normalized);
  return ACK_RE.test(stripped) || AFFIRMATIVE_RE.test(stripped) || ACK_FOLLOWUP_RE.test(stripped);
}

export function isAffirmativeInput(input: string): boolean {
  const normalized = normalize(input);
  if (!normalized) return false;
  return AFFIRMATIVE_RE.test(stripTrailingMarks(normalized));
}

function countLooseTokens(input: string): number {
  const tokens = input
    .split(/[\s、。!！?？]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  return tokens.length;
}

function isShortOfftopicLike(input: string): boolean {
  const stripped = stripTrailingMarks(input);
  if (!stripped) return false;
  if (CONSULT_SIGNAL_RE.test(stripped)) return false;
  if (OFFTOPIC_WORD_RE.test(stripped)) return true;

  const tokenCount = countLooseTokens(stripped);
  if (tokenCount === 1 && stripped.length <= 4) {
    return true;
  }
  if (tokenCount === 1 && stripped.length <= 16) {
    return !/[ぁ-んァ-ヶ一-龠]/.test(stripped);
  }
  return false;
}

export function intentToTopic(intent: IntentType): ConsultationTopic | null {
  if (
    intent === "love" ||
    intent === "marriage" ||
    intent === "work" ||
    intent === "money"
  ) {
    return intent;
  }
  return null;
}

export function classifyIntent(
  input: string,
  context: IntentClassificationContext = {}
): IntentType {
  const normalized = normalize(input);
  if (!normalized) return "nonsense_or_offtopic";

  const stripped = stripTrailingMarks(normalized);

  if (isGreetingOnlyInput(normalized)) return "greeting";
  if (isFortuneRequestInput(normalized)) return "fortune_request";
  if (context.lastTopic && SHORT_FORTUNE_ACCEPT_RE.test(stripped)) return "fortune_request";
  if (MARRIAGE_RE.test(normalized)) return "marriage";
  if (LOVE_RE.test(normalized)) return "love";
  if (WORK_RE.test(normalized)) return "work";
  if (MONEY_RE.test(normalized)) return "money";
  if (UNKNOWN_PROBLEM_RE.test(normalized)) return "unknown_problem";
  if (ACK_RE.test(stripped)) return "other";
  if (isShortOfftopicLike(normalized)) return "nonsense_or_offtopic";

  return "other";
}
