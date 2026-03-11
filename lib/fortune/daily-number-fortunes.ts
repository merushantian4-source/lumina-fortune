import {
  isFortuneNumber,
  type FortuneNumber,
  type DailyFlowLevel,
  type DailyNumberFortune,
} from "./types";

/* ---------- dayEnergyNumberFromDate ---------- */

export function dayEnergyNumberFromDate(dateString: string): FortuneNumber {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error("Invalid date format");
  }
  const digits = dateString.replace(/\D/g, "");
  let sum = digits.split("").reduce((total, d) => total + Number(d), 0);
  while (sum >= 10) {
    sum = String(sum)
      .split("")
      .reduce((total, d) => total + Number(d), 0);
  }
  if (!isFortuneNumber(sum)) {
    throw new Error("Day energy number out of range");
  }
  return sum;
}

/* ---------- Flow matrix (destiny x dayNumber) ---------- */

const FLOW_MATRIX: Record<FortuneNumber, Record<FortuneNumber, DailyFlowLevel>> = {
  1: { 1: 5, 2: 3, 3: 4, 4: 2, 5: 4, 6: 3, 7: 3, 8: 4, 9: 4 },
  2: { 1: 3, 2: 5, 3: 3, 4: 4, 5: 3, 6: 4, 7: 2, 8: 3, 9: 4 },
  3: { 1: 4, 2: 3, 3: 5, 4: 3, 5: 4, 6: 3, 7: 4, 8: 2, 9: 3 },
  4: { 1: 2, 2: 4, 3: 3, 4: 5, 5: 3, 6: 2, 7: 4, 8: 4, 9: 3 },
  5: { 1: 4, 2: 3, 3: 4, 4: 3, 5: 5, 6: 3, 7: 3, 8: 2, 9: 4 },
  6: { 1: 3, 2: 4, 3: 3, 4: 2, 5: 3, 6: 5, 7: 4, 8: 3, 9: 4 },
  7: { 1: 3, 2: 2, 3: 4, 4: 4, 5: 3, 6: 4, 7: 5, 8: 3, 9: 3 },
  8: { 1: 4, 2: 3, 3: 2, 4: 4, 5: 2, 6: 3, 7: 3, 8: 5, 9: 4 },
  9: { 1: 4, 2: 4, 3: 3, 4: 3, 5: 4, 6: 4, 7: 3, 8: 4, 9: 5 },
};

/* ---------- Titles per dayNumber ---------- */

const TITLES: Record<FortuneNumber, string> = {
  1: "始まりの火の道",
  2: "調和の静かな橋",
  3: "表現の色とりどりの波",
  4: "堅実な礎の力",
  5: "変化の風の通り道",
  6: "安定の慈しみの輪",
  7: "内省の深い泉",
  8: "実現の確かな歩み",
  9: "包容の広い空",
};

/* ---------- Content per dayNumber ---------- */

const DAY_CONTENT: Record<
  FortuneNumber,
  { summary: string; action: string; emotion: string; tags: string[] }
