import { AnimatePresence, motion } from "framer-motion";

import { TarotCard, type TarotCardData } from "./tarot-card";

interface CardRevealOverlayProps {
  isOpen: boolean;
  cards: TarotCardData[];
  onClose: () => void;
}

export function CardRevealOverlay({ isOpen, cards, onClose }: CardRevealOverlayProps) {
  const isSingleCard = cards.length <= 1;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[95] bg-[radial-gradient(circle_at_top,rgba(255,252,245,0.2),rgba(15,21,32,0.55)_55%,rgba(10,15,25,0.82))] p-3 backdrop-blur-md sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="mx-auto flex h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(246,239,227,0.92))] shadow-[0_30px_90px_-36px_rgba(12,17,26,0.75)] sm:h-[calc(100dvh-2.5rem)]"
            initial={{ scale: 0.94, opacity: 0, y: 18 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-[#e7decd]/90 bg-[rgba(255,250,241,0.88)] px-5 py-4 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.28em] text-[#8c7d68]">WHITE WITCH TAROT</p>
                  <h2 className="mt-1 text-lg text-[#2f2a24]">白の導きが届きました</h2>
                  <p className="mt-1 text-sm text-[#6c6154]">
                    {isSingleCard ? "今の流れに重なる一枚です。" : "静かに届いたカードたちです。"}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-[#d8cdb9] bg-white/88 px-4 py-2 text-sm text-[#5e5448] transition hover:bg-white"
                  onClick={onClose}
                >
                  閉じる
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {isSingleCard ? (
                <div className="flex min-h-full items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.36, ease: "easeOut" }}
                    className="w-full max-w-[260px]"
                  >
                    <TarotCard card={cards[0]!} className="shadow-[0_20px_70px_-34px_rgba(34,26,17,0.55)]" />
                  </motion.div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.28 }}
                    >
                      <TarotCard card={card} className="h-full" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
