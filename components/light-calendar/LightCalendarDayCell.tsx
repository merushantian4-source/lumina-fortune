"use client";

import {
  getCalendarCellBadges,
  getCellAccent,
} from "@/lib/light-calendar/lightCalendarUi2026";

type DayCellProps = {
  date: string;
  dayNumber: number;
  isSelected?: boolean;
  onClick?: () => void;
};

export function LightCalendarDayCell({
  date,
  dayNumber,
  isSelected,
  onClick,
}: DayCellProps) {
  const badges = getCalendarCellBadges(date);
  const accent = getCellAccent(date);

  const accentClass =
    accent === "gold"
      ? "bg-[linear-gradient(180deg,#fff8e8,#fff2cc)] border-amber-200"
      : accent === "warm"
        ? "bg-[linear-gradient(180deg,#fffaf7,#fff1ea)] border-rose-200"
        : accent === "muted"
          ? "bg-[linear-gradient(180deg,#faf8f6,#f2efeb)] border-slate-200"
          : "bg-white/80 border-[#eee4d6]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[92px] w-full rounded-2xl border p-2 text-left transition hover:shadow-sm ${accentClass} ${
        isSelected ? "ring-2 ring-[#d9c3a3]" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-[#3c342d]">{dayNumber}</span>
      </div>

      <div className="mt-2 flex flex-col gap-1">
        {badges.map((badge) => (
          <span
            key={`${date}-${badge.type}`}
            className="inline-flex w-fit rounded-full border border-white/70 bg-white/85 px-2 py-0.5 text-[10px] text-[#7b6857]"
          >
            {badge.shortLabel}
          </span>
        ))}
      </div>
    </button>
  );
}
