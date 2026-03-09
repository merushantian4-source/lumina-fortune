import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";
import { LuminaLinkButton } from "@/components/ui/button";

export default function MoonRitualsPage() {
  return (
    <PageShell
      maxWidth="content"
      title="新月・満月の小さな儀式"
      description="月の節目に、心をやわらかく整えるための静かなガイドです。"
      backHref="/calendar"
      backLabel="光の暦へ戻る"
    >
      <div className="space-y-4">
        <GlassCard>
          <p className="text-xs font-medium tracking-wide text-[#847967]">新月</p>
          <h2 className="mt-1 text-xl font-medium text-[#2e2a26]">新月の小さな儀式</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
            はじまりの静けさに合わせて、願いを言葉にするための3ステップです。背伸びせず、今の心に合う願いをそっと置いていきます。
          </p>
          <LuminaLinkButton href="/moon-rituals/new" className="mt-4 inline-flex">
            新月のガイドを見る
          </LuminaLinkButton>
        </GlassCard>

        <GlassCard>
          <p className="text-xs font-medium tracking-wide text-[#847967]">月光の願い</p>
          <h2 className="mt-1 text-xl font-medium text-[#2e2a26]">月光の願い</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
            新月の日に願いを置き、満月の日にその言葉を振り返るための静かなカードです。
          </p>
          <LuminaLinkButton href="/moon-rituals/wish" className="mt-4 inline-flex">
            月光の願いをひらく
          </LuminaLinkButton>
        </GlassCard>

        <GlassCard>
          <p className="text-xs font-medium tracking-wide text-[#847967]">満月</p>
          <h2 className="mt-1 text-xl font-medium text-[#2e2a26]">満月の小さな儀式</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
            ここまでの歩みを受け取り、重くなったものを手放すための振り返りです。できたことに光を当てて、次の流れを軽く整えます。
          </p>
          <LuminaLinkButton href="/moon-rituals/full" className="mt-4 inline-flex">
            満月のガイドを見る
          </LuminaLinkButton>
        </GlassCard>
      </div>
    </PageShell>
  );
}
