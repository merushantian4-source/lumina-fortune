import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLuckyWallpaper } from "@/lib/lucky-wallpapers";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LuckyWallpaperDetailPage({ params }: PageProps) {
  const { id } = await params;
  const wallpaper = getLuckyWallpaper(id);

  if (!wallpaper) {
    notFound();
  }

  return (
    <main className="lumina-page min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="lumina-shell mx-auto max-w-5xl rounded-3xl p-5 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/lucky-wallpapers" className="lumina-link text-sm underline-offset-4 hover:underline">
            一覧へ戻る
          </Link>
          <a
            href={wallpaper.file}
            download
            className="btn btn--primary !w-auto px-5 py-2.5 text-sm"
          >
            ダウンロード
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
          <div className="lumina-card rounded-2xl p-3">
            <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-xl bg-slate-50/80 sm:max-w-md">
              <Image
                src={wallpaper.file}
                alt={wallpaper.title}
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          <section className="space-y-4">
            <header className="lumina-header-panel rounded-2xl p-5">
              <p className="lumina-kicker text-xs font-semibold">WALLPAPER DETAIL</p>
              <h1 className="mt-2 text-xl font-bold leading-snug tracking-tight text-slate-900 sm:text-2xl">{wallpaper.title}</h1>
              <p className="lumina-muted mt-2 text-sm">スマホの待ち受けに使える開運画像です。</p>
            </header>

            <InfoBlock title="イメージ">{wallpaper.image}</InfoBlock>
            <InfoBlock title="効果">{wallpaper.effect}</InfoBlock>
            <InfoBlock title="デザインポイント">{wallpaper.design}</InfoBlock>
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoBlock({ title, children }: { title: string; children: string }) {
  return (
    <section className="lumina-card rounded-2xl p-5">
      <h2 className="text-sm font-semibold tracking-wide text-slate-800">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-900/90">{children}</p>
    </section>
  );
}
