"use client";

import Link from "next/link";
import { useState } from "react";

import { readFavoriteGuidance, type FavoriteGuidanceItem } from "@/lib/chat-favorite-guidance";

function formatSavedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function SavedGuidancePage() {
  const [items] = useState<FavoriteGuidanceItem[]>(() => readFavoriteGuidance());
  const [openId, setOpenId] = useState<string | null>(() => readFavoriteGuidance()[0]?.id ?? null);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f1e6_0%,#efe5d2_100%)] px-4 py-8 text-[#2f2a24]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#7a6c59] underline underline-offset-4 hover:text-[#544a3f]">
          白の館へ戻る
        </Link>

        <section className="mt-4 rounded-[2rem] border border-[#e6dac5]/80 bg-[linear-gradient(180deg,rgba(255,252,246,0.94),rgba(246,239,227,0.9))] p-5 shadow-[0_18px_40px_-28px_rgba(70,58,44,0.28)]">
          <p className="text-[11px] tracking-[0.24em] text-[#8a7b67]">SAVED GUIDANCE</p>
          <h1 className="mt-1 text-2xl">大切な導き</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#6f6458]">
            心に残しておきたい導きを、ここでゆっくり読み返せます。
          </p>

          {!items.length ? (
            <div className="mt-6 rounded-[1.4rem] border border-[#e7dcc8]/90 bg-white/68 px-4 py-6 text-sm leading-relaxed text-[#6f6458]">
              まだ大切な導きはありません。<br />
              気に入った鑑定結果があれば、チャット画面から残しておけます。
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((item) => {
                const isOpen = item.id === openId;
                return (
                  <article key={item.id} className="overflow-hidden rounded-[1.3rem] border border-[#e7dcc8]/90 bg-white/74">
                    <button
                      type="button"
                      onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                      className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
                    >
                      <div>
                        <p className="text-xs text-[#8a7b67]">{formatSavedAt(item.savedAt)}</p>
                        <p className="mt-1 text-sm font-medium text-[#2f2a24]">{item.cardName}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-[#6f6458]">{item.userQuestion}</p>
                      </div>
                      <span className="text-xs text-[#8a7b67]">{isOpen ? "閉じる" : "開く"}</span>
                    </button>

                    {isOpen ? (
                      <div className="border-t border-[#eee4d4] px-4 py-4 text-sm leading-relaxed text-[#3c352e]">
                        <p className="text-xs tracking-[0.16em] text-[#8a7b67]">質問</p>
                        <p className="mt-1 whitespace-pre-wrap">{item.userQuestion}</p>
                        <p className="mt-3 text-xs tracking-[0.16em] text-[#8a7b67]">リーディング</p>
                        <p className="mt-1 whitespace-pre-wrap">{item.readingText}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
