"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { WishAnimationOverlay } from "@/components/WishAnimationOverlay";
import { HakuWhisperCard } from "@/components/haku-whisper-card";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { pickHakuMessage } from "@/lib/haku-messages";
import { runClientModerationCheck } from "@/lib/moderation/clientCheck";
import { getOrCreateChatVisitorKey } from "@/lib/membership";

const MAX_MESSAGE_LENGTH = 300;
const PROFILE_STORAGE_KEY = "lumina_profile";

type StoredProfile = {
  nickname?: string;
};

function loadProfileForLetter(): StoredProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { nickname?: unknown };
    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
    };
  } catch {
    return {};
  }
}

function countChars(input: string): number {
  return Array.from(input).length;
}

export default function LetterPage() {
  const [nickname, setNickname] = useState(() => loadProfileForLetter().nickname ?? "");
  const [message, setMessage] = useState("");
  const [luminaReply, setLuminaReply] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [animationOpen, setAnimationOpen] = useState(false);
  const [animationText, setAnimationText] = useState("");
  const [pendingReply, setPendingReply] = useState("");
  const [hakuMessage, setHakuMessage] = useState("");

  const charCount = useMemo(() => countChars(message), [message]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();

    if (!trimmed) {
      setError("いまの気持ちを入力してください。");
      return;
    }
    if (countChars(trimmed) > MAX_MESSAGE_LENGTH) {
      setError("300文字以内で入力してください。");
      return;
    }

    const moderation = runClientModerationCheck(trimmed, getOrCreateChatVisitorKey(), {
      maxLength: MAX_MESSAGE_LENGTH,
    });
    if (!moderation.ok) {
      setError(moderation.error);
      return;
    }

    try {
      setSending(true);
      setError(null);
      const response = await fetch("/api/consultation-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          message: moderation.normalizedText,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; reply?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "送信に失敗しました。");
      }
      setPendingReply(typeof data.reply === "string" ? data.reply : "");
      setAnimationText(trimmed);
      setAnimationOpen(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "送信に失敗しました。");
    } finally {
      setSending(false);
    }
  };

  const handleAnimationComplete = () => {
    setAnimationOpen(false);
    setLuminaReply(
      pendingReply || "あなたの言葉は確かに受け取りました。無理しすぎず、今日はひとつだけ心がほどける時間を作ってみてください。"
    );
    setPendingReply("");
    setHakuMessage(pickHakuMessage("letter", `${animationText}:${nickname || "guest"}`));
    setSubmitted(true);
  };

  const handleWriteAgain = () => {
    setSubmitted(false);
    setLuminaReply("");
    setPendingReply("");
    setHakuMessage("");
    setError(null);
  };

  return (
    <PageShell
      maxWidth="content"
      title="ルミナへの手紙"
      description="いま心にあることを、短い言葉で書いてみてください。ルミナが静かに受け取ります。"
      backHref="/"
      backLabel="トップへ戻る"
      className="font-serif"
    >
      <div className="mb-4 overflow-hidden rounded-2xl border border-[#e1d5bf]/74 shadow-[0_14px_30px_-24px_rgba(82,69,53,0.24)]">
        <Image
          src="/gazou/tarotkanteiheya.jpg"
          alt="ルミナへの手紙"
          width={720}
          height={400}
          className="h-auto w-full object-cover"
          priority
        />
      </div>

      {submitted ? (
        <GlassCard className="rounded-3xl space-y-4">
          <p className="text-base leading-relaxed text-[#544c42] whitespace-pre-line">
            {luminaReply || "あなたの言葉は確かに受け取りました。無理しすぎず、今日はひとつだけ心がほどける時間を作ってみてください。"}
          </p>
          {hakuMessage ? <HakuWhisperCard message={hakuMessage} className="p-4 sm:p-5" /> : null}
          <div className="flex flex-wrap gap-3">
            <LuminaButton type="button" tone="secondary" className="rounded-xl px-6" onClick={handleWriteAgain}>
              もう一度書く
            </LuminaButton>
            <LuminaButton asChild className="rounded-xl px-6">
              <Link href="/consultation">個人鑑定を依頼する</Link>
            </LuminaButton>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-[#2e2a26]">
              ニックネーム（任意）
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={40}
                className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              />
            </label>

            <label className="block text-sm font-medium text-[#2e2a26]">
              いまの気持ち（必須 / 300文字）
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                className="lumina-input mt-2 min-h-36 w-full rounded-xl px-4 py-3 text-base leading-relaxed"
                required
              />
            </label>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-[#847967]">
                {charCount}/{MAX_MESSAGE_LENGTH}文字
              </p>
              <LuminaButton type="submit" disabled={sending || animationOpen} className="rounded-xl px-6">
                {sending || animationOpen ? "届けています..." : "送信する"}
              </LuminaButton>
            </div>

            <p className="text-xs leading-relaxed text-[#7d6d5a]">※この手紙は鑑定申込みではありません。</p>
            {error ? <p className="text-sm text-[#8b5e5e]">{error}</p> : null}
          </form>
        </GlassCard>
      )}
      <WishAnimationOverlay open={animationOpen} text={animationText} onComplete={handleAnimationComplete} />
    </PageShell>
  );
}
