"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { FavoriteGuidanceItem } from "@/lib/chat-favorite-guidance";
import type { ChatMessagePart } from "@/lib/chat-message-parts";

import type { TarotCardData } from "./tarot-card";
import { AssistantMessagePart } from "./chat-message-parts";

export interface Message {
  id: string;
  sender: "lumina" | "user";
  text: string;
  time: string;
  isTyping?: boolean;
  cards?: TarotCardData[];
  messageParts?: ChatMessagePart[];
  visiblePartCount?: number;
  showCardButton?: boolean;
  favoriteGuidance?: FavoriteGuidanceItem;
  isFavoriteSaved?: boolean;
  historyHref?: string;
  gateLinks?: Array<{
    label: string;
    href: string;
    description: string;
  }>;
}

interface ChatMessagesProps {
  messages: Message[];
  onDrawCards: (cards: TarotCardData[]) => void;
  onSaveFavorite: (item: FavoriteGuidanceItem) => void;
}

const assistantBubbleClassName =
  "border border-[#e1d5bf]/74 bg-[linear-gradient(160deg,rgba(255,252,246,0.88),rgba(248,242,231,0.82))] text-[#2e2a26] shadow-[0_10px_18px_-16px_rgba(82,69,53,0.24)] backdrop-blur-sm";
const assistantTextBubbleClassName = `${assistantBubbleClassName} max-w-[88%] rounded-[1.6rem] px-4 py-3`;

interface GuidanceActionsProps {
  favoriteGuidance?: FavoriteGuidanceItem;
  isFavoriteSaved?: boolean;
  historyHref?: string;
  onSaveFavorite: (item: FavoriteGuidanceItem) => void;
}

