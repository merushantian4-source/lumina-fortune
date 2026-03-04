"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton, LuminaLinkButton } from "@/components/ui/button";
import { getFixedDayForDate } from "@/lib/holidays";
import { getMoonPhaseForDateKey, type MajorMoonPhase } from "@/lib/moon-phase";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";
import { isFortuneNumber, type FortuneNumber } from "@/lib/fortune/types";
import { getLightWaveForDay, getPersonalScore } from "@/lib/light-wave";
import {
  getLuckyDaysForMonth,
  LUCKY_DAY_DESCRIPTIONS,
  LUCKY_DAY_LABELS,
  ROKUYO_DESCRIPTIONS,
  type LuckyDayRecord,
} from "@/lib/lucky-days";

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function buildMonthGrid(date: Date): Array<{ dateKey: string | null; day: number | null }> {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ dateKey: string | null; day: number | null }> = [];
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ dateKey: null, day: null });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ dateKey, day });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ dateKey: null, day: null });
  }
  return cells;
}

function weekdayLabels() {
  return ["日", "月", "火", "水", "木", "金", "土"];
}

type HolidayApiResponse = {
  month: string;
  holidays: Record<string, string>;
};

function getTodayDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type DayEvent = {
  id: string;
  icon: string;
  label: string;
  description: string;
  priority: number;
};

type WavePoint = {
  dateKey: string;
  day: number;
  score: number;
  baseScore: number;
};

const BIRTHDATE_STORAGE_KEY = "lumina_birthdate";
const DESTINY_NUMBER_LABELS: Record<FortuneNumber, string> = {
  1: "始まりの灯火",
  2: "月影の調律者",
  3: "祝福の歌い手",
  4: "大地の守り手",
  5: "風を渡る旅人",
  6: "愛を育てる灯",
  7: "静寂の賢者",
  8: "現実を築く王",
  9: "包容の祈り手",
};

function toDestinyNumberFromBirthdate(birthdate: string): FortuneNumber | null {
  try {
    const number = destinyNumberFromBirthdate(birthdate);
    return isFortuneNumber(number) ? number : null;
  } catch {
    return null;
  }
}

