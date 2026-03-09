import Link from "next/link";
import { BRAND } from "@/lib/brand";

const EXIT_LINKS = [
  { label: "個人鑑定のご依頼", href: "/consultation" },
  { label: "今日の占い", href: "/daily-fortune" },
  { label: "光の書庫", href: "/library" },
  { label: "光の願いの庭", href: "/wish-garden" },
] as const;

const SUPPORT_LINKS = [
  { label: "鑑定できない内容", href: "/consultation#limits" },
  { label: "お問い合わせ", href: "/letter" },
] as const;

const SOCIAL_LINKS = [
  { name: "TikTok", href: "https://www.tiktok.com/@luminousmagic0?_r=1&_t=ZS-94P8u7q3O5g" },
  { name: "Instagram", href: "https://www.instagram.com/luminousmagic0?igsh=MXZqNmtkazllZHpqNg%3D%3D&utm_source=qr" },
  { name: "YouTube", href: "https://youtube.com/channel/UCgmijIrv50RWonl2XgO8fiA?si=k60PNOj1RXFB3wcG" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mx-auto mt-8 w-full max-w-5xl px-4 pb-8 sm:pb-10">
      <div className="rounded-3xl border border-[#e1d5bf]/72 bg-[linear-gradient(165deg,rgba(255,252,246,0.86),rgba(248,242,231,0.76))] p-5 shadow-[0_10px_22px_-22px_rgba(82,69,53,0.22)] sm:p-6">
        <div className="border-b border-[#e1d5bf]/70 pb-4">
          <h2 className="text-lg font-medium text-[#3c352d]">館の出口</h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <section className="rounded-2xl border border-[#e7dcc7]/70 bg-white/50 p-4">
            <h3 className="text-sm font-medium text-[#847967]">館の地図</h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#544c42]">
              {EXIT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex underline-offset-4 hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#e7dcc7]/70 bg-white/50 p-4">
            <h3 className="text-sm font-medium text-[#847967]">サポート</h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#544c42]">
              {SUPPORT_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex underline-offset-4 hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#e7dcc7]/70 bg-white/50 p-4">
            <h3 className="text-sm font-medium text-[#847967]">SNS</h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#544c42]">
              {SOCIAL_LINKS.map((item) => (
                <li key={item.name}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex underline-offset-4 hover:underline">
                    {item.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${BRAND.name}｜${BRAND.tagline}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex underline-offset-4 hover:underline"
                >
                  シェア
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-[#e1d5bf]/70 pt-4 text-xs text-[#7d7364] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {BRAND.name}</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="underline-offset-4 hover:underline">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="underline-offset-4 hover:underline">
              利用規約
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
