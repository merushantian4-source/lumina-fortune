"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { SpecialOccasionEvent } from "@/lib/special-occasions";

type SpecialOccasionCardProps = {
  event: SpecialOccasionEvent;
};

export function SpecialOccasionCard({ event }: SpecialOccasionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.03 }}
      className="relative mx-auto mt-5 w-full max-w-5xl"
    >
      <div className="overflow-hidden rounded-[28px] border border-[#dbcdb4]/80 bg-[linear-gradient(160deg,rgba(255,251,246,0.97),rgba(245,236,224,0.92))] p-5 shadow-[0_18px_30px_-24px_rgba(96,80,60,0.2)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs tracking-[0.18em] text-[#8a7a64]">{event.badge}</p>
            <h2 className="mt-1 text-xl font-medium text-[#2e2a26] sm:text-2xl">{event.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#544c42] sm:text-[15px]">{event.message}</p>
          </div>
          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#dcccae]/85 bg-[linear-gradient(180deg,#fffaf0,#f6ead7)] text-[24px] text-[#9c8661] shadow-sm sm:flex">
            ✨
          </div>
        </div>

        {event.card ? (
          <div className="mt-4 rounded-[24px] border border-[#e4d7c2]/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(252,246,236,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <p className="text-xs tracking-[0.18em] text-[#8a7a64]">祝福カード</p>
            <div className="mt-3 flex items-start gap-4">
              <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[#dcccae]/85 bg-[linear-gradient(180deg,#fffaf0,#f6ead7)] text-[26px] text-[#9c8661] shadow-sm">
                ✨
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-medium text-[#2e2a26]">{event.card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#544c42]">{event.card.message}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/daily-fortune"
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#a79678]/80 bg-[#b7a076] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#ad9568]"
          >
            今日の占いを見る
          </Link>
          <Link
            href="/profile"
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-4 py-1.5 text-sm font-medium text-[#6f6556] transition hover:bg-[#fffaf0]"
          >
            プロフィールを確認
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
