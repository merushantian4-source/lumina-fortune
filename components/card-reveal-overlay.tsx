"use client"

import { motion, AnimatePresence } from "framer-motion"
import { TarotCard, type TarotCardData } from "./tarot-card"

interface CardRevealOverlayProps {
  isOpen: boolean
  cards: TarotCardData[]
  onClose: () => void
}

export function CardRevealOverlay({
  isOpen,
  cards,
  onClose,
}: CardRevealOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="grid max-w-2xl gap-4 sm:grid-cols-3"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <TarotCard card={card} />
              </motion.div>
            ))}
          </motion.div>
          <button
            className="absolute right-4 top-4 rounded-full border border-slate-200/70 bg-white/90 px-4 py-2 text-slate-900 transition hover:bg-white"
            onClick={onClose}
          >
            閉じる
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
