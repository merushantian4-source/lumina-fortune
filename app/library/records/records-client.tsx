"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { recordChapters } from "@/lib/library/records";

export function RecordsClient() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recordChapters;
    return recordChapters.filter((chapter) => chapter.title.toLowerCase().includes(q) || chapter.subtitle.toLowerCase().includes(q));
  }, [query]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#e1d5bf]/72 bg-[linear-gradient(165deg,rgba(255,252,246,0.76),rgba(248,242,231,0.68))] p-4 shadow-[0_10px_20px_-22px_rgba(82,69,53,0.2)] sm:p-5">
      <div className="pointer-events-none absolute -right-52 -top-40 h-[38rem] w-[38rem] overflow-hidden rounded-full border border-[#e7dcc8]/75 opacity-32">
        <Image src="/gazou/IMG_4216.webp" alt="" fill className="object-cover" sizes="608px" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,252,246,0.1),rgba(255,252,246,0.34))]" />
      </div>

      <div className="relative z-10 mb-4">
        <label htmlFor="record-search" className="mb-2 block text-sm text-[#544c42]">
          章タイトルで探す
        </label>
        <input
          id="record-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例: 起源 / ルミナ / カード"
          className="lumina-input w-full rounded-xl px-4 py-3 text-sm"
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filtered.map((chapter) => (
          <article
            key={chapter.slug}
            className="rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(162deg,rgba(255,252,246,0.92),rgba(248,242,231,0.88))] p-4 shadow-[0_10px_20px_-20px_rgba(82,69,53,0.22)]"
          >
            <p className="text-lg">{chapter.icon}</p>
            <h3 className="mt-2 text-lg font-medium text-[#2e2a26]">{chapter.title}</h3>
            <p className="mt-1 text-sm text-[#544c42]">{chapter.subtitle}</p>
            <div className="mt-3">
              <Link
                href={`/library/records/${chapter.slug}`}
                className="inline-flex items-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-3 py-1.5 text-sm text-[#6f6556] transition hover:bg-[#f9f3e7]"
              >
                読む →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? <p className="relative z-10 mt-4 text-sm text-[#7d6d5a]">該当する章は見つかりませんでした。</p> : null}
    </section>
  );
}