function buildFallbackMessageParts(text: string, cards?: TarotCardData[]): ChatMessagePart[] {
  const sentences = (text ?? "")
    .split(/(?<=[。！？])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const firstCard = cards?.[0];

  const intro =
    sentences[0] ?? "それでは、カードを通して、今の流れをそっと見ていきましょう。";
  const readingShort = sentences[1] ?? sentences[0] ?? "";
  const readingDetail =
    sentences.length >= 3
      ? sentences.slice(2).join("")
      : text || "この導きから見える気配を、落ち着いて受け取ってみてください。";

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

function GuidanceActions({
  favoriteGuidance,
  isFavoriteSaved = false,
  historyHref,
  onSaveFavorite,
}: GuidanceActionsProps) {
  if (!favoriteGuidance && !historyHref) {
    return null;
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-2xl">
      <div className="mt-6 rounded-xl border border-[#d7cdea] bg-[#f4eefc] p-6">
        <p className="text-[11px] tracking-[0.16em] text-[#8b7e9e]">PRIVATE GUIDANCE</p>
        <p className="mt-2 text-base font-medium text-[#4f465d]">もっと深く知りたい方はこちら</p>
        <p className="mt-2 text-sm leading-relaxed text-[#6f667c]">
          今の流れを、あなたに合わせて丁寧に読み解きます。
        </p>
        <div className="mt-4">
          <Link
            href="/consultation"
            className="inline-flex items-center rounded-full border border-[#cfc2e2] bg-[linear-gradient(160deg,#ffffff,#f1e8fb)] px-4 py-2 text-sm font-medium text-[#5f5472] transition hover:border-[#bdaed7] hover:bg-[#f8f2ff] hover:text-[#4f4660]"
          >
            個人鑑定を依頼する
          </Link>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-[#ddd2be] bg-white/70 px-4 py-3">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="shrink-0">
            {favoriteGuidance ? (
              <button
                type="button"
                className="rounded-lg border border-[#d7c6a4]/78 bg-[#fff8eb] px-3 py-2 text-sm font-medium text-[#6d5f4d] transition hover:bg-[#fff3dc] disabled:cursor-default disabled:opacity-65"
                onClick={() => onSaveFavorite(favoriteGuidance)}
                disabled={isFavoriteSaved}
              >
                {isFavoriteSaved ? "保存済みの導き" : "この導きを保存"}
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-4 text-sm sm:justify-end">
            <Link
              href="/saved-guidance"
              className="text-[#7a6b58] underline underline-offset-4 hover:text-[#564c42]"
            >
              保存した導きを見る
            </Link>
            {historyHref ? (
              <Link
                href={historyHref}
                className="text-[#7a6b58] underline underline-offset-4 hover:text-[#564c42]"
              >
                読解の記録を見る
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatMessages({ messages, onDrawCards, onSaveFavorite }: ChatMessagesProps) {
  const [expandedMessageIds, setExpandedMessageIds] = useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) => {
    setExpandedMessageIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => {
            const text = msg.text ?? "";
            const isLongLumina = msg.sender === "lumina" && text.length > 420 && !msg.messageParts?.length;
            const isExpanded = !!expandedMessageIds[msg.id];
            const previewText = isLongLumina && !isExpanded ? `${text.slice(0, 260)}…` : text;
            const normalizedParts =
              msg.sender === "lumina" && msg.cards?.length && !msg.messageParts?.length && text
                ? buildFallbackMessageParts(text, msg.cards)
                : msg.messageParts;
            const visibleParts =
              normalizedParts?.slice(0, msg.visiblePartCount ?? normalizedParts.length) ?? [];
            const areAllPartsVisible =
              !normalizedParts?.length ||
              (msg.visiblePartCount ?? 0) >= normalizedParts.length;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "user" ? (
                  <div className="max-w-[88%] rounded-2xl border border-[#aaa0bc]/70 bg-[#958cad]/95 px-4 py-3 text-white shadow-[0_10px_18px_-16px_rgba(80,67,102,0.38)]">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                    <p className="mt-1 text-xs text-white/75">{msg.time}</p>
                  </div>
                ) : (
                  <div className="w-full max-w-[92%]">
                    {msg.isTyping ? (
                      <div className={`inline-flex rounded-[1.6rem] px-4 py-3 ${assistantBubbleClassName}`}>
                        <div className="flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#b7abce] [animation-delay:0ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#b7abce] [animation-delay:150ms]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-[#b7abce] [animation-delay:300ms]" />
                        </div>
                      </div>
                    ) : normalizedParts?.length ? (
                      <div className="mx-auto w-full max-w-2xl space-y-3">
                        {visibleParts.map((part, index) => {
                          const isTextPart =
                            part.type === "intro" ||
                            part.type === "reading-short" ||
                            part.type === "reading-detail";

                          return (
                            <motion.div
                              key={`${msg.id}-${part.type}-${index}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.28, ease: "easeOut" }}
                              className="flex justify-start"
                            >
                              <div
                                className={
                                  isTextPart
                                    ? assistantTextBubbleClassName
                                    : "mx-auto w-full max-w-[300px]"
                                }
                              >
                                <AssistantMessagePart part={part} cards={msg.cards} />
                              </div>
                            </motion.div>
                          );
                        })}

                        {msg.showCardButton && msg.cards ? (
                          <button
                            type="button"
                            className="rounded-lg border border-[#baa98d]/72 bg-[#fdf8ee] px-3 py-2 text-sm font-medium text-[#6f6556] transition hover:bg-[#f9f3e7]"
                            onClick={() => onDrawCards(msg.cards)}
                          >
                            カードを見る
                          </button>
                        ) : null}

                        {areAllPartsVisible ? (
                          <GuidanceActions
                            favoriteGuidance={msg.favoriteGuidance}
                            isFavoriteSaved={msg.isFavoriteSaved}
                            historyHref={msg.historyHref}
                            onSaveFavorite={onSaveFavorite}
                          />
                        ) : null}

                        {areAllPartsVisible && msg.gateLinks?.length ? (
                          <div className="space-y-2 rounded-xl border border-[#e7dcc8]/90 bg-white/60 p-3">
                            {msg.gateLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="block rounded-xl border border-[#dcccb3]/80 bg-[#fff8eb] px-3 py-3 transition hover:bg-[#fff2dc]"
                              >
                                <p className="text-sm font-medium text-[#5f5346]">{link.label}</p>
                                <p className="mt-1 text-xs leading-relaxed text-[#7b6e61]">{link.description}</p>
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className={assistantTextBubbleClassName}>
                        {isLongLumina ? (
                          <div className="rounded-xl border border-[#e6dac5]/80 bg-white/55 p-3">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{previewText}</p>
                            <button
                              type="button"
                              onClick={() => toggleExpanded(msg.id)}
                              className="mt-2 text-xs font-medium text-[#6f6556] underline underline-offset-4 hover:text-[#544c42]"
                            >
                              {isExpanded ? "閉じる" : "続きを読む"}
                            </button>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                        )}

                        {msg.showCardButton && msg.cards ? (
                          <button
                            type="button"
                            className="mt-3 rounded-lg border border-[#baa98d]/72 bg-[#fdf8ee] px-3 py-2 text-sm font-medium text-[#6f6556] transition hover:bg-[#f9f3e7]"
                            onClick={() => onDrawCards(msg.cards)}
                          >
                            カードを見る
                          </button>
                        ) : null}

                        <div className="mx-auto mt-3 w-full max-w-2xl">
                          <GuidanceActions
                            favoriteGuidance={msg.favoriteGuidance}
                            isFavoriteSaved={msg.isFavoriteSaved}
                            historyHref={msg.historyHref}
                            onSaveFavorite={onSaveFavorite}
                          />
                        </div>

                        {msg.gateLinks?.length ? (
                          <div className="mt-4 space-y-2 rounded-xl border border-[#e7dcc8]/90 bg-white/60 p-3">
                            {msg.gateLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="block rounded-xl border border-[#dcccb3]/80 bg-[#fff8eb] px-3 py-3 transition hover:bg-[#fff2dc]"
                              >
                                <p className="text-sm font-medium text-[#5f5346]">{link.label}</p>
                                <p className="mt-1 text-xs leading-relaxed text-[#7b6e61]">{link.description}</p>
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}

                    <p className="mt-1 text-xs text-[#7d6d5a]/85">{msg.time}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
