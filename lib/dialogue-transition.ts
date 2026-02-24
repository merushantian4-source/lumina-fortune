export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type DialogueConversationState = {
  questionStreak: number;
  affirmativeStreak: number;
  hasRelationshipInfo: boolean;
  hasClearGoal: boolean;
  shouldOfferFortune: boolean;
  triggerReason:
    | "clear-goal"
    | "relationship-info"
    | "affirmative-streak"
    | "question-streak"
    | null;
};

const CLEAR_GOAL_RE =
  /(もっと仲良くなりたい|仲良くなりたい|付き合いたい|脈ある|脈あり|告白したい|進展したい|距離を縮めたい)/;

const RELATIONSHIP_INFO_RE =
  /(同じ学校|同じクラス|同じ職場|一緒に帰|帰っている|帰った|手をつない|手繋い|LINEして|連絡して|デート|会って|話してくれ|目が合う)/;

const AFFIRMATIVE_ONLY_RE =
  /^(はい|うん|そう|そうです|そうですね|気になります|気になる|あります|たぶん|そうかも|です|そう思います)[！!。…\s]*$/;

const FORTUNE_REQUEST_RE = /(占って|占い|タロット|リーディング|見てほしい|みてほしい)/;

const OFFER_VARIATIONS = [
  "今の状況を占ってみますか？",
  "脈あり度と次の一手、占いますか？",
  "タロットで1枚引きして、今の流れを見ますか？",
] as const;

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function isQuestionLikeAssistantReply(text: string): boolean {
  const t = normalize(text);
  if (!t) return false;
  const sentences = t.split(/(?<=[。！？?])/).filter(Boolean);
  const hasQuestion = /[?？]/.test(t);
  if (!hasQuestion) return false;
  // Count as "question rally" only when assistant reply is mostly asking.
  return (
    sentences.length <= 2 &&
    /[?？]\s*$/.test(t) &&
    !/(占ってみますか|占いますか|見ますか)/.test(t)
  );
}

function isAffirmativeReply(text: string): boolean {
  return AFFIRMATIVE_ONLY_RE.test(normalize(text));
}

function containsRelationshipInfo(text: string): boolean {
  return RELATIONSHIP_INFO_RE.test(text);
}

function containsClearGoal(text: string): boolean {
  return CLEAR_GOAL_RE.test(text);
}

function isFortuneRequest(text: string): boolean {
  return FORTUNE_REQUEST_RE.test(text);
}

function collectRecentUserFacts(history: ChatHistoryItem[], currentMessage: string): string[] {
  const userTexts = [
    ...history.filter((h) => h.role === "user").map((h) => h.content),
    currentMessage,
  ]
    .map(normalize)
    .filter(Boolean)
    .slice(-4);

  const facts: string[] = [];

  const hasSameSchool = userTexts.some((t) => /同じ学校|同じクラス|同じ職場/.test(t));
  const hasGoHome = userTexts.some((t) => /一緒に帰|帰っている|帰った/.test(t));
  const hasHandHold = userTexts.some((t) => /手をつない|手繋い/.test(t));

  if (hasSameSchool) facts.push("同じ学校（または日常で会える関係）");
  if (hasGoHome) facts.push("一緒に帰ることがある");
  if (hasHandHold) facts.push("手をつないだことがある");

  if (facts.length === 0) {
    const current = normalize(currentMessage);
    if (current) {
      const short = current.length > 30 ? `${current.slice(0, 30)}…` : current;
      facts.push(short);
    }
  }

  return facts.slice(0, 3);
}

function buildSummarySentence(facts: string[]): string {
  const joined = facts.join("、");
  const text = `${joined}んですね。`;
  return text.length <= 60 ? text : `${text.slice(0, 59)}。`;
}

function pickOfferVariant(seedSource: string): string {
  let hash = 0;
  for (const ch of seedSource) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return OFFER_VARIATIONS[hash % OFFER_VARIATIONS.length] ?? OFFER_VARIATIONS[0];
}

function clampTextLength(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars - 1)}…`;
}

export function getDialogueConversationState(
  history: ChatHistoryItem[],
  currentMessage: string
): DialogueConversationState {
  let questionStreak = 0;
  let affirmativeStreak = 0;

  const recent = [...history].slice(-8);
  for (let i = recent.length - 1; i >= 0; i--) {
    const item = recent[i];
    if (item.role !== "assistant") continue;
    if (isQuestionLikeAssistantReply(item.content)) {
      questionStreak += 1;
      continue;
    }
    break;
  }

  const recentUserTurns = [...history]
    .filter((h) => h.role === "user")
    .map((h) => h.content)
    .slice(-4);
  for (let i = recentUserTurns.length - 1; i >= 0; i--) {
    if (isAffirmativeReply(recentUserTurns[i])) {
      affirmativeStreak += 1;
      continue;
    }
    break;
  }
  if (isAffirmativeReply(currentMessage)) {
    affirmativeStreak += 1;
  } else {
    affirmativeStreak = 0;
  }

  const allUserTexts = [...recentUserTurns, currentMessage];
  const hasRelationshipInfo = allUserTexts.some(containsRelationshipInfo);
  const hasClearGoal = containsClearGoal(currentMessage);

  let triggerReason: DialogueConversationState["triggerReason"] = null;
  if (!isFortuneRequest(currentMessage)) {
    if (hasClearGoal) triggerReason = "clear-goal";
    else if (hasRelationshipInfo) triggerReason = "relationship-info";
    else if (affirmativeStreak >= 2) triggerReason = "affirmative-streak";
    else if (questionStreak >= 2) triggerReason = "question-streak";
  }

  return {
    questionStreak,
    affirmativeStreak,
    hasRelationshipInfo,
    hasClearGoal,
    shouldOfferFortune: triggerReason !== null,
    triggerReason,
  };
}

export function buildFortuneOfferReply(
  history: ChatHistoryItem[],
  currentMessage: string
): string {
  const facts = collectRecentUserFacts(history, currentMessage);
  const summary = buildSummarySentence(facts);
  const offer = pickOfferVariant(`${history.length}:${currentMessage}`);
  return clampTextLength(`${summary}${offer}`, 120);
}
