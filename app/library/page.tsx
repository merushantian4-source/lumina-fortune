import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/ui/page-shell";

export const metadata: Metadata = {
  title: "光の書庫 | LUMINA",
  description: "物語・コラム・待ち受け・動画を静かに受け取るための書庫です。",
};

type LibraryItem = {
  title: string;
  description: string;
  href: string;
  cta: string;
};

const libraryItems: LibraryItem[] = [
  {
    title: "白の庭の記録（物語）",
    description: "白の館とルミナの物語を辿ります。",
    href: "/library/records",
    cta: "読む",
  },
  {
    title: "館の書棚（コラム）",
    description: "心を整えるための短い読み物です。",
    href: "/columns",
    cta: "読む",
  },
  {
    title: "光の待ち受けお守り",
    description: "今月の待ち受けを受け取れます。",
    href: "/lucky-wallpapers",
    cta: "開く",
  },
  {
    title: "月灯りの間（動画）",
    description: "静かな動画をゆっくり楽しめます。",
    href: "/library/limited-video",
    cta: "見る",
  },
];

export default function LibraryPage() {
  return (
    <PageShell
      maxWidth="wide"
      title="光の書庫"
      description="物語と記録を、やわらかな灯りの中で読み進めるための場所です。"
      backHref="/"
      backLabel="トップへ戻る"
    >
      <section className="relative overflow-hidden rounded-3xl border border-[#e1d5bf]/72 bg-[linear-gradient(165deg,rgba(255,252,246,0.76),rgba(248,242,231,0.68))] p-4 shadow-[0_10px_20px_-22px_rgba(82,69,53,0.2)] sm:p-5">
        <div className="pointer-events-none absolute -right-52 -top-40 h-[38rem] w-[38rem] overflow-hidden rounded-full border border-[#e7dcc8]/75 opacity-32">
          <Image src="/gazou/IMG_4216.webp" alt="" fill className="object-cover" sizes="608px" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,252,246,0.1),rgba(255,252,246,0.34))]" />
        </div>

        <div className="relative z-10 mb-3 flex items-end justify-between gap-3">
          <h2 className="text-lg font-medium text-[#3c352d]">光の書庫</h2>
          <p className="text-xs tracking-[0.08em] text-[#8b7e6b]">静かな時間を受け取る</p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-3 md:grid-cols-2">
          {libraryItems.map((item) => (
            <article
              key={item.href}
              className="rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(162deg,rgba(255,252,246,0.92),rgba(248,242,231,0.88))] p-4 shadow-[0_12px_22px_-20px_rgba(82,69,53,0.22)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-medium leading-tight text-[#2e2a26]">{item.title}</h3>
                <Link
                  href={item.href}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-[#baa98d]/72 bg-[#fdf8ee] px-4 text-sm font-medium text-[#6f6556] transition hover:bg-[#f9f3e7]"
                >
                  {item.cta}
                </Link>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#544c42]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