> = {
  1: {
    summary: "新しい一歩を踏み出すエネルギーが高まる流れです。",
    action: "小さくても具体的な行動を一つ選ぶと、今日の流れをあなたらしく扱えます。",
    emotion: "勢いだけで走ると息切れしやすいので、立ち止まる瞬間も大切です。",
    tags: ["始動", "決断", "意志", "独立"],
  },
  2: {
    summary: "周囲との調和が自然に整いやすい流れです。",
    action: "相手の話をひとつ深く聴くことで、今日の流れをあなたらしく扱えます。",
    emotion: "合わせすぎると自分を見失いやすいので、自分の声も聴いてあげてください。",
    tags: ["調和", "共感", "受容", "繊細"],
  },
  3: {
    summary: "表現力や発想が軽やかに広がりやすい流れです。",
    action: "思いついたことを形にしてみると、今日の流れをあなたらしく扱えます。",
    emotion: "楽しさの裏にある不安を見ないふりしないことも、表現の一部です。",
    tags: ["創造", "表現", "遊び心", "発信"],
  },
  4: {
    summary: "地に足のついた判断や段取りが活きやすい流れです。",
    action: "優先順位を一つだけ決めると、今日の流れをあなたらしく扱えます。",
    emotion: "完璧を求めすぎると窮屈になるので、ほどよさを意識すると楽になります。",
    tags: ["堅実", "計画", "安定", "信頼"],
  },
  5: {
    summary: "変化や新しい風を取り入れやすい流れです。",
    action: "いつもと違う選択を一つしてみると、今日の流れをあなたらしく扱えます。",
    emotion: "自由でいたい気持ちと安定のバランスを意識すると穏やかに過ごせます。",
    tags: ["変化", "自由", "冒険", "柔軟"],
  },
  6: {
    summary: "愛情や気遣いがやわらかく巡りやすい流れです。",
    action: "自分の気持ちを丁寧に伝えることで、今日の流れをあなたらしく扱えます。",
    emotion: "人のために動くことは素敵ですが、余白も同じくらい必要です。",
    tags: ["愛情", "循環", "堅実", "信頼"],
  },
  7: {
    summary: "内面を静かに見つめる力が高まりやすい流れです。",
    action: "一人の時間を少しだけ確保すると、今日の流れをあなたらしく扱えます。",
    emotion: "考えすぎて動けなくなる前に、小さなアウトプットを挟むと楽になります。",
    tags: ["内省", "洞察", "静寂", "探求"],
  },
  8: {
    summary: "目標に向かって着実に進む力が活きやすい流れです。",
    action: "成果を一つ形にすることを意識すると、今日の流れをあなたらしく扱えます。",
    emotion: "責任感が強まりやすい分、自分へのねぎらいも忘れないでください。",
    tags: ["達成", "実行", "責任", "豊かさ"],
  },
  9: {
    summary: "広い視野で物事を受け止められる流れです。",
    action: "誰かのために少しだけ時間を使うと、今日の流れをあなたらしく扱えます。",
    emotion: "すべてを受け入れようとしなくても大丈夫、境界線も優しさです。",
    tags: ["包容", "共感", "手放し", "完了"],
  },
};

/* ---------- Headline generation ---------- */

// First halves: 10-18 chars each
const HEADS: string[] = [
  "心の奥にある力がそっと動き出す",
  "足元から確かなものが立ち上がる",
  "流れの中で新しい芽が顔を出す",
  "ゆるやかに整っていく内側の声",
  "見えなかった景色がふと開ける",
  "思いがけない角度から光が届く",
  "積み重ねてきたものに手ごたえ",
  "自分の中にある温もりが目覚める",
  "つながりの奥に新しい意味を見る",
  "手のひらに残る確かさを辿れる",
  "静かに育っていた種が花開く",
  "背中を押すものが現れてくる",
  "小さな気づきが道を照らし出す",
  "視界がひらけて一歩が軽くなる",
  "内側の声にふと耳を澄ませる",
  "芯のある選択ができる自分に会う",
  "迷いの向こうに答えが透けて見える",
  "穏やかな力が根を張りはじめる",
  "あたらしい風が窓から入ってくる",
  "手の届くところに大切なものがある",
  "深い呼吸のあとに道筋が浮かぶ",
  "心地よいリズムを取り戻していく",
  "何かを受け取れる準備が整っていく",
  "ひとつの問いに光が差してくる",
  "広がりの中に自分の居場所を見る",
  "温かい記憶が今の自分を支える",
  "思いの輪郭がはっきりしてくる",
  "足取りが自然と前を向きはじめる",
  "心のどこかで何かが確かに動く",
  "気持ちの奥が少しずつほどけていく",
  "言葉にならない直感が冴えてくる",
  "余韻の中に大切な鍵が隠れている",
  "波が引いたあとに見つかるもの",
  "根っこのところで安心が広がる",
  "淡い光の中で進む方向が見える",
  "新しい問いかけが胸に響いてくる",
  "やさしさの輪が少しずつ広がる",
  "心の土壌にあたらしい種が届く",
  "自分だけの道しるべが見えてくる",
  "奥行きのある一歩を踏み出せる",
];

