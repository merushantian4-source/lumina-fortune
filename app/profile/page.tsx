"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { LuminaButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";

const PROFILE_STORAGE_KEY = "lumina_profile";
const BIRTHDATE_STORAGE_KEY = "lumina_birthdate";
const PROFILE_BIRTHDATE_COOKIE_KEY = "lumina_profile_birthdate";
const BIRTHDATE_COOKIE_KEY = "lumina_birthdate";
const PROFILE_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

type LoveStatus = "single" | "married" | "complicated" | "unrequited";

type StoredProfile = {
  nickname: string;
  birthdate: string;
  job?: string;
  loveStatus: LoveStatus;
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
  { label: "💞 お付き合いしている人がいる（dating）", value: "married" },
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
      ...(trimmedJob ? { job: trimmedJob } : {}),
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(BIRTHDATE_STORAGE_KEY, birthdate);
    const encodedBirthdate = encodeURIComponent(birthdate);
    const cookieBase = `path=/; samesite=lax; max-age=${PROFILE_COOKIE_MAX_AGE}`;
    document.cookie = `${PROFILE_BIRTHDATE_COOKIE_KEY}=${encodedBirthdate}; ${cookieBase}`;
    document.cookie = `${BIRTHDATE_COOKIE_KEY}=${encodedBirthdate}; ${cookieBase}`;
    setErrorMessage("");
    setSavedMessage("あなたの灯りを受け取りました。これからは、あなたに合わせて言葉を紡ぎます。");
    setIsSaving(true);

    window.setTimeout(() => {
      router.refresh();
      router.push("/");
    }, 1200);
  };

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
          {savedMessage ? <p className="text-sm text-[#2f6f50]">{savedMessage}</p> : null}

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
    </PageShell>
  );
}
