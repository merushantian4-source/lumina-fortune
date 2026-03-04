"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { FortuneTemplate } from "@/lib/fortune/types";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton, LuminaLinkButton } from "@/components/ui/button";

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
  bottomLinkHref?: string;
  bottomLinkLabel?: string;
};

export default function FortuneResult({
  template,
  pageTitle,
  topLinkHref = "/",
  topLinkLabel = "トップへ戻る",
  resetHref,
  resetLabel = "別の生年月日で占い直す",
  storageKeysToClear = [],
  halfYearSectionTitle = "⏳ 上半期・下半期",
  firstHalfTitle = "上半期",
  secondHalfTitle = "下半期",
  bottomLinkHref,
  bottomLinkLabel,
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
    <PageShell
      maxWidth="content"
      title={pageTitle}
      backHref={topLinkHref}
      backLabel={topLinkLabel}
      headerRight={
        <LuminaButton type="button" onClick={handleReset} tone="secondary" className="w-full sm:w-auto">
          {resetLabel}
        </LuminaButton>
      }
    >
      <GlassCard>
        <div className="space-y-6 sm:space-y-7">
          <GlassCard className="border-[#ddd0b8]/75 bg-[linear-gradient(160deg,rgba(255,252,246,0.95),rgba(248,242,231,0.88))] p-5 shadow-[0_14px_30px_-24px_rgba(82,69,53,0.32)]">
            <SectionHeading>🕊 はじめに</SectionHeading>
            <h2 className="mt-3 text-lg font-medium text-[#2e2a26] sm:text-xl">{template.introTitle}</h2>
            <div className="mt-3">
              <MarkdownText text={stripDuplicateLeadingHeading(template.introBody, "はじめに")} />
            </div>
          </GlassCard>

          <section className="rounded-2xl border border-[#dcc99f]/65 bg-[linear-gradient(145deg,rgba(255,252,245,0.9),rgba(247,240,226,0.86),rgba(236,245,238,0.74))] p-5 shadow-[0_12px_26px_-24px_rgba(82,69,53,0.42)] sm:p-6">
            <SectionHeading>🌟 全体テーマ</SectionHeading>
            <p className="mt-4 text-xl font-medium leading-relaxed text-[#2e2a26] sm:text-2xl">{template.themeCatch}</p>
          </section>

          <GlassCard className="p-5">
            <SectionHeading>{halfYearSectionTitle}</SectionHeading>
            <TwoColumnGrid className="mt-4">
              <InfoCardMarkdown title={firstHalfTitle} text={template.firstHalf} />
              <InfoCardMarkdown title={secondHalfTitle} text={template.secondHalf} />
            </TwoColumnGrid>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeading>💗 恋愛運</SectionHeading>
            <TwoColumnGrid className="mt-4">
              <InfoCard title="シングル" description="出会い・進展・心の整え方のヒント">
                <MarkdownText text={stripDuplicateLoveLead(template.loveSingle, "シングル")} />
              </InfoCard>
              <InfoCard title="パートナーあり" description="関係を育てる対話と行動のヒント">
                <MarkdownText text={stripDuplicateLoveLead(template.lovePartner, "パートナーあり")} />
              </InfoCard>
            </TwoColumnGrid>
          </GlassCard>

          <TextSection title="💼 仕事・学業運" body={template.work} />
          <TextSection title="🤝 人間関係" body={template.relations} />

          <section className="rounded-2xl border border-emerald-200/85 bg-[linear-gradient(160deg,rgba(244,252,247,0.8),rgba(232,246,238,0.74))] p-5 shadow-[0_12px_24px_-24px_rgba(16,102,71,0.38)]">
            <SectionHeading>🍀 開運パート</SectionHeading>

            <div className="mt-4 rounded-xl border border-emerald-100/90 bg-white/88 p-4">
              <h3 className="text-sm font-semibold tracking-wide text-emerald-900">■ 開運アクション</h3>
              <ul className="mt-3 space-y-3">
                {template.actions.slice(0, 3).map((action, index) => (
                  <li
                    key={`${template.fortuneNumber}-action-${index + 1}`}
                    className="rounded-lg border border-emerald-100/85 bg-[linear-gradient(165deg,rgba(248,255,251,0.88),rgba(236,249,241,0.72))] px-4 py-3"
                  >
                    <div>
                      <MarkdownText text={action} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-100/90 bg-white/88 p-4">
              <h3 className="text-sm font-semibold tracking-wide text-emerald-900">■ 開運場所</h3>
              <ul className="mt-3 space-y-2">
                {template.powerSpots.slice(0, 3).map((spot, index) => (
                  <li
                    key={`${template.fortuneNumber}-spot-${index + 1}`}
                    className="rounded-lg border border-emerald-100/85 bg-[linear-gradient(165deg,rgba(248,255,251,0.88),rgba(236,249,241,0.72))] px-4 py-3"
                  >
                    <div>
                      <MarkdownText text={spot} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <GlassCard className="p-5">
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
          </GlassCard>

          <section className="rounded-2xl border border-rose-200/80 bg-[linear-gradient(155deg,rgba(255,249,251,0.82),rgba(254,240,245,0.72))] p-5 shadow-[0_12px_24px_-24px_rgba(163,77,106,0.35)]">
            <SectionHeading>✨ ルミナからの祝福</SectionHeading>
            <div className="mt-4 rounded-xl border border-rose-100/80 bg-white/80 p-4">
              <MarkdownText text={template.blessing} />
            </div>
          </section>

          {bottomLinkHref && bottomLinkLabel ? (
            <section className="flex justify-center pt-2">
              <LuminaLinkButton href={bottomLinkHref} tone="secondary" className="min-w-[220px]">
                {bottomLinkLabel}
              </LuminaLinkButton>
            </section>
          ) : null}
        </div>
      </GlassCard>
    </PageShell>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-semibold tracking-wide text-[#2e2a26]">{children}</h2>;
}

function TextSection({ title, body }: { title: string; body: string }) {
  return (
    <GlassCard className="p-5">
      <SectionHeading>{title}</SectionHeading>
      <div className="mt-4">
        <MarkdownText text={body} />
      </div>
    </GlassCard>
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
    <div className="rounded-xl border border-[#e1d5bf]/76 bg-[linear-gradient(165deg,rgba(255,254,250,0.88),rgba(250,245,235,0.72))] p-4 shadow-[0_10px_20px_-24px_rgba(82,69,53,0.5)]">
      <h3 className="text-sm font-semibold text-[#2e2a26]">{title}</h3>
      {description ? <p className="mt-1 text-xs leading-relaxed text-[#544c42]">{description}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function stripDuplicateLeadingHeading(text: string, title: string): string {
  const normalizedTitle = title.trim();
  if (!normalizedTitle) return text;

  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const firstNonEmptyIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstNonEmptyIndex < 0) return text;

  if (lines[firstNonEmptyIndex].trim() !== normalizedTitle) return text;
  lines.splice(firstNonEmptyIndex, 1);
  return lines.join("\n").replace(/^\n+/, "");
}

function stripDuplicateLoveLead(text: string, title: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const firstNonEmptyIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstNonEmptyIndex < 0) return text;

  const first = lines[firstNonEmptyIndex].trim();
  const normalized = first.replace(/\s+/g, "");
  const isSingleLead = /^シングル[:：]?$/.test(normalized) || first === "シングルの方へ";
  const isPartnerLead = /^パートナーあり[:：]?$/.test(normalized) || first === "パートナーがいる方へ";
  const isDuplicate =
    first === title.trim() ||
    (title.trim() === "シングル" && isSingleLead) ||
    (title.trim() === "パートナーあり" && isPartnerLead);

  if (!isDuplicate) return text;
  lines.splice(firstNonEmptyIndex, 1);
  return lines.join("\n").replace(/^\n+/, "");
}

function MarkdownText({ text }: { text: string }) {
  const blocks = parseMarkdownLikeBlocks(text);

  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-[#544c42]">
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

function InfoCardMarkdown({
  title,
  description,
  text,
}: {
  title: string;
  description?: string;
  text: string;
}) {
  return (
    <InfoCard title={title} description={description}>
      <MarkdownText text={stripDuplicateLeadingHeading(text, title)} />
    </InfoCard>
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
