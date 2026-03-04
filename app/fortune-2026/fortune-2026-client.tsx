"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";

const BIRTHDATE_STORAGE_KEY = "lumina_birthdate";

type Fortune2026ClientProps = {
  serverBirthdate: string | null;
};

function loadInitialBirthdate(serverBirthdate: string | null): string {
  if (serverBirthdate) return serverBirthdate;
  if (typeof window === "undefined") return "";

  try {
    return localStorage.getItem(BIRTHDATE_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function Fortune2026Client({ serverBirthdate }: Fortune2026ClientProps) {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState(() => loadInitialBirthdate(serverBirthdate));
  const [error, setError] = useState("");
  const [viewWithoutSaving, setViewWithoutSaving] = useState(false);

  const autoDestinyNumber = useMemo(() => {
    if (!birthDate) return null;

    try {
      return destinyNumberFromBirthdate(birthDate);
    } catch {
      return null;
    }
  }, [birthDate]);

  useEffect(() => {
    if (!autoDestinyNumber) return;
    router.replace(`/fortune-2026/result/${autoDestinyNumber}`);
  }, [autoDestinyNumber, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!birthDate) {
      setError("生年月日を入力してください。");
      return;
    }

    try {
      const destinyNumber = destinyNumberFromBirthdate(birthDate);
      if (!viewWithoutSaving) {
        localStorage.setItem(BIRTHDATE_STORAGE_KEY, birthDate);
      }
      router.push(`/fortune-2026/result/${destinyNumber}`);
    } catch {
      setError("正しい生年月日（YYYY-MM-DD）を入力してください。");
    }
  };

  if (autoDestinyNumber) {
    return (
      <PageShell
        maxWidth="narrow"
        title="生年月日で占う 2026年の運勢"
        description="生年月日から運命数を計算し、2026年の運勢を表示します。"
        backHref="/"
        backLabel="トップへ戻る"
      >
        <GlassCard>
          <p className="lumina-muted text-sm">読み込み中...</p>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell
      maxWidth="narrow"
      title="生年月日で占う 2026年の運勢"
      description="生年月日から運命数を計算し、2026年の運勢を表示します。"
      backHref="/"
      backLabel="トップへ戻る"
    >
      <GlassCard>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-[#2e2a26]">
            生年月日
            <input
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              className="lumina-input mt-2 w-full rounded-lg px-4 py-2 transition"
              required
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-[#544c42]">
            <input
              type="checkbox"
              checked={viewWithoutSaving}
              onChange={(event) => setViewWithoutSaving(event.target.checked)}
              className="h-4 w-4 accent-[#958cad]"
            />
            保存しないで見る
          </label>

          <LuminaButton type="submit" tone="primary">
            2026年の運勢を見る
          </LuminaButton>
        </form>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </GlassCard>
    </PageShell>
  );
}
