"use client";

import { LuminaLinkButton } from "@/components/ui/button";
import { getLightCalendarUi } from "@/lib/light-calendar/lightCalendarUi2026";
import type { MajorMoonPhase, MoonPhaseInfo } from "@/lib/moon-phase";

type Props = {
  date: string;
  moon?: MoonPhaseInfo | null;
  moonMajorPhase?: MajorMoonPhase;
};

function badgeClass(tone: "best" | "good" | "neutral" | "caution") {
  switch (tone) {
    case "best":
      return "border-amber-300/70 bg-amber-50 text-amber-700";
    case "good":
      return "border-rose-200/80 bg-rose-50 text-rose-700";
    case "caution":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-[#e7dccb] bg-white/80 text-[#7b6b57]";
  }
}

export function LightCalendarCard({ date, moon, moonMajorPhase }: Props) {
  const day = getLightCalendarUi(date);

  if (!day) {
    return (
      <section className="rounded-[28px] border border-[#ece2d2] bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(250,243,235,0.92))] p-5 shadow-[0_20px_40px_-28px_rgba(90,74,56,0.28)]">
        <p className="text-xs tracking-[0.18em] text-[#9b8c77]">光の暦</p>
        <h3 className="mt-2 text-lg font-medium text-[#2f2a24]">
          この日は特別な暦情報がありません
        </h3>
        <p className="mt-3 text-sm leading-7 text-[#6f6254]">
          穏やかな通常日です。大きな吉日でなくても、心を整えて過ごすことで運の流れはやさしく育っていきます。
        </p>

        {moon ? (
          <div className="mt-4 rounded-2xl border border-[#eadfcf] bg-white/75 px-4 py-3">
            <p className="text-xs tracking-[0.18em] text-[#a18e75]">月の流れ</p>
            <p className="mt-2 text-sm leading-7 text-[#62574a]">
              {moon.icon} {moon.phaseLabel}
            </p>
          </div>
        ) : null}

        {moonMajorPhase === "new_moon" ? (
          <div className="mt-4">
            <LuminaLinkButton href="/moon-rituals/new" className="inline-flex">
              新月の小さな祈りへ
            </LuminaLinkButton>
          </div>
        ) : null}

        {moonMajorPhase === "full_moon" ? (
          <div className="mt-4">
            <LuminaLinkButton href="/moon-rituals/full" className="inline-flex">
              満月の小さな祈りへ
            </LuminaLinkButton>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#ece2d2] bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(248,239,229,0.95))] shadow-[0_24px_48px_-30px_rgba(90,74,56,0.35)]">
      <div className="border-b border-white/60 bg-[radial-gradient(circle_at_top,rgba(255,244,214,0.65),rgba(255,250,244,0)_58%)] px-5 pb-4 pt-5">
        <p className="text-[11px] tracking-[0.24em] text-[#9b8c77]">光の暦</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {day.badges.map((badge) => (
            <span
              key={`${day.date}-${badge.type}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${badgeClass(
                badge.tone
              )}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <h3 className="mt-4 text-xl font-medium leading-8 text-[#2f2a24]">{day.headline}</h3>
      </div>

      <div className="px-5 py-5">
        <p className="text-sm leading-7 text-[#5f564c]">{day.softMessage}</p>

        {moon ? (
          <div className="mt-4 rounded-2xl border border-[#eadfcf] bg-white/75 px-4 py-3">
            <p className="text-xs tracking-[0.18em] text-[#a18e75]">月の流れ</p>
            <p className="mt-2 text-sm leading-7 text-[#62574a]">
              {moon.icon} {moon.phaseLabel}
            </p>
          </div>
        ) : null}

        {day.actionTip ? (
          <div className="mt-4 rounded-2xl border border-[#eadfcf] bg-white/75 px-4 py-3">
            <p className="text-xs tracking-[0.18em] text-[#a18e75]">おすすめの過ごし方</p>
            <p className="mt-2 text-sm leading-7 text-[#62574a]">{day.actionTip}</p>
          </div>
        ) : null}

        {day.caution ? (
          <div className="mt-4 rounded-2xl border border-[#e5e2dd] bg-[#f6f4f1] px-4 py-3">
            <p className="text-xs tracking-[0.18em] text-[#8c847b]">ひとこと注意</p>
            <p className="mt-2 text-sm leading-7 text-[#5f5952]">{day.caution}</p>
          </div>
        ) : null}

        {moonMajorPhase === "new_moon" ? (
          <div className="mt-4">
            <LuminaLinkButton href="/moon-rituals/new" className="inline-flex">
              新月の小さな祈りへ
            </LuminaLinkButton>
          </div>
        ) : null}

        {moonMajorPhase === "full_moon" ? (
          <div className="mt-4">
            <LuminaLinkButton href="/moon-rituals/full" className="inline-flex">
              満月の小さな祈りへ
            </LuminaLinkButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}
