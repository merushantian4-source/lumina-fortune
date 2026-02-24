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

function summarizeTopic(input: string, topic: ConsultationTopic): string {
  if (topic === "marriage") {
    return "結婚についてのお悩みなんですね。";
  }
  if (topic === "love") {
    return "恋愛について気になっているんですね。";
  }
  if (topic === "work") {
    return /学業|勉強|受験|進路|学校/.test(input)
      ? "学業について気になっているんですね。"
      : "仕事についてお悩みなんですね。";
  }
  return "お金のことが気になっているんですね。";
}

function buildOfferLine(topic: ConsultationTopic): string {
  if (topic === "love") return "お相手の気持ちや恋愛運を見てみましょうか？";
  if (topic === "marriage") return "結婚運を見てみましょうか？";
  if (topic === "work") return "仕事運を見てみましょうか？";
  return "金運を見てみましょうか？";
}

function buildTopicGuardReply(input: string, topic: ConsultationTopic): string {
  const summary = summarizeTopic(input, topic);
  const offer = buildOfferLine(topic);
  const text = `${summary}${offer}`;
  return text.length <= 120 ? text : `${summary}占いで見てみましょうか？`;
}

function buildOfftopicReply(lastTopic: ConsultationTopic | null): string {
  if (lastTopic === "love") {
    return "なるほど。恋愛のことが気になっているんですね。お相手の気持ちや恋愛運を見てみましょうか？";
  }
  if (lastTopic === "marriage") {
    return "なるほど。結婚のことが気になっているんですね。結婚運を見てみましょうか？";
  }
  if (lastTopic === "work") {
    return "なるほど。仕事のことに戻りましょう。仕事運を見てみましょうか？";
  }
  if (lastTopic === "money") {
    return "なるほど。お金の相談に戻りましょう。金運を見てみましょうか？";
  }
  return "なるほど。相談に戻りましょう。恋愛・仕事など、占いたいテーマはどれですか？";
}

function buildOfftopicReplyByStreak(
  lastTopic: ConsultationTopic | null,
  offtopicStreak: number
): string {
  if (offtopicStreak <= 0) return buildOfftopicReply(lastTopic);
  if (lastTopic === "love") {
    return "恋愛の相談に戻れます。占いたい内容を一言で教えてください（例: 相手の気持ち、進展）。";
  }
  if (lastTopic === "marriage") {
    return "結婚の相談に戻れます。占いたい内容を一言で教えてください（例: 結婚、相性）。";
  }
  if (lastTopic === "work") {
    return "仕事の相談に戻れます。占いたい内容を一言で教えてください（例: 仕事、人間関係）。";
  }
  if (lastTopic === "money") {
    return "金運の相談に戻れます。占いたい内容を一言で教えてください（例: 金運、収入）。";
  }
  return "占いたい内容を一言で教えてください（例: 恋愛、仕事、人間関係）。";
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
  for (let i = recent.length - 1; i >= 0; i--) {
    const item = recent[i];
    if (item.role !== "assistant") continue;
    const text = item.content.trim();
    if (
      /相談に戻りましょう|占いたいテーマはどれですか|占いたい内容を一言で教えてください/.test(
        text
      )
    ) {
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
    intent === "love" ||
    intent === "marriage" ||
    intent === "work" ||
    intent === "money"
  ) {
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
      const text = "お話ありがとうございます。恋愛・仕事・人間関係など、どのテーマでしょうか？";
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
