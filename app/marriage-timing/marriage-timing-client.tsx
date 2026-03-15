"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { getMarriageTimingReading, type MarriageTimingReading } from "@/lib/marriageTiming";
import { getInitialBirthdate } from "@/lib/profile/getProfile";
import { useClaudeReading } from "@/lib/ai/use-claude-reading";

type MarriageTimingClientProps = {
  serverBirthdate: string | null;
};

export default function MarriageTimingClient({ serverBirthdate }: MarriageTimingClientProps) {
  const initialBirthdate = getInitialBirthdate(serverBirthdate);
  const [birthdate, setBirthdate] = useState(initialBirthdate);
  const [errorMessage, setErrorMessage] = useState("");
  const [templateResult, setTemplateResult] = useState(() => {
    if (!initialBirthdate) return null;
    try {
      return getMarriageTimingReading(initialBirthdate);
    } catch {
      return null;
    }
  });

  const { reading: result, isEnhancing } = useClaudeReading<MarriageTimingReading>({
    feature: "marriage-timing",
    templateReading: templateResult,
    context: birthdate ? `生年月日: ${birthdate}` : undefined,
    interpretationFrame: templateResult?.interpretationFrame,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!birthdate) {
      setErrorMessage("生年月日を入力してください。");
      return;
    }

    try {
      // 前の結果を一旦クリアしてから新しい結果をセット
      setTemplateResult(null);
      const newReading = getMarriageTimingReading(birthdate);
      requestAnimationFrame(() => {
        setTemplateResult(newReading);
      });
    } catch {
      setTemplateResult(null);
      setErrorMessage("生年月日は YYYY-MM-DD の形式で正しく入力してください。");
    }
  };

  return (
    <PageShell
      maxWidth="content"
      title="婚期を視る占い"
      description="運命数と3年の個人年数から、ご縁が深まりやすい時期と愛が形になりやすい流れをやさしく読み解きます。"
      backHref="/"
      backLabel="トップへ戻る"
      className="font-serif"
    >
      <div className="mb-4 overflow-hidden rounded-3xl">
        <Image
          src="/gazou/konki.png"
          alt="婚期を視る占いのイメージ"
          width={1050}
          height={500}
          className="w-full"
          priority
        />
      </div>

      <GlassCard className="rounded-3xl">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="block text-sm font-medium text-[#2e2a26]">
            生年月日
            <input
              type="date"
              value={birthdate}
              onChange={(event) => setBirthdate(event.target.value)}
              className="lumina-input mt-2 w-full rounded-xl px-4 py-3 text-base"
              required
            />
          </label>
          <LuminaButton type="submit" className="rounded-xl px-6 md:mb-[1px]">
            婚期の流れを視る
          </LuminaButton>
        </form>
        {errorMessage ? <p className="mt-4 text-sm text-[#8b5e5e]">{errorMessage}</p> : null}
      </GlassCard>

      {isEnhancing && !result && (
        <div className="mt-4">
          <GlassCard className="rounded-3xl">
            <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#d4c5a9] border-t-transparent" />
              <p className="text-sm tracking-[0.14em] text-[#8b7e6c] animate-pulse">ルミナが言葉を紡いでいます…</p>
            </div>
          </GlassCard>
        </div>
      )}
      {result ? (
        <div className="mt-4 space-y-4">
          <GlassCard className="rounded-3xl">
            <section className="rounded-[1.5rem] border border-[#dfd4c2]/80 bg-white/70 p-5">
              <p className="text-xs tracking-[0.12em] text-[#857866]">導入</p>
              <p className="mt-3 text-base leading-8 text-[#4d453c]">{result.intro}</p>
            </section>

            <section className="mt-4 rounded-[1.5rem] border border-[#dfd4c2]/80 bg-white/70 p-5">
              <p className="text-xs tracking-[0.12em] text-[#857866]">あなたの結婚傾向</p>
              <p className="mt-3 text-base leading-8 text-[#4d453c]">{result.tendency}</p>
            </section>

            <section className="mt-4 rounded-[1.6rem] border border-[#d8cde7] bg-[linear-gradient(180deg,rgba(250,246,255,0.92),rgba(244,236,252,0.86))] p-5 shadow-[0_20px_40px_-30px_rgba(95,79,128,0.3)]">
              <p className="text-xs tracking-[0.12em] text-[#6d627e]">婚期の流れ</p>
              <p className="mt-3 text-base leading-8 text-[#50455b]">{result.flowSummary}</p>
              <div className="mt-5 grid gap-3">
                {result.years.map((year) => (
                  <article
                    key={year.year}
                    className="rounded-[1.35rem] border border-[#e4d9ee] bg-white/78 px-4 py-4 shadow-[0_14px_28px_-26px_rgba(95,79,128,0.28)]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#f1e8fb] px-3 py-1 text-xs font-medium text-[#6f6084]">
                        {year.label}
                      </span>
                      <span className="text-sm text-[#7b6f8d]">{year.year}年</span>
                      <span className="rounded-full border border-[#ddd0ec] px-3 py-1 text-xs text-[#7b6f8d]">
                        個人年数 {year.personalYear}
                      </span>
                      <span className="rounded-full border border-[#d8c9ea] bg-[#faf5ff] px-3 py-1 text-xs text-[#695d7a]">
                        {year.badge}
                      </span>
                    </div>
                    <h2 className="mt-3 text-lg font-medium text-[#2f2838]">{year.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-[#544c42]">{year.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-[1.5rem] border border-[#dfd4c2]/80 bg-white/70 p-5">
              <p className="text-xs tracking-[0.12em] text-[#857866]">婚期が近づくサイン</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[#544c42]">
                {result.signs.map((sign) => (
                  <li key={sign} className="rounded-2xl border border-[#ece2d2]/80 bg-[#fffdfa] px-4 py-3">
                    {sign}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-[1.5rem] border border-[#dfd4c2]/80 bg-white/70 p-5">
              <p className="text-xs tracking-[0.12em] text-[#857866]">今、意識すると良いこと</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[#544c42]">
                {result.advice.map((advice) => (
                  <li key={advice} className="rounded-2xl border border-[#ece2d2]/80 bg-[#fffdfa] px-4 py-3">
                    {advice}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-[1.6rem] border border-[#d9cbe9] bg-[linear-gradient(180deg,rgba(250,246,255,0.92),rgba(244,236,252,0.86))] px-5 py-5 text-center shadow-[0_20px_40px_-30px_rgba(95,79,128,0.3)]">
              <p className="text-xs tracking-[0.12em] text-[#6d627e]">ひと言メッセージ</p>
              <p className="mt-3 text-base leading-8 text-[#50455b]">{result.closing}</p>
            </section>

            <section className="mt-4 rounded-[1.45rem] border border-[#d8cde7] bg-[#f6f1fb] px-5 py-5 shadow-[0_18px_38px_-28px_rgba(95,79,128,0.24)]">
              <p className="text-sm font-medium text-[#5e5246]">もっと深く恋の流れを見たいときはこちらへ。</p>
              <p className="mt-1 text-xs leading-relaxed text-[#7a6d60]">
                相性占いとあわせて読むと、ご縁が深まりやすい相手像も見えやすくなります。
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/compatibility"
                  className="inline-flex items-center rounded-full border border-[#cfc2e2] bg-[linear-gradient(160deg,#ffffff,#f2eafb)] px-4 py-2 text-sm font-medium text-[#5f5472] shadow-[0_10px_24px_-20px_rgba(95,79,128,0.28)] transition hover:border-[#bdaed7] hover:bg-[#f8f2ff] hover:text-[#4f4660]"
                >
                  相性占いを見る
                </Link>
                <Link
                  href="/consultation"
                  className="inline-flex items-center rounded-full border border-[#d4c5af] bg-[#fff9ef] px-4 py-2 text-sm font-medium text-[#6f6556] transition hover:bg-[#fffdf8]"
                >
                  個人鑑定をひらく
                </Link>
              </div>
            </section>
          </GlassCard>
        </div>
      ) : null}
    </PageShell>
  );
}
