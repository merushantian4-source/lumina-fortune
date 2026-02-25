"use client"

import { useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FloatingFeathers } from "@/components/floating-feathers"
import { WelcomeScreen } from "@/components/welcome-screen"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessages, type Message } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"
import { WhiteBirdAnimation } from "@/components/white-bird-animation"
import { CardRevealOverlay } from "@/components/card-reveal-overlay"
import type { TarotCardData } from "@/components/tarot-card"
import { isFortuneRequestInput } from "@/lib/input-guards"

function getCurrentTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
}

/**
 * 明確に占い依頼がある時だけ true
 */
function shouldDrawCards(message: string): boolean {
  const t = message.trim()
  if (!t) return false
  return isFortuneRequestInput(t)
}

export default function Page() {
  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [birdActive, setBirdActive] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [currentCards, setCurrentCards] = useState<TarotCardData[]>([])

  const addLuminaMessage = useCallback((text: string, cards?: TarotCardData[]) => {
    setIsTyping(true)

    const typingId = `typing-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        sender: "lumina",
        text: "",
        time: getCurrentTime(),
        isTyping: true,
      },
    ])

    const delay = 1500 + Math.random() * 1500
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? { ...m, text, isTyping: false, cards, showCardButton: !!cards }
            : m
        )
      )
      setIsTyping(false)
    }, delay)
  }, [])

  const handleStart = useCallback(async () => {
    setStarted(true)

    const typingId = `typing-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        sender: "lumina",
        text: "",
        time: getCurrentTime(),
        isTyping: true,
      },
    ])
    setIsTyping(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "__welcome__",
          mode: "chat",
          history: [],
        }),
      })
      let data: { text?: string; error?: string }
      try {
        data = await res.json()
      } catch {
        throw new Error("サーバーからの応答を読み取れませんでした。")
      }

      if (!res.ok) throw new Error(data.error ?? "応答を取得できませんでした")

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
      )
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "接続に問題がございました。しばらく経ってから、もう一度お試しくださいませ。"
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
      )
    } finally {
      setIsTyping(false)
    }
  }, [])

  const handleSend = useCallback(async (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      time: getCurrentTime(),
    }
    setMessages((prev) => [...prev, userMsg])

    const typingId = `typing-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        sender: "lumina",
        text: "",
        time: getCurrentTime(),
        isTyping: true,
      },
    ])
    setIsTyping(true)

    const isFortuneMode = shouldDrawCards(text)

    const history = messages
      .filter((m) => !m.isTyping && m.text)
      .map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }))

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: isFortuneMode ? "fortune" : "chat",
          history,
        }),
      })
      let data: { text?: string; error?: string; cards?: TarotCardData[] }
      try {
        data = await res.json()
      } catch {
        throw new Error("サーバーからの応答を読み取れませんでした。")
      }

      if (!res.ok) throw new Error(data.error ?? "応答を取得できませんでした")

      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? {
                ...m,
                text: data.text || "",
                isTyping: false,
                cards: data.cards ?? undefined,
                showCardButton: !!data.cards?.length,
              }
            : m
        )
      )
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "接続に問題がございました。しばらく経ってから、もう一度お試しくださいませ。"
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
      )
    } finally {
      setIsTyping(false)
    }
  }, [])

  const handleDrawCards = useCallback((cards: TarotCardData[]) => {
    setCurrentCards(cards)
    setBirdActive(true)
  }, [])

  const handleBirdComplete = useCallback(() => {
    setBirdActive(false)
    setShowCards(true)
  }, [])

  const handleCloseCards = useCallback(() => {
    setShowCards(false)
  }, [])

  const handleBackToTop = useCallback(() => {
    setStarted(false)
    setMessages([])
    setIsTyping(false)
    setBirdActive(false)
    setShowCards(false)
    setCurrentCards([])
  }, [])

  return (
    <main className="relative min-h-screen">
      <FloatingFeathers />
      <WhiteBirdAnimation isActive={birdActive} onComplete={handleBirdComplete} />
      <CardRevealOverlay isOpen={showCards} cards={currentCards} onClose={handleCloseCards} />

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="welcome"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <WelcomeScreen onStart={handleStart} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex min-h-screen flex-col"
          >
            <ChatHeader onBackToTop={handleBackToTop} />
            <ChatMessages messages={messages} onDrawCards={handleDrawCards} />
            <ChatInput onSend={handleSend} disabled={isTyping} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
