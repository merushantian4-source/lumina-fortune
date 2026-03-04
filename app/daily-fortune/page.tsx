"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TarotBackArtwork, TarotCardArtwork } from "@/components/tarot-card-artwork";
import { tarotCards, type TarotCardEntry } from "@/src/data/tarotCards";
import { getRandomTarotCard } from "@/lib/tarot";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";

type DrawnCard = TarotCardEntry & {
  reversed: boolean;
};

type DailyFortuneResponse = {
  text?: string;
  error?: string;
};

type SaveWordResponse = {
  record?: {
    id: string;
  };
  error?: string;
};

type RecentDailyCardItem = {
  label: "今日" | "昨日" | "一昨日";
  dateKey: string;
  cardName: string | null;
};

type RecentDailyCardResponse = {
  history?: RecentDailyCardItem[];
};

type DailyFortuneProfile = {
  nickname?: string;
  job?: string;
  occupation?: string;
  loveStatus?: "single" | "married" | "complicated" | "unrequited" | string;
};

type BookmarkShareState = {
  text: string;
  dateLabel: string;
};

const DAILY_FORTUNE_COOKIE_NAME = "lumina_daily_fortune";
const DAILY_FORTUNE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 2;
const DAILY_FORTUNE_TIMEZONE = "Asia/Tokyo"; // JST固定で日付キーを生成する
const PROFILE_STORAGE_KEY = "lumina_profile";
type DailyFortuneCookiePayload = {
  dateKey: string;
  result: {
    cardId: number;
    reversed: boolean;
    summary: string;
    fullText: string;
  };
};

function loadProfileForDailyFortune(): DailyFortuneProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DailyFortuneProfile;
    const resolvedJob =
      typeof parsed.job === "string"
        ? parsed.job
        : typeof parsed.occupation === "string"
          ? parsed.occupation
          : undefined;
    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : undefined,
      job: resolvedJob,
      loveStatus: typeof parsed.loveStatus === "string" ? parsed.loveStatus : undefined,
    };
  } catch {
    return {};
  }
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeOrientationMentions(text: string, card: { nameJa: string; reversed: boolean }): string {
  const opposite = card.reversed ? "正位置" : "逆位置";
  const expected = card.reversed ? "逆位置" : "正位置";
  const escapedName = escapeRegExp(card.nameJa);
  const directPattern = new RegExp(`${escapedName}\\s*[・・]\\s*${opposite}\\s*[・・]`, "g");
  return text.replace(directPattern, `${card.nameJa}（${expected}）`);
}

function sanitizeFortuneText(text: string): string {
  const mojibakeLike = /(縺|繧|繝|荳|蜈|蝗|螳|隱|讒|髮|蜊|窶ｦ|竊・){2,}/;
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const cleaned = lines.filter((line) => !mojibakeLike.test(line.trim()));
  const normalized = cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return normalized || text;
}

function extractTopWhisper(fullText: string, fallbackSummary: string): string {
  const normalized = fullText.replace(/\r\n/g, "\n").trim();
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const themeLine = lines.find((line) => /今日は.+の日です/.test(line));
  if (themeLine) {
    return themeLine;
  }
  const cleaned = normalized
    .replace(/\*\*/g, "")
    .replace(/[「」]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length > 0) {
    return cleaned.slice(0, 90);
  }
  return fallbackSummary;
}

function extractBookmarkMessage(fullText: string, fallbackSummary: string): string {
  const normalized = fullText.replace(/\r\n/g, "\n").trim();
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const preferredLine =
    lines.find((line) => line.includes("今日は") && line.includes("日です")) ??
    lines.find((line) => line.length >= 12 && line.length <= 80 && !line.includes("【")) ??
    "";

  const source = preferredLine || fallbackSummary || "";
  return source.replace(/\*\*/g, "").replace(/[「」]/g, "").trim();
}

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

