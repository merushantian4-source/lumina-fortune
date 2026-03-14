"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";
import { listColumnArticles, listColumnCategories, type ColumnCategory } from "@/lib/columns";

type FilterValue = "すべて" | ColumnCategory;
const CATEGORY_LABELS: Record<string, string> = {
  仕事: "仕事",
  失恋: "恋愛",
  不安: "不安",
  心: "不安",
  願い: "願い",
  占い: "占い",
};

const CATEGORY_EMOJI: Record<string, string> = {
  仕事: "📖",
  失恋: "❤️",
  不安: "😰",
  心: "😰",
  願い: "✨",
  占い: "🔮",
};

function stripTitleEmoji(title: string): string {
  return title.replace(/^📖\s*/, "");
}

export default function ColumnsPage() {
  const [filter, setFilter] = useState<FilterValue>("すべて");
  const categories = useMemo(() => listColumnCategories(), []);
  const articles = useMemo(() => listColumnArticles(filter), [filter]);

  return (
    <PageShell
      maxWidth="wide"
      title="館の書棚"
      description="静かな夜に開ける、小さな読み物を集めた書棚です。"
      backHref="/"
      backLabel="トップへ戻る"
    >
      <GlassCard>
        <div className="flex flex-wrap items-center gap-2">
          <LuminaButton
            type="button"
            tone={filter === "すべて" ? "primary" : "secondary"}
            onClick={() => setFilter("すべて")}
          >
            すべて
          </LuminaButton>
          {categories.map((category) => (
            <LuminaButton
              key={category}
              type="button"
              tone={filter === category ? "primary" : "secondary"}
              onClick={() => setFilter(category)}
            >
              {CATEGORY_LABELS[category] ?? category}
            </LuminaButton>
          ))}
        </div>
      </GlassCard>

      <div className="relative mt-4 overflow-hidden rounded-2xl border border-[#e1d5bf]/74 shadow-[0_14px_30px_-24px_rgba(82,69,53,0.24)]">
        <Image
          src="/gazou/dokusyo.png"
          alt="館の書棚"
          width={1050}
          height={500}
          className="h-auto w-full object-cover"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-white/25" />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/columns/${article.slug}`}
            className="group flex flex-col rounded-2xl border border-[#e1d5bf]/74 bg-white/60 px-5 py-4 shadow-[0_8px_20px_-16px_rgba(82,69,53,0.18)] backdrop-blur transition hover:bg-[#fff8ed]/80"
          >
            <span className="inline-flex self-start rounded-full border border-[#d8c8ab]/82 bg-[#fff8ed]/86 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-[#7f725f]">
              {CATEGORY_LABELS[article.category] ?? article.category}
            </span>
            <h2 className="mt-2 text-base font-medium leading-snug text-[#2e2a26] group-hover:text-[#4a3f2f]">
              {CATEGORY_EMOJI[article.category] ? `${CATEGORY_EMOJI[article.category]} ` : ""}{stripTitleEmoji(article.title)}
            </h2>
            <p className="mt-1.5 line-clamp-1 text-sm leading-relaxed text-[#6f6556]">
              {article.lead}
            </p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
