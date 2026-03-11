"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import UnmeiVisual from "@/components/unmei/UnmeiVisual";
import { LuminaButton, LuminaLinkButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";
import { fortuneNumberNames } from "@/lib/fortune/names";
import type { DailyFlowLevel, DailyNumberFortune, FortuneNumber, FortuneTemplate } from "@/lib/fortune/types";

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
  previousLinkHref?: string;
  previousLinkLabel?: string;
  nextLinkHref?: string;
  nextLinkLabel?: string;
  dailyFortunes?: DailyNumberFortune[];
  dailySectionTitle?: string;
};

type DailyListEntry = DailyNumberFortune & {
  dayOfMonth: number;
  isToday: boolean;
};

const FLOW_LEVEL_META: Record<
  DailyFlowLevel,
  { icon: string; label: string; meaning: string; stars: string }
> = {
  5: { icon: "☀", label: "光が満ちる", meaning: "かなり追い風", stars: "★★★★★" },
  4: { icon: "✨", label: "光が差す", meaning: "良い流れ", stars: "★★★★☆" },
  3: { icon: "⭐", label: "やわらかな光", meaning: "安定", stars: "★★★☆☆" },
  2: { icon: "🌙", label: "静かな調整", meaning: "少し停滞", stars: "★★☆☆☆" },
  1: { icon: "☁", label: "霧の時間", meaning: "慎重", stars: "★☆☆☆☆" },
};

