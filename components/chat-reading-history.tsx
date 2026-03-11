import { useState } from "react";

export type ChatReadingHistoryItem = {
  id: string;
  createdAt: string;
  userQuestion: string;
  cardName: string;
  readingText: string;
};

interface ChatReadingHistoryProps {
  items: ChatReadingHistoryItem[];
}

function formatHistoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function ChatReadingHistory({ items }: ChatReadingHistoryProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <section className="mx-auto mt-4 w-full max-w-3xl px-4">
      <div className="rounded-[1.5rem] border border-[#e6dac5]/80 bg-[linear-gradient(180deg,rgba(255,252,246,0.9),rgba(247,241,230,0.82))] p-4 shadow-[0_14px_30px_-24px_rgba(70,58,44,0.28)]">
        <p className="text-[11px] tracking-[0.24em] text-[#8a7b67]">READING ARCHIVE</p>
        <h2 className="mt-1 text-base text-[#2f2a24]">これまでの導き</h2>
        <p className="mt-3 text-xs text-[#786b5d] whitespace-pre-line">
          {"これまでルミナがカードから受け取った\n小さな導きをここに残しています。"}
        </p>

        <div className="mt-4">
          <p className="text-sm text-[#5f5449]">導きの記録</p>
        </div>

        {!items.length ? (
          <div className="mt-4 rounded-[1.2rem] border border-[#e7dcc8]/90 bg-white/60 px-4 py-5 text-sm leading-relaxed text-[#6f6458] whitespace-pre-line">
            {"まだ導きの記録はありません。\nルミナに気になることを\nひとつ聞いてみてくださいね。"}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="overflow-hidden rounded-[1.2rem] border border-[#e7dcc8]/90 bg-white/72">
                <button
                  type="button"
                  onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                  className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left"
                >
                  <div>
                    <p className="text-xs text-[#8a7b67]">{formatHistoryDate(item.createdAt)}</p>
                    <p className="mt-1 text-sm font-medium text-[#322c26]">{item.cardName}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-[#6f6458]">{item.userQuestion}</p>
                  </div>
                  <span className="mt-1 text-xs text-[#8a7b67]">{isOpen ? "閉じる" : "開く"}</span>
                </button>

                {isOpen ? (
                  <div className="border-t border-[#eee4d4] px-4 py-3 text-sm leading-relaxed text-[#3c352e]">
                    <p className="text-xs tracking-[0.16em] text-[#8a7b67]">相談内容</p>
                    <p className="mt-1 whitespace-pre-wrap">{item.userQuestion}</p>
                    <p className="mt-3 text-xs tracking-[0.16em] text-[#8a7b67]">リーディング</p>
                    <p className="mt-1 whitespace-pre-wrap">{item.readingText}</p>
                    <button
                      type="button"
                      className="mt-4 text-xs text-[#8a7b67] underline underline-offset-4 hover:text-[#665b4f]"
                    >
                      この導きをしまう
                    </button>
                  </div>
                ) : null}
              </div>
            );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
