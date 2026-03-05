import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = {
  title: "月灯りの間 | 光の書庫 | LUMINA",
  description: "白い館の静けさの中で受け取る、ルミナの限定映像ページです。",
};

type VideoCategory = "恋愛" | "仕事" | "人間関係" | "心の整え";

type VideoItem = {
  title: string;
  note: string;
  category: VideoCategory;
  youtubeId: string;
  watchUrl: string;
};

const videos: VideoItem[] = [
  {
    title: "今この恋が向かっている未来",
    note: "公開中",
    category: "恋愛",
    youtubeId: "KutxJ6Y2Q4c",
    watchUrl: "https://youtube.com/shorts/KutxJ6Y2Q4c?si=jrLkQo5HB1fzi83N",
  },
];

export default function LimitedVideoPage() {
  const categories = Array.from(new Set(videos.map((video) => video.category)));

  return (
    <PageShell
      maxWidth="content"
      title="月灯りの間"
      description="ここは、白い館の奥にある小さな映写室。必要な夜にだけ、そっと灯りがともります。"
      backHref="/library"
      backLabel="光の書庫へ戻る"
    >
      <GlassCard>
        <p className="text-sm leading-7 text-[#544c42]">この部屋では、ルミナの限定映像を静かに公開していきます。</p>
      </GlassCard>

      <div className="mt-4 space-y-4">
        {categories.map((category) => {
          const items = videos.filter((video) => video.category === category);

          return (
            <GlassCard
              key={category}
              className="border-[#e1d5bf]/75 bg-[linear-gradient(162deg,rgba(255,252,246,0.9),rgba(248,242,231,0.86))]"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-medium text-[#2e2a26]">カテゴリ: {category}</h2>
                <span className="rounded-full border border-[#d4c5ac]/80 bg-[#fff8ec]/90 px-2.5 py-1 text-xs text-[#6f6556]">
                  {items.length}本
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {items.map((video) => (
                  <article key={video.youtubeId} className="rounded-xl border border-[#dccfb8]/75 bg-white/65 p-3">
                    <p className="text-xs font-medium tracking-[0.12em] text-[#847967]">{video.note}</p>
                    <h3 className="mt-2 text-lg font-medium text-[#2e2a26]">{video.title}</h3>
                    <div className="mt-4 mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-[#dccfb8]/80 bg-[#f8f3e8] shadow-[0_12px_30px_-18px_rgba(60,45,35,0.55)]">
                      <div className="relative aspect-[9/16] w-full">
                        <iframe
                          className="absolute left-0 top-0 h-full w-full"
                          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <a
                        href={video.watchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-4 py-2 text-sm text-[#6f6556] transition hover:bg-[#f9f3e7]"
                      >
                        YouTubeで開く
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="mt-4">
        <h3 className="text-base font-medium text-[#2e2a26]">お知らせを受け取りたい方へ</h3>
        <p className="mt-2 text-sm leading-7 text-[#544c42]">
          新しい映像は、トップページの「光の書庫」からご案内します。
          <br />
          迷ったときは、館の地図からこの部屋へ戻ってきてください。
        </p>
        <div className="mt-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-4 py-2 text-sm text-[#6f6556] transition hover:bg-[#f9f3e7]"
          >
            トップへ戻る →
          </Link>
        </div>
      </GlassCard>
    </PageShell>
  );
}
