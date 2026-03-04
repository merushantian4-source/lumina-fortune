import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = {
  title: "月灯りの間 | 光の書庫 | LUMINA",
  description: "白い館の静けさの中で受け取る、ルミナの限定映像ページです。",
};

const videos = [
  {
    title: "テスト公開: 月灯りの映像",
    note: "公開中",
    summary: "静かな夜に、そっと心をほどくためのテスト映像です。",
    youtubeId: "fRzO6HGSPzM",
  },
  {
    title: "夜更けの心をほどく、3分の呼吸",
    note: "公開準備中",
    summary: "焦りを静かに手放すための、短いガイド映像です。",
  },
  {
    title: "月の光に合わせる、やさしい整え習慣",
    note: "公開準備中",
    summary: "眠る前に心を整える、小さなルーティンをお届けします。",
  },
];

export default function LimitedVideoPage() {
  return (
    <PageShell
      maxWidth="content"
      title="月灯りの間"
      description="ここは、白い館の奥にある小さな映写室。必要な夜にだけ、そっと灯りがともります。"
      backHref="/library"
      backLabel="光の書庫へ戻る"
    >
      <GlassCard>
        <p className="text-sm leading-7 text-[#544c42]">
          この部屋では、ルミナの限定映像を静かに公開していきます。
          <br />
          まずはテスト映像を一つ、そっと灯しておきます。
        </p>
      </GlassCard>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {videos.map((video) => (
          <GlassCard key={video.title} className="border-[#e1d5bf]/75 bg-[linear-gradient(162deg,rgba(255,252,246,0.9),rgba(248,242,231,0.86))]">
            <p className="text-xs font-medium tracking-[0.12em] text-[#847967]">{video.note}</p>
            <h2 className="mt-2 text-lg font-medium text-[#2e2a26]">{video.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#544c42]">{video.summary}</p>

            {video.youtubeId ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-[#dccfb8]/80 bg-[#f8f3e8]">
                <div className="relative w-full pb-[56.25%]">
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
            ) : null}
          </GlassCard>
        ))}
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
