"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { LuminaButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";
import {
  BIRTHDATE_COOKIE_KEY,
  BIRTHDATE_STORAGE_KEY,
  MONTHLY_BIRTH_COOKIE_KEY,
  PROFILE_BIRTHDATE_COOKIE_KEY,
  PROFILE_COOKIE_MAX_AGE,
  PROFILE_STORAGE_KEY,
  PROFILE_UPDATED_AT_COOKIE_KEY,
} from "@/lib/profile/profile-store";
import { trackEvent } from "@/lib/analytics/track";
import { syncProfileToSupabase } from "@/lib/analytics/profile-sync";
import { deleteProfile } from "@/lib/analytics/profile-delete";

type LoveStatus = "single" | "dating" | "married" | "complicated" | "unrequited";

type StoredProfile = {
  nickname: string;
  birthdate: string;
  job?: string;
  loveStatus: LoveStatus;
  updatedAt?: string;
};

type LightRecord = {
  id: string;
  dateKey: string;
  cardName: string;
  message: string;
  createdAt: string;
};

const LOVE_STATUS_OPTIONS: Array<{ label: string; value: LoveStatus }> = [
  { label: "🌿 ひとりの時間を楽しんでいる", value: "single" },
  { label: "💞 お付き合いしている人がいる", value: "dating" },
  { label: "💍 結婚している", value: "married" },
  { label: "🌙 秘密の関係", value: "complicated" },
  { label: "🌸 想いを寄せている人がいる", value: "unrequited" },
];

