import Link from "next/link";
import { lightWorks } from "@/lib/light-work";

export default function LightWorkPage() {
  return (
    <main className="lumina-page min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="lumina-shell mx-auto max-w-4xl rounded-3xl p-5 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="lumina-link text-sm underline-offset-4 hover:underline">
            トップへ戻る
          </Link>
        </div>

        <header className="lumina-header-panel rounded-2xl p-5">
          <p className="lumina-kicker text-xs font-semibold">LIGHT WORKS</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">光のワーク</h1>
          <p className="lumina-muted mt-2 text-sm leading-relaxed">
            気分や目的に合わせて選べる、短時間で実行しやすいセルフワークです。
            <br />
            呼吸とイメージを使って、心と空気感を静かに整えます。
          </p>
        </header>

        <section className="mt-8 grid gap-4">
          {lightWorks.map((work) => (
            <Link
              key={work.slug}
              href={`/light-work/${work.slug}`}
              className="lumina-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{work.title}</h2>
                  <p className="lumina-muted mt-2 text-sm leading-relaxed">{work.summary}</p>
                </div>
                <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">
                  {work.duration}
                </span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
