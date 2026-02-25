import Image from "next/image";
import Link from "next/link";
import { luckyWallpapers } from "@/lib/lucky-wallpapers";

export default function LuckyWallpapersPage() {
  return (
    <main className="lumina-page min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="lumina-shell mx-auto max-w-5xl rounded-3xl p-5 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="lumina-link text-sm underline-offset-4 hover:underline">
            トップへ戻る
          </Link>
          <p className="lumina-muted text-sm">スマホの待ち受けに使える開運画像です。</p>
        </div>

        <header className="lumina-header-panel rounded-2xl p-5">
          <p className="lumina-kicker text-xs font-semibold">LUMINA WALLPAPER CHARMS</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">光の待ち受けお守り</h1>
          <p className="lumina-muted mt-2 text-sm leading-relaxed">
            気分や願いに合わせて選べる、ルミナのやわらかな開運待ち受けです。
          </p>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {luckyWallpapers.map((wallpaper) => (
            <Link
              key={wallpaper.id}
              href={`/lucky-wallpapers/${wallpaper.id}`}
              className="lumina-card group overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[9/16] w-full bg-slate-50/80">
                <Image
                  src={wallpaper.file}
                  alt={wallpaper.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              </div>

              <div className="space-y-2 p-4">
                <h2 className="text-base font-semibold leading-snug text-slate-900">{wallpaper.title}</h2>
                <p className="lumina-muted text-sm leading-relaxed">{wallpaper.shortDescription}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
