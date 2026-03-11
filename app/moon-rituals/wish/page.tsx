"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton, LuminaLinkButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { runClientModerationCheck } from "@/lib/moderation/clientCheck";
import { getOrCreateChatVisitorKey } from "@/lib/membership";

const PROFILE_STORAGE_KEY = "lumina_profile";
const MAX_WISH_LENGTH = 200;

type StoredProfile = {
  nickname?: string;
};

type MoonlightWishRecord = {
  id: string;
  user_id: string;
  wish_text: string;
  newmoon_date: string;
  created_at: string;
};

type MoonlightWishResponse = {
  ok?: boolean;
  dateKey?: string;
  phaseLabel?: string;
  majorPhase?: "new_moon" | "full_moon" | "first_quarter" | "last_quarter" | null;
  canWrite?: boolean;
  canReview?: boolean;
  wish?: MoonlightWishRecord | null;
  error?: string;
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

function formatDateLabel(dateKey?: string) {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-");
  if (!year || !month || !day) return dateKey;
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export default function MoonlightWishPage() {
  const [nickname, setNickname] = useState(() => loadProfile().nickname ?? "");
  const [wishText, setWishText] = useState("");
  const [currentWish, setCurrentWish] = useState<MoonlightWishRecord | null>(null);
  const [phaseLabel, setPhaseLabel] = useState("月の流れ");
  const [dateKey, setDateKey] = useState("");
  const [canWrite, setCanWrite] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const charCount = useMemo(() => countChars(wishText), [wishText]);

  useEffect(() => {
    const user_id = nickname.trim();
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        const query = user_id ? `?user_id=${encodeURIComponent(user_id)}` : "";
        const response = await fetch(`/api/moonlight-wish${query}`, { cache: "no-store" });
        const data = (await response.json()) as MoonlightWishResponse;
        if (cancelled) return;
        setPhaseLabel(data.phaseLabel ?? "月の流れ");
        setDateKey(data.dateKey ?? "");
        setCanWrite(Boolean(data.canWrite));
        setCanReview(Boolean(data.canReview));
        setCurrentWish(data.wish ?? null);
      } catch {
        if (cancelled) return;
        setError("月の庭の様子を読み込めませんでした。");
      } finally {
        if (!cancelled) {
          setLoading(false);
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
    const user_id = nickname.trim();
    const trimmedWish = wishText.trim();

    if (!user_id) {
      setError("ニックネームを入力してください。");
      return;
    }
    if (!trimmedWish) {
      setError("願いを書いてください。");
      return;
    }
    if (countChars(trimmedWish) > MAX_WISH_LENGTH) {
      setError("願いは200文字以内で書いてください。");
      return;
    }

    const moderation = runClientModerationCheck(trimmedWish, getOrCreateChatVisitorKey(), {
      maxLength: MAX_WISH_LENGTH,
    });
    if (!moderation.ok) {
      setError(moderation.error);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setStatus("");
      const response = await fetch("/api/moonlight-wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          wish_text: moderation.normalizedText,
        }),
      });
      const data = (await response.json()) as MoonlightWishResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "願いを置けませんでした。");
      }
      setCurrentWish(data.wish ?? null);
      setWishText("");
      setStatus("あなたの願いは、月の庭に静かに置かれました。");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "願いを置けませんでした。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      maxWidth="content"
      title="月光の願い"
      description="新月に願いを置き、満月にその光を振り返るための静かな場所です。"
      backHref="/moon-rituals"
      backLabel="儀式一覧へ戻る"
    >
      <div className="space-y-4">
        <GlassCard className="rounded-3xl">
          <p className="text-xs font-medium tracking-wide text-[#847967]">MOONLIGHT WISH</p>
          <h2 className="mt-2 text-2xl font-medium text-[#2e2a26]">月光の願い</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
            {formatDateLabel(dateKey)}は{phaseLabel}です。
            <br />
            月の節目に、いまの願いをやわらかく見つめます。
          </p>
        </GlassCard>

        <GlassCard className="rounded-3xl">
          <label className="block text-sm font-medium text-[#2e2a26]">
            ニックネーム
            <input
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={60}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
            />
          </label>
        </GlassCard>

        {loading ? (
          <GlassCard className="rounded-3xl">
            <p className="text-sm text-[#6f6556]">月の庭を整えています...</p>
          </GlassCard>
        ) : null}

        {!loading && canWrite ? (
          <GlassCard className="rounded-3xl">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium tracking-wide text-[#847967]">新月の日</p>
                <h3 className="mt-1 text-xl font-medium text-[#2e2a26]">願いを月の庭に置く</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-[#2e2a26]">
                  願いごと
                  <textarea
                    value={wishText}
                    onChange={(event) => setWishText(event.target.value)}
                    maxLength={MAX_WISH_LENGTH}
                    className="lumina-input mt-2 min-h-36 w-full rounded-xl px-4 py-3 text-base leading-relaxed"
                    required
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#847967]">
                    {charCount}/{MAX_WISH_LENGTH}文字
                  </p>
                  <LuminaButton type="submit" disabled={saving} className="rounded-xl px-6">
                    {saving ? "置いています..." : "願いを書く"}
                  </LuminaButton>
                </div>
              </form>

              {status ? <p className="text-sm text-[#6f6556]">{status}</p> : null}
            </div>
          </GlassCard>
        ) : null}

        {!loading && canReview ? (
          <GlassCard className="rounded-3xl">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium tracking-wide text-[#847967]">満月の日</p>
                <h3 className="mt-1 text-xl font-medium text-[#2e2a26]">あなたが新月に置いた願い</h3>
              </div>

              {currentWish ? (
                <div className="rounded-2xl border border-[#e1d5bf]/72 bg-[linear-gradient(160deg,rgba(255,252,246,0.92),rgba(248,242,231,0.86))] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#544c42]">{currentWish.wish_text}</p>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-[#544c42]">
                  まだ振り返る願いが見つかりませんでした。新月の日に、ひとつ言葉を置いてみてください。
                </p>
              )}

              <div className="rounded-2xl border border-[#e8dcc7] bg-[#fff8ed]/90 p-4 text-sm leading-relaxed text-[#5f5344]">
                願いは、静かな時間の中で形を変えていきます。
              </div>
            </div>
          </GlassCard>
        ) : null}

        {!loading && !canWrite && !canReview ? (
          <GlassCard className="rounded-3xl">
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-[#2e2a26]">月の節目を待つ時間</h3>
              <p className="text-sm leading-relaxed text-[#544c42]">
                月光の願いは、新月の日に書き、満月の日に振り返るための場所です。
                <br />
                今夜は月の流れを静かに見つめて、次の節目を待ちましょう。
              </p>
            </div>
          </GlassCard>
        ) : null}

        {error ? <p className="text-sm text-[#8b5e5e]">{error}</p> : null}

        <div className="pt-1">
          <LuminaLinkButton href="/calendar" className="inline-flex">
            光の暦へ戻る
          </LuminaLinkButton>
        </div>
      </div>
    </PageShell>
  );
}
