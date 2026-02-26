import type { Metadata } from "next";
import { Geist_Mono, Noto_Serif_JP } from "next/font/google";
import { StarfieldBackground } from "@/components/starfield-background";
import "./globals.css";

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "白の魔女ルミナの占い - タロット占い",
  description: "光とハーブを操る白の魔女ルミナが、相棒の白いインコと共にタロットであなたの運勢を占います。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSerifJp.variable} ${geistMono.variable} antialiased text-slate-900`}>
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/main_back.png')] bg-cover bg-center bg-no-repeat" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-[#F6F8F7]/60 to-[#F6F8F7]/72" />
          <StarfieldBackground />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
