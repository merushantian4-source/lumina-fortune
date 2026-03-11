"use client"

import { CARD_BACK_IMAGE_PATH } from "@/components/tarot-card-artwork"
import { LightTarotDisplay } from "@/components/light-tarot-display"
import { findTarotCardByJaName } from "@/src/data/tarotCards"

export interface TarotCardData {
  id: string
  name: string
  meaning: string
  reversed: boolean
}

interface TarotCardProps {
  card: TarotCardData
  onClick?: () => void
  className?: string
}

export function TarotCard({ card, onClick, className = "" }: TarotCardProps) {
  const imageMeta = findTarotCardByJaName(card.name)

  return (
    <div
      className={`mx-auto w-[min(62vw,260px)] max-w-[260px] rounded-lg border border-amber-200/50 bg-gradient-to-b from-amber-50/90 to-amber-100/50 p-3 shadow-lg backdrop-blur ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="mb-3 flex min-h-[170px] items-center justify-center overflow-hidden rounded-md border border-amber-200 bg-white/80 p-2 shadow-sm sm:min-h-[185px]">
        <LightTarotDisplay
          imagePath={imageMeta?.imagePath ?? CARD_BACK_IMAGE_PATH}
          alt={imageMeta?.nameJa ?? card.name}
          isReversed={card.reversed}
          className="rounded-md"
          artworkClassName="block h-auto max-h-[38vh] w-full max-w-[260px] object-contain"
          sizes="(max-width: 640px) 62vw, 260px"
        />
      </div>
      <p className="font-medium text-amber-900">{card.name}</p>
      <p className="mt-1 text-xs font-medium text-amber-700/80">
        {card.reversed ? "逆位置" : "正位置"}
      </p>
      <p className="mt-1 text-sm text-amber-800/80">{card.meaning}</p>
    </div>
  )
}
