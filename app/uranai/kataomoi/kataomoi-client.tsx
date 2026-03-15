"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { LightTarotDisplay } from "@/components/light-tarot-display";
import { LuminaButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";
import {
  KATAOMOI_QUESTION_CHIPS,
  getKataomoiReading,
  type KataomoiReading,
} from "@/lib/kataomoi-reading";
import { useClaudeReading } from "@/lib/ai/use-claude-reading";

function splitParagraphs(text: string): string[] {
  return text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/65 bg-white/75 px-4 py-4 shadow-[0_18px_36px_-30px_rgba(95,79,57,0.3)] backdrop-blur-sm">
      <p className="text-[11px] tracking-[0.16em] text-[#8a7b68]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#40372f]">{value}</p>
    </div>
  );
}

function ResultSection({
  eyebrow,
  title,
  accent = "default",
  paragraphs,
}: {
  eyebrow: string;
  title: string;
  accent?: "default" | "violet";
  paragraphs: string[];
}) {
  const palette =
    accent === "violet"
      ? "border-[#dccccf] bg-[linear-gradient(180deg,rgba(252,248,255,0.96),rgba(245,239,251,0.92))] shadow-[0_20px_44px_-34px_rgba(100,78,129,0.28)]"
      : "border-[#e9dcc9]/90 bg-[linear-gradient(180deg,rgba(255,253,249,0.96),rgba(250,244,236,0.9))] shadow-[0_20px_44px_-34px_rgba(111,90,68,0.18)]";

  return (
    <section className={`rounded-[1.8rem] border p-5 sm:p-6 ${palette}`}>
      <p className="text-[11px] tracking-[0.18em] text-[#8a7b68]">{eyebrow}</p>
      <h3 className="mt-2 text-[1.1rem] font-medium text-[#2f2a27] sm:text-[1.22rem]">{title}</h3>
      <div className="mt-4 space-y-3 text-[0.98rem] leading-8 text-[#4f473d]">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

function ResultView({ result }: { result: KataomoiReading }) {
  return (
    <div className="space-y-6">
      {/* カード情報ヘッダー */}
      <section className="overflow-hidden rounded-[2rem] border border-[#e9dcc9]/90 bg-[linear-gradient(145deg,rgba(255,252,248,0.98),rgba(247,241,233,0.92))] shadow-[0_30px_70px_-46px_rgba(109,89,67,0.3)]">
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
          <div className="w-[140px] shrink-0 sm:w-[160px]">
            <LightTarotDisplay
              imagePath={result.cardImagePath}
              alt={`${result.cardName}のタロットカード`}
              isReversed={result.isReversed}
              className="rounded-[1.8rem] p-2"
              artworkClassName="rounded-[1.5rem]"
              sizes="160px"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-[#f4ecdf] px-3 py-1 text-[11px] tracking-[0.12em] text-[#796a57]">
                KATAOMOI READING
              </span>
              <span className="rounded-full bg-[#f1ebf8] px-3 py-1 text-[11px] text-[#756683]">
                {result.isReversed ? "逆位置" : "正位置"}
              </span>
            </div>
            <h2 className="mt-4 text-[1.5rem] leading-tight text-[#2f2a27] sm:text-[1.8rem]">{result.cardName}</h2>
            <p className="mt-3 text-[0.95rem] leading-8 text-[#5b5348]">{result.cardMeaning}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <SummaryChip label="恋の進み方" value={result.progressLabel} />
              <SummaryChip label="動きやすい時期" value={result.timingShort} />
              <SummaryChip label="今の鍵" value={result.keyAction} />
            </div>
          </div>
        </div>
      </section>

      {/* あなたの質問 */}
      <section className="rounded-[1.8rem] border border-[#e6d9c7]/90 bg-white/78 p-5 shadow-[0_20px_44px_-34px_rgba(111,90,68,0.2)] sm:p-6">
        <p className="text-[11px] tracking-[0.18em] text-[#8a7b68]">QUESTION</p>
        <p className="mt-3 rounded-[1.2rem] bg-[#fbf7f0] px-4 py-4 text-[0.95rem] leading-8 text-[#51483e]">{result.question}</p>
      </section>

      {/* この恋の現在地 */}
      <ResultSection eyebrow="OVERVIEW" title="この恋の現在地" paragraphs={splitParagraphs(result.intro)} />

      {/* 恋の流れ & 相手の気持ち */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ResultSection eyebrow="STATUS" title="恋の流れ" paragraphs={splitParagraphs(result.status)} />
        <ResultSection eyebrow="FEELING" title="相手の気持ち" paragraphs={splitParagraphs(result.partnerFeeling)} />
      </div>

      {/* タイミング */}
      <section className="rounded-[1.8rem] border border-[#eee2cf] bg-[#fffdfa] p-5 shadow-[0_20px_44px_-34px_rgba(111,90,68,0.15)] sm:p-6">
        <p className="text-[11px] tracking-[0.14em] text-[#8a7b68]">TIMING</p>
        <h3 className="mt-2 text-[1.1rem] font-medium text-[#2f2a27]">タイミング</h3>
        <p className="mt-3 text-[0.95rem] leading-8 text-[#4f473d]">{result.timing}</p>
      </section>

      {/* これからの動き & 今のアドバイス */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ResultSection eyebrow="FUTURE" title="これからの動き" accent="violet" paragraphs={splitParagraphs(result.future)} />
        <ResultSection eyebrow="GUIDE" title="今のアドバイス" paragraphs={splitParagraphs(result.advice)} />
      </div>

      {/* ルミナメッセージ */}
      <section className="rounded-[1.8rem] border border-[#e6daef] bg-[linear-gradient(180deg,rgba(252,248,255,0.96),rgba(245,239,251,0.92))] p-5 shadow-[0_20px_44px_-34px_rgba(100,78,129,0.2)] sm:p-6">
        <p className="text-[11px] tracking-[0.14em] text-[#7b6c8c]">LUMINA MESSAGE</p>
        <h3 className="mt-2 text-[1.1rem] font-medium text-[#2f2a27]">ルミナからのメッセージ</h3>
        <p className="mt-3 text-[0.95rem] leading-8 text-[#534861]">{result.message}</p>
      </section>
    </div>
  );
}

export default function KataomoiClient() {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const templateResult = useMemo(() => {
    if (!submittedQuestion) return null;
    try {
      return getKataomoiReading(submittedQuestion);
    } catch {
      return null;
    }
  }, [submittedQuestion]);

  const { reading: result, isEnhancing } = useClaudeReading<KataomoiReading>({
    feature: "kataomoi",
    templateReading: templateResult,
    context: submittedQuestion,
    interpretationFrame: templateResult?.interpretationFrame,
  });

  useEffect(() => {
    if (templateResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [templateResult]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuestion = question.trim();
    if (!nextQuestion) {
      setErrorMessage("知りたいことを書いてから、カードを開いてください。");
      return;
    }
    setErrorMessage("");
    setSubmittedQuestion(nextQuestion);
  };

  return (
    <PageShell
      maxWidth="content"
      title="片思い占い"
      description="片思いの行方、相手の気持ち、動き出すタイミングを、ルミナの言葉とタロットで静かに読み解きます。"
      backHref="/"
      backLabel="トップへ戻る"
      className="font-serif"
    >
      <div className="mb-5 overflow-hidden rounded-[2rem] border border-[#e6dac8]/80 bg-[linear-gradient(140deg,rgba(255,251,246,0.82),rgba(248,241,232,0.7))] shadow-[0_26px_56px_-40px_rgba(104,86,66,0.28)]">
        <Image src="/gazou/kataomoi.png" alt="片思い占いのイメージ" width={1050} height={500} className="w-full" priority />
      </div>
      <div className="mb-5 overflow-hidden rounded-[2rem] border border-[#e6dac8]/80 bg-[linear-gradient(140deg,rgba(255,251,246,0.9),rgba(248,241,232,0.82))] shadow-[0_26px_56px_-40px_rgba(104,86,66,0.3)]">
        <div className="relative px-6 py-7 sm:px-8 sm:py-9">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(243,231,202,0.42),transparent_32%),linear-gradient(180deg,rgba(255,251,246,0.78),rgba(246,240,234,0.38))]" />
          <div className="relative">
            <p className="text-xs tracking-[0.22em] text-[#8b7e6c]">KATAOMOI TAROT</p>
            <h2 className="mt-3 text-[1.9rem] leading-tight text-[#2f2a27] sm:text-[2.35rem]">片思いの心を、<br />やさしく見つめるために。</h2>
            <div className="mt-5 max-w-[38rem] space-y-4 text-[0.98rem] leading-8 text-[#544c42]">
              <p>この恋はどう進むのか。言葉にできない想いほど、胸の中で大きくなりやすいものです。</p>
              <p>ルミナの導きとタロットを通して、相手の気持ちや恋の流れ、次の一歩を静かに読み解いていきます。</p>
            </div>
          </div>
        </div>
      </div>
      <GlassCard className="rounded-[2rem] p-5 sm:p-6">
        <div className="rounded-[1.7rem] border border-[#eadfce]/80 bg-[linear-gradient(180deg,rgba(255,252,248,0.96),rgba(250,244,235,0.85))] p-5 shadow-[0_22px_44px_-34px_rgba(112,90,67,0.2)]">
          <p className="text-xs tracking-[0.14em] text-[#8b7e6c]">このページで見えること</p>
          <p className="mt-3 text-base leading-8 text-[#4f473d]">片思いの可能性、相手の気持ち、動き出すタイミング、今のあなたに必要な言葉を読み解きます。</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-5">
          <label htmlFor="kataomoi-question" className="block text-sm font-medium text-[#3b352f]">恋について知りたいこと</label>
          <textarea id="kataomoi-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="例: この恋は進展しますか？" rows={5} className="lumina-input mt-3 w-full rounded-[1.3rem] px-4 py-4 text-base leading-7" />
          <div className="mt-4">
            <p className="text-sm font-medium text-[#5b5348]">こんなことが聞けます</p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {KATAOMOI_QUESTION_CHIPS.map((chip) => (
                <button key={chip} type="button" onClick={() => setQuestion(chip)} className="rounded-full border border-[#e6d8bf] bg-[linear-gradient(160deg,rgba(255,252,246,0.96),rgba(246,238,225,0.92))] px-4 py-2.5 text-left text-sm leading-6 text-[#5f564a] shadow-[0_12px_28px_-24px_rgba(116,94,70,0.32)] transition hover:border-[#d9c8a8] hover:bg-[#fffaf2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cbb9d8]">
                  {chip}
                </button>
              ))}
            </div>
          </div>
          {errorMessage ? <p className="mt-4 text-sm text-[#936565]">{errorMessage}</p> : null}
          <LuminaButton type="submit" className="mt-5 w-full rounded-[1rem] py-3 text-base sm:w-auto sm:px-8">片思いの流れを見る</LuminaButton>
        </form>
      </GlassCard>
      <div ref={resultRef} />
      <GlassCard className="mt-5 rounded-[2rem] p-5 sm:p-6">
        {result ? (
          <ResultView result={result} />
        ) : isEnhancing ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.8rem] border border-[#e9dcc9]/60 bg-[linear-gradient(180deg,rgba(255,252,248,0.9),rgba(249,244,236,0.8))] px-6 py-10 text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#d4c5a9] border-t-transparent" />
            <p className="text-sm tracking-[0.14em] text-[#8b7e6c] animate-pulse">ルミナが言葉を紡いでいます…</p>
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col justify-center rounded-[1.8rem] border border-dashed border-[#e4d9c7] bg-[linear-gradient(180deg,rgba(255,252,248,0.82),rgba(249,244,236,0.68))] px-6 py-10 text-center">
            <p className="text-sm tracking-[0.16em] text-[#8b7e6c]">RESULT</p>
            <h2 className="mt-3 text-[1.4rem] text-[#2f2a27]">カードが恋の流れを映し出します</h2>
            <p className="mt-4 text-sm leading-7 text-[#5c5448]">質問を書いてカードを開くと、<br />相手の気持ちや恋の流れを表示します。</p>
          </div>
        )}
      </GlassCard>
    </PageShell>
  );
}
