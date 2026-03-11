"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { WishAnimationOverlay } from "@/components/WishAnimationOverlay";
import { HakuWhisperCard } from "@/components/haku-whisper-card";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { pickHakuMessage } from "@/lib/haku-messages";
import { runClientModerationCheck } from "@/lib/moderation/clientCheck";
import { containsNgWord } from "@/lib/moderation/checkNgWord";
import { getOrCreateChatVisitorKey } from "@/lib/membership";

type WishEntry = {
  id: string;
  message: string;
  createdAt: string;
};

const MAX_MESSAGE_LENGTH = 100;

function countChars(input: string): number {
  return Array.from(input).length;
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function WishGardenPage() {
  const [message, setMessage] = useState("");
  const [wishes, setWishes] = useState<WishEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [hakuMessage, setHakuMessage] = useState<string | null>(null);

  const [animationOpen, setAnimationOpen] = useState(false);
  const [animationText, setAnimationText] = useState("");

  const messageLength = useMemo(() => countChars(message), [message]);
  const isOverLimit = messageLength > MAX_MESSAGE_LENGTH;

  useEffect(() => {
    const loadWishes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/wish-garden", { cache: "no-store" });
        const data = (await res.json()) as { wishes?: WishEntry[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "願いの読み込みに失敗しました");
        setWishes(Array.isArray(data.wishes) ? data.wishes : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "願いの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    void loadWishes();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(id);
  }, [notice]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed) {
      setError("願いの言葉を入力してください。");
      return;
    }
    if (countChars(trimmed) > MAX_MESSAGE_LENGTH) {
      setError(`願いは${MAX_MESSAGE_LENGTH}文字以内で入力してください。`);
      return;
    }

    const userKey = getOrCreateChatVisitorKey();
    const moderation = runClientModerationCheck(trimmed, userKey, {
      maxLength: MAX_MESSAGE_LENGTH,
    });
    if (!moderation.ok) {
      setError(moderation.error);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setNotice(null);

      const res = await fetch("/api/wish-garden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: moderation.normalizedText, userKey }),
      });
      const data = (await res.json()) as { wish?: WishEntry; error?: string };
      if (!res.ok || !data.wish) {
        throw new Error(data.error ?? "願いの保存に失敗しました");
      }

      setWishes((prev) => [data.wish as WishEntry, ...prev].slice(0, 24));
      setAnimationText(trimmed);
      setAnimationOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "願いの保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnimationComplete = () => {
    setAnimationOpen(false);
    setMessage("");
    setNotice("願いを置きました。");
    setHakuMessage(pickHakuMessage("wish-garden", `${animationText}:${Date.now()}`));
  };

  return (
    <PageShell
      maxWidth="wide"
      title="光の願いの庭"
      description="ここには、小さな願いや祈りが置かれていきます。"
      backHref="/"
      backLabel="トップへ戻る"
      headerClassName="border-[#e1d5bf]/78 bg-[linear-gradient(160deg,rgba(255,252,246,0.52),rgba(248,242,231,0.42))]"
      headerBackground={
        <>
          <div className="h-full w-full bg-[url('/gazou/negainoniwa.png')] bg-cover bg-center opacity-82 [filter:blur(0.5px)_contrast(1.05)_saturate(1.05)]" />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,252,246,0.3),rgba(248,242,231,0.22))]" />
        </>
      }
      className="relative overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,247,0.24),transparent_42%),radial-gradient(circle_at_84%_14%,rgba(246,233,202,0.18),transparent_46%),radial-gradient(circle_at_24%_72%,rgba(226,239,255,0.16),transparent_52%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50 [background-image:radial-gradient(circle,rgba(255,255,255,0.75)_0.85px,transparent_0.95px)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[#fffdf5]/30 blur-3xl" />

      <GlassCard className="lumina-glow-card">
        <p className="text-sm leading-relaxed text-[#544c42]">
          叶えたいこと、心に浮かんだ言葉。
          <br />
          誰かへの優しい想い。
          <br />
          あなたの光も、静かにここへ残してみてください。
        </p>
      </GlassCard>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#e1d5bf]/74 shadow-[0_14px_30px_-24px_rgba(82,69,53,0.24)]">
        <Image
          src="/gazou/negai.png"
          alt="光の願いの庭"
          width={960}
          height={400}
          className="h-auto w-full object-cover"
          priority
        />
      </div>

      <GlassCard className="mt-4">
        <h2 className="text-lg font-medium text-[#2e2a26]">願いを書く（匿名）</h2>
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <textarea
            value={message}
            onChange={(e) => {
            const val = e.target.value;
            setMessage(val);
            if (val.trim() && containsNgWord(val.trim())) {
              setError("その言葉は願いの庭には置けないようです。別の表現でそっと書き直してみてください。");
            } else if (error) {
              setError(null);
            }
          }}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="ここに置きたい願いを、短い言葉で書いてみてください。"
            className="lumina-input min-h-28 w-full rounded-xl px-3 py-2 text-sm leading-relaxed"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={`text-xs ${isOverLimit ? "text-[#8a4f44]" : "text-[#847967]"}`}>
              {messageLength}/{MAX_MESSAGE_LENGTH}文字
            </p>
            <LuminaButton type="submit" disabled={isSubmitting || animationOpen || !message.trim()}>
              {isSubmitting ? "保存中..." : "願いを書く"}
            </LuminaButton>
          </div>
          {error ? <p className="text-sm text-[#8a4f44]">{error}</p> : null}
        </form>
      </GlassCard>

      <section className="relative mt-4 overflow-hidden rounded-3xl border border-[#e1d5bf]/75 bg-[rgba(255,252,246,0.45)] p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="h-full w-full bg-[url('/gazou/negainoniwa.png')] bg-cover bg-center opacity-90 [filter:contrast(1.02)_saturate(1.02)]" />
          <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(255,252,246,0.18),rgba(248,242,231,0.12))]" />
        </div>
        <h2 className="px-1 text-lg font-medium text-[#2e2a26]">最新の願い</h2>
        {isLoading ? (
          <GlassCard className="mt-3">
            <p className="text-sm text-[#544c42]">願いを読み込み中です...</p>
          </GlassCard>
        ) : wishes.length === 0 ? (
          <GlassCard className="mt-3">
            <p className="text-sm text-[#544c42]">まだ願いはありません。最初のひとつを置いてみてください。</p>
          </GlassCard>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
            {wishes.map((wish, index) => (
              <motion.article
                key={wish.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.28) }}
                className="rounded-xl border border-[#e1d5bf]/60 bg-[rgba(255,252,246,0.72)] px-3 py-2.5 shadow-[0_6px_14px_-10px_rgba(82,69,53,0.18)] backdrop-blur-sm"
              >
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-[#4f473d] sm:text-sm">{wish.message}</p>
                <p className="mt-1.5 text-[10px] text-[#8b7e6b] sm:text-xs">{formatDateTime(wish.createdAt)}</p>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {hakuMessage ? <HakuWhisperCard message={hakuMessage} className="mt-4" /> : null}

      <WishAnimationOverlay open={animationOpen} text={animationText} onComplete={handleAnimationComplete} />

      <AnimatePresence>
        {notice ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.26 }}
            className="pointer-events-none fixed bottom-5 left-1/2 z-[130] w-[min(92vw,22rem)] -translate-x-1/2 rounded-full border border-[#d8ccb5]/85 bg-[rgba(255,252,246,0.95)] px-4 py-2 text-center text-sm text-[#5f6b52] shadow-[0_10px_24px_-20px_rgba(82,69,53,0.4)]"
          >
            {notice}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageShell>
  );
}
