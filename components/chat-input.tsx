"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("")

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed && !disabled) {
        onSend(trimmed)
        setValue("")
      }
    },
    [value, disabled, onSend]
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200/70 bg-white/65 px-4 py-3 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-2xl gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="質問を入力..."
          disabled={disabled}
          className="lumina-input flex-1 rounded-full px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <motion.button
          type="submit"
          disabled={disabled || !value.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn btn--primary !w-auto px-6 py-3 disabled:opacity-50"
        >
          送信
        </motion.button>
      </div>
    </form>
  )
}
