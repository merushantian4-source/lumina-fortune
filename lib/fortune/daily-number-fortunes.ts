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

function getMonthPhase(day: number): MonthPhase {
  if (day <= 7) return "early";
  if (day <= 20) return "mid";
  return "late";
}

function shouldUseSeasonalWord(seed: number, offset: number): boolean {
  return seededIndex(seed, offset, 10) < Math.round(SEASONAL_USAGE_RATE * 10);
}

function getSeasonalBucketByPhase(phase: MonthPhase, seed: number, offset: number): SeasonalBucket {
  if (phase === "early") {
    return seededIndex(seed, offset, 10) < 6 ? "air" : "comfort";
  }
  if (phase === "mid") {
    return seededIndex(seed, offset, 10) < 6 ? "air" : "light";
  }
  return seededIndex(seed, offset, 10) < 6 ? "scene" : "light";
}

function pickSeasonalWord(
  month: number,
  phase: MonthPhase,
  seed: number,
  offset: number
): { bucket: SeasonalBucket; word: string } | null {
  if (month === 1) {
    const seasonal = JANUARY_SEASONAL_WORDS_BY_PHASE[phase];
    const bucket = getSeasonalBucketByPhase(phase, seed, offset);
    const words = seasonal[bucket];
    return {
      bucket,
      word: words[seededIndex(seed, offset + 1, words.length)]!,
    };
  }
  const seasonal = MONTHLY_SEASONAL_WORDS[month as MonthNumber];
  if (!seasonal) return null;
  const bucket = getSeasonalBucketByPhase(phase, seed, offset);
  const words = seasonal[bucket];
  return {
    bucket,
    word: words[seededIndex(seed, offset + 1, words.length)]!,
  };
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

export function buildLegacyMonthlyDailyNumberFortunes(params: {
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

type DailyLineCandidate = {
  text: string;
  words: string[];
  stems: string[];
  pattern: string;
  skeleton: string;
  ending: string;
  metaphorGroups: string[];
  score: number;
  rhythm: string;
  naturalness: number;
  naturalnessScore: number;
};

type MonthPhase = "early" | "mid" | "late";
type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type SeasonalBucket = "air" | "light" | "scene" | "comfort";

type MonthlyGenerationState = {
  usedWords: Set<string>;
  usedStems: Set<string>;
  usedPatterns: Map<string, number>;
  usedEndings: Map<string, number>;
  usedMetaphors: Set<string>;
  usedLines: Set<string>;
  previousMonthLines: string[];
  previousMonthWordSets: Set<string>[];
  previousMonthWords: Set<string>;
  previousMonthSkeletons: Set<string>;
  usedSkeletons: Map<string, number>;
  recentPatterns: string[];
  recentRhythms: string[];
  recentEndings: string[];
};

type CandidateSeedContext = {
  year: number;
  month: number;
  day: number;
  monthPhase: MonthPhase;
  destinyNumber: FortuneNumber;
  dayNumber: FortuneNumber;
  flowLevel: DailyFlowLevel;
};

type VocabularyBucket =
  | "warmth"
  | "forward"
  | "discovery"
  | "inner"
  | "scene"
  | "recovery"
  | "touch"
  | "mood";

type PatternName = "noun-core" | "motion" | "scene" | "sense" | "afterglow" | "omen";

const SOFT_BANNED_REPEAT_WORDS = new Set([
  "光",
  "やさしさ",
  "心",
  "気づき",
  "流れ",
  "種",
  "芽",
  "安心",
  "広がる",
  "満ちる",
  "静か",
  "小さな",
  "そっと",
  "見える",
  "届く",
  "ほどける",
]);

const HARD_BLOCKED_TERMS = new Set([
  "福音",
  "芽熱",
  "頁",
  "返り音",
  "舵先",
  "進み先",
  "合図が揺れる",
]);

const NATURALNESS_BLACKLIST = [
  "進み先",
  "渡り先",
  "一歩先",
  "輪郭がのぞく",
  "明日への道筋",
  "明日への一歩先",
  "音が差し込む",
  "差し込む日",
  "宿る予感",
  "の向こうに",
  "がふと揺れる",
  "のしるし",
];

const ABSTRACT_WORDS = ["輪郭", "気配", "兆し", "しるし", "道筋", "流れ", "予感", "手応え", "きっかけ"];

type NaturalnessDiagnostics = {
  score: number;
  reasons: string[];
};

const VOCABULARY_POOLS: Record<VocabularyBucket, string[]> = {
  warmth: ["ぬくもり", "あたたかさ", "やわらぎ", "穏やかさ", "安堵", "和み"],
  forward: ["一歩", "足取り", "道筋", "歩幅", "行き先", "流れ"],
  discovery: ["糸口", "答え", "手応え", "兆し", "ヒント", "きっかけ"],
  inner: ["胸の奥", "本音", "願い", "想い", "気持ち", "迷い"],
  scene: ["朝の気配", "風向き", "薄明かり", "余白", "朝の空", "水面"],
  recovery: ["やわらぎ", "落ち着き", "凪", "深呼吸", "静けさ", "余裕"],
  touch: ["手応え", "ぬくもり", "気配", "安心", "やさしさ", "落ち着き"],
  mood: ["軽やかな", "やわらかな", "穏やかな", "晴れやかな", "しなやかな", "落ち着いた"],
};

const ENDING_VARIANTS = [
  "日",
  "気配",
  "予感",
  "兆し",
  "タイミング",
  "きっかけ",
] as const;

const SEASONAL_USAGE_RATE = 0.3;

const JANUARY_SEASONAL_WORDS_BY_PHASE: Record<MonthPhase, Record<SeasonalBucket, string[]>> = {
  early: {
    air: ["澄んだ朝", "冬の空気", "冷えた空", "白い息"],
    light: ["やわらかな朝の光", "新しい朝", "凛とした光", "静かな光"],
    scene: ["年明けの空気", "新年のはじまり", "静かな始まり", "新しい朝"],
    comfort: ["ぬくもり", "ひと息つける時間", "静かなぬくもり"],
  },
  mid: {
    air: ["冬の空気", "澄んだ朝", "澄んだ冬の空気", "冷えた空"],
    light: ["やわらかな冬の光", "淡い朝の光", "澄んだ光", "静かな朝の光"],
    scene: ["冬の空気", "澄んだ朝", "静かな冬景色", "白い息の朝"],
    comfort: ["ぬくもり", "ひと息つける時間", "静かなぬくもり"],
  },
  late: {
    air: ["澄んだ空気", "冬の空気", "冬空", "冷たい朝の空気"],
    light: ["淡い冬の光", "やわらかな朝の光", "静かな光", "冬空の光"],
    scene: ["冬の静けさ", "澄んだ空気", "冬空", "静かな冬景色"],
    comfort: ["落ち着く時間", "静かなぬくもり", "ひと息つける時間"],
  },
};

export const MONTHLY_SEASONAL_WORDS: Record<MonthNumber, Record<SeasonalBucket, string[]>> = {
  1: {
    air: ["澄んだ朝", "冬の空気", "冷えた空", "静かな寒さ", "白い息"],
    light: ["やわらかな陽だまり", "淡い朝の光", "冬の光", "かすかなぬくもり"],
    scene: ["年明けの空気", "新しい朝", "静かな始まり", "凛とした景色"],
    comfort: ["あたたかい気配", "ぬくもり", "ひと息つける時間"],
  },
  2: {
    air: ["春待つ空気", "やわらぐ寒さ", "まだ冷たい朝", "やさしい薄明かり"],
    light: ["淡い光", "やわらかな日差し", "春を待つ光"],
    scene: ["ほどけはじめる気配", "季節のゆるみ", "小さな変わり目"],
    comfort: ["やわらかなぬくもり", "少し軽くなる空気", "ほっとする時間"],
  },
  3: {
    air: ["春の風", "芽吹きの気配", "やわらかな空気", "ほどける寒さ"],
    light: ["春の光", "明るい朝", "やさしい日差し"],
    scene: ["芽吹きの頃", "新しい季節の入口", "動きはじめる景色"],
    comfort: ["軽やかな気配", "ゆるやかなぬくもり", "やさしい巡り"],
  },
  4: {
    air: ["春の空気", "やわらかな風", "軽やかな朝", "花冷えの気配"],
    light: ["やさしい光", "明るい日差し", "春の陽だまり"],
    scene: ["新しい風景", "はじまりの気配", "整いはじめる景色"],
    comfort: ["ふんわりした安心感", "穏やかなぬくもり", "落ち着いた明るさ"],
  },
  5: {
    air: ["若葉の風", "青空の気配", "すっきりした空気", "初夏の風"],
    light: ["まぶしい光", "青空の明るさ", "伸びやかな日差し"],
    scene: ["若葉の頃", "軽やかに広がる景色", "のびやかな季節"],
    comfort: ["晴れやかな気配", "軽い足取り", "心地よい余白"],
  },
  6: {
    air: ["しっとりした空気", "雨上がりの気配", "やわらかな湿り気", "静かな曇り空"],
    light: ["雨間の光", "やわらかな明るさ", "にじむ光"],
    scene: ["雨音のある時間", "移ろいやすい空模様", "静かに満ちる景色"],
    comfort: ["落ち着いた静けさ", "深呼吸したくなる時間", "しっとりした安堵"],
  },
  7: {
    air: ["夏の風", "朝の熱気", "青い空気", "まっすぐな日差し"],
    light: ["夏の光", "強い日差し", "きらめく明るさ"],
    scene: ["夏の入口", "空の広がり", "光の強い景色"],
    comfort: ["ひと息つける木陰", "涼やかな気配", "風の通り道"],
  },
  8: {
    air: ["夕立の気配", "濃い夏の空気", "ゆるむ夜風", "残暑の気配"],
    light: ["まぶしい陽射し", "夕暮れの光", "夏のきらめき"],
    scene: ["夏の盛り", "揺れる陽炎", "夕暮れどきの景色"],
    comfort: ["涼しいひと息", "夜風のやわらぎ", "少しゆるむ時間"],
  },
  9: {
    air: ["秋の気配", "涼しい風", "澄みはじめる空気", "やわらかな夜気"],
    light: ["やわらかな秋の光", "落ち着いた明るさ", "静かな夕映え"],
    scene: ["季節の変わり目", "少し深まる景色", "静かに移る空"],
    comfort: ["ほっとする涼しさ", "落ち着いた余白", "静かな安堵"],
  },
  10: {
    air: ["澄んだ空気", "秋の風", "ひんやりした朝", "静かな冷たさ"],
    light: ["澄んだ光", "秋晴れの明るさ", "やわらかな夕暮れ"],
    scene: ["深まりゆく秋", "落ち着いた景色", "空の高い日"],
    comfort: ["静かなぬくもり", "穏やかな落ち着き", "深呼吸したくなる空気"],
  },
  11: {
    air: ["冷たい風", "深まる秋", "冬に近づく空気", "澄んだ朝の冷たさ"],
    light: ["淡い陽だまり", "やわらかな冬めく光", "静かな明るさ"],
    scene: ["葉が落ち着く頃", "静まりはじめる景色", "季節の奥行き"],
    comfort: ["ぬくもりのありがたさ", "落ち着いた静けさ", "あたたかなひと息"],
  },
  12: {
    air: ["冬の空気", "澄んだ朝", "冷たい風", "静かな年の瀬"],
    light: ["灯りのぬくもり", "澄んだ冬の光", "やわらかな明かり"],
    scene: ["年の瀬の空気", "静かな夜", "ひと区切りの景色"],
    comfort: ["ほっとするぬくもり", "ひと息つける時間", "静かな安堵"],
  },
};

function createMonthlyGenerationState(): MonthlyGenerationState {
  return {
    usedWords: new Set<string>(),
    usedStems: new Set<string>(),
    usedPatterns: new Map<string, number>(),
    usedEndings: new Map<string, number>(),
    usedMetaphors: new Set<string>(),
    usedLines: new Set<string>(),
    previousMonthLines: [],
    previousMonthWordSets: [],
    previousMonthWords: new Set<string>(),
    previousMonthSkeletons: new Set<string>(),
    usedSkeletons: new Map<string, number>(),
    recentPatterns: [],
    recentRhythms: [],
    recentEndings: [],
  };
}

function extractNormalizedWords(text: string): string[] {
  return Array.from(text.matchAll(/[一-龠々ぁ-んァ-ヶー]{2,}/g)).map((match) => match[0]);
}

function createMonthlyGenerationStateFromPreviousMonth(previousMonthLines: string[]): MonthlyGenerationState {
  const state = createMonthlyGenerationState();
  state.previousMonthLines = previousMonthLines;
  state.previousMonthWordSets = previousMonthLines.map((line) => new Set(extractNormalizedWords(line)));
  state.previousMonthWords = new Set(previousMonthLines.flatMap((line) => extractNormalizedWords(line)));
  state.previousMonthSkeletons = new Set(previousMonthLines.map((line) => inferPatternSkeleton(line)));
  state.recentPatterns = previousMonthLines.slice(-2).map((line) => inferPatternCategory(line));
  state.recentRhythms = previousMonthLines.slice(-1).map((line) => toRhythm(line));
  state.recentEndings = previousMonthLines.slice(-2).map((line) => normalizeEndingFamily(line));
  return state;
}

function seededIndex(seed: number, salt: number, length: number): number {
  return ((seed + salt * 2654435761) >>> 0) % length;
}

function pickWord(
  bucket: VocabularyBucket,
  state: MonthlyGenerationState,
  seed: number,
  salt: number
): string {
  const pool = VOCABULARY_POOLS[bucket];
  const fresh = pool.filter((word) => !state.usedWords.has(word));
  const freshAgainstPrevious = fresh.filter((word) => !state.previousMonthWords.has(word));
  const target =
    freshAgainstPrevious.length > 0
      ? freshAgainstPrevious
      : fresh.length > 0
        ? fresh
        : pool;
  return target[seededIndex(seed, salt, target.length)]!;
}

function preferredPattern(context: CandidateSeedContext, offset: number): PatternName {
  const earlyPatterns: PatternName[] = [
    "noun-core",
    "sense",
    "afterglow",
    "motion",
    "noun-core",
    "omen",
  ];
  const latePatterns: PatternName[] = [
    "motion",
    "scene",
    "afterglow",
    "sense",
    "motion",
    "omen",
  ];
  const pool = context.monthPhase === "early" ? earlyPatterns : latePatterns;
  const base = (context.dayNumber + context.flowLevel + context.destinyNumber + offset) % pool.length;
  return pool[base]!;
}

function chooseEnding(context: CandidateSeedContext, seed: number, offset: number): string {
  const pool =
    context.flowLevel >= 4
      ? ["予感", "兆し", "タイミング", "日"]
      : context.flowLevel === 3
        ? ["気配", "日", "きっかけ", "予感"]
        : ["気配", "日", "きっかけ", "兆し"];
  return pool[seededIndex(seed, offset, pool.length)]!;
}

function toRhythm(text: string): string {
  const particles = text.match(/[のにへとがをはも]/g) ?? [];
  return particles.join("");
}

function normalizeEndingFamily(ending: string): string {
  if (ending.endsWith("そう")) return "そう";
  if (ending.endsWith("気配")) return "気配";
  if (ending.endsWith("予感")) return "予感";
  if (ending.endsWith("兆し")) return "兆し";
  if (ending.endsWith("きっかけ")) return "きっかけ";
  if (ending.endsWith("整う")) return "整う";
  return ending;
}

// Legacy generator retained for comparison reporting.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildCandidateText(
  pattern: string,
  context: CandidateSeedContext,
  state: MonthlyGenerationState,
  seed: number,
  offset: number
): Omit<DailyLineCandidate, "score"> {
  const ending = chooseEnding(context, seed, offset + 10);
  const innerFocusPool = ["気持ち", "本音", "願い", "迷い"];
  const innerFocus = innerFocusPool[seededIndex(seed, offset + 12, innerFocusPool.length)]!;
  const mood = pickWord("mood", state, seed, offset + 13);
  const scene = pickWord("scene", state, seed, offset + 14);
  const recovery = pickWord("recovery", state, seed, offset + 15);

  switch (pattern) {
    case "noun-core": {
      const templates = [
        {
          text: `自分の本音に気づきやすい日`,
          words: ["自分", "本音"],
          stems: ["気づく"],
          skeleton: "core-notice-true-feeling",
          ending: "日",
          naturalness: 26,
        },
        {
          text: `気持ちの整理が少しつきやすい日`,
          words: ["気持ち", "整理"],
          stems: ["つく"],
          skeleton: "core-feeling-organize",
          ending: "日",
          naturalness: 28,
        },
        {
          text: "考えていたことがまとまりやすい日",
          words: ["こと"],
          stems: ["まとまる"],
          skeleton: "core-thoughts-settle",
          ending: "日",
          naturalness: 25,
        },
        {
          text: "自分の気持ちを言葉にしやすい日",
          words: ["気持ち", "言葉"],
          stems: ["しやすい"],
          skeleton: "core-put-feelings-into-words",
          ending: "日",
          naturalness: 24,
        },
        {
          text: `自分の${innerFocus}に向き合いやすい日`,
          words: ["自分", innerFocus],
          stems: ["向き合う"],
          skeleton: "core-face-self-clue",
          ending: "日",
          naturalness: 23,
        },
      ] as const;
      const choice = templates[seededIndex(seed, offset + 17, templates.length)]!;
      return {
        text: choice.text,
        words: [...choice.words],
        stems: [...choice.stems],
        pattern,
        skeleton: choice.skeleton,
        ending: choice.ending,
        metaphorGroups: [],
        rhythm: toRhythm(choice.text),
        naturalness: choice.naturalness,
        naturalnessScore: choice.naturalness,
      };
    }
    case "motion": {
      const templates =
        context.flowLevel >= 4
          ? [
              {
                text: "物事が少しずつ進みやすい日",
                words: ["物事"],
                stems: ["進む"],
                skeleton: "flow-things-move",
                ending: "日",
              },
              {
                text: "停滞していた空気が動き出す日",
                words: ["空気"],
                stems: ["動き出す"],
                skeleton: "flow-stagnation-breaks",
                ending: "日",
              },
              {
                text: "小さな行動が流れを変えやすい日",
                words: ["行動", "流れ"],
                stems: ["変える"],
                skeleton: "flow-small-action-shifts",
                ending: "日",
              },
              {
                text: "ひとつずつ進めると流れに乗りやすい日",
                words: ["流れ"],
                stems: ["進める", "乗る"],
                skeleton: "flow-step-by-step",
                ending: "日",
              },
            ]
          : [
              {
                text: "迷いがやわらぎやすい日",
                words: ["迷い"],
                stems: ["やわらぐ"],
                skeleton: "flow-doubt-softens",
                ending: "日",
              },
              {
                text: "心が少し落ち着きを取り戻す日",
                words: ["心", "落ち着き"],
                stems: ["取り戻す"],
                skeleton: "flow-calm-returns",
                ending: "日",
              },
              {
                text: "無理を手放すと進める日",
                words: ["無理"],
                stems: ["手放す", "進める"],
                skeleton: "flow-release-and-move",
                ending: "日",
              },
              {
                text: "気負わずに動くと整いやすい日",
                words: ["気負い"],
                stems: ["動く", "整う"],
                skeleton: "flow-no-pressure",
                ending: "日",
              },
            ];
      const choice = templates[seededIndex(seed, offset + 18, templates.length)]!;
      return {
        text: choice.text,
        words: [...choice.words],
        stems: [...choice.stems],
        pattern,
        skeleton: choice.skeleton,
        ending: choice.ending,
        metaphorGroups: [],
        rhythm: toRhythm(choice.text),
        naturalness: 20,
        naturalnessScore: 20,
      };
    }
    case "scene": {
      const templates = [
        {
          text: "止まっていたことが進みやすい日",
          words: ["こと"],
          stems: ["進む"],
          skeleton: "scene-stopped-things-move",
          ending: "日",
        },
        {
          text: "先延ばしにしていたことを進めたい日",
          words: ["こと"],
          stems: ["進める"],
          skeleton: "scene-delayed-things-advance",
          ending: "日",
        },
        {
          text: "迷っていたことの答えが出やすい日",
          words: ["迷い", "答え"],
          stems: ["出る"],
          skeleton: "hesitation-answer-comes",
          ending: "日",
        },
        {
          text: "話し合いが少し前に進みやすい日",
          words: ["話し合い"],
          stems: ["進む"],
          skeleton: "scene-talk-moves",
          ending: "日",
        },
        {
          text: "様子を見ていたことを決めやすい日",
          words: ["様子"],
          stems: ["決める"],
          skeleton: "scene-decide-pending",
          ending: "日",
        },
      ] as const;
      const choice = templates[seededIndex(seed, offset + 19, templates.length)]!;
      return {
        text: choice.text,
        words: [...choice.words],
        stems: [...choice.stems],
        pattern,
        skeleton: choice.skeleton,
        ending: choice.ending,
        metaphorGroups: [],
        rhythm: toRhythm(choice.text),
        naturalness: 20,
        naturalnessScore: 20,
      };
    }
    case "sense": {
      const templates = [
        {
          text: "急がず丁寧に進めたい日",
          words: ["丁寧"],
          stems: ["進める"],
          skeleton: "hint-go-slow",
          ending: "日",
        },
        {
          text: "身近なことを整えると運気が上向く日",
          words: ["身近なこと", "運気"],
          stems: ["整える", "上向く"],
          skeleton: "hint-tidy-nearby",
          ending: "日",
        },
        {
          text: "小さな違和感を見逃さないでいたい日",
          words: ["違和感"],
          stems: ["見逃す"],
          skeleton: "hint-notice-discomfort",
          ending: "日",
        },
        {
          text: "身の回りを整えると気分が軽くなる日",
          words: ["身の回り", "気分"],
          stems: ["整える", "軽くなる"],
          skeleton: "hint-tidy-space",
          ending: "日",
        },
        {
          text: "細かな確認をしておきたい日",
          words: ["確認"],
          stems: ["しておく"],
          skeleton: "hint-check-details",
          ending: "日",
        },
      ] as const;
      const choice = templates[seededIndex(seed, offset + 20, templates.length)]!;
      return {
        text: choice.text,
        words: [...choice.words],
        stems: [...choice.stems],
        pattern,
        skeleton: choice.skeleton,
        ending: choice.ending,
        metaphorGroups: [],
        rhythm: toRhythm(choice.text),
        naturalness: 24,
        naturalnessScore: 24,
      };
    }
    case "afterglow": {
      const templates = [
        {
          text: "本音を素直に言葉にしやすい日",
          words: ["本音", "言葉"],
          stems: ["しやすい"],
          skeleton: "inner-honest-words",
          ending: "日",
        },
        {
          text: "気持ちの整理が少し進みやすい日",
          words: ["気持ち", "整理"],
          stems: ["進む"],
          skeleton: "inner-sorting-progress",
          ending: "日",
        },
        {
          text: `今日は少し${mood}気持ちで過ごせる日`,
          words: [mood, "気持ち"],
          stems: ["過ごせる"],
          skeleton: "inner-soft-day",
          ending: "日",
        },
        {
          text: "今日は落ち着いて判断しやすい日",
          words: ["判断"],
          stems: ["しやすい"],
          skeleton: "inner-calm-judgment",
          ending: "日",
        },
        {
          text: "今日は自分のペースを守りたい日",
          words: ["自分", "ペース"],
          stems: ["守る"],
          skeleton: "inner-keep-pace",
          ending: "日",
        },
      ] as const;
      const choice = templates[seededIndex(seed, offset + 21, templates.length)]!;
      return {
        text: choice.text,
        words: [...choice.words],
        stems: [...choice.stems],
        pattern,
        skeleton: choice.skeleton,
        ending: choice.ending,
        metaphorGroups: ["afterglow"],
        rhythm: toRhythm(choice.text),
        naturalness: 20,
        naturalnessScore: 20,
      };
    }
    case "omen":
    default: {
      const finalEnding = ENDING_VARIANTS.includes(ending as (typeof ENDING_VARIANTS)[number]) ? ending : "気配";
      const templates =
        context.flowLevel >= 4
          ? [
              {
                text: "うれしい流れを受け取りやすい日",
                words: ["流れ"],
                stems: ["受け取る"],
                skeleton: "omen-positive-flow",
                metaphorGroups: [],
              },
              {
                text: "気持ちに少し余裕が戻りやすい日",
                words: ["気持ち", "余裕"],
                stems: ["戻る"],
                skeleton: "omen-room-returns",
                metaphorGroups: [],
              },
              {
                text: `${scene}のように空気がやわらぐ日`,
                words: [scene, "空気"],
                stems: ["やわらぐ"],
                skeleton: "today-tailwind",
                metaphorGroups: [`scene:${scene}`],
              },
              {
                text: "今ある流れを素直に受け止めたい日",
                words: ["流れ"],
                stems: ["受け止める"],
                skeleton: "omen-accept-flow",
                metaphorGroups: [],
              },
            ]
          : [
              {
                text: "気持ちを整えると過ごしやすい日",
                words: ["気持ち"],
                stems: ["整える", "過ごす"],
                skeleton: "omen-balance-day",
                metaphorGroups: [],
              },
              {
                text: "焦らず動くほど整いやすい日",
                words: ["焦り"],
                stems: ["動く", "整う"],
                skeleton: "omen-slow-action-day",
                metaphorGroups: [],
              },
              {
                text: `${recovery}を意識すると軽くなれる日`,
                words: [recovery],
                stems: ["意識する", "なれる"],
                skeleton: "omen-recovery-focus",
                metaphorGroups: [],
              },
              {
                text: "身近な安心を大切にしたい一日",
                words: ["安心"],
                stems: ["大切にする"],
                skeleton: "omen-value-calm",
                metaphorGroups: [],
              },
            ];
      const choice = templates[seededIndex(seed, offset + 22, templates.length)]!;
      return {
        text: choice.text,
        words: [...choice.words, ...(choice.text.includes(finalEnding) ? [finalEnding] : [])],
        stems: [...choice.stems],
        pattern,
        skeleton: choice.skeleton,
        ending: choice.text.endsWith("日") ? "日" : finalEnding,
        metaphorGroups: [...choice.metaphorGroups],
        rhythm: toRhythm(choice.text),
        naturalness: 19,
        naturalnessScore: 19,
      };
    }
  }
}

function buildPhaseAwareCandidateText(
  pattern: string,
  context: CandidateSeedContext,
  state: MonthlyGenerationState,
  seed: number,
  offset: number
): Omit<DailyLineCandidate, "score"> {
  const innerFocusPool = ["気持ち", "本音", "願い", "迷い"];
  const innerFocus = innerFocusPool[seededIndex(seed, offset + 12, innerFocusPool.length)]!;
  const mood = pickWord("mood", state, seed, offset + 13);
  const recovery = pickWord("recovery", state, seed, offset + 15);
  const seasonal = shouldUseSeasonalWord(seed, offset + 16)
    ? pickSeasonalWord(context.month, context.monthPhase, seed, offset + 17)
    : null;
  const seasonalWords = seasonal ? [seasonal.word] : [];
  const seasonalMetaphors = seasonal ? [`season:${context.month}:${seasonal.bucket}:${seasonal.word}`] : [];

  const detectEnding = (text: string): string => {
    if (text.endsWith("日")) return "日";
    if (text.endsWith("とき")) return "とき";
    if (text.endsWith("ころ")) return "ころ";
    if (text.endsWith("タイミング")) return "タイミング";
    return text.slice(-3);
  };

  const build = (
    text: string,
    words: string[],
    stems: string[],
    skeleton: string,
    naturalness: number,
    metaphorGroups: string[] = []
  ): Omit<DailyLineCandidate, "score"> => ({
    text,
    words,
    stems,
    pattern,
    skeleton,
    ending: detectEnding(text),
    metaphorGroups,
    rhythm: toRhythm(text),
    naturalness,
    naturalnessScore: naturalness,
  });

  switch (pattern) {
    case "noun-core": {
      const templates =
        context.monthPhase === "early"
          ? [
              build("自分の本音にふと気づけるとき", ["自分", "本音"], ["気づく"], "core-notice-true-feeling", 34),
              build("気持ちの整理が少しずつ進むころ", ["気持ち", "整理"], ["つく"], "core-feeling-organize", 36),
              build("考えていたことがまとまりやすい日", ["考え"], ["まとまる"], "core-thoughts-settle", 34),
              build(`自分の${innerFocus}に静かに向き合えるとき`, ["自分", innerFocus], ["向き合う"], "core-face-self-clue", 33),
              build("心の声を聴くのにちょうどいいタイミング", ["心", "声"], ["聴く"], "core-listen-heart", 35),
            ]
          : [
              build("自分の気持ちを言葉にしやすい日", ["自分", "気持ち", "言葉"], ["言葉にする"], "core-put-feelings-into-words", 36),
              build("考えがすっと整ってくるころ", ["考え"], ["まとまる"], "core-thoughts-settle", 34),
              build("本音をそっと言葉にできるとき", ["本音", "言葉"], ["言葉にする"], "core-honest-words", 35),
              build("内側の声がクリアに聞こえはじめる日", ["声"], ["聞こえる"], "core-inner-voice-clear", 36),
            ];
      return templates[seededIndex(seed, offset + 18, templates.length)]!;
    }
    case "motion": {
      const templates =
        context.monthPhase === "early"
          ? [
              build("迷いがすこしずつほどけていくとき", ["迷い"], ["やわらぐ"], "flow-doubt-softens", 34),
              build("停滞していた空気が動き出す日", ["停滞", "空気"], ["動き出す"], "flow-stagnation-breaks", 35),
              build("心に落ち着きが戻ってくるころ", ["心", "落ち着き"], ["取り戻す"], "flow-calm-returns", 35),
              build("流れが静かに変わりはじめるタイミング", ["流れ"], ["変わる"], "flow-quiet-shift", 36),
            ]
          : [
              build("物事が少しずつ前に進むころ", ["物事"], ["進む"], "flow-things-move", 36),
              build("小さな行動が流れを変えやすい日", ["行動", "流れ"], ["変える"], "flow-small-action-shifts", 35),
              build("ひとつずつ進めると手応えが出るとき", ["流れ"], ["進める"], "flow-step-by-step", 36),
              build("背中をそっと押される感覚がある日", ["背中"], ["押される"], "flow-gentle-push", 35),
            ];
      return templates[seededIndex(seed, offset + 19, templates.length)]!;
    }
    case "scene": {
      const seasonalTemplates =
        context.monthPhase === "early"
          ? [
              build(
                `${seasonal?.word ?? "季節の空気"}の中で気持ちが整いやすい日`,
                [...seasonalWords, "気持ち"],
                ["整う"],
                "seasonal-early-settle",
                35,
                seasonalMetaphors
              ),
              build(
                `${seasonal?.word ?? "季節の空気"}とともに迷いがほどけていくとき`,
                [...seasonalWords, "迷い"],
                ["やわらぐ"],
                "seasonal-early-soften",
                35,
                seasonalMetaphors
              ),
            ]
          : [
              build(
                `${seasonal?.word ?? "季節の空気"}の中で答えが定まりやすい日`,
                [...seasonalWords, "答え"],
                ["定まる"],
                "seasonal-late-decide",
                35,
                seasonalMetaphors
              ),
              build(
                `${seasonal?.word ?? "季節の空気"}とともに言葉がまとまるころ`,
                [...seasonalWords, "言葉"],
                ["まとまる"],
                "seasonal-late-words",
                35,
                seasonalMetaphors
              ),
            ];
      const plainTemplates =
        context.monthPhase === "early"
          ? [
              build("気持ちの整理がすこし進むころ", ["気持ち", "整理"], ["進む"], "scene-sorting-progress", 34),
              build("落ち着いて判断できるタイミング", ["判断"], ["判断する"], "scene-calm-judgment", 35),
              build("身近なことを整えると気分が軽くなる日", ["身近", "気分"], ["整える"], "scene-tidy-mood", 35),
            ]
          : [
              build("迷いの先にふと答えが見えるとき", ["迷い", "答え"], ["出る"], "hesitation-answer-comes", 35),
              build("話し合いが少し前に進みやすい日", ["話し合い"], ["進む"], "scene-talk-moves", 35),
              build("決断のタイミングが近づいてくるころ", ["様子"], ["決める"], "scene-decide-pending", 35),
            ];
      const templates = seasonal ? seasonalTemplates : plainTemplates;
      return templates[seededIndex(seed, offset + 20, templates.length)]!;
    }
    case "sense": {
      const templates =
        context.monthPhase === "early"
          ? [
              build("急がず丁寧に進めると心地よいとき", ["丁寧"], ["進める"], "hint-go-slow", 36),
              build("身近なことを整えると気分が軽くなる日", ["身近", "気分"], ["整える", "軽くなる"], "hint-tidy-space", 35),
              build("小さな確認が安心につながるころ", ["確認"], ["しておく"], "hint-check-details", 35),
              build("丁寧さが結果に表れやすいタイミング", ["丁寧"], ["表れる"], "hint-careful-timing", 36),
            ]
          : [
              build("身近なことを整えると運気が上向く日", ["身近", "運気"], ["整える", "上向く"], "hint-tidy-nearby", 35),
              build("小さな違和感がヒントになるとき", ["違和感"], ["見逃さない"], "hint-notice-discomfort", 34),
              build("今できることから始めると流れが生まれるころ", ["今"], ["手をつける"], "hint-start-now", 35),
            ];
      return templates[seededIndex(seed, offset + 21, templates.length)]!;
    }
    case "afterglow": {
      const seasonalTemplates =
        context.monthPhase === "early"
          ? [
              build(
                `${seasonal?.word ?? "季節の空気"}の中で心が落ち着くとき`,
                [...seasonalWords, "心", "落ち着き"],
                ["落ち着く"],
                "seasonal-early-calm",
                35,
                seasonalMetaphors
              ),
            ]
          : [
              build(
                `${seasonal?.word ?? "季節の空気"}とともに足取りが軽くなるころ`,
                [...seasonalWords, "足取り"],
                ["軽くなる"],
                "seasonal-late-step",
                35,
                seasonalMetaphors
              ),
            ];
      const plainTemplates =
        context.monthPhase === "early"
          ? [
              build(`少し${mood}気持ちで過ごせるとき`, [mood, "気持ち"], ["過ごせる"], "inner-soft-day", 35),
              build("自分のペースを大切にしたいころ", ["自分", "ペース"], ["守る"], "inner-keep-pace", 35),
              build(`${mood}空気の中で自分を取り戻せる日`, [mood, "自分"], ["取り戻す"], "inner-recover", 35),
            ]
          : [
              build("本音がすっと言葉になるとき", ["本音", "言葉"], ["言葉にする"], "inner-honest-words", 36),
              build("気持ちの整理がひと区切りつくころ", ["気持ち", "整理"], ["進む"], "inner-sorting-progress", 35),
              build("自分の気持ちに素直でいられる日", ["自分", "気持ち"], ["素直"], "inner-honest-self", 36),
            ];
      const templates = seasonal ? seasonalTemplates : plainTemplates;
      return templates[seededIndex(seed, offset + 22, templates.length)]!;
    }
    case "omen":
    default: {
      const seasonalTemplates =
        context.monthPhase === "early"
          ? [
              build(
                `${seasonal?.word ?? "季節の空気"}に包まれて気持ちがやわらぐとき`,
                [...seasonalWords, "気持ち"],
                ["やわらぐ"],
                "seasonal-early-wrap",
                34,
                seasonalMetaphors
              ),
            ]
          : [
              build(
                `${seasonal?.word ?? "季節の空気"}の中で人とのつながりを感じるころ`,
                [...seasonalWords, "人", "つながり"],
                ["感じる"],
                "seasonal-late-connect",
                35,
                seasonalMetaphors
              ),
            ];
      const plainTemplates =
        context.monthPhase === "early"
          ? [
              build("気持ちに少し余裕が戻ってくるころ", ["気持ち", "余裕"], ["戻る"], "omen-room-returns", 35),
              build(`${recovery}を意識すると軽くなれるとき`, [recovery], ["意識する", "軽くなる"], "omen-recovery-focus", 34),
              build("自分を労わる時間をつくりたい日", ["自分"], ["労わる"], "omen-self-care", 35),
            ]
          : [
              build("うれしい流れを受け取れるとき", ["流れ"], ["受け取る"], "omen-positive-flow", 35),
              build("今ある流れを素直に受け止めたいころ", ["流れ"], ["受け止める"], "omen-accept-flow", 35),
              build("気持ちを整えると過ごしやすくなる日", ["気持ち"], ["整える"], "omen-settle-mood", 35),
            ];
      const templates = seasonal ? seasonalTemplates : plainTemplates;
      return templates[seededIndex(seed, offset + 23, templates.length)]!;
    }
  }
}

function hasTooManyAbstractNouns(text: string): boolean {
  return /(輪郭|気配|兆し|流れ|道筋|想い|願い|答え|糸口|手応え).*(輪郭|気配|兆し|流れ|道筋|想い|願い|答え|糸口|手応え).*(輪郭|気配|兆し|流れ|道筋|想い|願い|答え|糸口|手応え)/.test(text);
}

function countMetaphors(text: string): number {
  return ["薄明かり", "月影", "風向き", "水面", "朝の気配", "追い風"].filter((word) => text.includes(word))
    .length;
}

function evaluateNaturalness(text: string): NaturalnessDiagnostics {
  const reasons: string[] = [];
  let score = 0;

  if (/(日|くる|いる|やすい|なれる|進める|保てる|とき|ころ|タイミング)$/.test(text)) {
    score += 30;
  } else {
    reasons.push("結びが曖昧");
  }

  if (
    /(進み先|渡り先|一歩先|輪郭がのぞく|明日への道筋|明日への一歩先|音が差し込む|差し込む日|宿る予感)/.test(
      text
    )
  ) {
    score -= 40;
    reasons.push("blacklist表現");
  } else {
    score += 25;
  }

  if (/本音|整理|落ち着き|丁寧|身近なこと|違和感|過ごしやすい|進みやすい/.test(text)) {
    score += 10;
  }

  if (countMetaphors(text) > 0) {
    score -= 20;
    reasons.push("比喩が強い");
  }

  const abstractCount = ABSTRACT_WORDS.reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0);
  if (abstractCount >= 2) {
    score -= 20;
    reasons.push("抽象語が多い");
  }

  if (/の[^の]{0,5}の[^の]{0,5}/.test(text) || /気配を受け取りやすい/.test(text)) {
    score -= 50;
    reasons.push("名詞接続が不自然");
  }

  if (!/何|どう|日/.test(text) && !/(進みやすい|落ち着き|整理|整える|見逃さない|気づきやすい|過ごしやすい)/.test(text)) {
    reasons.push("読み取りづらい");
  }

  return { score, reasons };
}

function passesNaturalLanguageGuard(candidate: Omit<DailyLineCandidate, "score">): boolean {
  const diagnostics = evaluateNaturalness(candidate.text);
  if (candidate.text.length > 28) return false;
  if ([...HARD_BLOCKED_TERMS].some((term) => candidate.text.includes(term))) return false;
  if (NATURALNESS_BLACKLIST.some((term) => candidate.text.includes(term))) return false;
  if (hasTooManyAbstractNouns(candidate.text)) return false;
  if ((candidate.text.match(/揺れる/g) ?? []).length > 0) return false;
  if ((candidate.text.match(/のぞく/g) ?? []).length > 0) return false;
  if (countMetaphors(candidate.text) > 1) return false;
  if (/輪郭がのぞく/.test(candidate.text)) return false;
  if (/合図が揺れる/.test(candidate.text)) return false;
  if (/の[^の]{0,4}の[^の]{0,4}の/.test(candidate.text)) return false;
  if (/気配の気配|答えの形|流れの流れ/.test(candidate.text)) return false;
  if (candidate.text.length < 14) return false;
  if (diagnostics.score < 35) return false;
  return true;
}

function hasPreviousMonthWordOverlap(
  candidate: Omit<DailyLineCandidate, "score">,
  state: MonthlyGenerationState,
  minimum = 2
): boolean {
  const candidateWordSet = new Set(candidate.words);
  return state.previousMonthWordSets.some((previousWordSet) => {
    let overlap = 0;
    for (const word of candidateWordSet) {
      if (!previousWordSet.has(word)) continue;
      overlap += 1;
      if (overlap >= minimum) return true;
    }
    return false;
  });
}

function scoreCandidate(
  candidate: Omit<DailyLineCandidate, "score">,
  state: MonthlyGenerationState
): number {
  let score = 100;
  const len = candidate.text.length;
  const diagnostics = evaluateNaturalness(candidate.text);

  if (len < 16) score -= 20;

  for (const word of candidate.words) {
    if (state.usedWords.has(word)) score -= 40;
    if (SOFT_BANNED_REPEAT_WORDS.has(word) && state.usedWords.has(word)) score -= 25;
  }

  for (const stem of candidate.stems) {
    if (state.usedStems.has(stem)) score -= 25;
  }

  if (state.usedLines.has(candidate.text)) {
    score -= 60;
  }

  for (const metaphor of candidate.metaphorGroups) {
    if (state.usedMetaphors.has(metaphor)) score -= 25;
  }

  if (state.previousMonthLines.includes(candidate.text)) {
    score -= 50;
  }

  if (hasPreviousMonthWordOverlap(candidate, state)) score -= 20;

  const patternCount = state.usedPatterns.get(candidate.pattern) ?? 0;
  if (patternCount >= 1) score -= 20;

  const skeletonCount = state.usedSkeletons.get(candidate.skeleton) ?? 0;
  if (skeletonCount >= 1) score -= 20;
  if (state.previousMonthSkeletons.has(candidate.skeleton)) score -= 18;

  const endingCount = state.usedEndings.get(candidate.ending) ?? 0;
  if (endingCount >= 2) score -= 15;
  const recentEndings = state.recentEndings.slice(-2);
  if (recentEndings.length === 2 && recentEndings.every((ending) => ending === candidate.ending)) {
    score -= 30;
  }

  if (len > 28) score -= 30;
  else if (len > 24) score -= 10;
  else if (len >= 18 && len <= 22) score += 8;

  const hasFreshWord = candidate.words.some((word) => !state.usedWords.has(word));
  if (hasFreshWord) score += 10;
  if (candidate.words.some((word) => VOCABULARY_POOLS.scene.includes(word) && !state.usedWords.has(word))) {
    score += 8;
  }
  if (/[気配予感兆しタイミングきっかけ日]$/.test(candidate.text)) {
    score += 6;
  }
  score += candidate.naturalness;
  score += diagnostics.score;

  if (!passesNaturalLanguageGuard(candidate)) {
    score -= 100;
  }

  if (state.recentRhythms[state.recentRhythms.length - 1] === candidate.rhythm) {
    score -= 8;
  }

  const recentPatterns = state.recentPatterns.slice(-2);
  if (recentPatterns.length === 2 && recentPatterns.every((pattern) => pattern === candidate.pattern)) {
    score -= 24;
  }

  return score;
}

function registerCandidate(candidate: DailyLineCandidate, state: MonthlyGenerationState) {
  state.usedLines.add(candidate.text);
  candidate.words.forEach((word) => state.usedWords.add(word));
  candidate.stems.forEach((stem) => state.usedStems.add(stem));
  state.usedPatterns.set(candidate.pattern, (state.usedPatterns.get(candidate.pattern) ?? 0) + 1);
  state.usedSkeletons.set(candidate.skeleton, (state.usedSkeletons.get(candidate.skeleton) ?? 0) + 1);
  state.usedEndings.set(candidate.ending, (state.usedEndings.get(candidate.ending) ?? 0) + 1);
  candidate.metaphorGroups.forEach((metaphor) => state.usedMetaphors.add(metaphor));
  state.recentPatterns.push(candidate.pattern);
  state.recentRhythms.push(candidate.rhythm);
  state.recentEndings.push(candidate.ending);
  state.recentPatterns = state.recentPatterns.slice(-3);
  state.recentRhythms = state.recentRhythms.slice(-2);
  state.recentEndings = state.recentEndings.slice(-2);
}

function generateDailyLineCandidates(
  context: CandidateSeedContext,
  state: MonthlyGenerationState
): DailyLineCandidate[] {
  const seed = simpleHash(context.year, context.month, context.day, context.destinyNumber) + context.dayNumber * 97;
  const candidates: DailyLineCandidate[] = [];

  for (let index = 0; index < 30; index += 1) {
    const pattern = preferredPattern(context, index);
    const rawCandidate = buildPhaseAwareCandidateText(pattern, context, state, seed, index * 13 + 1);
    const candidate = {
      ...rawCandidate,
      ending: normalizeEndingFamily(rawCandidate.ending),
    };
    candidates.push({
      ...candidate,
      score: scoreCandidate(candidate, state),
    });
  }

  return candidates.sort((left, right) => right.score - left.score);
}

function buildUniqueFallbackLine(
  context: CandidateSeedContext,
  state: MonthlyGenerationState
): DailyLineCandidate {
  const seed = simpleHash(context.year, context.month, context.day, context.destinyNumber);
  const recovery = pickWord("recovery", state, seed, 41);
  const mood = pickWord("mood", state, seed, 42);
  const options = [
    "目の前のことを丁寧に進めたい日",
    "自分の気持ちを整えて過ごせるとき",
    "身近な用事から片づけると気持ちが軽くなるころ",
    "無理なく物事が進むタイミング",
    `${recovery}を大切にしながら過ごしたいとき`,
    "小さな確認が安心につながる日",
    `${mood}視点で選び直せるころ`,
    "今できることから手をつけると流れが生まれるとき",
  ];

  for (let index = 0; index < options.length; index += 1) {
    const text = options[seededIndex(seed, index + 43, options.length)]!;
    if (state.usedLines.has(text)) continue;
    return {
      text,
      words: extractNormalizedWords(text),
      stems: text.includes("進め") ? ["進める"] : text.includes("整え") ? ["整える"] : ["過ごす"],
      pattern: "sense",
      skeleton: `fallback-${index}`,
      ending: text.endsWith("とき") ? "とき" : text.endsWith("ころ") ? "ころ" : text.endsWith("タイミング") ? "タイミング" : "日",
      metaphorGroups: [],
      score: 0,
      rhythm: toRhythm(text),
      naturalness: 30,
      naturalnessScore: 30,
    };
  }

  const text = "今日は目の前のことを整えたい日";
  return {
    text,
    words: extractNormalizedWords(text),
    stems: ["整える"],
    pattern: "sense",
    skeleton: "fallback-last",
    ending: "日",
    metaphorGroups: [],
    score: 0,
    rhythm: toRhythm(text),
    naturalness: 30,
    naturalnessScore: 30,
  };
}

function buildHeadlineForDay(
  context: CandidateSeedContext,
  state: MonthlyGenerationState
): string {
  const candidates = generateDailyLineCandidates(context, state);
  const recentTwo = state.recentPatterns.slice(-2);
  const chosen =
    candidates.find(
      (candidate) =>
        candidate.text.length >= 14 &&
        candidate.text.length <= 28 &&
        passesNaturalLanguageGuard(candidate) &&
        !state.usedLines.has(candidate.text) &&
        !state.previousMonthLines.includes(candidate.text) &&
        !state.previousMonthSkeletons.has(candidate.skeleton) &&
        !hasPreviousMonthWordOverlap(candidate, state) &&
        !(state.recentEndings.length === 2 && state.recentEndings.every((ending) => ending === candidate.ending)) &&
        !(recentTwo.length === 2 && recentTwo.every((pattern) => pattern === candidate.pattern))
    ) ??
    candidates.find(
      (candidate) =>
        candidate.text.length >= 14 &&
        candidate.text.length <= 28 &&
        passesNaturalLanguageGuard(candidate) &&
        !state.usedLines.has(candidate.text)
    ) ??
    buildUniqueFallbackLine(context, state);
  registerCandidate(chosen, state);
  return chosen.text;
}

function buildMonthlyHeadlines(params: {
  year: number;
  month: number;
  destinyNumber: FortuneNumber;
}, cache = new Map<string, string[]>()): string[] {
  const { year, month, destinyNumber } = params;
  const cacheKey = `${year}-${month}-${destinyNumber}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  const days = daysInMonth(year, month);
  const previousMonth =
    month === 1
      ? { year: year - 1, month: 12 }
      : { year, month: month - 1 };
  const previousMonthLines =
    previousMonth.year < 2026
      ? []
      : buildMonthlyHeadlines(
          {
            year: previousMonth.year,
            month: previousMonth.month,
            destinyNumber,
          },
          cache
        );
  const state = createMonthlyGenerationStateFromPreviousMonth(previousMonthLines);
  const headlines: string[] = [];

  for (let day = 1; day <= days; day += 1) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayNumber = dayEnergyNumberFromDate(date);
    const flowLevel = FLOW_MATRIX[destinyNumber][dayNumber];
    headlines.push(
      buildHeadlineForDay(
        {
          year,
          month,
          day,
          monthPhase: getMonthPhase(day),
          destinyNumber,
          dayNumber,
          flowLevel,
        },
        state
      )
    );
  }

  cache.set(cacheKey, headlines);
  return headlines;
}

const COMPARISON_WORDS = [
  ...SOFT_BANNED_REPEAT_WORDS,
  "光",
  "心",
  "やさしさ",
  "流れ",
  "気づき",
  "静か",
  "小さな",
  "そっと",
  "ほどける",
];

function inferPatternFromText(text: string): string {
  if (text === "自分の本音に気づきやすい日") return "noun-core";
  if (text === "気持ちの整理が少しつきやすい日") return "noun-core";
  if (text === "考えていたことがまとまりやすい日") return "noun-core";
  if (text === "自分の気持ちを言葉にしやすい日") return "noun-core";
  if (/^自分の.+に向き合いやすい日$/.test(text)) return "noun-core";
  if (
    text === "物事が少しずつ進みやすい日" ||
    text === "停滞していた空気が動き出す日" ||
    text === "小さな行動が流れを変えやすい日" ||
    text === "ひとつずつ進めると流れに乗りやすい日" ||
    text === "迷いがやわらぎやすい日" ||
    text === "心が少し落ち着きを取り戻す日" ||
    text === "無理を手放すと進める日" ||
    text === "気負わずに動くと整いやすい日"
  ) return "motion";
  if (text === "止まっていたことが進みやすい日") return "scene";
  if (text === "先延ばしにしていたことを進めたい日") return "scene";
  if (text === "迷っていたことの答えが出やすい日") return "scene";
  if (text === "話し合いが少し前に進みやすい日") return "scene";
  if (text === "様子を見ていたことを決めやすい日") return "scene";
  if (text === "急がず丁寧に進めたい日") return "sense";
  if (text === "身近なことを整えると運気が上向く日") return "sense";
  if (text === "小さな違和感を見逃さないでいたい日") return "sense";
  if (text === "身の回りを整えると気分が軽くなる日") return "sense";
  if (text === "細かな確認をしておきたい日") return "sense";
  if (text === "本音を素直に言葉にしやすい日") return "afterglow";
  if (text === "気持ちの整理が少し進みやすい日") return "afterglow";
  if (/今日は少し.+過ごせる日$/.test(text)) return "afterglow";
  if (text === "今日は落ち着いて判断しやすい日") return "afterglow";
  if (text === "今日は自分のペースを守りたい日") return "afterglow";
  if (
    text === "うれしい流れを受け取りやすい日" ||
    text === "気持ちに少し余裕が戻りやすい日" ||
    /のように空気がやわらぐ日$/.test(text) ||
    text === "気持ちを整えると過ごしやすい日" ||
    text === "焦らず動くほど整いやすい日" ||
    /を意識すると軽くなれる日$/.test(text) ||
    text === "今ある流れを素直に受け止めたい日" ||
    text === "身近な安心を大切にしたい一日"
  ) return "omen";
  return "motion";
}

function inferSkeletonFromText(text: string): string {
  if (text === "自分の本音に気づきやすい日") return "core-notice-true-feeling";
  if (text === "気持ちの整理が少しつきやすい日") return "core-feeling-organize";
  if (text === "考えていたことがまとまりやすい日") return "core-thoughts-settle";
  if (text === "自分の気持ちを言葉にしやすい日") return "core-put-feelings-into-words";
  if (/^自分の.+に向き合いやすい日$/.test(text)) return "core-face-self-clue";
  if (text === "物事が少しずつ進みやすい日") return "flow-things-move";
  if (text === "停滞していた空気が動き出す日") return "flow-stagnation-breaks";
  if (text === "小さな行動が流れを変えやすい日") return "flow-small-action-shifts";
  if (text === "ひとつずつ進めると流れに乗りやすい日") return "flow-step-by-step";
  if (text === "迷いがやわらぎやすい日") return "flow-doubt-softens";
  if (text === "心が少し落ち着きを取り戻す日") return "flow-calm-returns";
  if (text === "無理を手放すと進める日") return "flow-release-and-move";
  if (text === "気負わずに動くと整いやすい日") return "flow-no-pressure";
  if (text === "止まっていたことが進みやすい日") return "scene-stopped-things-move";
  if (text === "先延ばしにしていたことを進めたい日") return "scene-delayed-things-advance";
  if (text === "迷っていたことの答えが出やすい日") return "hesitation-answer-comes";
  if (text === "話し合いが少し前に進みやすい日") return "scene-talk-moves";
  if (text === "様子を見ていたことを決めやすい日") return "scene-decide-pending";
  if (text === "急がず丁寧に進めたい日") return "hint-go-slow";
  if (text === "身近なことを整えると運気が上向く日") return "hint-tidy-nearby";
  if (text === "小さな違和感を見逃さないでいたい日") return "hint-notice-discomfort";
  if (text === "身の回りを整えると気分が軽くなる日") return "hint-tidy-space";
  if (text === "細かな確認をしておきたい日") return "hint-check-details";
  if (text === "本音を素直に言葉にしやすい日") return "inner-honest-words";
  if (text === "気持ちの整理が少し進みやすい日") return "inner-sorting-progress";
  if (/今日は少し.+過ごせる日$/.test(text)) return "inner-soft-day";
  if (text === "今日は落ち着いて判断しやすい日") return "inner-calm-judgment";
  if (text === "今日は自分のペースを守りたい日") return "inner-keep-pace";
  if (text === "うれしい流れを受け取りやすい日") return "omen-positive-flow";
  if (text === "気持ちに少し余裕が戻りやすい日") return "omen-room-returns";
  if (/のように空気がやわらぐ日$/.test(text)) return "today-tailwind";
  if (text === "気持ちを整えると過ごしやすい日") return "omen-balance-day";
  if (text === "焦らず動くほど整いやすい日") return "omen-slow-action-day";
  if (/を意識すると軽くなれる日$/.test(text)) return "omen-recovery-focus";
  if (text === "今ある流れを素直に受け止めたい日") return "omen-accept-flow";
  if (text === "身近な安心を大切にしたい一日") return "omen-value-calm";
  return "unknown";
}

function collectComparisonWords(texts: string[]) {
  const counts = new Map<string, number>();
  for (const word of COMPARISON_WORDS) {
    let total = 0;
    for (const text of texts) {
      if (text.includes(word)) total += 1;
    }
    if (total > 0) counts.set(word, total);
  }
  return counts;
}

function inferPatternCategory(text: string): string {
  if (/本音|気持ちの整理が少しつきやすい日|考えていたことがまとまりやすい日|言葉にしやすい日|向き合いやすい日/.test(text)) {
    return "noun-core";
  }
  if (/物事が少しずつ進みやすい日|動き出す日|変えやすい日|乗りやすい日|取り戻す日|迷いがやわらぎやすい日/.test(text)) {
    return "motion";
  }
  if (/答えが出やすい日|決めやすい日|判断しやすい日|話し合いが少し前に進みやすい日|気持ちが整いやすい日|言葉がまとまりやすい日/.test(text)) {
    return "scene";
  }
  if (/丁寧に進めたい日|運気が上向く日|違和感を見逃さないでいたい日|気分が軽くなる日|確認をしておきたい日|手をつけたい日/.test(text)) {
    return "sense";
  }
  if (/過ごせる日|ペースを守りたい日|心が落ち着きやすい日|足取りが軽くなる日/.test(text)) {
    return "afterglow";
  }
  if (/余裕が戻りやすい日|受け取りやすい日|受け止めたい日|つながりを感じやすい日|意識すると軽くなれる日|包まれて気持ちがやわらぐ日/.test(text)) {
    return "omen";
  }
  return inferPatternFromText(text);
}

function inferPatternSkeleton(text: string): string {
  if (text.includes("自分の本音に気づきやすい日")) return "core-notice-true-feeling";
  if (text.includes("気持ちの整理が少しつきやすい日")) return "core-feeling-organize";
  if (text.includes("考えていたことがまとまりやすい日")) return "core-thoughts-settle";
  if (text.includes("自分の気持ちを言葉にしやすい日")) return "core-put-feelings-into-words";
  if (text.includes("本音を言葉にしやすい日")) return "core-honest-words";
  if (text.includes("向き合いやすい日")) return "core-face-self-clue";
  if (text.includes("物事が少しずつ進みやすい日")) return "flow-things-move";
  if (text.includes("停滞していた空気が動き出す日")) return "flow-stagnation-breaks";
  if (text.includes("小さな行動が流れを変えやすい日")) return "flow-small-action-shifts";
  if (text.includes("ひとつずつ進めると流れに乗りやすい日")) return "flow-step-by-step";
  if (text.includes("迷いがやわらぎやすい日")) return "flow-doubt-softens";
  if (text.includes("心が少し落ち着きを取り戻す日")) return "flow-calm-returns";
  if (text.includes("気持ちの整理が少し進みやすい日")) return "inner-sorting-progress";
  if (text.includes("今日は落ち着いて判断しやすい日")) return "scene-calm-judgment";
  if (text.includes("答えが出やすい日")) return "hesitation-answer-comes";
  if (text.includes("話し合いが少し前に進みやすい日")) return "scene-talk-moves";
  if (text.includes("決めやすい日")) return "scene-decide-pending";
  if (text.includes("気持ちが整いやすい日")) return "seasonal-early-settle";
  if (text.includes("迷いがやわらぎやすい日") && text.includes("とともに")) return "seasonal-early-soften";
  if (text.includes("答えが定まりやすい日")) return "seasonal-late-decide";
  if (text.includes("言葉がまとまりやすい日") && text.includes("とともに")) return "seasonal-late-words";
  if (text.includes("丁寧に進めたい日")) return "hint-go-slow";
  if (text.includes("運気が上向く日")) return "hint-tidy-nearby";
  if (text.includes("違和感を見逃さないでいたい日")) return "hint-notice-discomfort";
  if (text.includes("気分が軽くなる日")) return "hint-tidy-space";
  if (text.includes("確認をしておきたい日")) return "hint-check-details";
  if (text.includes("手をつけたい日")) return "hint-start-now";
  if (text.includes("本音を素直に言葉にしやすい日")) return "inner-honest-words";
  if (text.includes("今日は少し") && text.includes("気持ちで過ごせる日")) return "inner-soft-day";
  if (text.includes("今日は自分のペースを守りたい日")) return "inner-keep-pace";
  if (text.includes("心が落ち着きやすい日")) return "seasonal-early-calm";
  if (text.includes("足取りが軽くなる日")) return "seasonal-late-step";
  if (text.includes("余裕が戻りやすい日")) return "omen-room-returns";
  if (text.includes("受け取りやすい日")) return "omen-positive-flow";
  if (text.includes("受け止めたい日")) return "omen-accept-flow";
  if (text.includes("意識すると軽くなれる日")) return "omen-recovery-focus";
  if (text.includes("つながりを感じやすい日")) return "seasonal-late-connect";
  if (text.includes("包まれて気持ちがやわらぐ日")) return "seasonal-early-wrap";
  return inferSkeletonFromText(text);
}

export function countRepeatedWordsInMonth(lines: string[]) {
  const counts = new Map<string, number>();
  for (const line of lines) {
    const words = Array.from(line.matchAll(/[一-龠々ぁ-んァ-ヶー]{2,}/g)).map((match) => match[0]);
    for (const word of words) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

export function countRepeatedSoftBannedWords(lines: string[]) {
  return Array.from(collectComparisonWords(lines).entries())
    .filter(([, count]) => count >= 2)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

export function countPatternRuns(lines: string[]) {
  let maxRun = 1;
  let currentRun = 1;

  for (let index = 1; index < lines.length; index += 1) {
    currentRun =
      inferPatternCategory(lines[index]!) === inferPatternCategory(lines[index - 1]!)
        ? currentRun + 1
        : 1;
    maxRun = Math.max(maxRun, currentRun);
  }

  return maxRun;
}

export function countRepeatedSkeletonPatterns(lines: string[]) {
  const counts = new Map<string, number>();
  for (const line of lines) {
    const skeleton = inferPatternSkeleton(line);
    counts.set(skeleton, (counts.get(skeleton) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
}

export function countOverLengthLines(lines: string[], threshold: number) {
  return countLongHeadlines(lines, threshold);
}

export function estimateEllipsisRisk(lines: string[], threshold = 22) {
  return lines.filter((line) => line.length > threshold).length;
}

function wordOverlapScore(left: string, right: string) {
  const leftWords = new Set(extractNormalizedWords(left));
  const rightWords = new Set(extractNormalizedWords(right));
  let overlap = 0;
  for (const word of leftWords) {
    if (rightWords.has(word)) overlap += 1;
  }
  return overlap;
}

export function countPreviousMonthDuplicateLines(currentLines: string[], previousLines: string[]) {
  return currentLines.filter((line) => previousLines.includes(line)).length;
}

export function adjacentSimilarityScore(lines: string[]) {
  if (lines.length < 2) return 0;
  let total = 0;
  for (let index = 1; index < lines.length; index += 1) {
    total += wordOverlapScore(lines[index - 1]!, lines[index]!);
  }
  return Number((total / (lines.length - 1)).toFixed(2));
}

function summarizeTone(lines: string[]) {
  const counts = {
    settle: 0,
    notice: 0,
    soften: 0,
    calm: 0,
    decide: 0,
    move: 0,
    words: 0,
    connect: 0,
  };

  for (const line of lines) {
    if (/整|整理/.test(line)) counts.settle += 1;
    if (/気づ|本音/.test(line)) counts.notice += 1;
    if (/やわら|軽くなる/.test(line)) counts.soften += 1;
    if (/落ち着|余裕|ペース/.test(line)) counts.calm += 1;
    if (/定まり|決め|判断|答え/.test(line)) counts.decide += 1;
    if (/進み|動き出す|手をつけ/.test(line)) counts.move += 1;
    if (/言葉/.test(line)) counts.words += 1;
    if (/つながり|話し合い/.test(line)) counts.connect += 1;
  }

  const earlyScore = counts.settle + counts.notice + counts.soften + counts.calm;
  const lateScore = counts.decide + counts.move + counts.words + counts.connect;

  return {
    dominant: earlyScore >= lateScore ? "整う・気づく寄り" : "定まる・進む寄り",
    counts,
  };
}

export function summarizeMonthHalfTone(lines: string[]) {
  const midpoint = Math.min(15, lines.length);
  return {
    firstHalfTone: summarizeTone(lines.slice(0, midpoint)),
    secondHalfTone: summarizeTone(lines.slice(midpoint)),
  };
}

export function findMeaningUnclearLines(lines: string[]) {
  return lines
    .map((line) => ({
      text: line,
      diagnostics: evaluateNaturalness(line),
    }))
    .filter(({ diagnostics }) => diagnostics.score < 35 || diagnostics.reasons.includes("読み取りづらい"));
}

function topRepeatedWords(texts: string[]) {
  return Array.from(collectComparisonWords(texts).entries())
    .filter(([, count]) => count >= 2)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 10);
}

function countLongHeadlines(texts: string[], threshold: number) {
  return texts.filter((text) => text.length > threshold).length;
}

export function buildMonthlyDailyHeadlineComparison(params: {
  year: number;
  month: number;
  destinyNumber: FortuneNumber;
}) {
  const legacy = buildLegacyMonthlyDailyNumberFortunes(params).map((entry) => entry.headline);
  const cache = new Map<string, string[]>();
  const current = buildMonthlyHeadlines(params, cache);
  const previousMonth =
    params.month === 1
      ? { year: params.year - 1, month: 12 }
      : { year: params.year, month: params.month - 1 };
  const previousLegacyLines = buildLegacyMonthlyNumberFortunesForComparison(previousMonth.year, previousMonth.month, params.destinyNumber);
  const previousCurrentLines = buildMonthlyHeadlines(
    { year: previousMonth.year, month: previousMonth.month, destinyNumber: params.destinyNumber },
    cache
  );

  return {
    legacy: {
      repeatedWords: topRepeatedWords(legacy),
      previousMonthDuplicateLines: countPreviousMonthDuplicateLines(legacy, previousLegacyLines),
      repeatedSkeletonPatterns: countRepeatedSkeletonPatterns(legacy),
      adjacentSimilarityScore: adjacentSimilarityScore(legacy),
      over22: countLongHeadlines(legacy, 22),
      over24: countLongHeadlines(legacy, 24),
      over28: countLongHeadlines(legacy, 28),
      samples: legacy.slice(0, 3),
    },
    current: {
      ...summarizeMonthHalfTone(current),
      repeatedWords: topRepeatedWords(current),
      previousMonthDuplicateLines: countPreviousMonthDuplicateLines(current, previousCurrentLines),
      repeatedSkeletonPatterns: countRepeatedSkeletonPatterns(current),
      adjacentSimilarityScore: adjacentSimilarityScore(current),
      meaningUnclearLines: findMeaningUnclearLines(current),
      over22: countLongHeadlines(current, 22),
      over24: countLongHeadlines(current, 24),
      over28: countLongHeadlines(current, 28),
      samples: current.slice(0, 3),
    },
  };
}

function buildLegacyMonthlyNumberFortunesForComparison(
  year: number,
  month: number,
  destinyNumber: FortuneNumber
) {
  return buildLegacyMonthlyDailyNumberFortunes({ year, month, destinyNumber }).map((entry) => entry.headline);
}

export function buildMonthlyDailyNumberFortunes(params: {
  year: number;
  month: number;
  destinyNumber: FortuneNumber;
}): DailyNumberFortune[] {
  const { year, month, destinyNumber } = params;
  const days = daysInMonth(year, month);
  const headlines = buildMonthlyHeadlines(params);
  const results: DailyNumberFortune[] = [];

  for (let day = 1; day <= days; day += 1) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayNumber = dayEnergyNumberFromDate(dateStr);
    const flowLevel = FLOW_MATRIX[destinyNumber][dayNumber];
    const content = DAY_CONTENT[dayNumber];

    results.push({
      date: dateStr,
      dayNumber,
      flowLevel,
      title: TITLES[dayNumber],
      headline: headlines[day - 1]!,
      summary: content.summary,
      action: content.action,
      emotion: content.emotion,
      tags: [...content.tags],
    });
  }

  return results;
}
