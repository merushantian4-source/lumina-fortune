"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuminaButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";
import { getCompatibilityReading } from "@/lib/fortune/compatibility-map";
import { fortuneNumberNames } from "@/lib/fortune/names";
import { getSoulNameByNumber } from "@/lib/fortune/soul-names";
import type { FortuneNumber } from "@/lib/fortune/types";

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

function splitReadingParagraphs(text: string, preferredParagraphs = 2): string[] {
  const sentences = text
    .split(/(?<=[\u3002\uff01\uff1f])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    return [text.trim()];
  }

  const chunkSize = Math.ceil(sentences.length / preferredParagraphs);
  const paragraphs: string[] = [];

  for (let index = 0; index < sentences.length; index += chunkSize) {
    paragraphs.push(sentences.slice(index, index + chunkSize).join(" "));
  }

  return paragraphs;
}

export default function CompatibilityPage() {
  const [profile] = useState(loadProfile);
  const [myNickname, setMyNickname] = useState(profile.nickname);
  const [myBirthdate, setMyBirthdate] = useState(profile.birthdate);
  const [partnerNickname, setPartnerNickname] = useState("");
  const [partnerBirthdate, setPartnerBirthdate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const strengthsParagraphs = result ? splitReadingParagraphs(result.reading.strengths) : [];
  const pitfallsParagraphs = result ? splitReadingParagraphs(result.reading.pitfalls) : [];
  const messageParagraphs = result ? splitReadingParagraphs(result.reading.luminaMessage) : [];

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
      setErrorMessage("生年月日は YYYY-MM-DD の形式で正しく入力してください。");
    }
  };

  return (
    <PageShell
      maxWidth="content"
      title="相性占い"
      description="ふたりの生年月日から、関係の流れと心の響きをやさしく読み解きます。"
      backHref="/"
      backLabel="トップへ戻る"
      className="font-serif"
    >
      <div className="mb-4 overflow-hidden rounded-3xl">
        <Image
          src="/gazou/aisyou.jpg"
          alt="LUMINAの相性占い。ふたりの関係をやさしく読み解くイメージ"
          width={1050}
          height={500}
          className="w-full"
          priority
        />
      </div>

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
            あなたの生年月日
            <input
              type="date"
              value={myBirthdate}
              onChange={(event) => setMyBirthdate(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#2e2a26]">
            お相手のニックネーム（任意）
            <input
              type="text"
              value={partnerNickname}
              onChange={(event) => setPartnerNickname(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              placeholder="例: あおい"
            />
          </label>

          <label className="block text-sm font-medium text-[#2e2a26]">
            お相手の生年月日
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
              <p className="mt-1 text-sm text-[#544c42]">
                魂の名: {result.mySoulName}
              </p>
            </div>
            <div className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="text-xs tracking-wide text-[#847967]">お相手</p>
              <p className="mt-1 text-lg font-medium text-[#2e2a26]">
                {partnerNickname || "お相手"}: {fortuneNumberNames[result.partnerNumber]}
              </p>
              <p className="mt-1 text-sm text-[#544c42]">
                魂の名: {result.partnerSoulName}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4 sm:space-y-5">
            <section className="rounded-[1.35rem] border border-[#e1d5bf]/72 bg-white/72 px-4 py-4 sm:px-5 sm:py-5">
              <h2 className="text-sm font-medium tracking-[0.08em] text-[#2e2a26]">
                相性の特徴
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-[#544c42] sm:leading-8">
                {strengthsParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-[1.35rem] border border-[#e1d5bf]/72 bg-white/72 px-4 py-4 sm:px-5 sm:py-5">
              <h2 className="text-sm font-medium tracking-[0.08em] text-[#2e2a26]">
                つまずきやすい点
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-[#544c42] sm:leading-8">
                {pitfallsParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-[1.35rem] border border-[#e1d5bf]/72 bg-white/72 px-4 py-4 sm:px-5 sm:py-5">
              <h2 className="text-sm font-medium tracking-[0.08em] text-[#2e2a26]">
                うまくいくコツ
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm leading-7 text-[#544c42] sm:space-y-3">
                {result.reading.tips.map((tip, index) => (
                  <li
                    key={tip}
                    className="flex items-start gap-3 rounded-2xl border border-[#eadfef] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,241,255,0.82))] px-3.5 py-3 shadow-[0_14px_30px_-26px_rgba(95,79,128,0.28)]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0e7fb] text-[11px] font-medium text-[#7e6f9a]">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{tip}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[1.6rem] border border-[#d9cbe9] bg-[linear-gradient(180deg,rgba(250,246,255,0.92),rgba(244,236,252,0.86))] px-5 py-5 text-center shadow-[0_20px_40px_-30px_rgba(95,79,128,0.3)] sm:px-6 sm:py-6">
              <h2 className="text-sm font-medium tracking-[0.12em] text-[#4f4660]">
                ひと言メッセージ
              </h2>
              <div className="mt-3 space-y-2 text-sm leading-7 text-[#544c42] sm:text-[15px] sm:leading-8">
                {messageParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-[1.45rem] border border-[#d8cde7] bg-[#f6f1fb] px-5 py-5 shadow-[0_18px_38px_-28px_rgba(95,79,128,0.24)]">
              <p className="text-sm font-medium text-[#5e5246]">
                もっと深く知りたいときは、こちらへ。
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#7a6d60]">
                ふたりの流れを、対話を通してもう少し丁寧に読み解くこともできます。
              </p>
              <div className="mt-3">
                <Link
                  href="/consultation"
                  className="inline-flex items-center rounded-full border border-[#cfc2e2] bg-[linear-gradient(160deg,#ffffff,#f2eafb)] px-4 py-2 text-sm font-medium text-[#5f5472] shadow-[0_10px_24px_-20px_rgba(95,79,128,0.28)] transition hover:border-[#bdaed7] hover:bg-[#f8f2ff] hover:text-[#4f4660]"
                >
                  対話鑑定をひらく
                </Link>
              </div>
            </section>
          </div>
        </GlassCard>
      ) : null}
    </PageShell>
  );
}
