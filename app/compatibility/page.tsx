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
      setErrorMessage(
        "\u3042\u306a\u305f\u3068\u304a\u76f8\u624b\u3001\u4e21\u65b9\u306e\u751f\u5e74\u6708\u65e5\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
      );
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
      setErrorMessage(
        "\u751f\u5e74\u6708\u65e5\u306f YYYY-MM-DD \u306e\u5f62\u5f0f\u3067\u6b63\u3057\u304f\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
      );
    }
  };

  return (
    <PageShell
      maxWidth="content"
      title="\u76f8\u6027\u5360\u3044"
      description="\u3075\u305f\u308a\u306e\u751f\u5e74\u6708\u65e5\u304b\u3089\u3001\u95a2\u4fc2\u306e\u6d41\u308c\u3068\u5fc3\u306e\u97ff\u304d\u3092\u3084\u3055\u3057\u304f\u8aad\u307f\u89e3\u304d\u307e\u3059\u3002"
      backHref="/"
      backLabel="\u30c8\u30c3\u30d7\u3078\u623b\u308b"
      className="font-serif"
    >
      <div className="mb-4 overflow-hidden rounded-3xl">
        <Image
          src="/gazou/aisyou.jpg"
          alt="LUMINA\u306e\u76f8\u6027\u5360\u3044\u3002\u3075\u305f\u308a\u306e\u95a2\u4fc2\u3092\u3084\u3055\u3057\u304f\u8aad\u307f\u89e3\u304f\u30a4\u30e1\u30fc\u30b8"
          width={1050}
          height={500}
          className="w-full"
          priority
        />
      </div>

      <GlassCard className="rounded-3xl">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-[#2e2a26]">
            {"\u3042\u306a\u305f\u306e\u30cb\u30c3\u30af\u30cd\u30fc\u30e0\uff08\u4efb\u610f\uff09"}
            <input
              type="text"
              value={myNickname}
              onChange={(event) => setMyNickname(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              placeholder="\u4f8b: \u3086\u308a"
            />
          </label>

          <label className="block text-sm font-medium text-[#2e2a26]">
            {"\u3042\u306a\u305f\u306e\u751f\u5e74\u6708\u65e5"}
            <input
              type="date"
              value={myBirthdate}
              onChange={(event) => setMyBirthdate(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#2e2a26]">
            {"\u304a\u76f8\u624b\u306e\u30cb\u30c3\u30af\u30cd\u30fc\u30e0\uff08\u4efb\u610f\uff09"}
            <input
              type="text"
              value={partnerNickname}
              onChange={(event) => setPartnerNickname(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              placeholder="\u4f8b: \u3042\u304a\u3044"
            />
          </label>

          <label className="block text-sm font-medium text-[#2e2a26]">
            {"\u304a\u76f8\u624b\u306e\u751f\u5e74\u6708\u65e5"}
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
              {"\u76f8\u6027\u3092\u8aad\u307f\u89e3\u304f"}
            </LuminaButton>
          </div>
        </form>
        {errorMessage ? <p className="mt-4 text-sm text-[#8b5e5e]">{errorMessage}</p> : null}
      </GlassCard>

      {result ? (
        <GlassCard className="mt-4 rounded-3xl">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="text-xs tracking-wide text-[#847967]">{"\u3042\u306a\u305f"}</p>
              <p className="mt-1 text-lg font-medium text-[#2e2a26]">
                {myNickname || "\u3042\u306a\u305f"}: {fortuneNumberNames[result.myNumber]}
              </p>
              <p className="mt-1 text-sm text-[#544c42]">
                {"\u9b42\u306e\u540d"}: {result.mySoulName}
              </p>
            </div>
            <div className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="text-xs tracking-wide text-[#847967]">{"\u304a\u76f8\u624b"}</p>
              <p className="mt-1 text-lg font-medium text-[#2e2a26]">
                {partnerNickname || "\u304a\u76f8\u624b"}: {fortuneNumberNames[result.partnerNumber]}
              </p>
              <p className="mt-1 text-sm text-[#544c42]">
                {"\u9b42\u306e\u540d"}: {result.partnerSoulName}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4 sm:space-y-5">
            <section className="rounded-[1.35rem] border border-[#e1d5bf]/72 bg-white/72 px-4 py-4 sm:px-5 sm:py-5">
              <h2 className="text-sm font-medium tracking-[0.08em] text-[#2e2a26]">
                {"\u76f8\u6027\u306e\u7279\u5fb4"}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-[#544c42] sm:leading-8">
                {strengthsParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-[1.35rem] border border-[#e1d5bf]/72 bg-white/72 px-4 py-4 sm:px-5 sm:py-5">
              <h2 className="text-sm font-medium tracking-[0.08em] text-[#2e2a26]">
                {"\u3064\u307e\u305a\u304d\u3084\u3059\u3044\u70b9"}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-[#544c42] sm:leading-8">
                {pitfallsParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-[1.35rem] border border-[#e1d5bf]/72 bg-white/72 px-4 py-4 sm:px-5 sm:py-5">
              <h2 className="text-sm font-medium tracking-[0.08em] text-[#2e2a26]">
                {"\u3046\u307e\u304f\u3044\u304f\u30b3\u30c4"}
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
                {"\u3072\u3068\u8a00\u30e1\u30c3\u30bb\u30fc\u30b8"}
              </h2>
              <div className="mt-3 space-y-2 text-sm leading-7 text-[#544c42] sm:text-[15px] sm:leading-8">
                {messageParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-[1.45rem] border border-[#d8cde7] bg-[#f6f1fb] px-5 py-5 shadow-[0_18px_38px_-28px_rgba(95,79,128,0.24)]">
              <p className="text-sm font-medium text-[#5e5246]">
                {
                  "\u3082\u3063\u3068\u6df1\u304f\u77e5\u308a\u305f\u3044\u3068\u304d\u306f\u3001\u3053\u3061\u3089\u3078\u3002"
                }
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#7a6d60]">
                {
                  "\u3075\u305f\u308a\u306e\u6d41\u308c\u3092\u3001\u5bfe\u8a71\u3092\u901a\u3057\u3066\u3082\u3046\u5c11\u3057\u4e01\u5be7\u306b\u8aad\u307f\u89e3\u304f\u3053\u3068\u3082\u3067\u304d\u307e\u3059\u3002"
                }
              </p>
              <div className="mt-3">
                <Link
                  href="/consultation"
                  className="inline-flex items-center rounded-full border border-[#cfc2e2] bg-[linear-gradient(160deg,#ffffff,#f2eafb)] px-4 py-2 text-sm font-medium text-[#5f5472] shadow-[0_10px_24px_-20px_rgba(95,79,128,0.28)] transition hover:border-[#bdaed7] hover:bg-[#f8f2ff] hover:text-[#4f4660]"
                >
                  {"\u5bfe\u8a71\u9451\u5b9a\u3092\u3072\u3089\u304f"}
                </Link>
              </div>
            </section>
          </div>
        </GlassCard>
      ) : null}
    </PageShell>
  );
}
