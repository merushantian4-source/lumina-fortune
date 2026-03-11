import {
  classifyIntent,
  intentToTopic,
  type ConsultationTopic,
  type IntentType,
} from "./intent-classifier";
import { getDialogueConversationState, type ChatHistoryItem } from "./dialogue-transition";

export type ConversationGuardState = {
  questionStreak: number;
  lastTopic: ConsultationTopic | null;
  offtopicStreak: number;
  awaitingFortuneResult: boolean;
};

export type GuardedChatDecision =
  | {
      kind: "pass";
      intent: IntentType;
      conversationState: ConversationGuardState;
    }
  | {
      kind: "reply";
      intent: IntentType;
      text: string;
      conversationState: ConversationGuardState;
    }
  | {
      kind: "proceed_to_fortune";
      intent: IntentType;
      conversationState: ConversationGuardState;
    };

function isLikelyShortOfftopicFollowup(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (trimmed.length > 8) return false;
  if (/[?？!！]/.test(trimmed)) return false;
  if (containsExplicitTopicWord(trimmed)) return false;
  if (/(相談|占い|みて|見て|知りたい|どう|お願い|お願いします|はい|おねがい)/.test(trimmed)) {
    return false;
  }
  return true;
}

function containsExplicitTopicWord(input: string): boolean {
  return /(恋愛|結婚|仕事|金運|お金)/.test(input);
}

function summarizeTopic(input: string, topic: ConsultationTopic): string {
  if (topic === "marriage") {
    return "結婚のことですね。";
  }
  if (topic === "love") {
    return "恋のことですね。";
  }
  if (topic === "work") {
    return /学業|就活|転職活動|学歴/.test(input)
      ? "学びのことですね。"
      : "お仕事のことですね。";
  }
  return "お金のことですね。";
}

const NO_PARTNER_LOVE_RE =
  /(出会いがない|恋人がいない|まだ恋人がいない|彼氏がいない|彼女がいない|好きな人がいない|出会いたい(けど|けれど|がない|がほしい))/;

function buildOfferLine(topic: ConsultationTopic, input: string): string {
  if (topic === "love") {
    if (NO_PARTNER_LOVE_RE.test(input)) return "出会い運や恋愛運を見てみましょうか？";
    return "お相手の気持ちや恋愛運を見てみましょうか？";
  }
  if (topic === "marriage") return "結婚運を見てみましょうか？";
  if (topic === "work") return "仕事運を見てみましょうか？";
  return "金運を見てみましょうか？";
}

function buildTopicGuardReply(input: string, topic: ConsultationTopic): string {
  if (topic === "marriage") {
    return "結婚についてのお悩みなんですね。結婚運を見てみましょうか？";
  }
  if (topic === "love") {
    return "恋愛について気になっているんですね。お相手の気持ちや恋愛運を見てみましょうか？";
  }
  if (topic === "work") {
    return "仕事についてお悩みなんですね。仕事運を見てみましょうか？";
  }
  const summary = summarizeTopic(input, topic);
  const offer = buildOfferLine(topic, input);
  const text = `${summary}${offer}`;
  return text.length <= 120 ? text : `${summary}占いで見てみましょうか？`;
}

void buildTopicGuardReply;

function buildOfftopicReply(lastTopic: ConsultationTopic | null): string {
  if (lastTopic === "love") {
    return "なるほど。恋愛についてですね。お相手の気持ちや恋愛運を見てみましょうか？";
  }
  if (lastTopic === "marriage") {
    return "なるほど。結婚についてですね。結婚運を見てみましょうか？";
  }
  if (lastTopic === "work") {
    return "なるほど。仕事についてですね。仕事運を見てみましょうか？";
  }
  if (lastTopic === "money") {
    return "なるほど。お金についてですね。金運を見てみましょうか？";
  }
  return "気になっていることがあるのですね。恋愛・仕事など、占いたいテーマを教えてください。";
}

function buildOfftopicReplyByStreak(
  lastTopic: ConsultationTopic | null,
  offtopicStreak: number
): string {
  if (offtopicStreak <= 0) return buildOfftopicReply(lastTopic);
  if (lastTopic === "love") {
    return "恋のことですね。占いたい内容を一言で教えてください。";
  }
  if (lastTopic === "marriage") {
    return "結婚のことですね。占いたい内容を一言で教えてください。";
  }
  if (lastTopic === "work") {
    return "お仕事のことですね。占いたい内容を一言で教えてください。";
  }
  if (lastTopic === "money") {
    return "お金のことですね。占いたい内容を一言で教えてください。";
  }
  return "占いたい内容を一言で教えてください。";
}

function buildUnknownProblemReply(): string {
  return "そうなんですね。どんなことでお悩みですか？";
}

