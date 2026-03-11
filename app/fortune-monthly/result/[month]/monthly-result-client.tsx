"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FortuneResult from "@/components/fortune-result";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { buildMonthlyDailyNumberFortunes } from "@/lib/fortune/daily-number-fortunes";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";
import { getFortuneNumberName } from "@/lib/fortune/names";
import { buildMonthlyTemplateForProfile } from "@/lib/fortune/monthly-profile-template";
import { buildProfileVersionKey, loadStoredProfile } from "@/lib/profile/profile-store";

type Props = {
  month: number;
  initialBirthdate: string | null;
};

export default function MonthlyResultClient({ month, initialBirthdate }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<ReturnType<typeof loadStoredProfile>>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setProfile(loadStoredProfile());
      setIsHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const birthdate = isHydrated ? profile?.birthdate?.trim() || initialBirthdate || "" : initialBirthdate || "";
  const profileKey = useMemo(() => buildProfileVersionKey(profile), [profile]);
  const previousMonth = month > 1 ? month - 1 : null;
  const nextMonth = month < 12 ? month + 1 : null;

  const result = useMemo(() => {
    if (!birthdate) return null;

    try {
      const fortuneNumber = destinyNumberFromBirthdate(birthdate);
      const template = buildMonthlyTemplateForProfile(month, birthdate, profile);
      const fortuneName = getFortuneNumberName(fortuneNumber);
      const year = new Date().getFullYear();
      const dailyFortunes = buildMonthlyDailyNumberFortunes({ year, month, destinyNumber: fortuneNumber });

      if (!template || !fortuneName) return null;

      return { template, fortuneName, dailyFortunes };
    } catch {
      return null;
    }
  }, [birthdate, month, profile]);

  useEffect(() => {
    if (!isHydrated && !initialBirthdate) return;
    if (!birthdate || !result) {
      router.replace("/fortune-monthly");
    }
  }, [birthdate, initialBirthdate, isHydrated, result, router]);

  if (!birthdate || !result) {
    return (
      <PageShell maxWidth="narrow" title="毎月の運勢" backHref="/" backLabel="トップへ戻る">
        <GlassCard>
          <p className="lumina-muted text-sm">最新プロフィールを確認しています...</p>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <FortuneResult
      key={`${month}:${profileKey}`}
      template={result.template}
      dailyFortunes={result.dailyFortunes}
      dailySectionTitle="今月の日別の流れ"
      variantLabel="NUMEROLOGY MONTHLY"
      pageTitle={`${result.fortuneName}の${month}月の運勢`}
      topLinkHref="/"
      topLinkLabel="Topに戻る"
      resetHref="/fortune-monthly?edit=1"
      halfYearSectionTitle={`今月 ${month}月前半・後半`}
      firstHalfTitle={`${month}月前半`}
      secondHalfTitle={`${month}月後半`}
      previousLinkHref={previousMonth ? `/fortune-monthly/result/${previousMonth}` : undefined}
      previousLinkLabel={previousMonth ? `${previousMonth}月へ` : undefined}
      bottomLinkHref="/fortune-monthly/result"
      bottomLinkLabel="月一覧を見る"
      nextLinkHref={nextMonth ? `/fortune-monthly/result/${nextMonth}` : undefined}
      nextLinkLabel={nextMonth ? `${nextMonth}月へ` : undefined}
    />
  );
}
