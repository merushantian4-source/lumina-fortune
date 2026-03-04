import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";
import { getAdjacentRecordChapters, getRecordChapter, type RecordChapter } from "@/lib/library/records";

type Props = {
  slug: RecordChapter["slug"];
};

const PLACEHOLDER_BODY = `本文は準備中です。
まもなく「白の庭の記録」が開かれます。
静かなページの余白には、
まだ言葉になっていない光が息づいています。
ルミナと白が辿った道のりを、
ひとつずつ丁寧に綴ってまいります。
どうぞ、少しだけ心をゆるめて
この書庫で次の章をお待ちください。`;

export function RecordChapterPage({ slug }: Props) {
  const chapter = getRecordChapter(slug);

  if (!chapter) {
    return (
      <PageShell
        maxWidth="content"
        title="白の庭の記録"
        description="指定された章が見つかりませんでした。"
        backHref="/library/records"
        backLabel="白の庭の記録へ戻る"
      >
        <GlassCard>
          <p className="text-sm text-[#544c42]">指定された章は見つかりませんでした。</p>
        </GlassCard>
      </PageShell>
    );
  }

  const { prev, next } = getAdjacentRecordChapters(slug);

  return (
    <PageShell
      maxWidth="content"
      title={chapter.title}
      description={chapter.subtitle}
      backHref="/library/records"
      backLabel="白の庭の記録へ戻る"
    >
      <nav className="mb-4 text-sm text-[#6f6556]">
        <Link href="/library" className="lumina-link">
          光の書庫
        </Link>
        <span className="px-2 text-[#9f9588]">{">"}</span>
        <Link href="/library/records" className="lumina-link">
          白の庭の記録
        </Link>
        <span className="px-2 text-[#9f9588]">{">"}</span>
        <span className="text-[#544c42]">{chapter.title}</span>
      </nav>

      <GlassCard>
        <h2 className="text-xl font-medium text-[#2e2a26]">
          {chapter.icon} {chapter.title}
        </h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#544c42]">{PLACEHOLDER_BODY}</p>
      </GlassCard>

      <GlassCard className="mt-4">
        <h2 className="text-lg font-medium text-[#2e2a26]">章の見出し</h2>
        <div className="mt-3 space-y-4">
          {chapter.sections.map((sectionTitle, index) => (
            <section key={sectionTitle} className="rounded-xl border border-[#e3d8c5]/75 bg-white/60 p-4">
              <h3 className="text-base font-medium text-[#2e2a26]">
                {index + 1}. {sectionTitle}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#544c42]">
                本文は準備中です。後日、この見出しに沿って物語本文を追加します。
              </p>
            </section>
          ))}
        </div>
      </GlassCard>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/library/records/${prev.slug}`}
            className="rounded-xl border border-[#dccfb8]/75 bg-white/60 px-4 py-3 text-sm text-[#544c42] transition hover:bg-white/80"
          >
            ← 前の章: {prev.title}
          </Link>
        ) : (
          <div className="rounded-xl border border-transparent px-4 py-3 text-sm text-[#9f9588]">← 前の章はありません</div>
        )}
        {next ? (
          <Link
            href={`/library/records/${next.slug}`}
            className="rounded-xl border border-[#dccfb8]/75 bg-white/60 px-4 py-3 text-right text-sm text-[#544c42] transition hover:bg-white/80"
          >
            次の章: {next.title} →
          </Link>
        ) : (
          <div className="rounded-xl border border-transparent px-4 py-3 text-right text-sm text-[#9f9588]">次の章はありません →</div>
        )}
      </div>
    </PageShell>
  );
}
