import { NextResponse } from "next/server";
import OpenAI from "openai";
import { pickRandomCards } from "@/lib/fortune-data";
import {
  buildBirthdate2026Prompt,
  buildChatPrompt,
  buildDialoguePrompt,
  buildDailyFortunePrompt,
  buildTarotPrompt,
} from "@/lib/prompt-builder";
import { ensureFortuneOutputFormat } from "@/lib/fortune-output";
import { greetingMessage, greetingResponse } from "@/lib/greeting-message";
import {
  buildFortuneOfferReply,
  getDialogueConversationState,
  type ChatHistoryItem,
} from "@/lib/dialogue-transition";
import { getGuardedChatDecision } from "@/lib/chat-flow-guard";
import { classifyIntent, isAcknowledgementInput } from "@/lib/intent-classifier";
import {
  isDialogueModeInput,
  isFortuneRequestInput,
  isGreetingOnlyInput,
} from "@/lib/input-guards";
import { sanitizeChatReply, sanitizeDialogueReply } from "@/lib/pre-fortune-reply";
import { replyStyle } from "@/lib/reply-style";

type RequestBody = {
  message?: string;
  cards?: { name: string; reversed?: boolean }[];
  mode?: string;
  history?: ChatHistoryItem[];
};

// OpenAI初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LUMINA_SYSTEM_PROMPT = `あなたは白の魔女ルミナです。占い師として丁寧で落ち着いた口調を保ってください。
相談者の恋愛や人間関係の当事者は相談者本人であり、あなたは第三者・伴走者として助言と質問に徹してください。
「私も〜したい」「一緒に〜しよう」「私も興味がある」のように、あなた自身が当事者化する表現は禁止です。`;

const FORTUNE_DECLARATION_RE = /少しカードを引いてみますね。少しだけお待ちください。/;

function isAwaitingFortuneResultFromHistory(history: ChatHistoryItem[]): boolean {
  const lastAssistant = [...history].reverse().find((h) => h.role === "assistant");
  if (!lastAssistant) return false;
  if (!FORTUNE_DECLARATION_RE.test(lastAssistant.content)) return false;

  const lastAssistantIndex = history.lastIndexOf(lastAssistant);
  const hasAssistantAfter = history.slice(lastAssistantIndex + 1).some((h) => h.role === "assistant");
  return !hasAssistantAfter;
}

function buildImmediateFortuneLeadIn(message: string): string | null {
  if (/(相手|お相手).*(気持ち)/.test(message) || /(気持ち).*(占って|見て|みて)/.test(message)) {
    return "そうなんですね。お相手様の気持ちを見てみましょう。";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { message, cards: existingCards, mode = "chat" } = body;
    const history = Array.isArray(body.history) ? body.history : [];
    const trimmedMessage = message?.trim() || "こんにちは";
    const awaitingFortuneResult = isAwaitingFortuneResultFromHistory(history);
    const awaitingFollowupIntent = awaitingFortuneResult
      ? classifyIntent(trimmedMessage)
      : null;
    const shouldAddAwaitingBridge =
      awaitingFortuneResult && !isAcknowledgementInput(trimmedMessage);
    let resolvedMode =
      mode === "chat" && isFortuneRequestInput(trimmedMessage) ? "fortune" : mode;
    const guardedDecision =
      resolvedMode === "chat" ? getGuardedChatDecision(history, trimmedMessage) : null;

    if (guardedDecision?.kind === "proceed_to_fortune") {
      resolvedMode = "fortune";
    }
    if (awaitingFortuneResult) {
      resolvedMode = "fortune";
    }

    if (resolvedMode === "chat" && trimmedMessage === "__welcome__") {
      return NextResponse.json({
        text: greetingMessage,
        cards: null,
        conversationState: {
          questionStreak: 0,
          lastTopic: null,
          offtopicStreak: 0,
          awaitingFortuneResult: false,
        },
      });
    }
    if (resolvedMode === "chat" && isGreetingOnlyInput(trimmedMessage)) {
      return NextResponse.json({
        text: greetingResponse,
        cards: null,
        conversationState: {
          questionStreak: 0,
          lastTopic: guardedDecision?.conversationState.lastTopic ?? null,
          offtopicStreak: 0,
          awaitingFortuneResult: false,
        },
      });
    }
    if (resolvedMode === "chat" && guardedDecision?.kind === "reply") {
      return NextResponse.json({
        text: guardedDecision.text,
        cards: null,
        conversationState: guardedDecision.conversationState,
      });
    }
    if (resolvedMode === "chat") {
      const conversationState = getDialogueConversationState(history, trimmedMessage);
      if (conversationState.shouldOfferFortune) {
        return NextResponse.json({
          text: buildFortuneOfferReply(history, trimmedMessage),
          cards: null,
          conversationState: {
            questionStreak: Math.min(conversationState.questionStreak + 1, 2),
            lastTopic: guardedDecision?.conversationState.lastTopic ?? null,
            offtopicStreak: 0,
            awaitingFortuneResult: false,
          },
        });
      }
    }

    let prompt = "";
    let cards = existingCards;
    let usedDialogueMode = false;

    if (resolvedMode === "chat") {
      if (
        isDialogueModeInput(
          trimmedMessage,
          replyStyle.dialogue.maxInputCharsForAutoDialogue
        )
      ) {
        prompt = buildDialoguePrompt(trimmedMessage);
        usedDialogueMode = true;
      } else {
        prompt = buildChatPrompt(trimmedMessage);
      }
    } else if (resolvedMode === "birthdate-2026") {
      prompt = buildBirthdate2026Prompt(trimmedMessage);
    } else {
      // タロット占いモード
      const isWorkFortuneRequest = /仕事運|学業運|仕事/.test(trimmedMessage);
      const fallbackCount =
        resolvedMode === "daily-fortune" || (resolvedMode === "fortune" && isWorkFortuneRequest)
          ? 1
          : 3;
      if (!cards || cards.length !== fallbackCount) {
        cards = pickRandomCards(fallbackCount);
      }

      if (resolvedMode === "daily-fortune") {
        prompt = buildDailyFortunePrompt(trimmedMessage, cards);
      } else {
        prompt = buildTarotPrompt(trimmedMessage, cards);
      }
    }

    // OpenAI呼び出し
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: LUMINA_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

    const rawText = completion.choices[0].message?.content || "";
      const formattedText =
        resolvedMode === "chat"
          ? usedDialogueMode
            ? sanitizeDialogueReply(trimmedMessage, rawText)
            : sanitizeChatReply(trimmedMessage, rawText)
        : resolvedMode === "fortune" || resolvedMode === "daily-fortune"
          ? ensureFortuneOutputFormat(rawText, cards ?? [])
          : rawText;
    const immediateFortuneLeadIn =
      resolvedMode === "fortune" && mode === "chat" && !awaitingFortuneResult
        ? buildImmediateFortuneLeadIn(trimmedMessage)
        : null;
    const text =
      resolvedMode === "fortune" && awaitingFortuneResult && shouldAddAwaitingBridge
        ? `ありがとうございます。では、カードから見えたことをお伝えしますね。\n${formattedText}`
        : immediateFortuneLeadIn
          ? `${immediateFortuneLeadIn}\n${formattedText}`
          : formattedText;

    return NextResponse.json({
      text,
      cards: resolvedMode === "fortune" || resolvedMode === "daily-fortune" ? cards : null,
      conversationState:
        awaitingFortuneResult
          ? {
              questionStreak: 0,
              lastTopic: guardedDecision?.conversationState.lastTopic ?? null,
              offtopicStreak: 0,
              awaitingFortuneResult: false,
            }
          : resolvedMode === "chat"
          ? {
              questionStreak: usedDialogueMode
                ? Math.min((guardedDecision?.conversationState.questionStreak ?? 0) + 1, 2)
                : 0,
              lastTopic: guardedDecision?.conversationState.lastTopic ?? null,
              offtopicStreak: guardedDecision?.conversationState.offtopicStreak ?? 0,
              awaitingFortuneResult: false,
            }
          : resolvedMode === "fortune"
            ? {
                questionStreak: 0,
                lastTopic: guardedDecision?.conversationState.lastTopic ?? null,
                offtopicStreak: 0,
                awaitingFortuneResult: false,
              }
            : undefined,
      meta:
        awaitingFortuneResult && awaitingFollowupIntent
          ? { awaitingFollowupIntent }
          : undefined,
    });
  } catch (error: unknown) {
    console.error("OpenAIエラー:", error);
    return NextResponse.json(
      { error: "ルミナさんとの通信に失敗しました。" },
      { status: 500 }
    );
  }
}
