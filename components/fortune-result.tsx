"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { FortuneTemplate } from "@/lib/fortune/types";

type Props = {
  template: FortuneTemplate;
  pageTitle: string;
  variantLabel: string;
  topLinkHref?: string;
  topLinkLabel?: string;
  resetHref: string;
  resetLabel?: string;
  storageKeysToClear?: string[];
  halfYearSectionTitle?: string;
  firstHalfTitle?: string;
  secondHalfTitle?: string;
};

export default function FortuneResult({
  template,
  pageTitle,
  variantLabel,
  topLinkHref = "/",
  topLinkLabel = "トップへ戻る",
  resetHref,
  resetLabel = "別の生年月日で占い直す",
  storageKeysToClear = [],
  halfYearSectionTitle = "⏳ 上半期・下半期",
  firstHalfTitle = "上半期",
  secondHalfTitle = "下半期",
}: Props) {
  const router = useRouter();

  const handleReset = () => {
    if (typeof window !== "undefined") {
      for (const key of storageKeysToClear) {
        localStorage.removeItem(key);
      }
    }
    router.push(resetHref);
  };

  return (
    <main className="lumina-page min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="lumina-shell mx-auto max-w-4xl rounded-3xl p-5 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={topLinkHref} className="lumina-link text-sm underline-offset-4 hover:underline">
            {topLinkLabel}
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn--secondary w-full sm:w-auto"
          >
            {resetLabel}
          </button>
        </div>

        <header className="lumina-header-panel rounded-2xl p-5">
          <p className="lumina-kicker text-xs font-semibold">{variantLabel}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{pageTitle}</h1>
        </header>

        <div className="mt-8 space-y-8">
          <section className="lumina-card rounded-2xl p-5">
            <SectionHeading>🕊 導入</SectionHeading>
            <h2 className="mt-3 text-lg font-semibold text-slate-900 sm:text-xl">{template.introTitle}</h2>
            <div className="mt-3">
              <MarkdownText text={template.introBody} />
            </div>
          </section>

          <section className="rounded-2xl border border-[#d7c894]/70 bg-gradient-to-br from-white/85 via-[#f7f4e8]/70 to-[#eef4ef]/70 p-5 shadow-sm sm:p-6">
            <SectionHeading>🌟 全体テーマ</SectionHeading>
            <p className="mt-4 text-xl font-bold leading-relaxed text-slate-900 sm:text-2xl">{template.themeCatch}</p>
          </section>

          <section className="lumina-card rounded-2xl p-5">
            <SectionHeading>{halfYearSectionTitle}</SectionHeading>
            <TwoColumnGrid className="mt-4">
              <InfoCard title={firstHalfTitle}>
                <MarkdownText text={template.firstHalf} />
              </InfoCard>
              <InfoCard title={secondHalfTitle}>
                <MarkdownText text={template.secondHalf} />
              </InfoCard>
            </TwoColumnGrid>
          </section>

          <section className="lumina-card rounded-2xl p-5">
            <SectionHeading>💗 恋愛運</SectionHeading>
            <TwoColumnGrid className="mt-4">
              <InfoCard title="シングル" description="出会い・進展・心の整え方のヒント">
                <MarkdownText text={template.loveSingle} />
              </InfoCard>
              <InfoCard title="パートナーあり" description="関係を育てる対話と行動のヒント">
                <MarkdownText text={template.lovePartner} />
              </InfoCard>
            </TwoColumnGrid>
          </section>

          <TextSection title="💼 仕事・学業運" body={template.work} />
          <TextSection title="🤝 人間関係" body={template.relations} />

          <section className="rounded-2xl border border-emerald-200/70 bg-emerald-50/45 p-5">
            <SectionHeading>🍀 開運パート</SectionHeading>

            <div className="mt-4 rounded-xl border border-emerald-100/80 bg-white/80 p-4">
              <h3 className="text-sm font-semibold text-emerald-900">■ 開運アクション</h3>
              <ul className="mt-3 space-y-3">
                {template.actions.slice(0, 3).map((action, index) => (
                  <li
                    key={`${template.fortuneNumber}-action-${index + 1}`}
                    className="rounded-lg border border-emerald-100/80 bg-emerald-50/35 px-4 py-3"
                  >
                    <p className="text-xs font-semibold tracking-wide text-emerald-800">
                      {index === 0 ? "・色" : index === 1 ? "・習慣" : "・小さな挑戦"}
                    </p>
                    <div className="mt-1">
                      <MarkdownText text={action} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-100/80 bg-white/80 p-4">
              <h3 className="text-sm font-semibold text-emerald-900">■ 開運場所</h3>
              <ul className="mt-3 space-y-2">
                {template.powerSpots.slice(0, 3).map((spot, index) => (
                  <li
                    key={`${template.fortuneNumber}-spot-${index + 1}`}
                    className="rounded-lg border border-emerald-100/80 bg-emerald-50/35 px-4 py-3"
                  >
                    <p className="text-xs font-semibold tracking-wide text-emerald-800">・場所{index + 1}</p>
                    <div className="mt-1">
                      <MarkdownText text={spot} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="lumina-card rounded-2xl p-5">
            <SectionHeading>🔑 キーワード</SectionHeading>
            <div className="mt-4 flex flex-wrap gap-2">
              {template.keywords.slice(0, 3).map((keyword, index) => (
                <span
                  key={`${template.fortuneNumber}-keyword-${index + 1}`}
                  className="rounded-full border border-[#d7c894]/70 bg-[#f8f5e8]/80 px-4 py-1.5 text-sm font-medium text-slate-900"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-rose-200/70 bg-rose-50/40 p-5">
            <SectionHeading>✨ ルミナからの祝福</SectionHeading>
            <div className="mt-4 rounded-xl border border-rose-100/80 bg-white/80 p-4">
              <MarkdownText text={template.blessing} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-semibold tracking-wide text-slate-800">{children}</h2>;
}

function TextSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="lumina-card rounded-2xl p-5">
      <SectionHeading>{title}</SectionHeading>
      <div className="mt-4">
        <MarkdownText text={body} />
      </div>
    </section>
  );
}

function TwoColumnGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`grid gap-4 md:grid-cols-2 ${className}`.trim()}>{children}</div>;
}

function InfoCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/75 p-4">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {description ? <p className="mt-1 text-xs leading-relaxed text-slate-600/85">{description}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function MarkdownText({ text }: { text: string }) {
  const blocks = parseMarkdownLikeBlocks(text);

  return (
    <div className="space-y-3 leading-relaxed text-slate-900/90">
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="whitespace-pre-wrap">
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

type MarkdownBlock = { type: "paragraph"; text: string } | { type: "list"; items: string[] };

function parseMarkdownLikeBlocks(text: string): MarkdownBlock[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join("\n") });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list.length > 0) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);

    if (bulletMatch) {
      flushParagraph();
      list.push(bulletMatch[1]);
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      flushList();
      continue;
    }

    flushList();
    paragraph.push(rawLine);
  }

  flushParagraph();
  flushList();

  return blocks;
}