export default function FortuneResult({
  template,
  pageTitle,
  variantLabel,
  topLinkHref = "/",
  topLinkLabel = "トップへ戻る",
  resetHref,
  resetLabel = "入力を編集する",
  storageKeysToClear = [],
  halfYearSectionTitle = "上半期・下半期の流れ",
  firstHalfTitle = "上半期",
  secondHalfTitle = "下半期",
  bottomLinkHref,
  bottomLinkLabel,
  previousLinkHref,
  previousLinkLabel,
  nextLinkHref,
  nextLinkLabel,
  dailyFortunes = [],
  dailySectionTitle = "今月の日別の流れ",
}: Props) {
  const router = useRouter();
  const [openDailyDate, setOpenDailyDate] = useState<string | null>(null);

  const dailySections = useMemo(() => splitDailyFortunes(dailyFortunes), [dailyFortunes]);
  const monthlyHighlights = useMemo(
    () => (variantLabel === "NUMEROLOGY MONTHLY" ? buildMonthlyHighlightGroups(dailyFortunes) : null),
    [dailyFortunes, variantLabel]
  );
  const openDailyFortune = useMemo(
    () => dailyFortunes.find((fortune) => fortune.date === openDailyDate) ?? null,
    [dailyFortunes, openDailyDate]
  );

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
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <LuminaButton asChild tone="secondary" className="w-full sm:w-auto">
            <Link href="/profile">プロフィールを見る</Link>
          </LuminaButton>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center rounded-full border border-[#d9c8a3] bg-white/75 px-4 py-2 text-sm font-medium text-[#5b5249] transition hover:bg-white"
          >
            {resetLabel}
          </button>
        </div>
      }
    >
      {variantLabel === "NUMEROLOGY 2026" ? (
        <div className="mb-4">
          <UnmeiVisual
            number={template.fortuneNumber}
            variant="hero"
            title={`${fortuneNumberNames[template.fortuneNumber as FortuneNumber]}の2026年運勢`}
            subtitle="一年の流れを、やさしく見渡すための光の案内"
            priority
          />
        </div>
      ) : null}

      <GlassCard>
        <div className="space-y-6 sm:space-y-7">
          <GlassCard className="border-[#ddd0b8]/75 bg-[linear-gradient(160deg,rgba(255,252,246,0.95),rgba(248,242,231,0.88))] p-5 shadow-[0_14px_30px_-24px_rgba(82,69,53,0.32)]">
            <SectionHeading>はじめに</SectionHeading>
            <h2 className="mt-3 text-lg font-medium text-[#2e2a26] sm:text-xl">{template.introTitle}</h2>
            <div className="mt-3">
              <MarkdownText text={stripDuplicateLeadingHeading(template.introBody, "はじめに")} />
            </div>
          </GlassCard>

          <section className="rounded-2xl border border-[#dcc99f]/65 bg-[linear-gradient(145deg,rgba(255,252,245,0.9),rgba(247,240,226,0.86),rgba(236,245,238,0.74))] p-5 shadow-[0_12px_26px_-24px_rgba(82,69,53,0.42)] sm:p-6">
            <SectionHeading>今月のテーマ</SectionHeading>
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
            <SectionHeading>恋愛の流れ</SectionHeading>
            <TwoColumnGrid className="mt-4">
              <InfoCard title="シングル" description="出会いと心の動きへのヒント">
                <MarkdownText text={stripDuplicateLoveLead(template.loveSingle, "シングル")} />
              </InfoCard>
              <InfoCard title="パートナーあり" description="関係を深めるためのヒント">
                <MarkdownText text={stripDuplicateLoveLead(template.lovePartner, "パートナーあり")} />
              </InfoCard>
            </TwoColumnGrid>
          </GlassCard>

          <TextSection title="仕事・学び" body={template.work} />
          <TextSection title="対人・人間関係" body={template.relations} />

          <section className="rounded-2xl border border-emerald-200/85 bg-[linear-gradient(160deg,rgba(244,252,247,0.8),rgba(232,246,238,0.74))] p-5 shadow-[0_12px_24px_-24px_rgba(16,102,71,0.38)]">
            <SectionHeading>今月のヒント</SectionHeading>

            <div className="mt-4 rounded-xl border border-emerald-100/90 bg-white/88 p-4">
              <h3 className="text-sm font-semibold tracking-wide text-emerald-900">おすすめアクション</h3>
              <ul className="mt-3 space-y-3">
                {template.actions.slice(0, 3).map((action, index) => (
                  <li
                    key={`${template.fortuneNumber}-action-${index + 1}`}
                    className="rounded-lg border border-emerald-100/85 bg-[linear-gradient(165deg,rgba(248,255,251,0.88),rgba(236,249,241,0.72))] px-4 py-3"
                  >
                    <MarkdownText text={action} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-100/90 bg-white/88 p-4">
              <h3 className="text-sm font-semibold tracking-wide text-emerald-900">おすすめの場所</h3>
              <ul className="mt-3 space-y-2">
                {template.powerSpots.slice(0, 3).map((spot, index) => (
                  <li
                    key={`${template.fortuneNumber}-spot-${index + 1}`}
                    className="rounded-lg border border-emerald-100/85 bg-[linear-gradient(165deg,rgba(248,255,251,0.88),rgba(236,249,241,0.72))] px-4 py-3"
                  >
                    <MarkdownText text={spot} />
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <GlassCard className="p-5">
            <SectionHeading>キーワード</SectionHeading>
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
            <SectionHeading>ルミナからの祝福</SectionHeading>
            <div className="mt-4 rounded-xl border border-rose-100/80 bg-white/80 p-4">
              <MarkdownText text={template.blessing} />
            </div>
          </section>

          {template.luminaMessage ? (
            <section className="rounded-2xl border border-[#d9c8a3]/80 bg-[linear-gradient(155deg,rgba(255,251,243,0.9),rgba(250,242,225,0.78))] p-5 shadow-[0_12px_24px_-24px_rgba(117,88,43,0.32)]">
              <SectionHeading>ルミナからのひとこと</SectionHeading>
              <div className="mt-4 rounded-xl border border-[#eadfc7]/80 bg-white/80 p-4">
                <MarkdownText text={template.luminaMessage} />
              </div>
            </section>
          ) : null}

          {dailyFortunes.length > 0 ? (
            <section className="rounded-2xl border border-sky-200/80 bg-[linear-gradient(160deg,rgba(244,250,255,0.88),rgba(234,244,251,0.76),rgba(244,249,246,0.72))] p-5 shadow-[0_12px_24px_-24px_rgba(74,107,142,0.28)]">
              <SectionHeading>{dailySectionTitle}</SectionHeading>
              <p className="mt-2 text-sm leading-relaxed text-[#5b5a57]">
                日付と光の強さを見比べながら、今月の軽さや整えどころをすぐ追える一覧です。
              </p>

              {monthlyHighlights ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <MonthlyHighlightCard
                    title="今月の光が強い3日"
                    description="この日は動くほど流れに乗りやすそうです。"
                    entries={monthlyHighlights.brightDays}
                    tone="bright"
                    openDailyDate={openDailyDate}
                    onToggle={setOpenDailyDate}
                  />
                  <MonthlyHighlightCard
                    title="今月の静かに過ごしたい3日"
                    description="この日は答えを急がず、整える意識が助けになります。"
                    entries={monthlyHighlights.quietDays}
                    tone="quiet"
                    openDailyDate={openDailyDate}
                    onToggle={setOpenDailyDate}
                  />
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <DailyFlowColumn
                  title="前半"
                  entries={dailySections.firstHalf}
                  openDailyDate={openDailyDate}
                  onToggle={setOpenDailyDate}
                />
                <DailyFlowColumn
                  title="後半"
                  entries={dailySections.secondHalf}
                  openDailyDate={openDailyDate}
                  onToggle={setOpenDailyDate}
                />
              </div>

              {openDailyFortune ? (
                <div className="mt-5 rounded-[1.5rem] border border-[#ead9c7] bg-[#fffaf4] p-5 shadow-[0_18px_36px_-28px_rgba(122,96,70,0.35)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold tracking-[0.08em] text-[#8b6b49]">
                        {formatDailyFortuneLabel(openDailyFortune.date)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-2xl">{FLOW_LEVEL_META[openDailyFortune.flowLevel].icon}</span>
                        <h3 className="text-lg font-semibold text-[#2e2a26]">{openDailyFortune.title}</h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenDailyDate(null)}
                      className="rounded-full border border-[#e5d2bb] bg-white/70 px-3 py-1 text-xs font-medium text-[#8b6b49] transition hover:bg-white"
                    >
                      閉じる
                    </button>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-[#ead9c7] pt-4">
                    <DailyFortuneBlock label="今日の流れ" text={openDailyFortune.summary} />
                    <DailyFortuneBlock label="行動のヒント" text={openDailyFortune.action} />
                    {openDailyFortune.emotion ? (
                      <DailyFortuneBlock label="感情の整え方" text={openDailyFortune.emotion} />
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {variantLabel === "NUMEROLOGY 2026" ? (
            <section className="rounded-[1.45rem] border border-[#d8cde7] bg-[#f6f1fb] px-5 py-5 shadow-[0_18px_38px_-28px_rgba(95,79,128,0.24)]">
              <p className="text-sm font-medium text-[#5e5246]">もっと深く知りたいときは、こちらへ</p>
              <p className="mt-1 text-xs leading-relaxed text-[#7a6d60]">
                一年の運勢をさらに詳しく読み解きたいときは、個人鑑定の案内も用意しています。
              </p>
              <div className="mt-3">
                <Link
                  href="/consultation"
                  className="inline-flex items-center rounded-full border border-[#cfc2e2] bg-[linear-gradient(160deg,#ffffff,#f2eafb)] px-4 py-2 text-sm font-medium text-[#5f5472] shadow-[0_10px_24px_-20px_rgba(95,79,128,0.28)] transition hover:border-[#bdaed7] hover:bg-[#f8f2ff] hover:text-[#4f4660]"
                >
                  個人鑑定を見る
                </Link>
              </div>
            </section>
          ) : null}

          {bottomLinkHref && bottomLinkLabel ? (
            <section className="pt-2">
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:items-stretch">
                {previousLinkHref && previousLinkLabel ? (
                  <LuminaLinkButton href={previousLinkHref} tone="secondary" className="min-w-[180px]">
                    {previousLinkLabel}
                  </LuminaLinkButton>
                ) : (
                  <div className="hidden min-w-[180px] sm:block" aria-hidden="true" />
                )}
                <LuminaLinkButton href={bottomLinkHref} tone="secondary" className="min-w-[220px]">
                  {bottomLinkLabel}
                </LuminaLinkButton>
                {nextLinkHref && nextLinkLabel ? (
                  <LuminaLinkButton href={nextLinkHref} tone="secondary" className="min-w-[180px]">
                    {nextLinkLabel}
                  </LuminaLinkButton>
                ) : (
                  <div className="hidden min-w-[180px] sm:block" aria-hidden="true" />
                )}
              </div>
            </section>
          ) : null}
        </div>
      </GlassCard>
    </PageShell>
  );
}

function DailyFlowColumn({
  title,
  entries,
  openDailyDate,
  onToggle,
}: {
  title: string;
  entries: DailyListEntry[];
  openDailyDate: string | null;
  onToggle: (date: string | null | ((current: string | null) => string | null)) => void;
}) {
  return (
    <div className="rounded-[1.35rem] border border-[#ead9c7] bg-[#fffaf4] p-4 shadow-[0_14px_28px_-26px_rgba(122,96,70,0.32)]">
      <p className="text-sm font-semibold tracking-[0.16em] text-[#8b6b49]">{title}</p>
      <div className="mt-3 space-y-1.5">
        {entries.map((entry) => {
          const meta = FLOW_LEVEL_META[entry.flowLevel];
          const isOpen = openDailyDate === entry.date;

          return (
            <button
              key={entry.date}
              type="button"
              onClick={() => onToggle((current) => (current === entry.date ? null : entry.date))}
              className={`flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left transition ${
                entry.isToday
                  ? "border border-[#e4c394] bg-[linear-gradient(135deg,rgba(255,246,228,0.95),rgba(255,250,244,0.96))] shadow-[0_16px_28px_-24px_rgba(210,164,92,0.45)]"
                  : "border border-transparent bg-[rgba(255,255,255,0.42)] hover:bg-[rgba(255,255,255,0.72)]"
              } ${isOpen ? "ring-1 ring-inset ring-[#d8b889]" : ""}`}
            >
              <span className="w-[52px] shrink-0 text-[13px] font-semibold leading-5 text-[#2e2a26]">
                {entry.isToday ? "▶ " : ""}
                {formatDailyFortuneCompactLabel(entry.date)}
              </span>
              <span
                className="w-6 shrink-0 text-center text-lg leading-5"
                title={`${meta.stars} | ${meta.label} | ${meta.meaning}`}
                aria-label={`${meta.label} ${meta.meaning}`}
              >
                {meta.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] leading-[1.35] text-[#4b3d30]">{entry.headline}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyHighlightCard({
  title,
  description,
  entries,
  tone,
  openDailyDate,
  onToggle,
}: {
  title: string;
  description: string;
  entries: DailyListEntry[];
  tone: "bright" | "quiet";
  openDailyDate: string | null;
  onToggle: (date: string | null | ((current: string | null) => string | null)) => void;
}) {
  const toneClass =
    tone === "bright"
      ? "border-[#ead8ad] bg-[linear-gradient(165deg,rgba(255,252,243,0.96),rgba(253,247,225,0.88),rgba(255,255,255,0.82))] shadow-[0_14px_28px_-24px_rgba(181,145,73,0.3)]"
      : "border-[#d8dfeb] bg-[linear-gradient(165deg,rgba(246,249,255,0.96),rgba(237,243,251,0.88),rgba(252,253,255,0.84))] shadow-[0_14px_28px_-24px_rgba(100,120,153,0.24)]";

  return (
    <div className={`rounded-[1.35rem] border p-4 ${toneClass}`}>
      <h3 className="text-sm font-semibold tracking-[0.08em] text-[#4a4238]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#625a50]">{description}</p>
      <div className="mt-4 space-y-2">
        {entries.map((entry) => {
          const meta = FLOW_LEVEL_META[entry.flowLevel];
          const isOpen = openDailyDate === entry.date;

          return (
            <button
              key={`${title}-${entry.date}`}
              type="button"
              onClick={() => onToggle((current) => (current === entry.date ? null : entry.date))}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                isOpen
                  ? "border-[#d7bb8b] bg-white/88 ring-1 ring-inset ring-[#d7bb8b]"
                  : "border-white/60 bg-white/68 hover:bg-white/84"
              }`}
            >
              <span className="w-[44px] shrink-0 text-sm font-semibold text-[#2e2a26]">
                {formatDailyFortuneCompactLabel(entry.date)}
              </span>
              <span className="w-6 shrink-0 text-center text-lg" aria-hidden="true">
                {meta.icon}
              </span>
              <span className="min-w-0 flex-1 text-sm leading-relaxed text-[#4b3d30]">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-semibold tracking-wide text-[#2e2a26]">{children}</h2>;
}

function DailyFortuneBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-[#ead9c7] bg-[rgba(255,255,255,0.58)] px-4 py-3">
      <p className="text-xs font-semibold tracking-wide text-[#8b6b49]">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#544c42]">{text}</p>
    </div>
  );
}

function getTodayIsoLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function splitDailyFortunes(dailyFortunes: DailyNumberFortune[]) {
  const todayIso = getTodayIsoLocal();
  const mapped = dailyFortunes.map((fortune) => ({
    ...fortune,
    dayOfMonth: Number(fortune.date.slice(-2)),
    isToday: fortune.date === todayIso,
  }));

  return {
    firstHalf: mapped.filter((fortune) => fortune.dayOfMonth <= 15),
    secondHalf: mapped.filter((fortune) => fortune.dayOfMonth >= 16),
  };
}

function buildMonthlyHighlightGroups(dailyFortunes: DailyNumberFortune[]) {
  const mapped = splitDailyFortunes(dailyFortunes).firstHalf.concat(splitDailyFortunes(dailyFortunes).secondHalf);
  const byBright = [...mapped].sort((left, right) => {
    if (right.flowLevel !== left.flowLevel) return right.flowLevel - left.flowLevel;
    return left.date.localeCompare(right.date);
  });
  const byQuiet = [...mapped].sort((left, right) => {
    if (left.flowLevel !== right.flowLevel) return left.flowLevel - right.flowLevel;
    return left.date.localeCompare(right.date);
  });

  return {
    brightDays: byBright.slice(0, 3),
    quietDays: byQuiet.slice(0, 3),
  };
}

function formatDailyFortuneLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${month}/${day}（${weekday}）`;
}

function formatDailyFortuneCompactLabel(date: string) {
  const [, month, day] = date.split("-").map(Number);
  return `${month}/${day}`;
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
