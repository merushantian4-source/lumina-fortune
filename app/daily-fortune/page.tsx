"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { TarotBackArtwork, TarotCardArtwork } from "@/components/tarot-card-artwork";
import { tarotCards, type TarotCardEntry } from "@/src/data/tarotCards";
import { getRandomTarotCard } from "@/lib/tarot";

type DrawnCard = TarotCardEntry & {
  reversed: boolean;
};

type DailyFortuneResponse = {
  text?: string;
  error?: string;
};

const DAILY_FORTUNE_COOKIE_NAME = "lumina_daily_fortune";
const DAILY_FORTUNE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 2;
const DAILY_FORTUNE_TIMEZONE = "Asia/Tokyo"; // JST固定で日付キーを生成する

type DailyFortuneCookiePayload = {
  dateKey: string;
  result: {
    cardId: number;
    reversed: boolean;
    summary: string;
    fullText: string;
  };
};

function getJstDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: DAILY_FORTUNE_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
  const month = Number(parts.find((p) => p.type === "month")?.value ?? "0");
  const day = Number(parts.find((p) => p.type === "day")?.value ?? "0");

  return { year, month, day };
}

function getJstDateKey(date = new Date()) {
  const { year, month, day } = getJstDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTodayLabel() {
  const { year, month, day } = getJstDateParts();
  return `${year}年${month}月${day}日`;
}

function encodeCookiePayload(payload: DailyFortuneCookiePayload): string {
  const json = JSON.stringify(payload);
  const utf8 = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of utf8) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function decodeCookiePayload(value: string): DailyFortuneCookiePayload | null {
  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as DailyFortuneCookiePayload;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.dateKey !== "string") return null;
    const result = parsed.result;
    if (!result || typeof result !== "object") return null;
    if (!Number.isInteger(result.cardId)) return null;
    if (typeof result.reversed !== "boolean") return null;
    if (typeof result.summary !== "string") return null;
    if (typeof result.fullText !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookieValue(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

function loadSavedDailyFortuneForToday(): { payload: DailyFortuneCookiePayload; card: DrawnCard } | null {
  const raw = getCookieValue(DAILY_FORTUNE_COOKIE_NAME);
  if (!raw) return null;

  const payload = decodeCookiePayload(raw);
  if (!payload) return null;
  if (payload.dateKey !== getJstDateKey()) return null;

  const baseCard = tarotCards.find((card) => card.id === payload.result.cardId);
  if (!baseCard) return null;

  return {
    payload,
    card: {
      ...baseCard,
      reversed: payload.result.reversed,
    },
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export default function DailyFortunePage() {
  const [readyToFlip, setReadyToFlip] = useState(false);
  const [selectedCard, setSelectedCard] = useState<DrawnCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipFinished, setFlipFinished] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [fullText, setFullText] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTodayResult, setHasTodayResult] = useState(false);
  const today = useMemo(() => getTodayLabel(), []);
  const prefersReducedMotion = usePrefersReducedMotion();
  const requestIdRef = useRef(0);
  const flipTimerRef = useRef<number | null>(null);
  const flipLockRef = useRef(false);

  useEffect(() => {
    const saved = loadSavedDailyFortuneForToday();
    if (!saved) return;

    setReadyToFlip(true);
    setSelectedCard(saved.card);
    setIsFlipped(true);
    setFlipFinished(true);
    setSummary(saved.payload.result.summary);
    setFullText(saved.payload.result.fullText);
    setShowResult(true);
    setIsReading(false);
    setError(null);
    setHasTodayResult(true);
  }, []);

  useEffect(() => {
    if (flipFinished && selectedCard) {
      setShowResult(true);
    }
  }, [flipFinished, selectedCard]);

  useEffect(() => {
    return () => {
      if (flipTimerRef.current !== null) {
        window.clearTimeout(flipTimerRef.current);
      }
    };
  }, []);

  const resetState = () => {
    if (hasTodayResult) {
      const saved = loadSavedDailyFortuneForToday();
      if (saved) {
        setReadyToFlip(true);
        setSelectedCard(saved.card);
        setIsFlipped(true);
        setFlipFinished(true);
        setSummary(saved.payload.result.summary);
        setFullText(saved.payload.result.fullText);
        setShowResult(true);
        setIsReading(false);
        setError(null);
        return;
      }
    }

    requestIdRef.current += 1;
    flipLockRef.current = false;
    if (flipTimerRef.current !== null) {
      window.clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
    setReadyToFlip(false);
    setSelectedCard(null);
    setIsFlipped(false);
    setFlipFinished(false);
    setSummary(null);
    setFullText(null);
    setShowResult(false);
    setIsReading(false);
    setError(null);
    setHasTodayResult(false);
  };

  const handlePrepare = () => {
    if (hasTodayResult) {
      const saved = loadSavedDailyFortuneForToday();
      if (saved) {
        setReadyToFlip(true);
        setSelectedCard(saved.card);
        setIsFlipped(true);
        setFlipFinished(true);
        setSummary(saved.payload.result.summary);
        setFullText(saved.payload.result.fullText);
        setShowResult(true);
        setIsReading(false);
        setError(null);
      }
      return;
    }

    requestIdRef.current += 1;
    flipLockRef.current = false;
    if (flipTimerRef.current !== null) {
      window.clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
    setReadyToFlip(true);
    setSelectedCard(null);
    setIsFlipped(false);
    setFlipFinished(false);
    setSummary(null);
    setFullText(null);
    setShowResult(false);
    setIsReading(false);
    setError(null);
  };

  const handleFlip = async () => {
    if (!readyToFlip || isFlipped || flipLockRef.current || hasTodayResult) return;

    const existing = loadSavedDailyFortuneForToday();
    if (existing) {
      setReadyToFlip(true);
      setSelectedCard(existing.card);
      setIsFlipped(true);
      setFlipFinished(true);
      setSummary(existing.payload.result.summary);
      setFullText(existing.payload.result.fullText);
      setShowResult(true);
      setIsReading(false);
      setError(null);
      setHasTodayResult(true);
      return;
    }

    flipLockRef.current = true;

    const requestId = ++requestIdRef.current;
    const { card: baseCard, isReversed } = getRandomTarotCard();
    const card: DrawnCard = {
      ...baseCard,
      reversed: isReversed,
    };

    setSelectedCard(card);
    setIsFlipped(true);
    setFlipFinished(false);
    setShowResult(false);
    setSummary(card.meaningJa);
    setFullText(null);
    setError(null);
    setIsReading(true);

    const flipDelay = prefersReducedMotion ? 0 : 520;
    flipTimerRef.current = window.setTimeout(() => {
      if (requestIdRef.current !== requestId) return;
      setFlipFinished(true);
      flipTimerRef.current = null;
    }, flipDelay);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${today}の毎日の運勢を1枚引きで占ってください。`,
          mode: "daily-fortune",
          cards: [{ name: card.nameJa, reversed: card.reversed }],
        }),
      });

      const data = (await res.json()) as DailyFortuneResponse;
      if (!res.ok) {
        throw new Error(data.error ?? "占い結果の取得に失敗しました。");
      }
      if (requestIdRef.current !== requestId) return;
      const resolvedText = data.text ?? null;
      setFullText(resolvedText);

      if (resolvedText) {
        const payload: DailyFortuneCookiePayload = {
          dateKey: getJstDateKey(),
          result: {
            cardId: card.id,
            reversed: card.reversed,
            summary: card.meaningJa,
            fullText: resolvedText,
          },
        };
        setCookieValue(
          DAILY_FORTUNE_COOKIE_NAME,
          encodeCookiePayload(payload),
          DAILY_FORTUNE_COOKIE_MAX_AGE_SECONDS
        );
        setHasTodayResult(true);
      }
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError(err instanceof Error ? err.message : "通信エラーが発生しました。");
    } finally {
      if (requestIdRef.current === requestId) {
        flipLockRef.current = false;
      }
      if (requestIdRef.current === requestId) {
        setIsReading(false);
      }
    }
  };

  return (
    <main className="lumina-page min-h-screen px-5 py-10 text-slate-900">
      <div className="lumina-shell mx-auto max-w-2xl rounded-3xl p-6">
        <div className="mb-4">
          <Link href="/" className="lumina-link text-sm underline-offset-4 hover:underline">
            トップへ戻る
          </Link>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">毎日の占い</h1>
        <p className="lumina-muted mt-2 text-sm">
          {today}の運勢を、タロット1枚引きで見ます。
        </p>
        {hasTodayResult ? (
          <p className="mt-2 text-sm text-slate-700/80">
            今日は占い済みです。JSTの0:00以降に新しい結果を占えます。
          </p>
        ) : null}

        {!readyToFlip ? (
          <div className="mt-6">
            <button type="button" onClick={handlePrepare} className="btn btn--primary">
              {hasTodayResult ? "今日の結果を見る" : "今日の運勢を占う"}
            </button>
          </div>
        ) : (
          <section className="mt-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-amber-900/80">
                {hasTodayResult
                  ? "保存された今日の結果を表示しています。"
                  : "カードをタップして、今日の1枚をめくってください。"}
              </p>

              <button
                type="button"
                onClick={handleFlip}
                disabled={isFlipped}
                aria-label={isFlipped ? "カードがめくられました" : "カードをめくる"}
                className="fortune-card-button group"
              >
                <span
                  className={`fortune-card-inner ${isFlipped ? "is-flipped" : ""}`}
                  aria-hidden="true"
                >
                  <span className="fortune-card-face fortune-card-back">
                    <TarotBackArtwork
                      className="fortune-card-back-media"
                      sizes="(max-width: 768px) 80vw, 320px"
                    />
                  </span>

                  <span className="fortune-card-face fortune-card-front">
                    {selectedCard ? (
                      <>
                        <span className="fortune-card-frame">
                          <TarotCardArtwork
                            imagePath={selectedCard.imagePath}
                            alt={selectedCard.nameJa}
                            isReversed={selectedCard.reversed}
                            className="h-full w-full rounded-xl object-cover"
                            sizes="(max-width: 768px) 80vw, 320px"
                          />
                        </span>
                        <span className="mt-3 text-sm font-semibold text-amber-950">
                          {selectedCard.nameJa}
                          {selectedCard.reversed ? "（逆位置）" : ""}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-amber-900/80">めくると表示されます</span>
                    )}
                  </span>
                </span>
              </button>

              {error ? <p className="text-sm text-red-700">{error}</p> : null}

              {isFlipped && !flipFinished ? (
                <p className="text-sm text-amber-800/80">カードを読み解いています…</p>
              ) : null}
              {flipFinished && isReading && !showResult ? (
                <p className="text-sm text-amber-800/80">今日のメッセージを整えています…</p>
              ) : null}
            </div>

            <div className={`fortune-result ${showResult ? "is-visible" : ""}`}>
              {selectedCard ? (
                <section className="mt-6 rounded-2xl border border-amber-200 bg-white/70 p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-gradient-to-b from-amber-100 to-rose-100 text-2xl shadow-sm">
                      <TarotCardArtwork
                        imagePath={selectedCard.imagePath}
                        alt={selectedCard.nameJa}
                        isReversed={selectedCard.reversed}
                        className="h-full w-full rounded-xl object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold">
                        {selectedCard.nameJa}
                        {selectedCard.reversed ? "（逆位置）" : ""}
                      </h2>
                      {summary ? (
                        <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50/60 p-2">
                          <p className="text-[11px] font-semibold tracking-wide text-amber-700">
                            要約{isReading ? "（先に見えている内容です）" : ""}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-amber-900/85">{summary}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {error ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  ) : null}

                  {isReading ? (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-white/80 p-4">
                      <div className="flex items-center gap-3">
                        <span className="reading-spinner" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-semibold text-amber-900">リーディング中…</p>
                          <p className="text-xs text-amber-800/80">
                            カードのメッセージを言葉にしています…
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {fullText ? (
                    <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                      <p className="mb-2 text-xs font-semibold tracking-wide text-amber-700">
                        リーディング全文
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{fullText}</p>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>

            <div className="mt-6">
              <button type="button" onClick={resetState} className="btn btn--primary">
                {hasTodayResult ? "今日の結果を見直す" : "もう一度占う"}
              </button>
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        .fortune-card-button {
          width: min(100%, 18rem);
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          perspective: 1200px;
        }

        .fortune-card-button:disabled {
          cursor: default;
        }

        .fortune-card-button:focus-visible {
          outline: 3px solid #b45309;
          outline-offset: 6px;
          border-radius: 1.5rem;
        }

        .fortune-card-inner {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 2.5 / 4;
          transform-style: preserve-3d;
          transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fortune-card-inner.is-flipped {
          transform: rotateY(180deg);
        }

        .fortune-card-face {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 1.25rem;
          border: 1px solid rgba(251, 191, 36, 0.35);
          box-shadow:
            0 16px 28px -18px rgba(120, 53, 15, 0.45),
            0 8px 16px -12px rgba(0, 0, 0, 0.3);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .fortune-card-back {
          overflow: hidden;
          background: #f8f3e8;
        }

        .fortune-card-back-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .fortune-card-front {
          padding: 0.9rem;
          transform: rotateY(180deg);
          background:
            linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 247, 237, 0.94)),
            linear-gradient(140deg, rgba(254, 243, 199, 0.3), rgba(251, 207, 232, 0.25));
          color: #451a03;
        }

        .fortune-card-frame {
          display: flex;
          width: 100%;
          flex: 1;
          min-height: 0;
          align-items: center;
          justify-content: center;
          border-radius: 0.85rem;
          border: 1px solid rgba(217, 119, 6, 0.2);
          background:
            radial-gradient(circle at 30% 25%, rgba(251, 191, 36, 0.28), transparent 45%),
            radial-gradient(circle at 75% 20%, rgba(251, 113, 133, 0.22), transparent 48%),
            linear-gradient(180deg, #fffdf8 0%, #fff7ed 100%);
        }

        .fortune-card-placeholder {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80%;
          height: 80%;
          border-radius: 0.9rem;
          border: 1px dashed rgba(180, 83, 9, 0.25);
          color: rgba(180, 83, 9, 0.7);
          font-size: 2rem;
          background: rgba(255, 255, 255, 0.5);
        }

        .tarot-image-fallback {
          position: relative;
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 0.75rem;
          border: 1px dashed rgba(180, 83, 9, 0.28);
          background:
            radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.22), transparent 48%),
            radial-gradient(circle at 80% 25%, rgba(251, 113, 133, 0.16), transparent 55%),
            linear-gradient(160deg, rgba(31, 41, 55, 0.92), rgba(17, 24, 39, 0.96));
          color: #fef3c7;
          text-align: center;
          padding: 0.5rem;
        }

        .tarot-image-fallback__mark {
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          opacity: 0.9;
          font-weight: 700;
        }

        .tarot-image-fallback__name {
          position: absolute;
          inset-inline: 0.35rem;
          bottom: 0.45rem;
          font-size: 0.6rem;
          line-height: 1.2;
          color: rgba(255, 251, 235, 0.85);
        }

        .tarot-image-fallback__ornament {
          width: 56%;
          height: 56%;
          border-radius: 999px;
          border: 1px solid rgba(255, 251, 235, 0.55);
          box-shadow:
            0 0 0 10px rgba(196, 161, 92, 0.14),
            0 0 0 20px rgba(196, 161, 92, 0.08);
        }

        .fortune-result {
          opacity: 0;
          transform: translateY(8px);
          transition:
            opacity 360ms ease,
            transform 360ms ease;
          pointer-events: none;
        }

        .fortune-result.is-visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .reading-spinner {
          width: 1rem;
          height: 1rem;
          border-radius: 999px;
          border: 2px solid rgba(217, 119, 6, 0.25);
          border-top-color: rgba(217, 119, 6, 0.9);
          animation: spin 0.9s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fortune-card-inner,
          .fortune-result {
            transition-duration: 1ms !important;
          }

          .reading-spinner {
            animation-duration: 0.01ms;
            animation-iteration-count: 1;
          }
        }
      `}</style>
    </main>
  );
}
