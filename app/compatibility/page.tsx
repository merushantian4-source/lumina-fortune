"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";
import { fortuneNumberNames } from "@/lib/fortune/names";
import type { FortuneNumber } from "@/lib/fortune/types";
import { getSoulNameByNumber } from "@/lib/fortune/soul-names";
import { getCompatibilityReading } from "@/lib/fortune/compatibility-map";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";
import Link from "next/link";

const PROFILE_STORAGE_KEY = "lumina_profile";

type StoredProfile = {
  nickname?: string;
  birthdate?: string;
};

type CompatibilityResult = {
  myNumber: FortuneNumber;
  partnerNumber: FortuneNumber;
  mySoulName: string;
  partnerSoulName: string;
  reading: ReturnType<typeof getCompatibilityReading>;
};

function loadProfile() {
  if (typeof window === "undefined") return { nickname: "", birthdate: "" };

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { nickname: "", birthdate: "" };
    const parsed = JSON.parse(raw) as StoredProfile;
    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
      birthdate: typeof parsed.birthdate === "string" ? parsed.birthdate : "",
    };
  } catch {
    return { nickname: "", birthdate: "" };
  }
}

export default function CompatibilityPage() {
  const [profile] = useState(loadProfile);
  const [myNickname, setMyNickname] = useState(profile.nickname);
  const [myBirthdate, setMyBirthdate] = useState(profile.birthdate);
  const [partnerNickname, setPartnerNickname] = useState("");
  const [partnerBirthdate, setPartnerBirthdate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!myBirthdate || !partnerBirthdate) {
      setErrorMessage("あなたとお相手、両方の生年月日を入力してください。");
      return;
    }

    try {
      const myNumber = destinyNumberFromBirthdate(myBirthdate);
      const partnerNumber = destinyNumberFromBirthdate(partnerBirthdate);
      setResult({
        myNumber,
        partnerNumber,
        mySoulName: getSoulNameByNumber(myNumber),
        partnerSoulName: getSoulNameByNumber(partnerNumber),
        reading: getCompatibilityReading(myNumber, partnerNumber),
      });
    } catch {
      setResult(null);
      setErrorMessage("正しい生年月日（YYYY-MM-DD）を入力してください。");
    }
  };

  return (
    <PageShell
      maxWidth="content"
      title="運命数相性占い"
      description="ふたりの生年月日から運命数を読み解き、関係の育て方をやさしく照らします。"
      backHref="/"
      backLabel="トップへ戻る"
      className="font-serif"
    >
      <GlassCard className="rounded-3xl">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-[#2e2a26]">
            あなたのニックネーム（任意）
            <input
              type="text"
              value={myNickname}
              onChange={(event) => setMyNickname(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              placeholder="例: ゆり"
            />
          </label>

          <label className="block text-sm font-medium text-[#2e2a26]">
            あなたの生年月日（必須）
            <input
              type="date"
              value={myBirthdate}
              onChange={(event) => setMyBirthdate(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#2e2a26]">
            相手のニックネーム（任意）
            <input
              type="text"
              value={partnerNickname}
              onChange={(event) => setPartnerNickname(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              placeholder="例: あおい"
            />
          </label>

          <label className="block text-sm font-medium text-[#2e2a26]">
            相手の生年月日（必須）
            <input
              type="date"
              value={partnerBirthdate}
              onChange={(event) => setPartnerBirthdate(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              required
            />
          </label>

          <div className="md:col-span-2">
            <LuminaButton type="submit" className="rounded-xl px-6">
              相性を読み解く
            </LuminaButton>
          </div>
        </form>
        {errorMessage ? <p className="mt-4 text-sm text-[#8b5e5e]">{errorMessage}</p> : null}
      </GlassCard>

      {result ? (
        <GlassCard className="mt-4 rounded-3xl">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="text-xs tracking-wide text-[#847967]">あなた</p>
              <p className="mt-1 text-lg font-medium text-[#2e2a26]">
                {myNickname || "あなた"}: {fortuneNumberNames[result.myNumber]}
              </p>
              <p className="mt-1 text-sm text-[#544c42]">魂の名: {result.mySoulName}</p>
            </div>
            <div className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="text-xs tracking-wide text-[#847967]">お相手</p>
              <p className="mt-1 text-lg font-medium text-[#2e2a26]">
                {partnerNickname || "お相手"}: {fortuneNumberNames[result.partnerNumber]}
              </p>
              <p className="mt-1 text-sm text-[#544c42]">魂の名: {result.partnerSoulName}</p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <section className="rounded-xl border border-[#e1d5bf]/72 bg-white/70 p-4">
              <h2 className="text-sm font-medium tracking-wide text-[#2e2a26]">相性の特徴（強み）</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#544c42]">{result.reading.strengths}</p>
            </section>

            <section className="rounded-xl border border-[#e1d5bf]/72 bg-white/70 p-4">
              <h2 className="text-sm font-medium tracking-wide text-[#2e2a26]">つまずきやすい点</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#544c42]">{result.reading.pitfalls}</p>
            </section>

            <section className="rounded-xl border border-[#e1d5bf]/72 bg-white/70 p-4">
              <h2 className="text-sm font-medium tracking-wide text-[#2e2a26]">うまくいくコツ（具体行動）</h2>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[#544c42]">
                {result.reading.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <span className="mt-1 text-[10px] text-[#958cad]">◆</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[#d2c4e7] bg-[#f5f0ff]/55 p-4">
              <h2 className="text-sm font-medium tracking-wide text-[#2e2a26]">ひと言メッセージ</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#544c42]">{result.reading.luminaMessage}</p>
            </section>

            <section className="rounded-[1.45rem] border border-[#d8cde7] bg-[#f6f1fb] px-5 py-5 shadow-[0_18px_38px_-28px_rgba(95,79,128,0.24)]">
              <p className="text-sm font-medium text-[#5e5246]">もっと深く知りたい方はこちら</p>
              <p className="mt-1 text-xs leading-relaxed text-[#7a6d60]">
                ふたりの流れを、今の状況に合わせて丁寧に読み解きます。
              </p>
              <div className="mt-3">
                <Link
                  href="/consultation"
                  className="inline-flex items-center rounded-full border border-[#cfc2e2] bg-[linear-gradient(160deg,#ffffff,#f2eafb)] px-4 py-2 text-sm font-medium text-[#5f5472] shadow-[0_10px_24px_-20px_rgba(95,79,128,0.28)] transition hover:border-[#bdaed7] hover:bg-[#f8f2ff] hover:text-[#4f4660]"
                >
                  個人鑑定を依頼する
                </Link>
              </div>
            </section>
          </div>
        </GlassCard>
      ) : null}
    </PageShell>
  );
}
