"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { FloatingFeathers } from "@/components/floating-feathers"
import { WelcomeScreen } from "@/components/welcome-screen"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessages, type Message } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"
import { WhiteBirdAnimation } from "@/components/white-bird-animation"
import { CardRevealOverlay } from "@/components/card-reveal-overlay"
import type { TarotCardData } from "@/components/tarot-card"

function getCurrentTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
}

type ChatConversationState = {
  phase?: "idle" | "intent_confirm" | "reading" | "followup"
  topic?: string | null
  awaitingConsent?: boolean
  awaitingTheme?: boolean
  questionStreak?: number
  lastTopic?: string | null
  offtopicStreak?: number
  awaitingFortuneResult?: boolean
}

export default function Page() {
  const searchParams = useSearchParams()
  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [birdActive, setBirdActive] = useState(false)
  const [showCards, setShowCards] = useState(false)
  const [currentCards, setCurrentCards] = useState<TarotCardData[]>([])
  const [conversationState, setConversationState] = useState<ChatConversationState | null>(null)
  const autoStartedRef = useRef(false)

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
      let data: { text?: string; error?: string; conversationState?: ChatConversationState }
      try {
        data = await res.json()
      } catch {
        throw new Error("サーバーからの応答を読み取れませんでした。")
      }

      if (!res.ok) throw new Error(data.error ?? "応答を取得できませんでした")
      setConversationState(data.conversationState ?? null)

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
          mode: "chat",
          history,
          conversationState,
        }),
      })
      let data: {
        text?: string
        error?: string
        cards?: TarotCardData[]
        conversationState?: ChatConversationState
      }
      try {
        data = await res.json()
      } catch {
        throw new Error("サーバーからの応答を読み取れませんでした。")
      }

      if (!res.ok) throw new Error(data.error ?? "応答を取得できませんでした")
      setConversationState(data.conversationState ?? null)

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
  }, [conversationState, messages])

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
    setConversationState(null)
  }, [])

  useEffect(() => {
    if (autoStartedRef.current || started) return
    if (searchParams.get("start") !== "tarot") return
    autoStartedRef.current = true
    void handleStart()
  }, [searchParams, started, handleStart])

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
            <WelcomeScreen />
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
