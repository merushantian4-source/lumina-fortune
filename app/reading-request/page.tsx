"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";

const PROFILE_STORAGE_KEY = "lumina_profile";

type Category = "恋愛" | "仕事" | "人間関係" | "お金" | "健康運" | "その他";
type BloodType = "A" | "B" | "O" | "AB" | "不明";
type Gender = "男性" | "女性" | "ジェンダーレス";

function loadProfile() {
  if (typeof window === "undefined") return { nickname: "", birthdate: "" };

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { nickname: "", birthdate: "" };
    const parsed = JSON.parse(raw) as { nickname?: unknown; birthdate?: unknown };
    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
      birthdate: typeof parsed.birthdate === "string" ? parsed.birthdate : "",
    };
  } catch {
    return { nickname: "", birthdate: "" };
  }
}

export default function ReadingRequestPage() {
  const [profile] = useState(loadProfile);
  const [nickname, setNickname] = useState(profile.nickname);
  const [birthdate, setBirthdate] = useState(profile.birthdate);
  const [bloodType, setBloodType] = useState<BloodType>("不明");
  const [gender, setGender] = useState<Gender>("ジェンダーレス");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category>("恋愛");
  const [content, setContent] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!nickname.trim() || !email.trim() || !content.trim() || !agreed) {
      setErrorMessage("必須項目を入力し、注意事項への同意にチェックしてください。");
      return;
    }

    try {
      setSending(true);
      const response = await fetch("/api/reading-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim(),
          birthdate: birthdate.trim() || undefined,
          bloodType,
          gender,
          email: email.trim(),
          category,
          content: content.trim(),
          agreed,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; requestId?: string; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "送信に失敗しました。");
      }

      setRequestId(data.requestId ?? null);
      setSubmitted(true);
      setToastMessage("送信を受け付けました。ルミナが静かに読み解きを始めています。");
      window.setTimeout(() => setToastMessage(""), 2800);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "送信時にエラーが発生しました。");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell
      maxWidth="content"
      title="個人鑑定のご依頼"
      description="あなたの状況に合わせた、より丁寧な読み解きをお届けするための窓口です。"
      backHref="/"
      backLabel="トップへ戻る"
      className="font-serif"
    >
      {submitted ? (
        <GlassCard className="rounded-3xl">
          <h2 className="text-xl font-medium text-[#2e2a26]">ご依頼を受け取りました</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
            あなたの言葉を大切に預かりました。灯りを整えながら、順番に読み解きを進めます。
          </p>
          {requestId ? <p className="mt-3 text-xs text-[#7d6d5a]">受付番号: {requestId}</p> : null}
        </GlassCard>
      ) : (
        <div className="space-y-4">
          <GlassCard className="rounded-3xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-[#2e2a26]">
                ニックネーム（必須）
                <input
                  type="text"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-[#2e2a26]">
                連絡先メール（必須）
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-[#2e2a26]">
                生年月日
                <input
                  type="date"
                  value={birthdate}
                  onChange={(event) => setBirthdate(event.target.value)}
                  className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
                />
              </label>

              <label className="block text-sm font-medium text-[#2e2a26]">
                血液型
                <select
                  value={bloodType}
                  onChange={(event) => setBloodType(event.target.value as BloodType)}
                  className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
                >
                  <option value="A">A型</option>
                  <option value="B">B型</option>
                  <option value="O">O型</option>
                  <option value="AB">AB型</option>
                  <option value="不明">不明</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-[#2e2a26]">
                性別
                <select
                  value={gender}
                  onChange={(event) => setGender(event.target.value as Gender)}
                  className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
                >
                  <option value="男性">男性</option>
                  <option value="女性">女性</option>
                  <option value="ジェンダーレス">ジェンダーレス</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-[#2e2a26]">
                相談カテゴリ
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as Category)}
                  className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
                  required
                >
                  <option value="恋愛">恋愛</option>
                  <option value="仕事">仕事</option>
                  <option value="人間関係">人間関係</option>
                  <option value="お金">お金</option>
                  <option value="健康運">健康運</option>
                  <option value="その他">その他</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-[#2e2a26]">
                相談内容（必須）
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="lumina-input mt-2 min-h-36 w-full rounded-xl px-4 py-3 text-base"
                  required
                />
              </label>

              <label className="flex items-start gap-2 text-sm leading-relaxed text-[#544c42]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#958cad]"
                  required
                />
                注意事項を確認し、内容に同意します。
              </label>

              <LuminaButton type="submit" disabled={sending} className="rounded-xl px-6">
                {sending ? "送信中..." : "依頼を送信する"}
              </LuminaButton>

              {errorMessage ? <p className="text-sm text-[#8b5e5e]">{errorMessage}</p> : null}
            </form>
          </GlassCard>

          <GlassCard className="rounded-3xl">
            <h2 className="text-sm font-medium tracking-wide text-[#2e2a26]">ご案内（大切なお知らせ）</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#544c42]">
              <li>・試験の合否、生死、病気の断定などはお受けしていません。</li>
              <li>・医療判断は行いません。健康運としての読み解きは可能です。</li>
              <li>・緊急性があるときは、どうか先に専門家へご相談ください。</li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
              あなたの安心を守るために、ルミナはやわらかな言葉で今できる道筋を照らします。
            </p>
          </GlassCard>
        </div>
      )}

      {toastMessage ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-[#d8c8ab]/82 bg-[#fff8ed] px-4 py-3 text-sm text-[#544c42] shadow-[0_14px_26px_-20px_rgba(82,69,53,0.28)]">
          {toastMessage}
        </div>
      ) : null}
    </PageShell>
  );
}
