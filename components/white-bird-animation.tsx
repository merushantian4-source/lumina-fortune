"use client"

import { motion, AnimatePresence } from "framer-motion"

interface WhiteBirdAnimationProps {
  isActive: boolean
  onComplete: () => void
}

export function WhiteBirdAnimation({ isActive, onComplete }: WhiteBirdAnimationProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-6xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: [0, 50, -30, 0],
              y: [0, -20, 10, 0],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              onComplete,
            }}
          >
            🕊️
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