// Second halves: diverse endings to avoid consecutive same-ending violations.
// Ending types: 予感, 気配, きっかけ, 兆し, 流れ, ヒント, 手ごたえ, 瞬間, 整う, + unique last-4-char endings
const TAILS: string[] = [
  // 予感 endings
  "穏やかな予感",
  "あたらしい予感",
  "たしかな予感",
  // 気配 endings
  "確かな気配",
  "あざやかな気配",
  "豊かさの気配",
  "奥行きのある気配",
  // きっかけ endings
  "小さなきっかけ",
  "あたらしいきっかけ",
  "たしかなきっかけ",
  // 兆し endings
  "あたたかな兆し",
  "すこやかな兆し",
  "ゆたかな兆し",
  // 流れ endings
  "やわらかな流れ",
  "おだやかな流れ",
  // ヒント endings
  "静かなヒント",
  "さりげないヒント",
  // 手ごたえ endings
  "大切な手ごたえ",
  "透きとおる手ごたえ",
  "深まりゆく手ごたえ",
  "響きあう手ごたえ",
  // unique endings (distinct last-4-char)
  "清らかなリズム",
  "深い安心の中で",
  "一歩先の景色へ",
  "ちいさな転機へ",
  "芯の通った道筋",
  "やさしい手ざわり",
  "ゆたかな広がり",
  "たしかな道しるべ",
  "根づく安定感",
  "満ちてくる信頼感",
  "心地よい余韻",
  "凪のような安らぎ",
  "息づく確かさ",
  "うまれたての感覚",
  "確かな芽吹き",
  "内なる輝きへ",
  "味わいのある歩みへ",
  "根を張る覚悟と共に",
  "紡がれる信頼の中で",
  "育ちゆく可能性へ",
  "淡い温もりの中で",
  "ふくらむ期待と共に",
  "やわらかな手がかり",
  "ほのかな充実感",
  "あたたかな確信へ",
  "深まりのある余白",
  "しずかな納得感",
  "丁寧な問いかけ",
  "すこやかな土台",
  "まっすぐな感触",
];

const ENDING_MARKERS_INTERNAL = ["かも", "予感", "気配", "瞬間", "ヒント", "兆し", "きっかけ", "流れ", "そう", "整う"];
const ADVERB_MARKERS_INTERNAL = ["そっと", "静かに", "やわらかく", "ゆるやかに", "軽やかに", "自然に", "穏やかに", "しなやかに", "ふわりと", "じわりと", "ほどよく"];

function headlineEndingType(text: string): string {
  return ENDING_MARKERS_INTERNAL.find((m) => text.endsWith(m)) ?? text.slice(-4);
}

function headlineFindAdverb(text: string): string | null {
  return ADVERB_MARKERS_INTERNAL.find((m) => text.includes(m)) ?? null;
}

function headlineLeadingChunk(text: string): string {
  return text.slice(0, 8);
}

