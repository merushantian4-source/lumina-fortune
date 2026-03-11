"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

import { FloatingFeathers } from "@/components/floating-feathers";
import { WelcomeScreen } from "@/components/welcome-screen";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages, type Message } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import {
  readFavoriteGuidance,
  saveFavoriteGuidance,
  type FavoriteGuidanceItem,
} from "@/lib/chat-favorite-guidance";
import { appendChatReadingHistory, getJstDateKey } from "@/lib/chat-reading-history-store";
import { collectTextFromMessageParts, type ChatMessagePart } from "@/lib/chat-message-parts";
import { getOrCreateChatVisitorKey, loadMembershipTier } from "@/lib/membership";
import { runClientModerationCheck } from "@/lib/moderation/clientCheck";
import { loadStoredProfile } from "@/lib/profile/profile-store";
import type { TarotCardData } from "@/components/tarot-card";

type HomeClientProps = {
  initialDailyWhisper: string;
  serverBirthdate: string | null;
};

type ChatConversationState = {
  phase?: "idle" | "intent_confirm" | "reading" | "followup";
  topic?: string | null;
  awaitingConsent?: boolean;
  awaitingTheme?: boolean;
  questionStreak?: number;
  lastTopic?: string | null;
  offtopicStreak?: number;
  awaitingFortuneResult?: boolean;
};

const FALLBACK_WELCOME = "Failed to load the welcome message. Please try again in a moment.";
const FALLBACK_CHAT = "Something went wrong while getting a response. Please try again.";

const FORTUNE_PART_DELAYS: Record<ChatMessagePart["type"], number> = {
  intro: 0,
  animation: 560,
  card: 1520,
  "reading-short": 760,
  "reading-detail": 980,
};

function getCurrentTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function formatCardOrientation(card: TarotCardData) {
  return card.reversed ? "逆位置" : "正位置";
}

function formatCardLabel(card: TarotCardData) {
  return `${card.name} (${formatCardOrientation(card)})`;
}

function createFortuneMessage(
  messageId: string,
  userQuestion: string,
  cards: TarotCardData[],
  parts: ChatMessagePart[],
  favoriteIds: string[]
): Message {
  const firstCard = cards[0];
  const readingText = collectTextFromMessageParts(
    parts.filter((part) => part.type === "reading-short" || part.type === "reading-detail")
  );

  return {
    id: messageId,
    sender: "lumina",
    text: collectTextFromMessageParts(parts),
    time: getCurrentTime(),
    cards,
    messageParts: parts,
    visiblePartCount: parts.length > 0 ? 1 : 0,
    favoriteGuidance: firstCard
      ? {
          id: messageId,
          savedAt: new Date().toISOString(),
          userQuestion,
          cardName: formatCardLabel(firstCard),
          readingText,
        }
      : undefined,
    isFavoriteSaved: favoriteIds.includes(messageId),
    historyHref: "/reading-history",
  };
}

