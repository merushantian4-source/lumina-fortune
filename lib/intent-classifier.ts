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
  /(結婚|入籍|婚活|結婚相手|夫|妻|プロポーズ|将来を考える|同棲|親への挨拶|誰と結婚|結婚したらいい)/;
const LOVE_RE =
  /(恋愛|相性|脈(あり|なし)?|告白|好き|気になる|片思い|両思い|付き合う|デート|line|ライン|相手の気持ち|距離|進展|復縁|彼氏|彼女)/;
const WORK_RE = /(仕事|転職|職場|上司|同僚|就活|学業|勉強|受験|学校|進路)/;
const MONEY_RE = /(金運|お金|収入|出費|貯金|投資|ローン|家計)/;
const UNKNOWN_PROBLEM_RE =
  /(最近悩んでて|悩みがある|相談したい|つらい|しんどい|不安|モヤモヤ|もやもや|うまくいかない|悩んでる|悩んでいて|悩んでます)/;
const CONSULT_SIGNAL_RE =
  /(悩|相談|不安|つらい|しんどい|もやもや|モヤモヤ|うまくいかない|占|運勢|恋愛|結婚|仕事|人間関係|金運)/;
const OFFTOPIC_WORD_RE =
  /^(うどん|生卵|卵|ラーメン|そば|パスタ|カレー|寿司|焼肉|テスト|test)$/i;
const SHORT_FORTUNE_ACCEPT_RE =
  /^(占って|お願いします|おねがいします|お願い|おねがい|見て|みて)$/;
const ACK_RE = /^(はい|うん|そう|そうです|そうですね|なるほど|たぶん|かも)$/;
const ACK_FOLLOWUP_RE =
  /^(結果|結果は|占ってる|まだ|どうなった|はやく)$/;

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

function stripTrailingMarks(input: string): string {
  return input.replace(/[!！?？。、，.\-ー〜～…\s]+$/g, "");
}

export function isAcknowledgementInput(input: string): boolean {
  const normalized = normalize(input);
  if (!normalized) return false;
  const stripped = stripTrailingMarks(normalized);
  return ACK_RE.test(stripped) || ACK_FOLLOWUP_RE.test(stripped);
}

function countLooseTokens(input: string): number {
  const tokens = input
    .split(/[\s、。,.!！?？]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return tokens.length;
}

function isShortOfftopicLike(input: string): boolean {
  const stripped = stripTrailingMarks(input);
  if (!stripped) return false;
  if (CONSULT_SIGNAL_RE.test(stripped)) return false;
  if (OFFTOPIC_WORD_RE.test(stripped)) return true;

  const tokenCount = countLooseTokens(stripped);
  if (tokenCount === 1 && stripped.length <= 16) {
    return !/[？?]/.test(stripped) && !/[ぁ-んァ-ヶ]/.test(stripped.replace(/[一-龠]/g, ""));
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
