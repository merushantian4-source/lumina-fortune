import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Geist_Mono, Noto_Serif_JP, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import { StarfieldBackground } from "@/components/starfield-background";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: BRAND.seoTitle,
  description: BRAND.seoDescription,
  keywords: [
    "タロット占い", "無料占い", "恋愛占い", "今日の運勢",
    "片思い占い", "復縁占い", "相性占い", "結婚占い",
    "タロット", "運勢", "白の館", "LUMINA",
  ],
  openGraph: {
    title: BRAND.seoTitle,
    description: BRAND.seoDescription,
    siteName: "白の館 LUMINA",
    locale: "ja_JP",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSerifJp.variable} ${playfairDisplay.variable} ${geistMono.variable} relative antialiased text-[#2e2a26]`}>
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/main_back.png')] bg-cover bg-center bg-no-repeat opacity-62" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(252,248,239,0.38),rgba(246,241,231,0.38))]" />
          <StarfieldBackground className="opacity-30" />
        </div>
        <div className="relative z-10">
          {children}
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </div>
      </body>
    </html>
  );
}
