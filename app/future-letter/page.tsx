"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton, LuminaLinkButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";

const PROFILE_STORAGE_KEY = "lumina_profile";
const MAX_MESSAGE_LENGTH = 500;

type StoredProfile = {
  nickname?: string;
};

type FutureLetterRecord = {
  id: string;
  date: string;
  message: string;
  user: string;
  created_at: string;
};

function loadProfile(): StoredProfile {
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

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTomorrowDateKey() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return getLocalDateKey(date);
}

function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-");
  if (!year || !month || !day) return dateKey;
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export default function FutureLetterPage() {
  const [nickname, setNickname] = useState(() => loadProfile().nickname ?? "");
  const [message, setMessage] = useState("");
  const [deliverDate, setDeliverDate] = useState(() => getTomorrowDateKey());
  const [deliveredLetters, setDeliveredLetters] = useState<FutureLetterRecord[]>([]);
  const [loadingDelivered, setLoadingDelivered] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const charCount = useMemo(() => countChars(message), [message]);
  const minDate = useMemo(() => getTomorrowDateKey(), []);

  useEffect(() => {
    const user = nickname.trim();
    if (!user) {
      setDeliveredLetters([]);
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        setLoadingDelivered(true);
        const query = new URLSearchParams({ user });
        const response = await fetch(`/api/future-letter?${query.toString()}`, { cache: "no-store" });
        const data = (await response.json()) as { letters?: FutureLetterRecord[] };
        if (!cancelled) {
          setDeliveredLetters(Array.isArray(data.letters) ? data.letters : []);
        }
      } catch {
        if (!cancelled) {
          setDeliveredLetters([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingDelivered(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [nickname]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = nickname.trim();
    const trimmedMessage = message.trim();

    if (!user) {
      setError("ニックネームを入力してください。");
      return;
    }
    if (!trimmedMessage) {
      setError("手紙の本文を入力してください。");
      return;
    }
    if (countChars(trimmedMessage) > MAX_MESSAGE_LENGTH) {
      setError("500文字以内で入力してください。");
      return;
    }
    if (!deliverDate) {
      setError("届ける日を選んでください。");
      return;
    }

    try {
      setSending(true);
      setError(null);
      setStatus("");
      const response = await fetch("/api/future-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user,
          message: trimmedMessage,
          date: deliverDate,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "保存に失敗しました。");
      }
      setMessage("");
      setDeliverDate(getTomorrowDateKey());
      setStatus("白が手紙を預かりました。");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "保存に失敗しました。");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell
      maxWidth="content"
      title="未来の手紙"
      description="未来のあなたへ、いまの言葉を静かに預ける場所です。白がその手紙を大切に抱えておきます。"
      backHref="/"
      backLabel="トップへ戻る"
      className="font-serif"
    >
      <div className="space-y-6">
        <GlassCard className="rounded-3xl border border-[#ded0b8]/80 bg-[linear-gradient(165deg,rgba(255,252,246,0.95),rgba(247,239,228,0.9))]">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.18em] text-[#8a7a64]">未来の手紙</p>
            <h2 className="text-2xl font-medium text-[#2e2a26]">未来のあなたへ言葉を残します</h2>
            <p className="text-sm leading-relaxed text-[#544c42]">
              白が手紙を預かり、届ける日まで静かにしまっておきます。
            </p>
          </div>
        </GlassCard>

        <GlassCard className="rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-[#2e2a26]">
              ニックネーム
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={40}
                className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
                required
              />
            </label>

            <label className="block text-sm font-medium text-[#2e2a26]">
              手紙本文
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                className="lumina-input mt-2 min-h-40 w-full rounded-xl px-4 py-3 text-base leading-relaxed"
                required
              />
            </label>

            <label className="block text-sm font-medium text-[#2e2a26]">
              届ける日
              <input
                type="date"
                value={deliverDate}
                min={minDate}
                onChange={(event) => setDeliverDate(event.target.value)}
                className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
                required
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#847967]">
                {charCount}/{MAX_MESSAGE_LENGTH}文字
              </p>
              <LuminaButton type="submit" disabled={sending} className="rounded-xl px-6">
                {sending ? "預けています..." : "手紙を書く"}
              </LuminaButton>
            </div>

            {status ? <p className="text-sm text-[#6f6556]">{status}</p> : null}
            {error ? <p className="text-sm text-[#8b5e5e]">{error}</p> : null}
          </form>
        </GlassCard>

        <GlassCard className="rounded-3xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs tracking-[0.18em] text-[#8a7a64]">今日、届いた手紙</p>
              <h3 className="text-xl font-medium text-[#2e2a26]">白が手紙を届けました</h3>
              <p className="text-sm leading-relaxed text-[#544c42]">
                指定の日を迎えた手紙が、ここに静かに届きます。
              </p>
            </div>

            {loadingDelivered ? <p className="text-sm text-[#6f6556]">白が手紙を探しています...</p> : null}

            {!loadingDelivered && deliveredLetters.length === 0 ? (
              <p className="text-sm leading-relaxed text-[#6f6556]">
                まだ届いた手紙はありません。未来の自分へ、ひとつ言葉を預けてみてください。
              </p>
            ) : null}

            <div className="space-y-3">
              {deliveredLetters.map((letter) => (
                <article
                  key={letter.id}
                  className="rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(162deg,rgba(255,252,246,0.88),rgba(248,242,231,0.82))] p-4"
                >
                  <p className="text-xs tracking-[0.14em] text-[#8a7a64]">{formatDateLabel(letter.date)}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#544c42]">{letter.message}</p>
                </article>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-center">
          <LuminaLinkButton href="/consultation" tone="secondary" className="rounded-xl px-6">
            個人鑑定を見る
          </LuminaLinkButton>
        </div>
      </div>
    </PageShell>
  );
}
