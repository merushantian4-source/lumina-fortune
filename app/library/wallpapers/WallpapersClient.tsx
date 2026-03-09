"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuminaButton } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  claimMonthlyGiftForVisitor,
  getVisitStreakForVisitor,
  makeVisitorKey,
  type VisitStreakRecord,
} from "@/lib/visit-streak";

const PROFILE_STORAGE_KEY = "lumina_profile";
const MONTHLY_WALLPAPER_SRC = "/matiuke/gentei/gentei2.jpg";

export function WallpapersClient() {
  const [record, setRecord] = useState<VisitStreakRecord | null>(null);
  const [notice, setNotice] = useState("");

  const resolveVisitorKey = () => {
    const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    const profile = rawProfile ? (JSON.parse(rawProfile) as { nickname?: string }) : {};
    return makeVisitorKey(typeof profile.nickname === "string" ? profile.nickname : "");
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      const key = resolveVisitorKey();
      const current = getVisitStreakForVisitor(localStorage, key);
      const shouldClaim = new URLSearchParams(window.location.search).get("claim") === "1";

      timeoutId = setTimeout(() => {
        setRecord(current);
      }, 0);

      if (shouldClaim && current && current.monthlyVisitCount >= 7 && !current.monthlyClaimed) {
        const claimed = claimMonthlyGiftForVisitor(localStorage, key);
        timeoutId = setTimeout(() => {
          setRecord(claimed);
          setNotice("待ち受けを受け取りました。");
        }, 0);
      }
    } catch {
      timeoutId = setTimeout(() => {
        setRecord(null);
      }, 0);
    }

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleClaim = () => {
    const visitorKey = resolveVisitorKey();
    if (!record || record.monthlyVisitCount < 7 || record.monthlyClaimed) return;

    const claimed = claimMonthlyGiftForVisitor(localStorage, visitorKey);
    setRecord(claimed);
    setNotice("待ち受けを受け取りました。");
  };

  const monthlyCount = record?.monthlyVisitCount ?? 0;
  const canClaim = monthlyCount >= 7 && !record?.monthlyClaimed;
  const unlocked = !!record?.monthlyClaimed;

  return (
    <GlassCard>
      <h2 className="text-lg font-medium text-[#2e2a26]">今月の限定特典</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#544c42]">
        毎日の来訪で光を集めると、月内7日到達で限定待ち受けを受け取って保存できます。
      </p>

      <div className="mt-4 rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(162deg,rgba(255,252,246,0.9),rgba(248,242,231,0.86))] p-4">
        <p className="text-xs tracking-[0.08em] text-[#847967]">進捗</p>
        <p className="mt-1 text-sm text-[#544c42]">{Math.min(monthlyCount, 7)}/7日</p>
        {unlocked ? <p className="mt-2 text-sm text-[#5f6b52]">受け取り済み</p> : null}
        {!unlocked && monthlyCount < 7 ? <p className="mt-2 text-sm text-[#6f6556]">あと{7 - monthlyCount}日</p> : null}
        {!unlocked ? (
          <div className="mt-3">
            <LuminaButton type="button" onClick={handleClaim} disabled={!canClaim}>
              特典を受け取る
            </LuminaButton>
          </div>
        ) : null}
        {notice ? <p className="mt-3 text-sm text-[#5f6b52]">{notice}</p> : null}
      </div>

      <div className="mt-5">
        <div className={`relative mx-auto max-w-[260px] overflow-hidden rounded-2xl border border-[#dfd2bc]/78 ${unlocked ? "" : "pointer-events-none"}`}>
          <div className={unlocked ? "" : "blur-sm brightness-90"}>
            <Image
              src={MONTHLY_WALLPAPER_SRC}
              alt="今月の待ち受けプレビュー"
              width={520}
              height={1040}
              className="h-auto w-full"
              priority
            />
          </div>
          {!unlocked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#f9f2e5]/35">
              <p className="rounded-full border border-[#d3c4a7]/80 bg-[#fffaf0]/90 px-3 py-1 text-xs text-[#6f6556]">7日で解放</p>
            </div>
          ) : null}
        </div>

        {unlocked ? (
          <a
            href={MONTHLY_WALLPAPER_SRC}
            download
            className="mx-auto mt-3 inline-flex min-h-9 items-center justify-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-4 py-1.5 text-sm font-medium text-[#6f6556] transition hover:bg-[#fffaf0]"
          >
            待ち受けを保存
          </a>
        ) : null}
      </div>

      <Link href="/daily-fortune" className="mt-4 inline-block text-sm text-[#6f6556] underline-offset-4 hover:underline">
        今日の運勢を見る
      </Link>
    </GlassCard>
  );
}
