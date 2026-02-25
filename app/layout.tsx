import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[url('/main_back.png')] bg-cover bg-center bg-fixed antialiased text-slate-900`}
      >
        {children}
      </body>
    </html>
  );
}
