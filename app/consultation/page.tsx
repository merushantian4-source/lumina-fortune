"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";

const PROFILE_STORAGE_KEY = "lumina_profile";

type Category = "恋愛" | "仕事" | "人間関係" | "家庭" | "健康" | "その他";
type BloodType = "A" | "B" | "O" | "AB" | "未回答";
type Gender = "男性" | "女性" | "ノンバイナリー" | "未回答";

type StoredProfile = {
  nickname?: string;
  birthdate?: string;
};

function loadProfileForConsultation(): StoredProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { nickname?: unknown; birthdate?: unknown };
    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
      birthdate: typeof parsed.birthdate === "string" ? parsed.birthdate : "",
    };
  } catch {
    return {};
  }
}

export default function ConsultationPage() {
  const [profile] = useState(loadProfileForConsultation);
  const [nickname, setNickname] = useState(profile.nickname ?? "");
  const [birthdate, setBirthdate] = useState(profile.birthdate ?? "");
  const [bloodType, setBloodType] = useState<BloodType>("未回答");
  const [gender, setGender] = useState<Gender>("未回答");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category>("恋愛");
  const [content, setContent] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setRequestId(null);

    if (!nickname.trim() || !email.trim() || !content.trim() || !agreed) {
      setError("必須項目を入力し、同意にチェックしてください。");
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
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "送信に失敗しました。");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell
      maxWidth="content"
      title="個人鑑定のご依頼"
      description="いま抱えている悩みや違和感を、そのまま書いてください。"
      backHref="/"
      backLabel="トップへ戻る"
      className="font-serif"
    >
      <GlassCard className="rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm leading-relaxed text-[#544c42]">
            まずは必要事項をご入力ください。迷っていることも、まとまっていなくて大丈夫です。
          </p>

          <section className="rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(162deg,rgba(255,252,246,0.9),rgba(248,242,231,0.86))] p-4">
            <h2 className="text-sm font-medium text-[#2e2a26]">鑑定メッセージの一例</h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-[#4f473d]">
              <p>
                30代・恋愛のご相談
                「いまは答えを急がず、相手の言葉よりも自分の心の反応を丁寧に見ていく時期です。静かに整えていくほど、次の一歩が自然に見えてきます。」
              </p>
              <p>
                40代・仕事のご相談
                「焦りの奥にある本音を一度言葉にすると、選ぶべき優先順位が明確になります。『やらないこと』を決めることで流れが整いやすくなります。」
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#e1d5bf]/75 bg-white/65 p-4">
            <h2 className="text-sm font-medium text-[#2e2a26]">このようなご相談が多いです</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#544c42]">
              <li>恋愛のすれ違い、距離感の調整</li>
              <li>仕事の方向性、転職や独立の迷い</li>
              <li>人間関係のストレス、対話の仕方</li>
              <li>これから先の選択とタイミング</li>
            </ul>
          </section>

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
            連絡用メール（必須）
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              required
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="O">O</option>
                <option value="AB">AB</option>
                <option value="未回答">未回答</option>
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
                <option value="ノンバイナリー">ノンバイナリー</option>
                <option value="未回答">未回答</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-[#2e2a26]">
            相談カテゴリ（必須）
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              required
            >
              <option value="恋愛">恋愛</option>
              <option value="仕事">仕事</option>
              <option value="人間関係">人間関係</option>
              <option value="家庭">家庭</option>
              <option value="健康">健康</option>
              <option value="その他">その他</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-[#2e2a26]">
            ご相談内容（必須）
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="lumina-input mt-2 min-h-36 w-full rounded-xl px-4 py-3 text-base leading-relaxed"
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
            {sending ? "送信中..." : "依頼する"}
          </LuminaButton>

          {error ? <p className="text-sm text-[#8b5e5e]">{error}</p> : null}
          {requestId ? <p className="text-sm text-[#5f6b52]">受付ID: {requestId}</p> : null}
        </form>
      </GlassCard>
    </PageShell>
  );
}
