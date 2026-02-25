"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { SparkleTrail } from "@/components/SparkleTrail"

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),rgba(247,250,248,0.56)_42%,rgba(221,231,223,0.24)_100%)]" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/55 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-8 h-56 w-56 rounded-full bg-emerald-100/45 blur-3xl" />
      <SparkleTrail className="w-full max-w-xl rounded-3xl">
        <motion.div
          className="lumina-shell relative w-full max-w-xl rounded-3xl p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto mb-5 h-36 w-36 overflow-hidden rounded-full border-4 border-white/80 bg-white/75 shadow-[0_18px_30px_-14px_rgba(22,37,53,0.35)] ring-4 ring-emerald-100/70">
            <Image
              src="/lumina-icon.png"
              alt="ルミナのアイコン"
              width={144}
              height={144}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <p className="mb-1 text-xs tracking-[0.28em] text-slate-600/90">WHITE WITCH TAROT</p>
          <h1 className="font-serif text-4xl font-bold tracking-[0.08em] text-slate-900 sm:text-5xl">LUMINA</h1>
          <p className="mt-2 text-base font-medium tracking-[0.08em] text-slate-700/90">光と静寂の占い</p>
          <p className="mt-4 text-base leading-relaxed text-slate-700/85">
            来てくださってありがとうございます。
            <br />
            光とハーブの白き魔女ルミナのサイトへようこそ。
            <br />
            アルビノインコの白と共に今の気持ちにそっと寄り添いながら、
            <br />
            あなたに合う言葉を丁寧にお届けします。
          </p>
          <motion.button
            className="btn btn--primary mt-10"
            onClick={onStart}
          >
            光の導きタロット占い
          </motion.button>
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Link
              href="/fortune-2026"
              className="btn btn--primary"
            >
              2026年の運勢
            </Link>
          </motion.div>
          <motion.div
            className="mt-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            <Link href="/fortune-monthly" className="btn btn--primary">
              毎月の運勢
            </Link>
          </motion.div>
          <motion.div
            className="mt-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/daily-fortune" className="btn btn--primary">
              毎日の占い
            </Link>
          </motion.div>
          <motion.div
            className="mt-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
          >
            <Link href="/lucky-wallpapers" className="btn btn--primary">
              光の待ち受けお守り
            </Link>
          </motion.div>
          <motion.div
            className="mt-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            <Link href="/light-work" className="btn btn--primary">
              光のワーク
            </Link>
          </motion.div>
        </motion.div>
      </SparkleTrail>
    </div>
  )
}
