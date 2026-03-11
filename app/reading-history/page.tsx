"use client";

import Link from "next/link";
import { useState } from "react";

import { getOrCreateChatVisitorKey } from "@/lib/membership";
import { runClientModerationCheck } from "@/lib/moderation/clientCheck";
import {
  readAllChatReadingHistory,
  updateChatReadingMemo,
  type ChatReadingHistoryItem,
} from "@/lib/chat-reading-history-store";

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00+09:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Tokyo",
  }).format(date);
}

function formatDateTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(date);
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function buildCalendarDays(displayMonth: Date) {
  const start = getMonthStart(displayMonth);
  const startWeekday = start.getDay();
  const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate();
  const cells: Array<{ key: string; label: string; dateKey?: string; inMonth: boolean }> = [];

  for (let index = 0; index < startWeekday; index += 1) {
    cells.push({ key: `blank-start-${index}`, label: "", inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const current = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
    cells.push({
      key: toDateKey(current),
      label: String(day),
      dateKey: toDateKey(current),
      inMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `blank-end-${cells.length}`, label: "", inMonth: false });
  }

  return cells;
}

function getItemQuestion(item: ChatReadingHistoryItem) {
  return item.question || item.userQuestion;
}

function getItemReading(item: ChatReadingHistoryItem) {
  return [item.readingShort, item.readingDetail].filter(Boolean).join("\n\n") || item.readingText;
}

function buildInitialHistoryState() {
  const loaded = readAllChatReadingHistory();
  const latest = loaded[0]?.dateKey ?? null;
  const initialMonth = latest
    ? getMonthStart(new Date(`${latest}T00:00:00+09:00`))
    : getMonthStart(new Date());
  const memoDrafts = loaded.reduce<Record<string, string>>((acc, item) => {
    acc[item.id] = item.memo ?? "";
    return acc;
  }, {});

  return {
    items: loaded,
    selectedDateKey: latest,
    displayMonth: initialMonth,
    memoDrafts,
  };
}

export default function ReadingHistoryPage() {
  const [initialState] = useState(buildInitialHistoryState);
  const [items, setItems] = useState<ChatReadingHistoryItem[]>(initialState.items);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(initialState.selectedDateKey);
  const [displayMonth, setDisplayMonth] = useState(initialState.displayMonth);
  const [memoDrafts, setMemoDrafts] = useState<Record<string, string>>(initialState.memoDrafts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memoError, setMemoError] = useState<string | null>(null);

  const todayKey = toDateKey(new Date());
  const datesWithReadings = new Set(items.map((item) => item.dateKey));
  const monthItems = buildCalendarDays(displayMonth);
  const selectedItems = selectedDateKey ? items.filter((item) => item.dateKey === selectedDateKey) : [];

  const handleSaveMemo = async (id: string) => {
    const memo = memoDrafts[id] ?? "";
    const moderation = runClientModerationCheck(memo, getOrCreateChatVisitorKey(), {
      maxLength: 500,
    });

    if (!moderation.ok) {
      setMemoError(moderation.error);
      return;
    }

    try {
      const response = await fetch("/api/reading-history/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memo: moderation.normalizedText,
          userKey: getOrCreateChatVisitorKey(),
        }),
      });
      const data = (await response.json()) as { ok?: boolean; memo?: string; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "メモを保存できませんでした。");
      }

      const next = updateChatReadingMemo(id, data.memo ?? moderation.normalizedText);
      setItems(next);
      setMemoError(null);
      setEditingId(null);
    } catch (error) {
      setMemoError(error instanceof Error ? error.message : "メモを保存できませんでした。");
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,249,239,0.96),rgba(244,235,220,0.94)_42%,rgba(234,224,208,0.96)_100%)] px-4 py-8 text-[#2f2a24]">
      <div className="relative mx-auto max-w-4xl">
        <Link
          href="/?start=tarot"
          className="text-sm text-[#7a6c59] underline underline-offset-4 hover:text-[#544a3f]"
        >
          光の導きタロット占いへ戻る
        </Link>

        <section className="mt-4 rounded-[2rem] border border-[#eadfcf]/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.94),rgba(247,241,231,0.9))] p-5 shadow-[0_24px_60px_-32px_rgba(94,79,61,0.28)] backdrop-blur-sm">
          <p className="text-[11px] tracking-[0.28em] text-[#9a896f]">GUIDANCE ARCHIVE</p>
          <h1 className="mt-2 text-2xl text-[#2f2a24]">読解の記録</h1>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#6f6458]">
            今日を含むローカルの読解履歴を日付ごとに表示します。ページを離れても、その日の記録はここから読み返せます。
          </p>

          <div className="mt-6 rounded-[1.6rem] border border-[#eadfcf]/90 bg-[linear-gradient(180deg,rgba(255,251,244,0.86),rgba(250,244,234,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="rounded-full border border-[#dbcdb6]/78 bg-[#fff9ef] px-3 py-1.5 text-sm text-[#5d5449] transition hover:bg-[#f8f1e4]"
              >
                前の月
              </button>
              <p className="text-sm font-medium text-[#4b4035]">
                {displayMonth.getFullYear()}年{displayMonth.getMonth() + 1}月
              </p>
              <button
                type="button"
                onClick={() => setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="rounded-full border border-[#dbcdb6]/78 bg-[#fff9ef] px-3 py-1.5 text-sm text-[#5d5449] transition hover:bg-[#f8f1e4]"
              >
                次の月
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-[#96846d]">
              {["日", "月", "火", "水", "木", "金", "土"].map((weekday) => (
                <div key={weekday}>{weekday}</div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {monthItems.map((day) => {
                const hasReading = day.dateKey ? datesWithReadings.has(day.dateKey) : false;
                const isSelected = day.dateKey === selectedDateKey;
                const isToday = day.dateKey === todayKey;

                return (
                  <button
                    key={day.key}
                    type="button"
                    disabled={!day.inMonth}
                    onClick={() => day.dateKey && setSelectedDateKey(day.dateKey)}
                    className={[
                      "relative min-h-12 rounded-2xl border text-sm transition",
                      day.inMonth
                        ? "border-[#e7dcc8]/80 bg-[#fffaf2] text-[#4e453a] hover:bg-[#f8f0e2]"
                        : "border-transparent bg-transparent text-transparent",
                      hasReading ? "shadow-[0_0_18px_rgba(231,210,157,0.34)]" : "",
                      isToday ? "shadow-[0_0_22px_rgba(244,231,190,0.42)]" : "",
                      isSelected ? "border-[#d4bf98] bg-[#f0e3ca]" : "",
                    ].join(" ")}
                  >
                    {isToday && day.inMonth ? (
                      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(255,245,210,0.38),rgba(255,250,242,0))]" />
                    ) : null}
                    <span className="relative block">{day.label}</span>
                    {hasReading ? (
                      <span className="relative mt-1 flex items-center justify-center gap-1 text-[10px] text-[#c8a96d]">
                        <span>記録</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#d5b46e]" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-[#eadfcf]/90 bg-[linear-gradient(180deg,rgba(255,251,244,0.84),rgba(248,242,233,0.9))] p-4">
            <p className="text-sm font-medium text-[#4b4035]">
              {selectedDateKey
                ? `${formatDateLabel(selectedDateKey)}の読解`
                : "日付を選ぶと、その日の読解を確認できます。"}
            </p>

            {memoError ? <p className="mt-3 text-sm text-[#8b5e5e]">{memoError}</p> : null}

            {!selectedDateKey || !selectedItems.length ? (
              <p className="mt-3 text-sm leading-relaxed text-[#6f6458]">
                まだこの日の読解はありません。カードを引いたあとに、ここへ戻って確認できます。
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {selectedItems.map((item) => {
                  const isEditing = editingId === item.id;

                  return (
                    <article
                      key={item.id}
                      className="rounded-[1.5rem] border border-[#eadfcf]/90 bg-[linear-gradient(180deg,rgba(255,255,252,0.82),rgba(248,243,235,0.88))] p-4 shadow-[0_18px_36px_-28px_rgba(84,67,47,0.22)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs tracking-[0.16em] text-[#9b8a73]">CARD</p>
                          <p className="mt-1 text-sm font-medium text-[#2f2a24]">{item.cardName}</p>
                          <p className="mt-2 text-xs text-[#8a7b67]">{formatDateTimeLabel(item.createdAt)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId((prev) => (prev === item.id ? null : item.id))}
                            className="rounded-full border border-[#dbcdb6]/78 bg-[#fff9ef] px-3 py-1.5 text-xs text-[#5d5449] transition hover:bg-[#f8f1e4]"
                          >
                            メモを残す
                          </button>
                          <Link
                            href="/?start=tarot"
                            className="rounded-full border border-[#dbcdb6]/78 bg-[#fff9ef] px-3 py-1.5 text-xs text-[#5d5449] transition hover:bg-[#f8f1e4]"
                          >
                            もう一度引く
                          </Link>
                        </div>
                      </div>

                      <div className="mt-4 space-y-4 text-sm leading-relaxed text-[#3c352e]">
                        <div>
                          <p className="text-xs tracking-[0.16em] text-[#9b8a73]">QUESTION</p>
                          <p className="mt-1 whitespace-pre-wrap">{getItemQuestion(item)}</p>
                        </div>
                        <div>
                          <p className="text-xs tracking-[0.16em] text-[#9b8a73]">READING</p>
                          <p className="mt-1 whitespace-pre-wrap">{getItemReading(item)}</p>
                        </div>
                        <div>
                          <p className="text-xs tracking-[0.16em] text-[#9b8a73]">MEMO</p>
                          {isEditing ? (
                            <div className="mt-2">
                              <textarea
                                value={memoDrafts[item.id] ?? ""}
                                onChange={(event) =>
                                  setMemoDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))
                                }
                                placeholder="その日に感じたことや、あとから見返したい気づきを残せます。"
                                className="min-h-24 w-full rounded-2xl border border-[#dcccb3]/80 bg-white px-3 py-3 text-sm text-[#3c352e] outline-none placeholder:text-[#a29586] focus:border-[#ccb07f]"
                              />
                              <div className="mt-3 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleSaveMemo(item.id)}
                                  className="rounded-full border border-[#dbcdb6]/78 bg-[#fff9ef] px-4 py-2 text-sm text-[#5d5449] transition hover:bg-[#f8f1e4]"
                                >
                                  メモを保存する
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1 rounded-2xl border border-[#efe4d4] bg-white/65 px-3 py-3 text-[#5d5449]">
                              {item.memo?.trim() ? (
                                <p className="whitespace-pre-wrap">{item.memo}</p>
                              ) : (
                                <p className="text-[#9a8d7e]">まだメモはありません。</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