function deriveLastTopicFromHistory(history: ChatHistoryItem[]): ConsultationTopic | null {
  let lastTopic: ConsultationTopic | null = null;
  for (const item of history) {
    if (item.role !== "user") continue;
    const intent = classifyIntent(item.content, { lastTopic });
    const topic = intentToTopic(intent);
    if (topic) lastTopic = topic;
  }
  return lastTopic;
}

function deriveOfftopicStreakFromHistory(history: ChatHistoryItem[]): number {
  let streak = 0;
  const recent = [...history].slice(-8);
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    const item = recent[i];
    if (item.role !== "assistant") continue;
    const text = item.content.trim();
    if (/占いたい内容を一言で教えてください|見てみましょうか|テーマを教えてください|どれですか/.test(text)) {
      streak += 1;
      continue;
    }
    break;
  }
  return streak;
}

function nextQuestionStreak(currentStreak: number, assistantReply: string): number {
  return /[?？]\s*$/.test(assistantReply.trim()) ? Math.min(currentStreak + 1, 2) : 0;
}

export function getGuardedChatDecision(
  history: ChatHistoryItem[],
  currentMessage: string
): GuardedChatDecision {
  const baseDialogue = getDialogueConversationState(history, currentMessage);
  const lastTopicFromHistory = deriveLastTopicFromHistory(history);
  const offtopicStreakFromHistory = deriveOfftopicStreakFromHistory(history);
  const intent = classifyIntent(currentMessage, { lastTopic: lastTopicFromHistory });
  const currentTopic = intentToTopic(intent) ?? lastTopicFromHistory;
  const baseState: ConversationGuardState = {
    questionStreak: Math.min(baseDialogue.questionStreak, 2),
    lastTopic: currentTopic,
    offtopicStreak: offtopicStreakFromHistory,
    awaitingFortuneResult: false,
  };

  if (intent === "fortune_request") {
    return {
      kind: "proceed_to_fortune",
      intent,
      conversationState: {
        questionStreak: 0,
        lastTopic: currentTopic,
        offtopicStreak: 0,
        awaitingFortuneResult: false,
      },
    };
  }

  if (
    lastTopicFromHistory &&
    isLikelyShortOfftopicFollowup(currentMessage) &&
    !containsExplicitTopicWord(currentMessage)
  ) {
    const text = buildOfftopicReplyByStreak(lastTopicFromHistory, offtopicStreakFromHistory);
    return {
      kind: "reply",
      intent: "nonsense_or_offtopic",
      text,
      conversationState: {
        questionStreak: nextQuestionStreak(baseState.questionStreak, text),
        lastTopic: lastTopicFromHistory,
        offtopicStreak: Math.min(offtopicStreakFromHistory + 1, 3),
        awaitingFortuneResult: false,
      },
    };
  }

  if (intent === "love" || intent === "marriage" || intent === "work" || intent === "money") {
    const text = buildTopicGuardReply(currentMessage, intent);
    return {
      kind: "reply",
      intent,
      text,
      conversationState: {
        questionStreak: nextQuestionStreak(baseState.questionStreak, text),
        lastTopic: intent,
        offtopicStreak: 0,
        awaitingFortuneResult: false,
      },
    };
  }

  if (intent === "unknown_problem") {
    if (baseState.questionStreak >= 1) {
      const text = "お話ありがとうございます。恋愛・仕事・人間関係など、気になるテーマを一言で教えてください。";
      return {
        kind: "reply",
        intent,
        text,
        conversationState: {
          questionStreak: nextQuestionStreak(baseState.questionStreak, text),
          lastTopic: lastTopicFromHistory,
          offtopicStreak: 0,
          awaitingFortuneResult: false,
        },
      };
    }

    const text = buildUnknownProblemReply();
    return {
      kind: "reply",
      intent,
      text,
      conversationState: {
        questionStreak: nextQuestionStreak(baseState.questionStreak, text),
        lastTopic: lastTopicFromHistory,
        offtopicStreak: 0,
        awaitingFortuneResult: false,
      },
    };
  }

  if (intent === "nonsense_or_offtopic") {
    const text = buildOfftopicReplyByStreak(lastTopicFromHistory, offtopicStreakFromHistory);
    return {
      kind: "reply",
      intent,
      text,
      conversationState: {
        questionStreak: nextQuestionStreak(baseState.questionStreak, text),
        lastTopic: lastTopicFromHistory,
        offtopicStreak: Math.min(offtopicStreakFromHistory + 1, 3),
        awaitingFortuneResult: false,
      },
    };
  }

  return {
    kind: "pass",
    intent,
    conversationState: {
      ...baseState,
      offtopicStreak: 0,
      awaitingFortuneResult: false,
    },
  };
}
