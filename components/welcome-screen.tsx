"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { SparkleTrail } from "@/components/SparkleTrail"

interface WelcomeScreenProps {
  onStart: () => void
}

const menuItems = [
  {
    title: "基本性格",
    description: "生年月日から運命数を計算して、あなたの土台となる性質を読み解きます。",
    href: "/basic-personality",
    ctaLabel: "占う",
  },
  {
    title: "2026年の運勢",
    description: "生年月日から運命数を計算して、今年の流れを読み解きます。",
    href: "/fortune-2026",
    ctaLabel: "読む",
  },
  {
    title: "毎月の運勢",
    description: "今月のテーマと行動のヒントを、やさしく受け取れます。",
    href: "/fortune-monthly",
    ctaLabel: "読む",
  },
  {
    title: "毎日の占い",
    description: "今日の一枚から、心の向きと小さな追い風を受け取ります。",
    href: "/daily-fortune",
    ctaLabel: "見る",
  },
  {
    title: "光の待ち受けお守り",
    description: "気分に合わせて選べる、ルミナの光の壁紙お守りです。",
    href: "/lucky-wallpapers",
    ctaLabel: "受け取る",
  },
  {
    title: "光のワーク",
    description: "心を整える小さな実践で、日常に静かな光を戻します。",
    href: "/light-work",
    ctaLabel: "はじめる",
  },
] as const

const recommendedLinks = [
  {
    label: "はじめて",
    title: "基本性格",
    href: "/basic-personality",
  },
  {
    label: "今年",
    title: "2026年の運勢",
    href: "/fortune-2026",
  },
  {
    label: "今すぐ",
    title: "今日の運勢",
    href: "/daily-fortune",
  },
] as const

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.95),transparent_52%),radial-gradient(circle_at_80%_20%,rgba(142,124,255,0.10),transparent_48%),radial-gradient(circle_at_50%_85%,rgba(194,181,255,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/80 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-4 h-44 w-44 rounded-full bg-[#E8E2FF]/70 blur-3xl" />

      <section className="relative mx-auto flex min-h-[72vh] w-full max-w-4xl items-center justify-center">
        <SparkleTrail className="w-full rounded-3xl">
          <motion.div
            className="lumina-shell relative mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl px-5 py-8 text-center sm:px-8 sm:py-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border-4 border-white/80 bg-white/80 shadow-[0_14px_28px_-16px_rgba(68,52,128,0.35)] ring-4 ring-[#EEE9FF] sm:h-32 sm:w-32">
              <Image
                src="/lumina-icon.png"
                alt="ルミナのアイコン"
                width={128}
                height={128}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <p className="mb-2 text-xs tracking-[0.24em] text-[#7A6FB0]">WHITE WITCH LUMINA</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">LUMINA</h1>
            <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">光と静寂の占い</p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/basic-personality"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#8E7CFF] px-5 text-base font-medium text-white shadow-md transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7CFF] focus-visible:ring-offset-2 sm:w-auto sm:min-w-56"
              >
                生年月日で占う（基本性格）
              </Link>
              <Link
                href="/daily-fortune"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#8E7CFF] bg-white/70 px-5 text-base font-medium text-[#8E7CFF] transition hover:bg-[#F3F0FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E7CFF] focus-visible:ring-offset-2 sm:w-auto sm:min-w-56"
              >
                今日の運勢を見る
              </Link>
            </div>
          </motion.div>
        </SparkleTrail>
      </section>

      <section className="relative mx-auto -mt-2 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {recommendedLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:shadow-md"
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-[#7A6FB0]">{item.label}</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-slate-900">{item.title}</p>
                <span className="text-sm text-[#6E5AE8] transition group-hover:translate-x-0.5">
                  →
                </span>
              </div>
            </Link>
          ))}
        </motion.div>
      </section>

      <section className="relative mx-auto mt-6 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div className="group flex h-full flex-col rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:shadow-md sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">光の導きタロット占い</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              ルミナとの対話から、今のあなたに必要な言葉を受け取ります。
            </p>
            <div className="mt-auto flex justify-end pt-4">
              <button
                type="button"
                onClick={onStart}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#8E7CFF]/30 px-4 text-base font-medium text-[#6E5AE8] transition hover:bg-[#F6F4FF]"
              >
                引く
              </button>
            </div>
          </div>

          {menuItems.map((item) => (
            <div
              key={item.href}
              className="group flex h-full flex-col rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:shadow-md sm:p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              <div className="mt-auto flex justify-end pt-4">
                <Link
                  href={item.href}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#8E7CFF]/30 px-4 text-base font-medium text-[#6E5AE8] transition hover:bg-[#F6F4FF]"
                >
                  {item.ctaLabel}
                </Link>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="relative mx-auto mt-8 w-full max-w-5xl rounded-3xl bg-[#F8F7FB] px-5 py-8 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <p className="text-base leading-relaxed text-slate-700">
            がんばりすぎた心に、静かな光を。
          </p>
          <p className="mt-2 text-base leading-relaxed text-slate-700">
            LUMINAの占いは、あなたを整えるための言葉です。
          </p>
        </motion.div>
      </section>
    </div>
  )
}
