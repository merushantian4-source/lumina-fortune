"use client";

import { motion } from "framer-motion";

import type { ChatMessagePart } from "@/lib/chat-message-parts";
import { findTarotCardByJaName } from "@/src/data/tarotCards";

import { CARD_BACK_IMAGE_PATH } from "./tarot-card-artwork";
import type { TarotCardData } from "./tarot-card";
import { WhiteBirdAnimation } from "./white-bird-animation";
import { LightTarotDisplay } from "./light-tarot-display";

interface AssistantMessagePartProps {
  part: ChatMessagePart;
  cards?: TarotCardData[];
}

function resolvePartCard(part: Extract<ChatMessagePart, { type: "card" }>, cards?: TarotCardData[]) {
  return cards?.find(
    (card) =>
      card.name === part.cardName &&
      (card.reversed ? "reversed" : "upright") === part.orientation
  );
}

function TarotReadingCard({ card }: { card: TarotCardData }) {
  const imageMeta = findTarotCardByJaName(card.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.46, ease: "easeOut" }}
      className="mx-auto w-full max-w-[300px] rounded-[1.8rem] border border-[#e9dcc7]/82 bg-[linear-gradient(180deg,rgba(255,252,247,0.99),rgba(246,238,226,0.96))] p-3 shadow-[0_18px_36px_-30px_rgba(56,42,26,0.26)]"
    >
      <div className="overflow-hidden rounded-[1.3rem] border border-[#ece0cf]/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(251,245,236,0.9))] p-2.5">
        <LightTarotDisplay
          imagePath={imageMeta?.imagePath ?? CARD_BACK_IMAGE_PATH}
          alt={imageMeta?.nameJa ?? card.name}
          isReversed={card.reversed}
          className="mx-auto w-full max-w-[280px] rounded-[1rem]"
          artworkClassName="block h-auto w-full max-w-[280px] rounded-[1rem] object-contain"
          sizes="(max-width: 640px) 68vw, 300px"
        />
      </div>
      <div className="pt-3 text-center text-[#4e4338]">
        <p className="text-[11px] tracking-[0.24em] text-[#9f917c]">DRAWN CARD</p>
        <p className="mt-2 text-base">{card.name}</p>
        <p className="mt-1 text-xs text-[#8a7b66]">{card.reversed ? "逆位置" : "正位置"}</p>
      </div>
    </motion.div>
  );
}

export function AssistantMessagePart({ part, cards }: AssistantMessagePartProps) {
  switch (part.type) {
    case "intro":
      return <p className="whitespace-pre-wrap text-sm leading-relaxed">{part.text}</p>;
    case "animation":
      return <WhiteBirdAnimation />;
    case "card": {
      const card = resolvePartCard(part, cards);
      return card ? <TarotReadingCard card={card} /> : null;
    }
    case "reading-short":
      return <p className="whitespace-pre-wrap text-sm leading-relaxed">{part.text}</p>;
    case "reading-detail":
      return <p className="whitespace-pre-wrap text-sm leading-[1.95]">{part.text}</p>;
    default:
      return null;
  }
}