function clearCookieValue(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
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
  const [saveWordMessage, setSaveWordMessage] = useState<string | null>(null);
  const [isSavingWord, setIsSavingWord] = useState(false);
  const [bookmarkShare, setBookmarkShare] = useState<BookmarkShareState | null>(null);
  const [bookmarkStatus, setBookmarkStatus] = useState<string | null>(null);
  const [isRenderingBookmark, setIsRenderingBookmark] = useState(false);
  const [recentCards, setRecentCards] = useState<RecentDailyCardItem[]>([
    { label: "今日", dateKey: "", cardName: null },
    { label: "昨日", dateKey: "", cardName: null },
    { label: "一昨日", dateKey: "", cardName: null },
  ]);
  const today = useMemo(() => getTodayLabel(), []);
  const prefersReducedMotion = usePrefersReducedMotion();
  const requestIdRef = useRef(0);
  const flipTimerRef = useRef<number | null>(null);
  const flipLockRef = useRef(false);
  const bookmarkCardRef = useRef<HTMLDivElement | null>(null);

  const applySavedResult = (saved: { payload: DailyFortuneCookiePayload; card: DrawnCard }) => {
    const normalizedFullText = sanitizeFortuneText(
      normalizeOrientationMentions(saved.payload.result.fullText, saved.card)
    );
    setReadyToFlip(true);
    setSelectedCard(saved.card);
    setIsFlipped(true);
    setFlipFinished(true);
    setSummary(saved.payload.result.summary);
    setFullText(normalizedFullText);
    setShowResult(true);
    setIsReading(false);
    setError(null);
    setHasTodayResult(true);
  };

  const fetchRecentCards = async () => {
    try {
      const profile = loadProfileForDailyFortune();
      const res = await fetch("/api/daily-fortune-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: { nickname: profile.nickname },
        }),
      });
      const data = (await res.json()) as RecentDailyCardResponse;
      if (!res.ok || !Array.isArray(data.history)) return;
      const normalized = data.history.slice(0, 3);
      if (normalized.length === 3) {
        setRecentCards(normalized);
      }
    } catch {
      // Keep fallback display.
    }
  };

  useEffect(() => {
    const saved = loadSavedDailyFortuneForToday();
    if (!saved) return;
    applySavedResult(saved);
  }, []);

  useEffect(() => {
    void fetchRecentCards();
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
        applySavedResult(saved);
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

  const handleRedrawToday = () => {
    clearCookieValue(DAILY_FORTUNE_COOKIE_NAME);
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
    setHasTodayResult(false);
  };

  const handlePrepare = () => {
    if (hasTodayResult) {
      const saved = loadSavedDailyFortuneForToday();
      if (saved) {
        applySavedResult(saved);
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
      applySavedResult(existing);
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
      const profile = loadProfileForDailyFortune();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${today}の毎日の占いを、1枚引きの結果で読み解いてください。`,
          mode: "daily-fortune",
          profile,
          cards: [{ name: card.nameJa, reversed: card.reversed }],
        }),
      });

      const data = (await res.json()) as DailyFortuneResponse;
      if (!res.ok) {
        throw new Error(data.error ?? "占い結果の取得に失敗しました。");
      }
      if (requestIdRef.current !== requestId) return;
      const resolvedText = data.text
        ? sanitizeFortuneText(normalizeOrientationMentions(data.text, card))
        : null;
      setFullText(resolvedText);

      if (resolvedText) {
        const topWhisper = extractTopWhisper(resolvedText, card.meaningJa);
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
        try {
          await fetch("/api/daily-fortune-whisper", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save",
              profile: { nickname: profile.nickname },
              payload: {
                dateKey: getJstDateKey(),
                message: topWhisper,
              },
            }),
          });
        } catch {
          // Do not block daily result when whisper save fails.
        }
        setHasTodayResult(true);
        void fetchRecentCards();
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

  const handleSaveTodayWord = async () => {
    if (!selectedCard || !fullText) return;

    const profile = loadProfileForDailyFortune();
    const nickname = profile.nickname?.trim();
    if (!nickname) {
      setSaveWordMessage("プロフィール登録後に保存できます。");
      return;
    }

    setIsSavingWord(true);
    setSaveWordMessage(null);
    try {
      const res = await fetch("/api/light-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          profile: { nickname },
          payload: {
            dateKey: getJstDateKey(),
            cardName: selectedCard.nameJa,
            message: fullText,
          },
        }),
      });
      const data = (await res.json()) as SaveWordResponse;
      if (!res.ok || !data.record?.id) {
        throw new Error(data.error ?? "保存に失敗しました。");
      }
      setSaveWordMessage("今日の言葉を保存しました。");
    } catch (err) {
      setSaveWordMessage(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setIsSavingWord(false);
    }
  };

  const handleCreateBookmark = () => {
    const message = extractBookmarkMessage(fullText ?? "", summary ?? "");
    if (!message) {
      setBookmarkStatus("しおりに入れる言葉が見つかりませんでした。");
      return;
    }
    setBookmarkShare({
      text: message,
      dateLabel: today,
    });
    setBookmarkStatus("光のしおりを整えました。");
  };

  const handleSaveBookmarkImage = async () => {
    if (!bookmarkCardRef.current) {
      setBookmarkStatus("しおりカードの生成に失敗しました。");
      return;
    }
    setIsRenderingBookmark(true);
    setBookmarkStatus(null);
    try {
      const htmlToImage = await import("html-to-image");
      const dataUrl = await htmlToImage.toPng(bookmarkCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#f8f3e8",
      });
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = `lumina-hikari-shiori-${getJstDateKey()}.png`;
      anchor.click();
      setBookmarkStatus("画像として保存しました。");
    } catch {
      setBookmarkStatus("画像生成に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsRenderingBookmark(false);
    }
  };

  const handleShareOnX = () => {
    if (!bookmarkShare?.text) {
      setBookmarkStatus("先に「光のしおりを作る」を押してください。");
      return;
    }
    const shareText = `🌙 今日のルミナのささやき\n${bookmarkShare.text}\n#LUMINA #今日の占い`;
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/daily-fortune` : "/daily-fortune";
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <PageShell
      maxWidth="narrow"
      title="毎日の占い"
      description={`${today}の運勢を、タロット1枚引きで見ます。`}
      backHref="/"
      backLabel="トップへ戻る"
    >
      <GlassCard>
        <p className="lumina-muted mt-1 text-sm">
          {today}の運勢を、タロット1枚引きで見ます。
        </p>
        {hasTodayResult ? (
          <p className="mt-2 text-sm text-slate-700/80">
            本日の結果は表示済みです。次回はJST 0:00以降に更新されます。
          </p>
        ) : null}

        {!readyToFlip ? (
          <div className="mt-6">
            <LuminaButton type="button" onClick={handlePrepare} tone="primary">
              {hasTodayResult ? "今日の結果を見る" : "今日の占いを引く"}
            </LuminaButton>
          </div>
        ) : (
          <section className="mt-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-[#6f6556]">
                {hasTodayResult
                  ? "すでに今日の結果を表示しています。"
                  : "カードをタップして、今日の1枚をめくってください。"}
              </p>

              <button
                type="button"
                onClick={handleFlip}
                disabled={isFlipped}
                aria-label={isFlipped ? "カードは表示済みです" : "カードをめくる"}
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
                <p className="text-sm text-[#6f6556]">今日のメッセージを整えています…</p>
              ) : null}
            </div>

            <div className={`fortune-result ${showResult ? "is-visible" : ""}`}>
              {selectedCard ? (
                <section className="mt-6 rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(160deg,rgba(255,252,246,0.88),rgba(248,242,231,0.82))] p-4 shadow-[0_12px_24px_-20px_rgba(82,69,53,0.22)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-xl border border-[#d8c8ab]/72 bg-gradient-to-b from-[#fff8ec] to-[#f6ebda] text-2xl shadow-sm">
                      <TarotCardArtwork
                        imagePath={selectedCard.imagePath}
                        alt={selectedCard.nameJa}
                        isReversed={selectedCard.reversed}
                        className="h-full w-full rounded-xl object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-medium text-[#2e2a26]">
                        {selectedCard.nameJa}
                        {selectedCard.reversed ? "（逆位置）" : ""}
                      </h2>
                      {summary ? (
                        <div className="mt-2 rounded-lg border border-[#e6dac5]/80 bg-white/60 p-2">
                          <p className="text-[11px] font-medium tracking-wide text-[#7d6d5a]">
                            {isReading ? "読み解き中..." : ""}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-[#544c42]">{summary}</p>
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
                    <div className="mt-4 rounded-xl border border-[#e1d5bf]/75 bg-white/80 p-4">
                      <div className="flex items-center gap-3">
                        <span className="reading-spinner" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-medium text-[#2e2a26]">リーディング中…</p>
                          <p className="text-xs text-[#544c42]">
                            カードのメッセージを言葉にしています…
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {fullText ? (
                    <div className="mt-4 rounded-xl border border-[#e6dac5]/80 bg-white/60 p-3">
                      <p className="mb-2 text-xs font-medium tracking-wide text-[#7d6d5a]">
                        リーディング全文
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#544c42]">{fullText}</p>
                    </div>
                  ) : null}
                </section>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <LuminaButton
                type="button"
                onClick={handleSaveTodayWord}
                tone="secondary"
                disabled={!selectedCard || !fullText || isSavingWord}
              >
                今日の言葉を保存
              </LuminaButton>
              {hasTodayResult ? (
                <LuminaButton type="button" onClick={handleRedrawToday} tone="primary">
                  再確認のカードを引く
                </LuminaButton>
              ) : (
                <LuminaButton type="button" onClick={resetState} tone="primary">
                  もう一度占う
                </LuminaButton>
              )}
            </div>
            {saveWordMessage ? (
              <p className="mt-2 text-sm text-[#544c42]">{saveWordMessage}</p>
            ) : null}

            {showResult && (fullText || summary) ? (
              <section className="mt-6 rounded-2xl border border-[#e1d5bf]/75 bg-white/55 p-4">
                <h3 className="text-base font-medium text-[#2e2a26]">光のしおり</h3>
                <p className="mt-1 text-sm text-[#544c42]">
                  今日の言葉を、やさしいしおりに整えて保存できます。
                </p>

                <div className="mt-3 flex flex-wrap gap-3">
                  <LuminaButton type="button" onClick={handleCreateBookmark} tone="secondary">
                    🌙 光のしおりを作る
                  </LuminaButton>
                  <LuminaButton
                    type="button"
                    onClick={handleSaveBookmarkImage}
                    tone="secondary"
                    disabled={!bookmarkShare || isRenderingBookmark}
                  >
                    画像として保存
                  </LuminaButton>
                  <LuminaButton
                    type="button"
                    onClick={handleShareOnX}
                    tone="secondary"
                    disabled={!bookmarkShare}
                  >
                    Xで共有
                  </LuminaButton>
                </div>

                {bookmarkStatus ? (
                  <p className="mt-2 text-sm text-[#544c42]">{bookmarkStatus}</p>
                ) : null}

                {bookmarkShare ? (
                  <div className="mt-4 flex justify-center">
                    <div
                      ref={bookmarkCardRef}
                      className="w-full max-w-[520px] rounded-2xl border border-[#d9ccb3]/80 bg-[linear-gradient(158deg,rgba(255,252,246,0.96),rgba(247,240,228,0.9))] px-6 py-7 text-center shadow-[0_12px_24px_-20px_rgba(96,80,60,0.22)]"
                    >
                      <p className="text-xs tracking-[0.24em] text-[#766e62]">LUMINA</p>
                      <p className="mt-2 text-sm text-[#7d6d5a]">{bookmarkShare.dateLabel}</p>
                      <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-[#544c42]">
                        {bookmarkShare.text}
                      </p>
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}
          </section>
        )}
      </GlassCard>

      <GlassCard className="mt-4">
        <h2 className="text-base font-medium text-[#2e2a26]">最近のカード履歴</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {recentCards.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#e1d5bf]/75 bg-white/55 px-3 py-2"
            >
              <p className="text-xs tracking-wide text-[#7d6d5a]">{item.label}</p>
              <p className="mt-1 text-sm text-[#2e2a26]">{item.cardName ?? "—"}</p>
            </div>
          ))}
        </div>
      </GlassCard>

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
    </PageShell>
  );
}