function loadInitialProfile(): StoredProfile {
  if (typeof window === "undefined") {
    return { nickname: "", birthdate: "", loveStatus: "single" };
  }

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { nickname: "", birthdate: "", loveStatus: "single" };

    const parsed = JSON.parse(raw) as Partial<StoredProfile> & { occupation?: unknown };
    const loveStatus =
      parsed.loveStatus === "single" ||
      parsed.loveStatus === "dating" ||
      parsed.loveStatus === "married" ||
      parsed.loveStatus === "complicated" ||
      parsed.loveStatus === "unrequited"
        ? parsed.loveStatus
        : "single";

    const job =
      typeof parsed.job === "string"
        ? parsed.job
        : typeof parsed.occupation === "string"
          ? parsed.occupation
          : undefined;

    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
      birthdate: typeof parsed.birthdate === "string" ? parsed.birthdate : "",
      job,
      loveStatus,
    };
  } catch {
    return { nickname: "", birthdate: "", loveStatus: "single" };
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [initialProfile] = useState(loadInitialProfile);
  const [nickname, setNickname] = useState(initialProfile.nickname);
  const [birthdate, setBirthdate] = useState(initialProfile.birthdate);
  const [job, setJob] = useState(initialProfile.job ?? "");
  const [loveStatus, setLoveStatus] = useState<LoveStatus>(initialProfile.loveStatus);
  const [errorMessage, setErrorMessage] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lightRecords, setLightRecords] = useState<LightRecord[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 分析: プロフィール登録画面を開いた
  useEffect(() => {
    void trackEvent("profile_started", "/profile");
  }, []);

  useEffect(() => {
    const nicknameForRecords = initialProfile.nickname?.trim();
    if (!nicknameForRecords) return;

    const fetchLightRecords = async () => {
      try {
        const res = await fetch("/api/light-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "list",
            profile: { nickname: nicknameForRecords },
          }),
        });
        const data = (await res.json()) as { records?: LightRecord[] };
        if (!res.ok || !Array.isArray(data.records)) return;
        setLightRecords(data.records);
      } catch {
        // Ignore fetch errors in profile page record list.
      }
    };

    void fetchLightRecords();
  }, [initialProfile.nickname]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedNickname = nickname.trim();
    const trimmedJob = job.trim();

    if (!trimmedNickname) {
      setErrorMessage("ニックネームは必須です。");
      return;
    }

    if (!birthdate || !/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      setErrorMessage("生年月日は YYYY-MM-DD 形式で入力してください。");
      return;
    }

    const profile: StoredProfile = {
      nickname: trimmedNickname,
      birthdate,
      loveStatus,
      updatedAt: new Date().toISOString(),
      ...(trimmedJob ? { job: trimmedJob } : {}),
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(BIRTHDATE_STORAGE_KEY, birthdate);
    const encodedBirthdate = encodeURIComponent(birthdate);
    const cookieBase = `path=/; samesite=lax; max-age=${PROFILE_COOKIE_MAX_AGE}`;
    document.cookie = `${PROFILE_BIRTHDATE_COOKIE_KEY}=${encodedBirthdate}; ${cookieBase}`;
    document.cookie = `${BIRTHDATE_COOKIE_KEY}=${encodedBirthdate}; ${cookieBase}`;
    document.cookie = `${MONTHLY_BIRTH_COOKIE_KEY}=${encodedBirthdate}; ${cookieBase}`;
    document.cookie = `${PROFILE_UPDATED_AT_COOKIE_KEY}=${encodeURIComponent(profile.updatedAt ?? "")}; ${cookieBase}`;
    setErrorMessage("");
    setSavedMessage("saved");
    setIsSaving(true);
    router.refresh();

    // 分析: プロフィール登録完了 → Supabase に保存
    void trackEvent("profile_completed", "/profile");
    void syncProfileToSupabase({
      nickname: trimmedNickname,
      birthdate,
      loveStatus,
      job: trimmedJob || undefined,
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteMessage("");
    try {
      const result = await deleteProfile();
      if (result.success) {
        setDeleteMessage("プロフィールを削除しました");
        // フォームを初期状態にリセット
        setNickname("");
        setBirthdate("");
        setJob("");
        setLoveStatus("single");
        setShowDeleteConfirm(false);
        setLightRecords([]);
        router.refresh();
      } else {
        setDeleteMessage(result.error ?? "削除に失敗しました。時間をおいてもう一度お試しください。");
      }
    } catch {
      setDeleteMessage("削除に失敗しました。時間をおいてもう一度お試しください。");
    } finally {
      setIsDeleting(false);
    }
  };

  // プロフィールが登録済みかどうか（ハイドレーション前はfalseで統一）
  const hasExistingProfile = isHydrated && initialProfile.nickname.trim().length > 0;

  const birthdateFortuneLinks = [
    { label: "2026年の運勢", href: "/fortune-2026" },
    { label: "毎月の運勢", href: "/fortune-monthly" },
    { label: "基本性格", href: "/basic-personality" },
    { label: "婚期占い", href: "/marriage-timing" },
  ];

  if (savedMessage === "saved") {
    return (
      <PageShell
        maxWidth="narrow"
        title="プロフィール登録"
        backHref="/"
        backLabel="トップへ戻る"
        className="font-serif"
      >
        <GlassCard className="rounded-3xl">
          <p className="text-xs tracking-[0.14em] text-[#8a7a64]">登録完了</p>
          <h2 className="mt-3 text-xl font-medium text-[#2e2a26]">あなたの灯りを受け取りました</h2>
          <p className="mt-3 text-sm leading-7 text-[#544c42]">
            生年月日での占い項目の鑑定結果が自動表示されるようになりました。
          </p>

          <div className="mt-5">
            <p className="text-sm font-medium text-[#3b352f]">早速見る</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {birthdateFortuneLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-[#e6d8bf] bg-[linear-gradient(160deg,rgba(255,252,246,0.96),rgba(246,238,225,0.92))] px-4 py-3 text-sm text-[#5f564a] shadow-[0_12px_28px_-24px_rgba(116,94,70,0.32)] transition hover:border-[#d9c8a8] hover:bg-[#fffaf2]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Link href="/" className="lumina-btn lumina-btn-secondary rounded-xl px-6">
              トップへ戻る
            </Link>
          </div>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell
      maxWidth="narrow"
      title="プロフィール登録"
      backHref="/"
      backLabel="トップへ戻る"
      className="font-serif"
    >
      <GlassCard className="mb-4 rounded-3xl">
        <p className="whitespace-pre-line text-sm leading-relaxed text-[#544c42]">
          {"この館では、あなたをより深く読み解くために\nほんの少しだけ、あなたのことを教えていただきます。\nすべては任意です。安心して記してください。"}
        </p>
      </GlassCard>

      <GlassCard className="rounded-3xl shadow-[0_18px_34px_-24px_rgba(82,69,53,0.24)]">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-medium text-[#2e2a26]">
              ニックネーム <span className="text-[#8b5e5e]">*</span>
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              className="lumina-input w-full rounded-xl px-4 py-3 text-base"
              placeholder="例: ゆり"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="birthdate" className="text-sm font-medium text-[#2e2a26]">
              生年月日 <span className="text-[#8b5e5e]">*</span>
            </label>
            <input
              id="birthdate"
              name="birthdate"
              type="date"
              required
              value={birthdate}
              onChange={(event) => setBirthdate(event.target.value)}
              className="lumina-input w-full rounded-xl px-4 py-3 text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="job" className="text-sm font-medium text-[#2e2a26]">
              職業
            </label>
            <input
              id="job"
              name="job"
              type="text"
              value={job}
              onChange={(event) => setJob(event.target.value)}
              className="lumina-input w-full rounded-xl px-4 py-3 text-base"
              placeholder="任意"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="loveStatus" className="text-sm font-medium text-[#2e2a26]">
              恋愛状況 <span className="text-[#8b5e5e]">*</span>
            </label>
            <select
              id="loveStatus"
              name="loveStatus"
              required
              value={loveStatus}
              onChange={(event) => setLoveStatus(event.target.value as LoveStatus)}
              className="lumina-input w-full rounded-xl px-4 py-3 text-base"
            >
              {LOVE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {errorMessage ? <p className="text-sm text-[#8b5e5e]">{errorMessage}</p> : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <LuminaButton type="submit" disabled={isSaving} className="rounded-xl px-6">
              保存する
            </LuminaButton>
            <Link href="/" className="lumina-btn lumina-btn-secondary rounded-xl px-6">
              キャンセル
            </Link>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="mt-4 rounded-3xl">
        <h2 className="text-base font-medium text-[#2e2a26]">光の記録（保存されたメッセージ一覧）</h2>
        {lightRecords.length === 0 ? (
          <p className="mt-3 text-sm text-[#544c42]">保存された言葉はまだありません。</p>
        ) : (
          <div className="mt-3 space-y-3">
            {lightRecords.map((record) => (
              <article
                key={record.id}
                className="rounded-xl border border-[#e1d5bf]/75 bg-white/60 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[#2e2a26]">{record.cardName}</p>
                  <p className="text-xs text-[#7d6d5a]">{record.dateKey}</p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#544c42]">
                  {record.message}
                </p>
              </article>
            ))}
          </div>
        )}
      </GlassCard>

      {/* プロフィール削除セクション（登録済みの場合のみ表示） */}
      {hasExistingProfile ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs text-[#9a8e7e] underline decoration-[#c8bfb0] underline-offset-2 transition hover:text-[#7a6e5e]"
          >
            プロフィールを削除する
          </button>
        </div>
      ) : null}

      {/* 削除完了メッセージ */}
      {deleteMessage ? (
        <div className="mt-3 text-center">
          <p className={`text-sm ${deleteMessage.includes("失敗") ? "text-[#8b5e5e]" : "text-[#6a8a64]"}`}>
            {deleteMessage}
          </p>
        </div>
      ) : null}

      {/* 削除確認モーダル */}
      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-[#2e2a26]/40 backdrop-blur-[2px]"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
            onKeyDown={(e) => e.key === "Escape" && !isDeleting && setShowDeleteConfirm(false)}
            role="button"
            tabIndex={0}
            aria-label="閉じる"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-[#e1d5bf] bg-[#fffdf8] px-6 py-6 shadow-[0_20px_40px_-16px_rgba(82,69,53,0.3)]">
            <h3 className="text-base font-medium text-[#2e2a26]">プロフィールの削除</h3>
            <p className="mt-3 text-sm leading-7 text-[#544c42]">
              登録したプロフィール情報を削除しますか？
            </p>
            <p className="mt-1 text-xs leading-5 text-[#8a7a64]">
              削除すると、この端末に保存されたプロフィール情報も消去されます。
              再度登録することもできます。
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-xl border border-[#e1d5bf] bg-white px-4 py-2 text-sm text-[#5f564a] transition hover:bg-[#faf6ef] disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                className="rounded-xl border border-[#c4a0a0]/60 bg-[#f5ece8] px-4 py-2 text-sm text-[#8b5e5e] transition hover:bg-[#f0e2dc] disabled:opacity-50"
              >
                {isDeleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