function loadInitialBirthdate(serverBirthdate: string | null): string {
  if (serverBirthdate) return serverBirthdate;
  if (typeof window === "undefined") return "";

  try {
    return localStorage.getItem(BIRTHDATE_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

type CalendarClientProps = {
  serverBirthdate: string | null;
};

export default function CalendarPage({ serverBirthdate }: CalendarClientProps) {
  const [birthDate, setBirthDate] = useState(() => loadInitialBirthdate(serverBirthdate));
  const [birthdateError, setBirthdateError] = useState("");
  const [viewWithoutSaving, setViewWithoutSaving] = useState(false);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<Record<string, string>>({});
  const [destinyNumber, setDestinyNumber] = useState<FortuneNumber | null>(() =>
    toDestinyNumberFromBirthdate(birthDate)
  );

  const month = useMemo(() => toMonthKey(monthDate), [monthDate]);
  const todayDateKey = useMemo(() => getTodayDateKey(), []);
  const grid = useMemo(() => buildMonthGrid(monthDate), [monthDate]);
  const monthDays = useMemo(() => getLuckyDaysForMonth(month), [month]);

  const handleBirthdateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBirthdateError("");

    const nextNumber = toDestinyNumberFromBirthdate(birthDate);
    if (!nextNumber) {
      setBirthdateError("正しい生年月日（YYYY-MM-DD）を入力してください。");
      return;
    }

    if (!viewWithoutSaving) {
      localStorage.setItem(BIRTHDATE_STORAGE_KEY, birthDate);
    }

    setDestinyNumber(nextNumber);
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      try {
        const res = await fetch(`/api/holidays?month=${month}`, { signal: controller.signal });
        const json = (await res.json()) as HolidayApiResponse;
        if (!cancelled) {
          setHolidays(json.holidays ?? {});
        }
      } catch {
        if (!cancelled) {
          setHolidays({});
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [month]);

  const selectedEvents = selectedDateKey
    ? buildDayEvents(selectedDateKey, monthDays[selectedDateKey], holidays[selectedDateKey])
    : [];
  const selectedMoonMajorPhase = selectedDateKey
    ? getMoonPhaseForDateKey(selectedDateKey).majorPhase
    : null;
  const wavePoints = useMemo(() => {
    const points: WavePoint[] = [];
    for (const cell of grid) {
      if (!cell.dateKey || !cell.day) continue;
      const fixed = getFixedDayForDate(cell.dateKey);
      const wave = getLightWaveForDay(
        cell.dateKey,
        monthDays[cell.dateKey],
        Boolean(holidays[cell.dateKey]),
        Boolean(fixed)
      );
      const score = destinyNumber
        ? getPersonalScore(wave.baseScore, destinyNumber, wave.eventType)
        : wave.baseScore;
      points.push({
        dateKey: cell.dateKey,
        day: cell.day,
        score,
        baseScore: wave.baseScore,
      });
    }
    return points;
  }, [grid, monthDays, holidays, destinyNumber]);
  const chartWidth = Math.max(720, wavePoints.length * 32);
  const chartHeight = 220;
  const chartTicks = wavePoints
    .map((point, index) => ({ ...point, index }))
    .filter(
      (point) =>
        point.index === 0 ||
        point.index === wavePoints.length - 1 ||
        (point.day % 5 === 0 && point.day !== wavePoints[wavePoints.length - 1]?.day)
    );

  const handlePrevMonth = () => {
    setSelectedDateKey(null);
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDateKey(null);
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <PageShell
      maxWidth="wide"
      title="光の暦"
      description="月の流れに合わせて、心を静かに整えるための小さな暦です。"
      backHref="/"
      backLabel="トップへ戻る"
    >
      {!destinyNumber ? (
        <GlassCard className="mb-4">
          <form onSubmit={handleBirthdateSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-[#2e2a26]">
              生年月日
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className="lumina-input mt-2 w-full rounded-lg px-4 py-2 transition"
                required
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-[#544c42]">
              <input
                type="checkbox"
                checked={viewWithoutSaving}
                onChange={(event) => setViewWithoutSaving(event.target.checked)}
                className="h-4 w-4 accent-[#958cad]"
              />
              保存しないで見る
            </label>
            <LuminaButton type="submit" tone="primary">
              この生年月日で見る
            </LuminaButton>
            {birthdateError ? <p className="text-sm text-red-700">{birthdateError}</p> : null}
          </form>
        </GlassCard>
      ) : null}

      <GlassCard>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <LuminaButton type="button" tone="secondary" onClick={handlePrevMonth}>
              前の月
            </LuminaButton>
            <p className="min-w-36 text-center text-lg font-medium text-[#2e2a26]">{monthLabel(monthDate)}</p>
            <LuminaButton type="button" tone="secondary" onClick={handleNextMonth}>
              次の月
            </LuminaButton>
          </div>
        </div>

        <p className="mt-4 text-sm text-[#544c42]">
          祝日と縁起のいい日を重ねて表示します。日付を押すと、その日の流れをやわらかく読めます。
        </p>

        <div className="mt-5 grid grid-cols-7 gap-2">
          {weekdayLabels().map((label) => (
            <div key={label} className="px-2 text-center text-xs font-medium text-[#7d6d5a]">
              {label}
            </div>
          ))}

          {grid.map((cell, idx) => {
            if (!cell.dateKey || !cell.day) {
              return <div key={`blank-${idx}`} className="h-24 rounded-xl border border-transparent" />;
            }
            const entry = monthDays[cell.dateKey];
            const active = selectedDateKey === cell.dateKey;
            const isToday = cell.dateKey === todayDateKey;
            const events = buildDayEvents(cell.dateKey, entry, holidays[cell.dateKey]);
            return (
              <button
                type="button"
                key={cell.dateKey}
                onClick={() => setSelectedDateKey(cell.dateKey)}
                className={`h-24 rounded-xl border p-2 text-left transition ${
                  active
                    ? "border-[#b9a78b] bg-[#fff8ed]"
                    : isToday
                      ? "border-[#b9a0dc]/80 bg-[#f3eefc] hover:bg-[#efe7fb]"
                    : "border-[#e1d5bf]/72 bg-white/60 hover:bg-[#fff8ed]/80"
                }`}
              >
                <p className={`text-sm font-medium ${isToday ? "text-[#5e4c86]" : "text-[#2e2a26]"}`}>{cell.day}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {events.length > 0 ? (
                    events.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#efe4d0] px-1 text-[10px] font-semibold leading-none text-[#6a5d4c]"
                        title={buildIconTitle(event)}
                      >
                        {event.icon}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs leading-relaxed text-[#6f6556]">—</span>
                  )}
                </div>
                <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-[#6f6556]">
                  {getCellCaption(events)}
                </p>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#847967]">光の波</p>
            <h2 className="mt-1 text-lg font-medium text-[#2e2a26]">
              {destinyNumber
                ? `${DESTINY_NUMBER_LABELS[destinyNumber]}のバイオリズム・グラフ`
                : "月相と縁起日から見た整いやすさ"}
            </h2>
          </div>
          <p className="text-xs text-[#6f6556]">
            {destinyNumber ? "表示: personalScore（baseScoreを補正）" : "表示: baseScore（共通）"}
          </p>
        </div>

        {!destinyNumber ? (
          <p className="mt-3 text-sm text-[#544c42]">
            運命数を入れると、日ごとの感じやすさの振れ幅を穏やかに補正して表示できます。
            <Link href="/basic-personality" className="ml-1 underline decoration-[#b9a78b] underline-offset-2">
              運命数を設定する
            </Link>
          </p>
        ) : (
          <p className="mt-3 text-sm text-[#544c42]">
            1ヶ月の運気の波を可視化。調子が良い時期と、慎重になるべき時期を月相と縁起日の共通波に、運命数ごとの「感じやすさ」の補正を重ねてグラフにしました。
          </p>
        )}

        <div className="mt-4 rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-3">
          <div className="overflow-x-auto pb-1">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-56"
              style={{ width: `${chartWidth}px`, minWidth: "100%" }}
              role="img"
              aria-label="光の波グラフ"
            >
              <line
                x1={toWaveX(0, Math.max(wavePoints.length, 2), chartWidth)}
                y1={toWaveY(75, chartHeight)}
                x2={toWaveX(Math.max(wavePoints.length - 1, 1), Math.max(wavePoints.length, 2), chartWidth)}
                y2={toWaveY(75, chartHeight)}
                stroke="#e8dcc7"
                strokeWidth="1"
              />
              <line
                x1={toWaveX(0, Math.max(wavePoints.length, 2), chartWidth)}
                y1={toWaveY(50, chartHeight)}
                x2={toWaveX(Math.max(wavePoints.length - 1, 1), Math.max(wavePoints.length, 2), chartWidth)}
                y2={toWaveY(50, chartHeight)}
                stroke="#e8dcc7"
                strokeWidth="1"
              />
              <line
                x1={toWaveX(0, Math.max(wavePoints.length, 2), chartWidth)}
                y1={toWaveY(25, chartHeight)}
                x2={toWaveX(Math.max(wavePoints.length - 1, 1), Math.max(wavePoints.length, 2), chartWidth)}
                y2={toWaveY(25, chartHeight)}
                stroke="#e8dcc7"
                strokeWidth="1"
              />
              {chartTicks.map((tick) => {
                const x = toWaveX(tick.index, wavePoints.length, chartWidth);
                return (
                  <g key={`${tick.dateKey}-tick`}>
                    <line
                      x1={x}
                      y1={toWaveY(5, chartHeight)}
                      x2={x}
                      y2={toWaveY(95, chartHeight)}
                      stroke="#eadfcb"
                      strokeWidth="0.9"
                      strokeDasharray="3 4"
                    />
                    <text x={x} y={chartHeight - 8} textAnchor="middle" fontSize="11" fill="#7d6d5a">
                      {tick.day}日
                    </text>
                  </g>
                );
              })}
              <polyline
                fill="none"
                stroke="#9e8867"
                strokeWidth="2.6"
                points={buildWavePolyline(wavePoints, chartWidth, chartHeight)}
              />
              {wavePoints.map((point, idx) => (
                <circle
                  key={point.dateKey}
                  cx={toWaveX(idx, wavePoints.length, chartWidth)}
                  cy={toWaveY(point.score, chartHeight)}
                  r="2.4"
                  fill="#c5ad88"
                />
              ))}
            </svg>
          </div>
          <div className="mt-1 text-[11px] text-[#7d6d5a]">
            日付ガイド: 5日ごとの縦線 / 最初日と最終日を表示
          </div>
        </div>
      </GlassCard>

      {selectedDateKey ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/20 p-4 sm:items-center">
          <div className="w-full max-w-xl rounded-2xl border border-[#e1d5bf]/78 bg-[linear-gradient(160deg,rgba(255,252,246,0.94),rgba(248,242,231,0.9))] p-5 shadow-[0_20px_36px_-24px_rgba(82,69,53,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-[#847967]">光の暦</p>
                <h2 className="mt-1 text-xl font-medium text-[#2e2a26]">{selectedDateKey}</h2>
              </div>
              <LuminaButton type="button" tone="secondary" onClick={() => setSelectedDateKey(null)}>
                閉じる
              </LuminaButton>
            </div>

            <DayDetail events={selectedEvents} moonMajorPhase={selectedMoonMajorPhase} />
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}

function DayDetail({
  events,
  moonMajorPhase,
}: {
  events: DayEvent[];
  moonMajorPhase: MajorMoonPhase;
}) {
  if (events.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
        <p className="text-sm leading-relaxed text-[#544c42]">この日は特別な登録がありません。</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {events.map((event) => (
        <div key={event.id} className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
          <p className="text-xs font-medium tracking-wide text-[#847967]">{event.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#544c42]">{event.description}</p>
        </div>
      ))}
      {moonMajorPhase === "new_moon" ? (
        <LuminaLinkButton href="/moon-rituals/new" className="inline-flex">
          新月の小さな儀式
        </LuminaLinkButton>
      ) : null}
      {moonMajorPhase === "full_moon" ? (
        <LuminaLinkButton href="/moon-rituals/full" className="inline-flex">
          満月の小さな儀式
        </LuminaLinkButton>
      ) : null}
    </div>
  );
}

function buildDayEvents(
  dateKey: string,
  entry: LuckyDayRecord | undefined,
  holidayName: string | undefined
): DayEvent[] {
  const events: DayEvent[] = [];
  const moon = getMoonPhaseForDateKey(dateKey);
  events.push({
    id: `moon-${dateKey}`,
    icon: moon.icon,
    label: `月の満ち欠け✨ ${moon.phaseLabel}`,
    description: buildMoonDescription(moon.phaseLabel, moon.majorPhase, moon.age),
    priority: 5,
  });

  const fixed = getFixedDayForDate(dateKey);
  if (fixed) {
    events.push({
      id: `fixed-${dateKey}-${fixed.label}`,
      icon: "季",
      label: fixed.label,
      description: fixed.description,
      priority: 10,
    });
  }

  if (holidayName) {
    events.push({
      id: `holiday-${dateKey}`,
      icon: "祝",
      label: `祝日: ${holidayName}`,
      description: `今日は「${holidayName}」。季節の節目に、いつもより深く呼吸して歩幅を整えると心が静かに満ちていきます。`,
      priority: 20,
    });
  }

  if (entry) {
    for (const kind of entry.lucky) {
      events.push({
        id: `lucky-${dateKey}-${kind}`,
        icon: "縁",
        label: LUCKY_DAY_LABELS[kind],
        description: `${LUCKY_DAY_DESCRIPTIONS[kind]}。焦らず丁寧に始めるほど、やさしい追い風が育っていきます。`,
        priority: 30,
      });
    }
    if (entry.rokuyo) {
      const base = ROKUYO_DESCRIPTIONS[entry.rokuyo] ?? "六曜の流れを意識して過ごす日";
      events.push({
        id: `rokuyo-${dateKey}-${entry.rokuyo}`,
        icon: "六",
        label: entry.rokuyo,
        description: `${base}。小さな確認を一つ重ねると、今日の流れがより穏やかになります。`,
        priority: 40,
      });
    }
  }

  return events.sort((a, b) => a.priority - b.priority);
}

function buildMoonDescription(label: string, majorPhase: MajorMoonPhase, age: number): string {
  const ageText = `月齢はおよそ${age.toFixed(1)}です。`;
  if (majorPhase === "new_moon") {
    return `${ageText}新月。静かに願いを置くほど、これからの流れがやさしく芽吹いていきます。`;
  }
  if (majorPhase === "first_quarter") {
    return `${ageText}上弦の月。動き出す力が満ちるとき。小さな一歩を丁寧に重ねると道が明るくなります。`;
  }
  if (majorPhase === "full_moon") {
    return `${ageText}満月。ここまでの歩みを受け取り、感謝を向けるほど心に澄んだ光が広がります。`;
  }
  if (majorPhase === "last_quarter") {
    return `${ageText}下弦の月。いらない力みをほどき、整え直すことで次の流れが軽やかになります。`;
  }
  return `${ageText}${label}。今の自分の呼吸にそっと合わせるように過ごすと、今日の流れが穏やかに整います。`;
}

function getCellCaption(events: DayEvent[]): string {
  const holiday = events.find((event) => event.id.startsWith("holiday-"));
  if (holiday) return holiday.label.replace(/^祝日:\s*/, "");

  const fixed = events.find((event) => event.id.startsWith("fixed-"));
  if (fixed) return fixed.label;

  const lucky = events.find((event) => event.id.startsWith("lucky-") || event.id.startsWith("rokuyo-"));
  if (lucky) return lucky.label;

  return " ";
}

function buildIconTitle(event: DayEvent): string {
  return `${event.label}：${event.description}`;
}

function toWaveX(index: number, total: number, width: number): number {
  const safeTotal = Math.max(total, 2);
  const innerWidth = Math.max(width - 48, 1);
  return 24 + (index / (safeTotal - 1)) * innerWidth;
}

function toWaveY(score: number, height: number): number {
  const clamped = Math.max(0, Math.min(100, score));
  const innerHeight = Math.max(height - 52, 1);
  return 16 + ((100 - clamped) / 100) * innerHeight;
}

function buildWavePolyline(points: WavePoint[], width: number, height: number): string {
  if (points.length === 0) return "";
  return points
    .map((point, idx) => `${toWaveX(idx, points.length, width)},${toWaveY(point.score, height)}`)
    .join(" ");
}
