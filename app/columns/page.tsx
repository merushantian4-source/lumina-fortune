"use client";

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
  願い: "願い",
  占い: "占い",
};

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

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <GlassCard key={article.slug} className="h-full">
            <p className="text-xs font-medium tracking-wide text-[#847967]">
              {CATEGORY_LABELS[article.category] ?? article.category}
            </p>
            <h2 className="mt-1 text-xl font-medium text-[#2e2a26]">{article.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#544c42]">{article.lead}</p>
            <Link
              href={`/columns/${article.slug}`}
              className="mt-4 inline-flex text-sm font-medium text-[#5f5344] underline decoration-[#b9a78b] underline-offset-2"
            >
              続きを読む
            </Link>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
