import Link from "next/link";
import { notFound } from "next/navigation";
import { getLightWork } from "@/lib/light-work";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LightWorkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const work = getLightWork(slug);

  if (!work) {
    notFound();
  }

  return (
    <main className="lumina-page min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="lumina-shell mx-auto max-w-4xl rounded-3xl p-5 sm:p-8">
        <div className="mb-6">
          <Link href="/light-work" className="lumina-link text-sm underline-offset-4 hover:underline">
            ← 光のワーク一覧へ戻る
          </Link>
        </div>

        <header className="lumina-header-panel rounded-2xl p-5">
          <p className="lumina-kicker text-xs font-semibold">LIGHT WORK DETAIL</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{work.title}</h1>
          <p className="lumina-muted mt-2 text-sm leading-relaxed">{work.summary}</p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoCard title="所要時間">{work.duration}</InfoCard>
          <InfoCard title="準備するもの">
            <ul className="list-disc space-y-1 pl-5">
              {work.prepare.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </InfoCard>
        </section>

        <section className="lumina-card mt-6 rounded-2xl p-5">
          <h2 className="text-base font-semibold tracking-wide text-slate-800">手順</h2>
          <ol className="mt-3 space-y-3">
            {work.steps.map((step, index) => (
              <li key={`${work.slug}-step-${index + 1}`} className="rounded-xl border border-slate-200/70 bg-white/75 px-4 py-3">
                <p className="text-xs font-semibold tracking-wide text-slate-600">STEP {index + 1}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-900/90">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="lumina-card mt-6 rounded-2xl p-5">
          <h2 className="text-base font-semibold tracking-wide text-slate-800">終わりの一言</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-900">{work.affirmation}</p>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="lumina-card rounded-2xl p-5">
      <h2 className="text-base font-semibold tracking-wide text-slate-800">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-slate-900/90">{children}</div>
    </section>
  );
}
