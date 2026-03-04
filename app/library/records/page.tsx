import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";
import { RecordsClient } from "./records-client";

export const metadata: Metadata = {
  title: "白の庭の記録（物語） | 光の書庫 | LUMINA",
  description: "白の庭の記録を章ごとに辿る目次ページ。ルミナの物語を静かに読み解けます。",
};

export default function RecordsPage() {
  return (
    <PageShell
      maxWidth="content"
      title="白の庭の記録（物語）"
      description="白の庭から白の館へ。ルミナの記録を章ごとに辿るための目次です。"
      backHref="/library"
      backLabel="光の書庫へ戻る"
    >
      <nav className="mb-4 text-sm text-[#6f6556]">
        <Link href="/library" className="lumina-link">
          光の書庫
        </Link>
        <span className="px-2 text-[#9f9588]">{">"}</span>
        <span className="text-[#544c42]">白の庭の記録</span>
      </nav>

      <GlassCard>
        <RecordsClient />
      </GlassCard>
    </PageShell>
  );
}