function simpleHash(year: number, month: number, day: number, destinyNumber: number): number {
  return (
    ((year * 400 + (month - 1) * 31 + (day - 1)) * 17 + destinyNumber * 13 + 7) >>> 0
  );
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Build a headline from HEADS[headIdx] + TAILS[tailIdx].
 * Returns null if the combined headline violates constraints.
 */
function buildHeadline(headIdx: number, tailIdx: number): string | null {
  const h = HEADS[headIdx % HEADS.length]!;
  const t = TAILS[tailIdx % TAILS.length]!;
  const combined = h + t;
  if (combined.length < 20 || combined.length > 36) return null;
  if (/日$/.test(combined)) return null;
  if (/刻/.test(combined)) return null;
  if (/\d+月\d+/.test(combined)) return null;
  if (/[。！？!?]/.test(combined)) return null;
  return combined;
}

/**
 * Generate all headlines for a full year at once, picking each headline
 * greedily so that it satisfies all consecutive constraints by construction.
 */
const headlineCache = new Map<string, string[]>();

/** Precompute all valid headline combinations */
let allValidHeadlines: string[] | null = null;
function getAllValidHeadlines(): string[] {
  if (allValidHeadlines) return allValidHeadlines;
  const set = new Set<string>();
  for (let hi = 0; hi < HEADS.length; hi++) {
    for (let ti = 0; ti < TAILS.length; ti++) {
      const h = buildHeadline(hi, ti);
      if (h) set.add(h);
    }
  }
  allValidHeadlines = Array.from(set);
  return allValidHeadlines;
}

function isAcceptable(
  candidate: string,
  prev: string | null,
  prevPrev: string | null,
): boolean {
  // Adverb must not be at end of headline
  const adv = headlineFindAdverb(candidate);
  if (adv && candidate.endsWith(adv)) return false;

  if (prev === null) return true;

  // Different ending type from previous
  if (headlineEndingType(candidate) === headlineEndingType(prev)) return false;

  // No consecutive same adverb
  const prevAdv = headlineFindAdverb(prev);
  if (adv && prevAdv && adv === prevAdv) return false;

  // No 3+ consecutive same leading chunk
  if (prevPrev !== null) {
    if (
      headlineLeadingChunk(candidate) === headlineLeadingChunk(prev) &&
      headlineLeadingChunk(prev) === headlineLeadingChunk(prevPrev)
    ) {
      return false;
    }
  }

  return true;
}

function getYearlyHeadlines(year: number, destinyNumber: FortuneNumber): string[] {
  const cacheKey = `${year}-${destinyNumber}`;
  const cached = headlineCache.get(cacheKey);
  if (cached) return cached;

  const pool = getAllValidHeadlines();
  const allHeadlines: string[] = [];
  const usedSet = new Set<string>();

  for (let month = 1; month <= 12; month++) {
    const days = daysInMonth(year, month);
    for (let day = 1; day <= days; day++) {
      const seed = simpleHash(year, month, day, destinyNumber);
      const prev = allHeadlines.length > 0 ? allHeadlines[allHeadlines.length - 1]! : null;
      const prevPrev = allHeadlines.length > 1 ? allHeadlines[allHeadlines.length - 2]! : null;

      let chosen: string | null = null;

      // Try hash-based selection first (for determinism/variety)
      for (let attempt = 0; attempt < pool.length; attempt++) {
        const idx = (seed + attempt * 31) % pool.length;
        const candidate = pool[idx]!;
        if (usedSet.has(candidate)) continue;
        if (!isAcceptable(candidate, prev, prevPrev)) continue;
        chosen = candidate;
        break;
      }

      // Exhaustive fallback
      if (!chosen) {
        for (let idx = 0; idx < pool.length; idx++) {
          const candidate = pool[idx]!;
          if (usedSet.has(candidate)) continue;
          if (!isAcceptable(candidate, prev, prevPrev)) continue;
          chosen = candidate;
          break;
        }
      }

      allHeadlines.push(chosen!);
      usedSet.add(chosen!);
    }
  }

  headlineCache.set(cacheKey, allHeadlines);
  return allHeadlines;
}

/* ---------- buildMonthlyDailyNumberFortunes ---------- */

export function buildMonthlyDailyNumberFortunes(params: {
  year: number;
  month: number;
  destinyNumber: FortuneNumber;
}): DailyNumberFortune[] {
  const { year, month, destinyNumber } = params;
  const days = daysInMonth(year, month);
  const yearlyHeadlines = getYearlyHeadlines(year, destinyNumber);

  // Calculate offset into yearly headlines for this month
  let offset = 0;
  for (let m = 1; m < month; m++) {
    offset += daysInMonth(year, m);
  }

  const results: DailyNumberFortune[] = [];
  for (let day = 1; day <= days; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayNumber = dayEnergyNumberFromDate(dateStr);
    const flowLevel = FLOW_MATRIX[destinyNumber][dayNumber];
    const content = DAY_CONTENT[dayNumber];

    results.push({
      date: dateStr,
      dayNumber,
      flowLevel,
      title: TITLES[dayNumber],
      headline: yearlyHeadlines[offset + day - 1]!,
      summary: content.summary,
      action: content.action,
      emotion: content.emotion,
      tags: [...content.tags],
    });
  }

  return results;
}