function splitFortuneText(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const sentences = normalized
    .split(/(?<=[。！？])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const intro = sentences[0] ?? "その流れですね。では、カードから見ていきますね。";
  const readingShort = sentences[1] ?? sentences[0] ?? "";
  const readingDetail =
    sentences.length >= 3
      ? sentences.slice(2).join("")
      : normalized || "この一枚から見える流れを、静かに受け取ってみてください。";

  return { intro, readingShort, readingDetail };
}

function buildClientFallbackMessageParts(text: string, cards?: TarotCardData[] | null): ChatMessagePart[] {
  const { intro, readingShort, readingDetail } = splitFortuneText(text);
  const firstCard = cards?.[0];

  return [
    { type: "intro", text: intro },
    { type: "animation", animation: "white-bird-delivers-card" },
    ...(firstCard
      ? [
          {
            type: "card" as const,
            cardName: firstCard.name,
            orientation: firstCard.reversed ? ("reversed" as const) : ("upright" as const),
          },
        ]
      : []),
    { type: "reading-short", text: readingShort },
    { type: "reading-detail", text: readingDetail },
  ];
}

export function HomeClient({ initialDailyWhisper, serverBirthdate }: HomeClientProps) {
  const searchParams = useSearchParams();
  const initialAutoStartRef = useRef(false);
  const fortuneStageTimeoutsRef = useRef<number[]>([]);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [conversationState, setConversationState] = useState<ChatConversationState | null>(null);
  const [isLuminaDevMode, setIsLuminaDevMode] = useState(false);

  const clearFortuneStageTimeouts = useCallback(() => {
    fortuneStageTimeoutsRef.current.forEach((timer) => window.clearTimeout(timer));
    fortuneStageTimeoutsRef.current = [];
  }, []);

  const revealFortuneMessageParts = useCallback(
    (messageId: string, parts: ChatMessagePart[]) => {
      clearFortuneStageTimeouts();

      let elapsed = 0;
      parts.slice(1).forEach((part, index) => {
        elapsed += FORTUNE_PART_DELAYS[part.type];
        const visiblePartCount = index + 2;
        const timer = window.setTimeout(() => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === messageId ? { ...message, visiblePartCount } : message
            )
          );
          if (visiblePartCount >= parts.length) {
            setIsTyping(false);
          }
        }, elapsed);
        fortuneStageTimeoutsRef.current.push(timer);
      });

      if (parts.length <= 1) {
        setIsTyping(false);
      }
    },
    [clearFortuneStageTimeouts]
  );

  useEffect(() => {
    setFavoriteIds(readFavoriteGuidance().map((item) => item.id));
  }, []);

  useEffect(() => clearFortuneStageTimeouts, [clearFortuneStageTimeouts]);

  const handleStart = useCallback(async () => {
    setStarted(true);

    const typingId = `typing-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        sender: "lumina",
        text: "",
        time: getCurrentTime(),
        isTyping: true,
      },
    ]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "__welcome__",
          mode: "chat",
          history: [],
        }),
      });

      let data: {
        text?: string;
        error?: string;
        conversationState?: ChatConversationState;
        meta?: {
          devMode?: boolean;
        };
      } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) throw new Error(data.error ?? FALLBACK_WELCOME);
      setIsLuminaDevMode(Boolean(data.meta?.devMode));
      setConversationState(data.conversationState ?? null);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? {
                ...m,
                text: data.text ?? "",
                isTyping: false,
                cards: undefined,
                showCardButton: false,
              }
            : m
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : FALLBACK_WELCOME;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? {
                ...m,
                text: msg,
                isTyping: false,
                cards: undefined,
                showCardButton: false,
              }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      const chatUserKey = getOrCreateChatVisitorKey();
      const moderation = runClientModerationCheck(text, chatUserKey, { maxLength: 500 });
      if (!moderation.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `lumina-error-${Date.now()}`,
            sender: "lumina",
            text: moderation.error,
            time: getCurrentTime(),
          },
        ]);
        return;
      }

      clearFortuneStageTimeouts();

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: moderation.normalizedText,
        time: getCurrentTime(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const typingId = `typing-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: typingId,
          sender: "lumina",
          text: "",
          time: getCurrentTime(),
          isTyping: true,
        },
      ]);
      setIsTyping(true);

      const history = messages
        .filter((m) => !m.isTyping && m.text)
        .map((m) => ({
          role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text,
        }));
      const profile = loadStoredProfile();
      const membershipTier = loadMembershipTier();

      let hasStagedFortune = false;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: moderation.normalizedText,
            mode: "chat",
            history,
            conversationState,
            profile: {
              nickname: profile?.nickname,
              birthdate: profile?.birthdate,
              job: profile?.job,
              loveStatus: profile?.loveStatus,
              membershipTier,
              userKey: chatUserKey,
            },
          }),
        });

        let data: {
          text?: string;
          messageParts?: ChatMessagePart[];
          error?: string;
          cards?: TarotCardData[];
          conversationState?: ChatConversationState;
          gate?: {
            title: string;
            body: string;
            links: Array<{ label: string; href: string; description: string }>;
          };
          meta?: {
            devMode?: boolean;
          };
        } = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (!res.ok) throw new Error(data.error ?? FALLBACK_CHAT);
        setIsLuminaDevMode(Boolean(data.meta?.devMode));
        setConversationState(data.conversationState ?? null);

        if (data.gate) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === typingId
                ? {
                    ...m,
                    text: `${data.gate!.title}\n\n${data.gate!.body}`,
                    isTyping: false,
                    cards: undefined,
                    showCardButton: false,
                    gateLinks: data.gate!.links,
                    historyHref: "/reading-history",
                  }
                : m
            )
          );
        } else if (data.cards?.length && (data.messageParts?.length || data.text)) {
          const normalizedMessageParts =
            data.messageParts?.length
              ? data.messageParts
              : buildClientFallbackMessageParts(data.text || "", data.cards);

          if (data.meta?.devMode) {
            console.log("[lumina] ui route:", "new-route");
            console.log("[lumina] ui raw api payload:", {
              cards: data.cards,
              messageParts: normalizedMessageParts,
              text: data.text,
            });
          }
          if (!data.messageParts?.length) {
            if (data.meta?.devMode) {
              console.warn("[lumina] ui fallback route: synthesized-messageParts-from-text");
            }
          }
          hasStagedFortune = true;
          const messageId = `fortune-${Date.now()}`;
          const fortuneMessage = createFortuneMessage(
            messageId,
            moderation.normalizedText,
            data.cards,
            normalizedMessageParts,
            favoriteIds
          );

          const readingText = collectTextFromMessageParts(
            normalizedMessageParts.filter(
              (part) => part.type === "reading-short" || part.type === "reading-detail"
            )
          );
          const firstCard = data.cards[0];
          const readingShort =
            normalizedMessageParts.find((part) => part.type === "reading-short")?.text ?? "";
          const readingDetail =
            normalizedMessageParts.find((part) => part.type === "reading-detail")?.text ?? "";
          if (firstCard) {
            appendChatReadingHistory({
              id: messageId,
              dateKey: getJstDateKey(),
              createdAt: new Date().toISOString(),
              question: moderation.normalizedText,
              userQuestion: moderation.normalizedText,
              cardName: formatCardLabel(firstCard),
              orientation: firstCard.reversed ? "reversed" : "upright",
              readingShort,
              readingDetail,
              readingText,
            });
          }

          if (data.meta?.devMode) {
            console.log("[lumina] render state:", {
              intro: normalizedMessageParts.find((part) => part.type === "intro"),
              readingShort: normalizedMessageParts.find((part) => part.type === "reading-short"),
              readingDetail: normalizedMessageParts.find((part) => part.type === "reading-detail"),
              card: firstCard,
              cards: data.cards,
            });
          }

          setMessages((prev) =>
            prev.map((m) => (m.id === typingId ? { ...fortuneMessage } : m))
          );
          revealFortuneMessageParts(messageId, normalizedMessageParts);
        } else {
          if (data.meta?.devMode) {
            console.warn("[lumina] ui route:", "text-only-route", {
              text: data.text,
              messageParts: data.messageParts,
              cards: data.cards,
            });
          }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === typingId
                ? {
                    ...m,
                    text: data.text || "",
                    isTyping: false,
                    cards: data.cards ?? undefined,
                    showCardButton: !!data.cards?.length,
                    gateLinks: undefined,
                    historyHref: undefined,
                  }
                : m
            )
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : FALLBACK_CHAT;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === typingId
              ? {
                  ...m,
                  text: msg,
                  isTyping: false,
                  cards: undefined,
                  showCardButton: false,
                  gateLinks: undefined,
                  historyHref: undefined,
                }
              : m
          )
        );
      } finally {
        if (!hasStagedFortune) {
          setIsTyping(false);
        }
      }
    },
    [clearFortuneStageTimeouts, conversationState, favoriteIds, messages, revealFortuneMessageParts]
  );

  const handleDrawCards = useCallback(() => {}, []);

  const handleSaveFavorite = useCallback((item: FavoriteGuidanceItem) => {
    const next = saveFavoriteGuidance(item);
    setFavoriteIds(next.map((entry) => entry.id));
    setMessages((prev) =>
      prev.map((message) =>
        message.favoriteGuidance?.id === item.id ? { ...message, isFavoriteSaved: true } : message
      )
    );
  }, []);

  const handleBackToTop = useCallback(() => {
    clearFortuneStageTimeouts();
    setStarted(false);
    setMessages([]);
    setIsTyping(false);
    setConversationState(null);
  }, [clearFortuneStageTimeouts]);

  useEffect(() => {
    if (initialAutoStartRef.current) return;
    if (searchParams.get("start") === "tarot") {
      initialAutoStartRef.current = true;
      void handleStart();
    }
  }, [searchParams, handleStart]);

  useEffect(() => {
    document.body.dataset.homeScreen = started ? "tarot" : "welcome";

    return () => {
      delete document.body.dataset.homeScreen;
    };
  }, [started]);

  return (
    <main className="relative min-h-screen">
      <FloatingFeathers />

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div key="welcome" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
            <WelcomeScreen
              initialDailyWhisper={initialDailyWhisper}
              serverBirthdate={serverBirthdate}
              onStartTarot={handleStart}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex min-h-screen flex-col"
          >
            {isLuminaDevMode ? (
              <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full border border-[#d8c8a8]/80 bg-[#fff7e8]/90 px-3 py-1 text-[11px] tracking-[0.12em] text-[#8a775d]">
                開発モード
              </div>
            ) : null}
            <ChatHeader onBackToTop={handleBackToTop} />
            <ChatMessages messages={messages} onDrawCards={handleDrawCards} onSaveFavorite={handleSaveFavorite} />
            <ChatInput onSend={handleSend} disabled={isTyping} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
