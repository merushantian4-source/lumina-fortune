"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { TarotBackArtwork, TarotCardArtwork } from "@/components/tarot-card-artwork";
import { LightTarotDisplay } from "@/components/light-tarot-display";
import { tarotCards, type TarotCardEntry } from "@/src/data/tarotCards";
import { getRandomTarotCard } from "@/lib/tarot";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton, LuminaLinkButton } from "@/components/ui/button";
import { pickHakuMessage } from "@/lib/haku-messages";
import { ensureFortuneOutputFormat, parseDailyFortuneSections } from "@/lib/daily-fortune-output";
import { runClientModerationCheck } from "@/lib/moderation/clientCheck";
import { getOrCreateChatVisitorKey } from "@/lib/membership";
import type { FortuneSection } from "@/lib/types/content";

type DrawnCard = TarotCardEntry & {
  reversed: boolean;
};

type DailyFortuneResponse = {
  text?: string;
  error?: string;
};

type SaveWordResponse = {
  record?: {
    id: string;
  };
  error?: string;
};

type RecentDailyCardItem = {
  label: "今日" | "昨日" | "一昨日";
  dateKey: string;
  cardName: string | null;
};

type RecentDailyCardResponse = {
  history?: RecentDailyCardItem[];
};

type DailyFortuneProfile = {
  nickname?: string;
  job?: string;
  occupation?: string;
  birthdate?: string;
  birthDate?: string;
  loveStatus?: "single" | "married" | "complicated" | "unrequited" | string;
};

type BookmarkShareState = {
  text: string;
  dateLabel: string;
};

type PrayerCardShareState = {
  imageUrl: string;
  themeText: string;
  closingText: string;
  hashtags: string;
  dateLabel: string;
};

type BirthdayBlessingCard = {
  id: string;
  title: string;
  message: string;
};

type SpecialFortuneEvent = {
  key: string;
  badge: string;
  title: string;
  message: string;
  priority: number;
  card?: BirthdayBlessingCard | null;
};

const DAILY_FORTUNE_COOKIE_NAME = "lumina_daily_fortune";
const DAILY_FORTUNE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 2;
const DAILY_FORTUNE_TIMEZONE = "Asia/Tokyo"; // JST固定で日付キーを生成する
const PROFILE_STORAGE_KEY = "lumina_profile";
const PRAYER_CARD_HASHTAGS = "#白の庭の祈り #LUMINA #今日の導き";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BIRTHDAY_MESSAGES = [
  "お誕生日おめでとうございます。\n今日は、あなたの魂がこの世界に光を灯した特別な日。\nこれからの一年が、やさしい導きと小さな奇跡に包まれますように。",
  "今日はあなたの祝福の日。\nこの世界に生まれた意味を、静かに思い出すような一日になりますように。\n新しい一年に、やわらかな光が差し込みます。",
  "お誕生日おめでとうございます。\nあなたが歩いてきた道も、これから歩く道も、\nすべてはあなたの魂が選んだ美しい物語です。",
  "今日は、あなたの星が輝き始めた日。\nこの一年が、あなたらしい光を取り戻す旅になりますように。",
  "お誕生日おめでとうございます。\n今日という日は、あなたの存在そのものが祝福される日。\nどうか自分自身にも、やさしい光を向けてあげてください。",
  "今日はあなたの魂の記念日。\nここまで歩いてきた自分を、そっと褒めてあげてくださいね。\n新しい一年が、やさしい流れに導かれますように。",
  "この世界にあなたが生まれたこと自体が、小さな奇跡です。\n今日という日が、あなたの未来を照らす光になりますように。",
  "お誕生日おめでとうございます。\nあなたの魂には、まだたくさんの光が眠っています。\nこの一年が、その光を見つける旅になりますように。",
] as const;

const BIRTHDAY_BLESSING_MESSAGE =
  "お誕生日おめでとうございます。今日はあなたの魂がこの世界に光を灯した特別な日。新しい一年がやさしい導きに包まれますように。";

const BIRTHDAY_BLESSING_CARDS: BirthdayBlessingCard[] = [
  {
    id: "light-door",
    title: "光の扉",
    message:
      "新しい一年の始まりに、あなたの前には静かに新しい扉が開いています。焦らず、心がやわらぐ方へ進んでみてください。",
  },
  {
    id: "moon-blessing",
    title: "月の祝福",
    message:
      "あなたの歩みは、見えないところでもきちんと守られています。この一年は、やさしい流れを信じることで運が整っていきます。",
  },
  {
    id: "soul-flame",
    title: "魂の灯火",
    message:
      "あなたの中にある小さな願いは、これから少しずつ形になっていきます。今年は、自分の本音を大切にするほど光が強まるでしょう。",
  },
  {
    id: "white-feather",
    title: "白い羽のしるし",
    message:
      "軽やかさが祝福になる一年です。重く抱えてきたものを少し降ろし、心が軽くなる選択をしてみてください。",
  },
  {
    id: "star-path",
    title: "星の導き",
    message:
      "あなたに必要なご縁や出来事は、正しいタイミングで近づいています。今年は無理に追わず、整えながら待つことで運命が動きます。",
  },
  {
    id: "silent-flower",
    title: "静寂の花",
    message:
      "静かな時間の中でこそ、あなたの魅力は深く花開いていきます。この一年は、無理をしない美しさがあなたを守ってくれるでしょう。",
  },
  {
    id: "wish-seed",
    title: "願いの種",
    message:
      "まだ言葉になっていない願いも、もうあなたの内側で芽吹き始めています。心の奥の小さな希望を、やさしく育ててみてください。",
  },
  {
    id: "dawn-prayer",
    title: "夜明けの祈り",
    message:
      "新しい朝の気配が、これからのあなたを静かに照らしています。この一年は、焦らず整えるほど道が澄んでいくはずです。",
  },
];

const SPECIAL_SEASONAL_EVENTS = [
  {
    key: "new-year",
    startMonthDay: "01-01",
    endMonthDay: "01-03",
    badge: "新しい年の祝福",
    title: "新年のやさしい光",
    message:
      "年の始まりに満ちる澄んだ光が、あなたの心を静かに整えています。この数日が、やさしい希望と穏やかな導きに包まれますように。",
    priority: 20,
  },
  {
    key: "christmas",
    startMonthDay: "12-24",
    endMonthDay: "12-25",
    badge: "聖夜の祝福",
    title: "クリスマスの灯り",
    message:
      "やわらかな灯りが心をあたためる特別な日です。大切な想いと静かな祈りが、あなたのこれからにやさしい奇跡を運んでくれるでしょう。",
    priority: 30,
  },
] as const;

type DailyFortuneCookiePayload = {
  dateKey: string;
  result: {
    cardId: number;
    reversed: boolean;
    summary: string;
    fullText: string;
  };
};

function loadProfileForDailyFortune(): DailyFortuneProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DailyFortuneProfile;
    const resolvedJob =
      typeof parsed.job === "string"
        ? parsed.job
        : typeof parsed.occupation === "string"
          ? parsed.occupation
          : undefined;
    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : undefined,
      job: resolvedJob,
      birthdate:
        typeof parsed.birthdate === "string"
          ? parsed.birthdate
          : typeof parsed.birthDate === "string"
            ? parsed.birthDate
            : undefined,
      loveStatus: typeof parsed.loveStatus === "string" ? parsed.loveStatus : undefined,
    };
  } catch {
    return {};
  }
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeOrientationMentions(text: string, card: { nameJa: string; reversed: boolean }): string {
  const opposite = card.reversed ? "正位置" : "逆位置";
  const expected = card.reversed ? "逆位置" : "正位置";
  const escapedName = escapeRegExp(card.nameJa);
  const directPattern = new RegExp(`${escapedName}\\s*[・・]\\s*${opposite}\\s*[・・]`, "g");
  return text.replace(directPattern, `${card.nameJa}（${expected}）`);
}

function sanitizeFortuneText(text: string): string {
  const mojibakeLike = /(縺|繧|繝|荳|蜈|蝗|螳|隱|讒|髮|蜊|窶ｦ|竊・){2,}/;
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const cleaned = lines.filter((line) => !mojibakeLike.test(line.trim()));
  const normalized = cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return normalized || text;
}

function extractTopWhisper(fullText: string, fallbackSummary: string): string {
  const normalized = fullText.replace(/\r\n/g, "\n").trim();
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const candidates = [fallbackSummary, ...lines, normalized]
    .map((value) => value.replace(/\*\*/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const quotedTheme = candidates
    .map((value) => value.match(/「([^」]{4,40})」/))
    .find(Boolean)?.[1];
  if (quotedTheme) {
    return quotedTheme.trim();
  }

  const todayTheme = candidates
    .map((value) => value.match(/今日は[「『]?([^」』。\n]+?)(?:[」』]?です|[」』]?の日(?:です)?)/))
    .find(Boolean)?.[1];
  if (todayTheme) {
    return todayTheme.trim().slice(0, 36);
  }

  const compactSentence = candidates
    .flatMap((value) => value.split(/[\n。]/))
    .map((value) => value.replace(/[「」]/g, "").trim())
    .find(
      (value) =>
        value.length >= 8 &&
        value.length <= 42 &&
        !/(こんにちは|カード|曜日|正位置|逆位置|象徴|昨日)/.test(value)
    );
  if (compactSentence) {
    return compactSentence;
  }

  return fallbackSummary.replace(/[「」]/g, "").trim().slice(0, 36) || "今日の導き";
}

function extractBookmarkMessage(fullText: string, fallbackSummary: string): string {
  const normalized = fullText.replace(/\r\n/g, "\n").trim();
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const preferredLine =
    lines.find((line) => line.includes("今日は") && line.includes("日です")) ??
    lines.find((line) => line.length >= 12 && line.length <= 80 && !line.includes("【")) ??
    "";

  const source = preferredLine || fallbackSummary || "";
  return source.replace(/\*\*/g, "").replace(/[「」]/g, "").trim();
}

function extractClosingGuidanceLine(fullText: string, fallbackSummary: string): string {
  const normalized = fullText.replace(/\r\n/g, "\n").trim();
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("🌿") && line !== "今日のひとこと");
  const candidate = [...lines]
    .reverse()
    .find((line) => line.length >= 10 && line.length <= 120 && !line.includes("【"));
  return (candidate ?? fallbackSummary ?? "").replace(/\*\*/g, "").replace(/[「」]/g, "").trim();
}

function buildCardShareTheme(card: DrawnCard | null, fallbackSummary: string, fullText: string): string {
  if (!card) {
    return extractTopWhisper(fullText, fallbackSummary);
  }

  const cardMeaning = card.meaningJa.replace(/\s+/g, " ").trim();
  const fromMeaning = cardMeaning
    .split(/。/)
    .map((value) => value.trim())
    .find((value) => value.length >= 8 && value.length <= 40);

  if (fromMeaning) {
    return fromMeaning;
  }

  const fallback = extractTopWhisper(fullText, fallbackSummary).trim();
  if (fallback) {
    return fallback;
  }

  return `${card.nameJa}の導き`;
}

function getJstDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: DAILY_FORTUNE_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
  const month = Number(parts.find((p) => p.type === "month")?.value ?? "0");
  const day = Number(parts.find((p) => p.type === "day")?.value ?? "0");

  return { year, month, day };
}

function getJstDateKey(date = new Date()) {
  const { year, month, day } = getJstDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getJstWeekdayJa(date = new Date()) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: DAILY_FORTUNE_TIMEZONE,
    weekday: "long",
  }).format(date);
}

function getJstMonthDayKey(date = new Date()) {
  const { month, day } = getJstDateParts(date);
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getBirthMonthDayKey(birthDate?: string) {
  if (!birthDate) return null;
  const match = birthDate.trim().match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return `${match[1]}-${match[2]}`;
}

function getBirthdayMessage(profile: DailyFortuneProfile) {
  const birthMonthDay =
    getBirthMonthDayKey(profile.birthdate) ?? getBirthMonthDayKey(profile.birthDate);
  if (!birthMonthDay) return null;
  if (birthMonthDay !== getJstMonthDayKey()) return null;

  return BIRTHDAY_BLESSING_MESSAGE;
}

function getBirthdayBlessingCard(profile: DailyFortuneProfile) {
  const birthDate = profile.birthdate ?? profile.birthDate;
  if (!birthDate || BIRTHDAY_BLESSING_CARDS.length === 0) return null;

  const birthMonthDay = getBirthMonthDayKey(birthDate);
  if (!birthMonthDay) return null;
  if (birthMonthDay !== getJstMonthDayKey()) return null;

  const seedSource = `${birthDate}-${getJstDateKey()}`;
  let hash = 0;
  for (let index = 0; index < seedSource.length; index += 1) {
    hash = (hash * 31 + seedSource.charCodeAt(index)) >>> 0;
  }

  return BIRTHDAY_BLESSING_CARDS[hash % BIRTHDAY_BLESSING_CARDS.length];
}

function isMonthDayInRange(monthDay: string, startMonthDay: string, endMonthDay: string) {
  return monthDay >= startMonthDay && monthDay <= endMonthDay;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getSpecialFortuneEvent(profile: DailyFortuneProfile): SpecialFortuneEvent | null {
  const todayMonthDay = getJstMonthDayKey();
  const seasonalEvents: SpecialFortuneEvent[] = SPECIAL_SEASONAL_EVENTS.filter((event) =>
    isMonthDayInRange(todayMonthDay, event.startMonthDay, event.endMonthDay)
  ).map((event) => ({
    key: event.key,
    badge: event.badge,
    title: event.title,
    message: event.message,
    priority: event.priority,
    card: null,
  }));

  const birthdayMessage = getBirthdayMessage(profile);
  const birthdayCard = getBirthdayBlessingCard(profile);
  const birthdayEvent =
    birthdayMessage && birthdayCard
      ? ({
          key: "birthday",
          badge: "🎂 今日はあなたの特別な日",
          title: "お誕生日おめでとうございます",
          message: birthdayMessage,
          priority: 100,
          card: birthdayCard,
        } satisfies SpecialFortuneEvent)
      : null;

  return [birthdayEvent, ...seasonalEvents]
    .filter((event): event is SpecialFortuneEvent => event !== null)
    .sort((left, right) => right.priority - left.priority)[0] ?? null;
}

function getTodayLabel() {
  const { year, month, day } = getJstDateParts();
  return `${year}年${month}月${day}日`;
}

function buildFallbackDailyFortune(card: DrawnCard, profile: DailyFortuneProfile) {
  const reading = card.reversed
    ? `${card.nameJa}が示すテーマは「${card.meaningJa}」です。
今は少し気持ちや流れを整えながら進むことで、見えてくるものが増えやすいでしょう。
急いで答えを出すより、自分の感覚を信じて丁寧に進めることが今日の助けになります。`
    : `${card.nameJa}が示すテーマは「${card.meaningJa}」です。
努力してきたことが少しずつ形になりやすく、前向きな流れを受け取りやすい日でしょう。
今日は自信を持って、今できることをひとつ進めてみてください。`;

  return ensureFortuneOutputFormat(reading, [{ name: card.nameJa, reversed: card.reversed }], {
    nickname: profile.nickname,
    job: profile.job,
    loveStatus: profile.loveStatus,
    weekdayJa: getJstWeekdayJa(),
  });
}

function isDailyFortuneTransportErrorText(text: string | null | undefined) {
  const normalized = text?.trim();
  if (!normalized) return false;

  return (
    normalized.includes("ルミナさんとの通信に失敗しました。") ||
    normalized.includes("占い結果の取得に失敗しました。")
  );
}

function encodeCookiePayload(payload: DailyFortuneCookiePayload): string {
  const json = JSON.stringify(payload);
  const utf8 = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of utf8) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function decodeCookiePayload(value: string): DailyFortuneCookiePayload | null {
  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as DailyFortuneCookiePayload;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.dateKey !== "string") return null;
    const result = parsed.result;
    if (!result || typeof result !== "object") return null;
    if (!Number.isInteger(result.cardId)) return null;
    if (typeof result.reversed !== "boolean") return null;
    if (typeof result.summary !== "string") return null;
    if (typeof result.fullText !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookieValue(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax`;
}

function clearCookieValue(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

function loadSavedDailyFortuneForToday(): { payload: DailyFortuneCookiePayload; card: DrawnCard } | null {
  const raw = getCookieValue(DAILY_FORTUNE_COOKIE_NAME);
  if (!raw) return null;

  const payload = decodeCookiePayload(raw);
  if (!payload) return null;
  if (payload.dateKey !== getJstDateKey()) return null;

  const baseCard = tarotCards.find((card) => card.id === payload.result.cardId);
  if (!baseCard) return null;

  return {
    payload,
    card: {
      ...baseCard,
      reversed: payload.result.reversed,
    },
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

export default function DailyFortunePage() {
  const [readyToFlip, setReadyToFlip] = useState(false);
  const [selectedCard, setSelectedCard] = useState<DrawnCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipFinished, setFlipFinished] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [fullText, setFullText] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTodayResult, setHasTodayResult] = useState(false);
  const [saveWordMessage, setSaveWordMessage] = useState<string | null>(null);
  const [isSavingWord, setIsSavingWord] = useState(false);
  const [bookmarkShare, setBookmarkShare] = useState<BookmarkShareState | null>(null);
  const [bookmarkStatus, setBookmarkStatus] = useState<string | null>(null);
  const [isRenderingBookmark, setIsRenderingBookmark] = useState(false);
  const [prayerCard, setPrayerCard] = useState<PrayerCardShareState | null>(null);
  const [prayerCardStatus, setPrayerCardStatus] = useState<string | null>(null);
  const [isGeneratingPrayerCard, setIsGeneratingPrayerCard] = useState(false);
  const [isSharingPrayerCard, setIsSharingPrayerCard] = useState(false);
  const [recentCards, setRecentCards] = useState<RecentDailyCardItem[]>([
    { label: "今日", dateKey: "", cardName: null },
    { label: "昨日", dateKey: "", cardName: null },
    { label: "一昨日", dateKey: "", cardName: null },
  ]);
  const today = useMemo(() => getTodayLabel(), []);
  const hakuMessage = useMemo(() => {
    if (!showResult || !selectedCard) return null;
    return pickHakuMessage(
      "daily-fortune",
      `${getJstDateKey()}:${selectedCard.id}:${selectedCard.reversed ? "rev" : "upright"}`
    );
  }, [showResult, selectedCard]);
  const fortuneSections = useMemo(() => {
    const parsed = parseDailyFortuneSections(fullText ?? "");
    return {
      intro: parsed.intro,
      cardMeaning: parsed.cardMeaning,
      overallFlow: parsed.overallFlow,
      work: parsed.work,
      love: parsed.love,
      advice: parsed.advice,
      money: parsed.money,
      todayHitokoto: parsed.todayHitokoto,
      whiteHitokoto: parsed.whiteHitokoto || hakuMessage || "",
    };
  }, [fullText, hakuMessage]);
  const detailSections = useMemo<FortuneSection[]>(() => {
    const sections: FortuneSection[] = [];

    if (fortuneSections.cardMeaning) {
      sections.push({ heading: "カードの意味", text: fortuneSections.cardMeaning });
    }
    if (fortuneSections.overallFlow) {
      sections.push({ heading: "今日の流れ", text: fortuneSections.overallFlow });
    }
    if (fortuneSections.work) {
      sections.push({ heading: "仕事・学び", text: fortuneSections.work });
    }
    if (fortuneSections.love) {
      sections.push({ heading: "恋愛・人間関係", text: fortuneSections.love });
    }
    if (fortuneSections.advice) {
      sections.push({ heading: "アドバイス", text: fortuneSections.advice });
    }
    if (fortuneSections.money) {
      sections.push({ heading: "金運", text: fortuneSections.money });
    }

    return sections;
  }, [fortuneSections]);
  const hasDisplayReading = Boolean((fullText ?? "").trim() || (summary ?? "").trim());
  const sharePreview = useMemo(() => {
    const sourceText = (fullText ?? "").trim();
    const fallback = (summary ?? "").trim();
    if (!sourceText && !fallback && !selectedCard) return null;

    const themeText = buildCardShareTheme(selectedCard, fallback || "今日の導き", sourceText || fallback || "")
      .replace(/\s+/g, " ")
      .trim();

    return {
      text: themeText || "今日の導き",
      dateLabel: today,
    };
  }, [fullText, selectedCard, summary, today]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const requestIdRef = useRef(0);
  const flipTimerRef = useRef<number | null>(null);
  const flipLockRef = useRef(false);
  const bookmarkCardRef = useRef<HTMLDivElement | null>(null);

  const applySavedResult = (saved: { payload: DailyFortuneCookiePayload; card: DrawnCard }) => {
    const normalizedFullText = sanitizeFortuneText(
      normalizeOrientationMentions(saved.payload.result.fullText, saved.card)
    );
    setReadyToFlip(true);
    setSelectedCard(saved.card);
    setIsFlipped(true);
    setFlipFinished(true);
    setSummary(saved.payload.result.summary);
    setFullText(normalizedFullText);
    setShowResult(true);
    setIsReading(false);
    setError(null);
    setHasTodayResult(true);
  };

  const fetchRecentCards = async () => {
    try {
      const profile = loadProfileForDailyFortune();
      const res = await fetch("/api/daily-fortune-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: { nickname: profile.nickname },
        }),
      });
      const data = (await res.json()) as RecentDailyCardResponse;
      if (!res.ok || !Array.isArray(data.history)) return;
      const normalized = data.history.slice(0, 3);
      if (normalized.length === 3) {
        setRecentCards(normalized);
      }
    } catch {
      // Keep fallback display.
    }
  };

  useEffect(() => {
    const saved = loadSavedDailyFortuneForToday();
    if (!saved) return;
    applySavedResult(saved);
  }, []);

  useEffect(() => {
    void fetchRecentCards();
  }, []);

  useEffect(() => {
    if (flipFinished && selectedCard) {
      setShowResult(true);
    }
  }, [flipFinished, selectedCard]);

  useEffect(() => {
    return () => {
      if (flipTimerRef.current !== null) {
        window.clearTimeout(flipTimerRef.current);
      }
      if (prayerCard?.imageUrl) {
        URL.revokeObjectURL(prayerCard.imageUrl);
      }
    };
  }, [prayerCard]);

  const resetState = () => {
    if (hasTodayResult) {
      const saved = loadSavedDailyFortuneForToday();
      if (saved) {
        applySavedResult(saved);
        return;
      }
    }

    requestIdRef.current += 1;
    flipLockRef.current = false;
    if (flipTimerRef.current !== null) {
      window.clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
    setReadyToFlip(false);
    setSelectedCard(null);
    setIsFlipped(false);
    setFlipFinished(false);
    setSummary(null);
    setFullText(null);
    setShowResult(false);
    setIsReading(false);
    setError(null);
    setHasTodayResult(false);
  };

  const handleRedrawToday = () => {
    clearCookieValue(DAILY_FORTUNE_COOKIE_NAME);
    requestIdRef.current += 1;
    flipLockRef.current = false;
    if (flipTimerRef.current !== null) {
      window.clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
    setReadyToFlip(true);
    setSelectedCard(null);
    setIsFlipped(false);
    setFlipFinished(false);
    setSummary(null);
    setFullText(null);
    setShowResult(false);
    setIsReading(false);
    setError(null);
    setHasTodayResult(false);
  };

  const handlePrepare = () => {
    if (hasTodayResult) {
      const saved = loadSavedDailyFortuneForToday();
      if (saved) {
        applySavedResult(saved);
      }
      return;
    }

    requestIdRef.current += 1;
    flipLockRef.current = false;
    if (flipTimerRef.current !== null) {
      window.clearTimeout(flipTimerRef.current);
      flipTimerRef.current = null;
    }
    setReadyToFlip(true);
    setSelectedCard(null);
    setIsFlipped(false);
    setFlipFinished(false);
    setSummary(null);
    setFullText(null);
    setShowResult(false);
    setIsReading(false);
    setError(null);
  };

  const handleFlip = async () => {
    if (!readyToFlip || isFlipped || flipLockRef.current || hasTodayResult) return;

    const existing = loadSavedDailyFortuneForToday();
    if (existing) {
      applySavedResult(existing);
      return;
    }

    flipLockRef.current = true;

    const requestId = ++requestIdRef.current;
    const { card: baseCard, isReversed } = getRandomTarotCard();
    const card: DrawnCard = {
      ...baseCard,
      reversed: isReversed,
    };

    setSelectedCard(card);
    setIsFlipped(true);
    setFlipFinished(false);
    setShowResult(false);
    setSummary(card.meaningJa);
    setFullText(null);
    setError(null);
    setIsReading(true);

    const flipDelay = prefersReducedMotion ? 0 : 520;
    flipTimerRef.current = window.setTimeout(() => {
      if (requestIdRef.current !== requestId) return;
      setFlipFinished(true);
      flipTimerRef.current = null;
    }, flipDelay);

    const profile = loadProfileForDailyFortune();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${today}の毎日の占いを、1枚引きの結果で読み解いてください。`,
          mode: "daily-fortune",
          profile,
          cards: [{ name: card.nameJa, reversed: card.reversed }],
        }),
      });

      const data = (await res.json()) as DailyFortuneResponse;
      if (!res.ok) {
        throw new Error(data.error ?? "占い結果の取得に失敗しました。");
      }
      if (requestIdRef.current !== requestId) return;
      const resolvedText = data.text
        ? sanitizeFortuneText(normalizeOrientationMentions(data.text, card))
        : null;
      const finalText =
        resolvedText && !isDailyFortuneTransportErrorText(resolvedText)
          ? resolvedText
          : sanitizeFortuneText(normalizeOrientationMentions(buildFallbackDailyFortune(card, profile), card));
      setFullText(finalText);

      if (finalText) {
        const topWhisper = extractTopWhisper(finalText, card.meaningJa);
        const payload: DailyFortuneCookiePayload = {
          dateKey: getJstDateKey(),
          result: {
            cardId: card.id,
            reversed: card.reversed,
            summary: card.meaningJa,
            fullText: finalText,
          },
        };
        setCookieValue(
          DAILY_FORTUNE_COOKIE_NAME,
          encodeCookiePayload(payload),
          DAILY_FORTUNE_COOKIE_MAX_AGE_SECONDS
        );
        try {
          await fetch("/api/daily-fortune-whisper", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save",
              profile: { nickname: profile.nickname },
              payload: {
                dateKey: getJstDateKey(),
                message: topWhisper,
              },
            }),
          });
        } catch {
          // Do not block daily result when whisper save fails.
        }
        setHasTodayResult(true);
        void fetchRecentCards();
      }
    } catch (caughtError) {
      if (requestIdRef.current !== requestId) return;
      console.error("Daily fortune request failed; using fallback reading.", caughtError);
      const fallbackText = sanitizeFortuneText(
        normalizeOrientationMentions(buildFallbackDailyFortune(card, profile), card)
      );
      const payload: DailyFortuneCookiePayload = {
        dateKey: getJstDateKey(),
        result: {
          cardId: card.id,
          reversed: card.reversed,
          summary: card.meaningJa,
          fullText: fallbackText,
        },
      };
      setFullText(fallbackText);
      setError(null);
      setCookieValue(
        DAILY_FORTUNE_COOKIE_NAME,
        encodeCookiePayload(payload),
        DAILY_FORTUNE_COOKIE_MAX_AGE_SECONDS
      );
      setHasTodayResult(true);
      void fetchRecentCards();
    } finally {
      if (requestIdRef.current === requestId) {
        flipLockRef.current = false;
      }
      if (requestIdRef.current === requestId) {
        setIsReading(false);
      }
    }
  };

  const handleSaveTodayWord = async () => {
    if (!selectedCard || !fullText) return;

    const profile = loadProfileForDailyFortune();
    const nickname = profile.nickname?.trim();
    if (!nickname) {
      setSaveWordMessage("プロフィール登録後に保存できます。");
      return;
    }

    setIsSavingWord(true);
    setSaveWordMessage(null);
    const moderation = runClientModerationCheck(fullText, getOrCreateChatVisitorKey(), {
      maxLength: 500,
    });
    if (!moderation.ok) {
      setSaveWordMessage(moderation.error);
      setIsSavingWord(false);
      return;
    }

    try {
      const res = await fetch("/api/light-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          profile: { nickname },
          payload: {
            dateKey: getJstDateKey(),
            cardName: selectedCard.nameJa,
            message: moderation.normalizedText,
          },
        }),
      });
      const data = (await res.json()) as SaveWordResponse;
      if (!res.ok || !data.record?.id) {
        throw new Error(data.error ?? "保存に失敗しました。");
      }
      setSaveWordMessage("今日の言葉を保存しました。");
    } catch (err) {
      setSaveWordMessage(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setIsSavingWord(false);
    }
  };

  const handleCreateBookmark = () => {
    const message = extractBookmarkMessage(fullText ?? "", summary ?? "");
    if (!message) {
      setBookmarkStatus("しおりに入れる言葉が見つかりませんでした。");
      return;
    }
    setBookmarkShare({
      text: message,
      dateLabel: today,
    });
    setBookmarkStatus("光のしおりを整えました。");
  };

  const handleSaveBookmarkImage = async () => {
    if (!sharePreview?.text || !bookmarkCardRef.current) {
      setBookmarkStatus("共有用画像の生成に失敗しました。");
      return;
    }
    setIsRenderingBookmark(true);
    setBookmarkStatus(null);
    try {
      const htmlToImage = await import("html-to-image");
      const dataUrl = await htmlToImage.toPng(bookmarkCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#f8f3e8",
      });
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = `lumina-daily-share-${getJstDateKey()}.png`;
      anchor.click();
      setBookmarkStatus("画像として保存しました。");
    } catch {
      setBookmarkStatus("画像生成に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsRenderingBookmark(false);
    }
  };

  const handleShareOnX = () => {
    if (!sharePreview?.text) {
      setBookmarkStatus("共有する導きがまだ整っていません。");
      return;
    }
    const shareText = `今日のルミナの導き\n\n「${sharePreview.text}」\n\n#LUMINA\n#今日の占い`;
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/daily-fortune` : "/daily-fortune";
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
    setBookmarkStatus("Xの共有画面を開きました。");
  };

  const handleCreatePrayerCard = async () => {
    const sourceText = (fullText ?? "").trim();
    const fallback = (summary ?? "").trim();
    if (!sourceText && !fallback) {
      setPrayerCardStatus("祈り札に入れる言葉が見つかりませんでした。");
      return;
    }

    const themeText = extractTopWhisper(sourceText || fallback, fallback || "今日の導き");
    const closingText = extractClosingGuidanceLine(sourceText || fallback, fallback || "明日に委ねて。");
    setIsGeneratingPrayerCard(true);
    setPrayerCardStatus(null);
    try {
      const response = await fetch("/api/share-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateLabel: today,
          themeText,
          closingText,
          bodyText: sourceText || fallback,
          hashtags: PRAYER_CARD_HASHTAGS,
        }),
      });
      if (!response.ok) {
        throw new Error("祈り札の生成に失敗しました。");
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPrayerCard((previous) => {
        if (previous?.imageUrl) {
          URL.revokeObjectURL(previous.imageUrl);
        }
        return {
          imageUrl: objectUrl,
          themeText,
          closingText,
          hashtags: PRAYER_CARD_HASHTAGS,
          dateLabel: today,
        };
      });
      setPrayerCardStatus("祈り札を整えました。");
    } catch (err) {
      setPrayerCardStatus(err instanceof Error ? err.message : "祈り札の生成に失敗しました。");
    } finally {
      setIsGeneratingPrayerCard(false);
    }
  };

  const handleSavePrayerCard = () => {
    if (!prayerCard?.imageUrl) {
      setPrayerCardStatus("先に「祈り札を作る」を押してください。");
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = prayerCard.imageUrl;
    anchor.download = `lumina-prayer-card-${getJstDateKey()}.png`;
    anchor.click();
    setPrayerCardStatus("祈り札を保存しました。");
  };

  const handleSharePrayerCard = async () => {
    if (!prayerCard) {
      setPrayerCardStatus("先に「祈り札を作る」を押してください。");
      return;
    }
    const shareText = `${prayerCard.themeText}\n${prayerCard.closingText}\n${prayerCard.hashtags}`;
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/daily-fortune` : "/daily-fortune";

    setIsSharingPrayerCard(true);
    try {
      if (navigator.share) {
        const blob = await fetch(prayerCard.imageUrl).then((res) => res.blob());
        const file = new File([blob], `lumina-prayer-card-${getJstDateKey()}.png`, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: "白の庭の祈り",
            text: shareText,
            files: [file],
          });
          setPrayerCardStatus("共有ダイアログを開きました。");
          return;
        }
      }
      const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(intentUrl, "_blank", "noopener,noreferrer");
      setPrayerCardStatus("共有用リンクを開きました。");
    } catch {
      setPrayerCardStatus("共有に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSharingPrayerCard(false);
    }
  };

  const handleCreateBookmarkBundle = async () => {
    await handleSaveTodayWord();
    handleCreateBookmark();
  };

  void handleSaveBookmarkImage;
  void handleShareOnX;
  void handleCreateBookmarkBundle;
  void handleSavePrayerCard;
  void handleSharePrayerCard;

  return (
    <PageShell
      maxWidth="narrow"
      title="毎日の占い"
      description={`${today}の運勢を、タロット1枚引きで見ます。`}
      backHref="/"
      backLabel="トップへ戻る"
    >
      <GlassCard>
        <p className="lumina-muted mt-1 text-sm">
          {today}の運勢を、タロット1枚引きで見ます。
        </p>
        {hasTodayResult ? (
          <p className="mt-2 text-sm text-slate-700/80">
            本日の結果は表示済みです。次回はJST 0:00以降に更新されます。
          </p>
        ) : null}

        {!readyToFlip ? (
          <div className="mt-6">
            <LuminaButton type="button" onClick={handlePrepare} tone="primary">
              {hasTodayResult ? "今日の結果を見る" : "今日の占いを引く"}
            </LuminaButton>
          </div>
        ) : (
          <section className="mt-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-[#6f6556]">
                {hasTodayResult
                  ? "すでに今日の結果を表示しています。"
                  : "カードをタップして、今日の1枚をめくってください。"}
              </p>

              <button
                type="button"
                onClick={handleFlip}
                disabled={isFlipped}
                aria-label={isFlipped ? "カードは表示済みです" : "カードをめくる"}
                className="fortune-card-button group"
              >
                <span
                  className={`fortune-card-inner ${isFlipped ? "is-flipped" : ""}`}
                  aria-hidden="true"
                >
                  <span className="fortune-card-face fortune-card-back">
                    <TarotBackArtwork
                      className="fortune-card-back-media"
                      sizes="(max-width: 768px) 80vw, 320px"
                    />
                  </span>

                  <span className="fortune-card-face fortune-card-front">
                    {selectedCard ? (
                      <>
                        <span className="fortune-card-frame">
                          <TarotCardArtwork
                            imagePath={selectedCard.imagePath}
                            alt={selectedCard.nameJa}
                            isReversed={selectedCard.reversed}
                            className="h-full w-full rounded-xl object-cover"
                            sizes="(max-width: 768px) 80vw, 320px"
                          />
                          {/* 光のスイープ */}
                          <span className="fortune-light-sweep" aria-hidden="true" />
                          {/* 微細な粒子光 */}
                          <span className="fortune-particles" aria-hidden="true">
                            <span className="fortune-particle fortune-particle--1" />
                            <span className="fortune-particle fortune-particle--2" />
                            <span className="fortune-particle fortune-particle--3" />
                            <span className="fortune-particle fortune-particle--4" />
                            <span className="fortune-particle fortune-particle--5" />
                            <span className="fortune-particle fortune-particle--6" />
                          </span>
                        </span>
                        <span className="mt-3 text-sm font-semibold text-amber-950">
                          {selectedCard.nameJa}
                          {selectedCard.reversed ? "（逆位置）" : ""}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-amber-900/80">めくると表示されます</span>
                    )}
                  </span>
                </span>
              </button>

              {error && !hasDisplayReading ? <p className="text-sm text-red-700">{error}</p> : null}

              {isFlipped && !flipFinished ? (
                <p className="text-sm text-amber-800/80">カードを読み解いています…</p>
              ) : null}
              {flipFinished && isReading && !showResult ? (
                <p className="text-sm text-[#6f6556]">今日のメッセージを整えています…</p>
              ) : null}
            </div>

            <div className={`fortune-result ${showResult ? "is-visible" : ""}`}>
              {selectedCard ? (
                <section className="mt-6 rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(160deg,rgba(255,252,246,0.88),rgba(248,242,231,0.82))] p-4 shadow-[0_12px_24px_-20px_rgba(82,69,53,0.22)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-xl border border-[#d8c8ab]/72 bg-gradient-to-b from-[#fff8ec] to-[#f6ebda] text-2xl shadow-sm">
                      <LightTarotDisplay
                        imagePath={selectedCard.imagePath}
                        alt={selectedCard.nameJa}
                        isReversed={selectedCard.reversed}
                        className="h-full w-full rounded-xl"
                        artworkClassName="h-full w-full rounded-xl object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-medium text-[#2e2a26]">
                        {selectedCard.nameJa}
                        {selectedCard.reversed ? "（逆位置）" : ""}
                      </h2>
                      {summary ? (
                        <div className="mt-2 rounded-lg border border-[#e6dac5]/80 bg-white/60 p-2">
                          <p className="text-[11px] font-medium tracking-wide text-[#7d6d5a]">
                            {isReading ? "読み解き中..." : ""}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-[#544c42]">{summary}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {error && !hasDisplayReading ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  ) : null}

                  {isReading ? (
                    <div className="mt-4 rounded-xl border border-[#e1d5bf]/75 bg-white/80 p-4">
                      <div className="flex items-center gap-3">
                        <span className="reading-spinner" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-medium text-[#2e2a26]">リーディング中…</p>
                          <p className="text-xs text-[#544c42]">
                            カードのメッセージを言葉にしています…
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {fortuneSections.intro ? (
                    <div className="mt-4 rounded-xl border border-[#e6dac5]/80 bg-white/60 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#544c42]">{fortuneSections.intro}</p>
                    </div>
                  ) : null}
                  {detailSections.map((section) => (
                    <div key={section.heading} className="mt-4 rounded-xl border border-[#e6dac5]/80 bg-white/60 p-4">
                      <p className="mb-2 text-xs font-medium tracking-wide text-[#7d6d5a]">{section.heading}</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#544c42]">{section.text}</p>
                    </div>
                  ))}
                  {false && fullText ? (
                    <div className="mt-4 rounded-xl border border-[#e6dac5]/80 bg-white/60 p-3">
                      <p className="mb-2 text-xs font-medium tracking-wide text-[#7d6d5a]">
                        リーディング全文
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#544c42]">{fullText}</p>
                    </div>
                  ) : null}
                  {false && fullText ? (
                    <section className="mt-4 rounded-2xl border border-[#d9ccb3]/80 bg-[linear-gradient(160deg,rgba(255,251,245,0.94),rgba(246,237,223,0.9))] p-4 shadow-[0_14px_24px_-20px_rgba(96,80,60,0.22)] sm:p-5">
                      <p className="text-xs tracking-[0.18em] text-[#8a7a64]">館の奥の灯り</p>
                      <div className="mt-2 space-y-3 text-sm leading-relaxed text-[#544c42]">
                        <p className="whitespace-pre-line">
                          {"今日のカードは\nあなたの流れの一片を\nそっと映したものです。"}
                        </p>
                        <p className="whitespace-pre-line">
                          {"もし今\n「もう少し深く見てほしい」\nと感じているなら"}
                        </p>
                        <p>ルミナが静かに読み解きます。</p>
                      </div>
                      <LuminaLinkButton
                        href="/consultation"
                        tone="secondary"
                        className="mt-4 w-full justify-center rounded-xl px-6 py-3 text-base sm:w-auto"
                      >
                        個人鑑定を依頼する
                      </LuminaLinkButton>
                    </section>
                  ) : null}
                  {fortuneSections.todayHitokoto ? (
                    <section className="mt-4 rounded-2xl border border-[#d9ccb3]/80 bg-[linear-gradient(160deg,rgba(255,251,245,0.94),rgba(246,237,223,0.9))] p-4 shadow-[0_14px_24px_-20px_rgba(96,80,60,0.22)] sm:p-5">
                      <p className="text-xs tracking-[0.18em] text-[#8a7a64]">今日のひとこと</p>
                      <div className="mt-2 text-sm leading-relaxed text-[#544c42]">
                        <p className="whitespace-pre-line">{fortuneSections.todayHitokoto}</p>
                      </div>
                      <LuminaLinkButton
                        href="/consultation"
                        tone="primary"
                        className="mt-4 w-full justify-center rounded-xl px-6 py-3 text-base sm:mx-auto sm:w-auto"
                      >
                        個人鑑定を依頼する
                      </LuminaLinkButton>
                    </section>
                  ) : null}
                  {fortuneSections.whiteHitokoto ? (
                    <section className="mt-4 rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(160deg,rgba(255,252,246,0.9),rgba(248,242,231,0.84))] p-4 shadow-[0_14px_24px_-20px_rgba(82,69,53,0.2)] sm:p-5">
                      <p className="text-xs tracking-[0.14em] text-[#8a7a64]">HAKU</p>
                      <h3 className="mt-1 text-base font-medium text-[#2e2a26]">白のひとこと</h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#544c42]">{fortuneSections.whiteHitokoto}</p>
                    </section>
                  ) : null}
                  {false && fortuneSections.todayHitokoto ? (
                    <section className="mt-4 rounded-2xl border border-[#d9ccb3]/80 bg-[linear-gradient(160deg,rgba(255,251,245,0.94),rgba(246,237,223,0.9))] p-4 shadow-[0_14px_24px_-20px_rgba(96,80,60,0.22)] sm:p-5">
                      <p className="text-xs tracking-[0.18em] text-[#8a7a64]">今日のひとこと</p>
                      <div className="mt-2 text-sm leading-relaxed text-[#544c42]">
                        <p className="whitespace-pre-line">
                          {"今日の言葉が、\nあなたの歩みに小さな光を灯しますように。"}
                        </p>
                      </div>
                      <LuminaLinkButton
                        href="/consultation"
                        tone="primary"
                        className="mt-4 w-full justify-center rounded-xl px-6 py-3 text-base sm:mx-auto sm:w-auto"
                      >
                        個人鑑定を依頼する
                      </LuminaLinkButton>
                    </section>
                  ) : null}
                  {false && hakuMessage ? <div /> : null}
                </section>
              ) : null}
            </div>
            {showResult ? (
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <section className="rounded-2xl border border-[#d7c6aa]/80 bg-[linear-gradient(165deg,rgba(255,250,242,0.92),rgba(246,236,220,0.88))] p-4 shadow-[0_14px_24px_-20px_rgba(82,69,53,0.28)]">
                <p className="text-xs tracking-[0.14em] text-[#8a7a64]">MAIN ACTION</p>
                <h3 className="mt-1 text-base font-medium text-[#2e2a26]">再確認のカード</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#544c42]">
                  今日の導きをもう一度たしかめたい時に、流れを静かに引き直せます。
                </p>
                {hasTodayResult ? (
                  <LuminaButton type="button" onClick={handleRedrawToday} tone="primary" className="mt-4 w-full justify-center rounded-xl px-6 py-3 text-base">
                    再確認のカードを引く
                  </LuminaButton>
                ) : (
                  <LuminaButton type="button" onClick={resetState} tone="primary" className="mt-4 w-full justify-center rounded-xl px-6 py-3 text-base">
                    もう一度、今日の占いを見る
                  </LuminaButton>
                )}
              </section>
                {(fullText || summary) && sharePreview ? (
                  <section className="rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(160deg,rgba(255,252,246,0.9),rgba(248,242,231,0.84))] p-4 shadow-[0_14px_24px_-20px_rgba(82,69,53,0.2)]">
                    <p className="text-xs tracking-[0.14em] text-[#8a7a64]">SHARE</p>
                    <h3 className="mt-1 text-base font-medium text-[#2e2a26]">今日の導きをシェア</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#544c42]">
                      今日のテーマを静かな一枚として残したり、Xへそのまま届けたりできます。
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <LuminaButton
                        type="button"
                        onClick={handleShareOnX}
                        tone="secondary"
                        className="w-full justify-center rounded-xl px-5 py-3 sm:flex-1"
                      >
                        Xでシェア
                      </LuminaButton>
                      <LuminaButton
                        type="button"
                        onClick={handleSaveBookmarkImage}
                        tone="secondary"
                        disabled={isRenderingBookmark}
                        className="w-full justify-center rounded-xl px-5 py-3 sm:flex-1"
                      >
                        {isRenderingBookmark ? "保存しています..." : "画像として保存"}
                      </LuminaButton>
                    </div>
                    {bookmarkStatus ? <p className="mt-3 text-sm text-[#544c42]">{bookmarkStatus}</p> : null}
                    <div className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden="true">
                      <div
                        ref={bookmarkCardRef}
                        className="w-[1080px] rounded-[36px] border border-[#d9ccb3]/80 bg-[linear-gradient(158deg,rgba(255,252,246,0.98),rgba(247,240,228,0.94))] px-14 py-14 shadow-[0_24px_48px_-28px_rgba(96,80,60,0.22)]"
                      >
                        <div className="flex items-center gap-12">
                          {selectedCard ? (
                            <div className="w-[280px] shrink-0 text-center">
                              {/* html-to-image 用の共有カードでは素の img の方が安定して描画される */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={selectedCard.imagePath}
                                alt={selectedCard.nameJa}
                                className="mx-auto h-auto w-full rounded-[24px] border border-[#d9ccb3]/80 shadow-[0_18px_30px_-24px_rgba(96,80,60,0.28)]"
                              />
                              <p className="mt-5 text-[30px] font-medium text-[#4b4339]">
                                {selectedCard.nameJa}
                                {selectedCard.reversed ? "（逆位置）" : "（正位置）"}
                              </p>
                            </div>
                          ) : null}

                          <div className="flex-1 text-center">
                            <p className="text-[26px] tracking-[0.24em] text-[#766e62]">今日のルミナの導き</p>
                            <p className="mt-5 text-[42px] text-[#7d6d5a]">{sharePreview.dateLabel}</p>
                            <p className="mt-12 text-[58px] leading-[1.5] text-[#544c42]">「{sharePreview.text}」</p>
                            <p className="mt-12 text-[24px] tracking-[0.18em] text-[#8a7a64]">#LUMINA #今日の占い</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>
            ) : null}

            {false && (
              <>
            <div className="mt-6 flex flex-wrap gap-3">
              <LuminaButton
                type="button"
                onClick={handleSaveTodayWord}
                tone="secondary"
                disabled={!selectedCard || !fullText || isSavingWord}
              >
                今日の言葉を保存
              </LuminaButton>
              {hasTodayResult ? (
                <LuminaButton type="button" onClick={handleRedrawToday} tone="primary">
                  再確認のカードを引く
                </LuminaButton>
              ) : (
                <LuminaButton type="button" onClick={resetState} tone="primary">
                  もう一度占う
                </LuminaButton>
              )}
            </div>
            {saveWordMessage ? (
              <p className="mt-2 text-sm text-[#544c42]">{saveWordMessage}</p>
            ) : null}
              </>
            )}

            {false && showResult && (fullText || summary) ? (
              <section className="mt-6 rounded-2xl border border-[#e1d5bf]/75 bg-white/55 p-4">
                <h3 className="text-base font-medium text-[#2e2a26]">光のしおり</h3>
                <p className="mt-1 text-sm text-[#544c42]">
                  今日の言葉を、やさしいしおりに整えて保存できます。
                </p>

                <div className="mt-3 flex flex-wrap gap-3">
                  <LuminaButton type="button" onClick={handleCreateBookmark} tone="secondary">
                    🌙 光のしおりを作る
                  </LuminaButton>
                  <LuminaButton
                    type="button"
                    onClick={handleSaveBookmarkImage}
                    tone="secondary"
                    disabled={!bookmarkShare || isRenderingBookmark}
                  >
                    画像として保存
                  </LuminaButton>
                  <LuminaButton
                    type="button"
                    onClick={handleShareOnX}
                    tone="secondary"
                    disabled={!bookmarkShare}
                  >
                    Xで共有
                  </LuminaButton>
                </div>

                {bookmarkStatus ? (
                  <p className="mt-2 text-sm text-[#544c42]">{bookmarkStatus}</p>
                ) : null}

                {bookmarkShare ? (
                  <div className="mt-4 flex justify-center">
                    <div
                      ref={bookmarkCardRef}
                      className="w-full max-w-[520px] rounded-2xl border border-[#d9ccb3]/80 bg-[linear-gradient(158deg,rgba(255,252,246,0.96),rgba(247,240,228,0.9))] px-6 py-7 text-center shadow-[0_12px_24px_-20px_rgba(96,80,60,0.22)]"
                    >
                      <p className="text-xs tracking-[0.24em] text-[#766e62]">LUMINA</p>
                      <p className="mt-2 text-sm text-[#7d6d5a]">{bookmarkShare?.dateLabel}</p>
                      <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-[#544c42]">
                        {bookmarkShare?.text}
                      </p>
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            {false && showResult && (fullText || summary) ? (
              <section className="mt-6 rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(160deg,rgba(255,252,246,0.88),rgba(248,242,231,0.82))] p-4">
                <h3 className="text-base font-medium text-[#2e2a26]">白の庭の祈り札</h3>
                <p className="mt-1 text-sm text-[#544c42]">
                  今日の導きを、シェア用の祈り札（1080×1350 PNG）として整えます。
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <LuminaButton type="button" onClick={handleCreatePrayerCard} tone="secondary" disabled={isGeneratingPrayerCard}>
                    {isGeneratingPrayerCard ? "生成中..." : "祈り札を作る"}
                  </LuminaButton>
                  <LuminaButton type="button" onClick={handleSavePrayerCard} tone="secondary" disabled={!prayerCard}>
                    保存
                  </LuminaButton>
                  <LuminaButton type="button" onClick={handleSharePrayerCard} tone="secondary" disabled={!prayerCard || isSharingPrayerCard}>
                    {isSharingPrayerCard ? "共有中..." : "共有"}
                  </LuminaButton>
                </div>
                <p className="mt-2 text-xs text-[#6f6556]">{PRAYER_CARD_HASHTAGS}</p>
                {prayerCardStatus ? <p className="mt-2 text-sm text-[#544c42]">{prayerCardStatus}</p> : null}

                {prayerCard ? (
                  <div className="mt-4 flex justify-center">
                    <div className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-[#d9ccb3]/80 bg-white/70 shadow-[0_12px_24px_-20px_rgba(96,80,60,0.22)]">
                      <Image
                        src={prayerCard?.imageUrl ?? ""}
                        alt="白の庭の祈り札プレビュー"
                        width={1080}
                        height={1350}
                        unoptimized
                        className="h-auto w-full"
                      />
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}
          </section>
        )}
      </GlassCard>

      <GlassCard className="mt-4 recent-guidance-card">
        <h2 className="text-base font-medium text-[#2e2a26]">最近のカード履歴</h2>
        <h2 className="text-base font-medium text-[#2e2a26]">最近の導き</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {recentCards.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#e1d5bf]/75 bg-white/55 px-3 py-2"
            >
              <p className="text-xs tracking-wide text-[#7d6d5a]">{item.label}</p>
              <p className="mt-1 text-sm text-[#2e2a26]">{item.cardName ?? "—"}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <style jsx>{`
        .fortune-card-button {
          width: min(100%, 18rem);
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          perspective: 1200px;
        }

        .recent-guidance-card > h2:first-of-type {
          display: none;
        }

        .fortune-card-button:disabled {
          cursor: default;
        }

        .fortune-card-button:focus-visible {
          outline: 3px solid #b45309;
          outline-offset: 6px;
          border-radius: 1.5rem;
        }

        .fortune-card-inner {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 2.5 / 4;
          transform-style: preserve-3d;
          transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fortune-card-inner.is-flipped {
          transform: rotateY(180deg);
        }

        .fortune-card-face {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 1.25rem;
          border: 1px solid rgba(251, 191, 36, 0.35);
          box-shadow:
            0 16px 28px -18px rgba(120, 53, 15, 0.45),
            0 8px 16px -12px rgba(0, 0, 0, 0.3);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .fortune-card-back {
          overflow: hidden;
          background: #f8f3e8;
        }

        .fortune-card-back-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .fortune-card-front {
          padding: 0.9rem;
          transform: rotateY(180deg);
          background:
            linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 247, 237, 0.94)),
            linear-gradient(140deg, rgba(254, 243, 199, 0.3), rgba(251, 207, 232, 0.25));
          color: #451a03;
        }

        .fortune-card-frame {
          position: relative;
          display: flex;
          width: 100%;
          flex: 1;
          min-height: 0;
          align-items: center;
          justify-content: center;
          border-radius: 0.85rem;
          border: 1px solid rgba(217, 119, 6, 0.2);
          overflow: hidden;
          background:
            radial-gradient(circle at 30% 25%, rgba(251, 191, 36, 0.28), transparent 45%),
            radial-gradient(circle at 75% 20%, rgba(251, 113, 133, 0.22), transparent 48%),
            linear-gradient(180deg, #fffdf8 0%, #fff7ed 100%);
        }

        /* — 外周のやわらかいオーラ — */
        .is-flipped .fortune-card-frame {
          box-shadow:
            0 0 18px 4px rgba(255, 248, 220, 0.35),
            0 0 40px 8px rgba(244, 226, 180, 0.15),
            0 0 60px 12px rgba(230, 220, 255, 0.08);
          animation: fortuneGlowPulse 3s ease-in-out 0.6s 1 both;
        }

        @keyframes fortuneGlowPulse {
          0% {
            box-shadow:
              0 0 18px 4px rgba(255, 248, 220, 0),
              0 0 40px 8px rgba(244, 226, 180, 0),
              0 0 60px 12px rgba(230, 220, 255, 0);
          }
          30% {
            box-shadow:
              0 0 22px 6px rgba(255, 248, 220, 0.4),
              0 0 48px 10px rgba(244, 226, 180, 0.2),
              0 0 68px 14px rgba(230, 220, 255, 0.1);
          }
          100% {
            box-shadow:
              0 0 14px 3px rgba(255, 248, 220, 0.18),
              0 0 32px 6px rgba(244, 226, 180, 0.08),
              0 0 48px 8px rgba(230, 220, 255, 0.04);
          }
        }

        /* — 斜めスイープ光 — */
        .fortune-light-sweep {
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          pointer-events: none;
          opacity: 0;
          background: linear-gradient(
            115deg,
            transparent 20%,
            rgba(255, 255, 255, 0.08) 35%,
            rgba(255, 252, 235, 0.38) 45%,
            rgba(255, 248, 220, 0.5) 50%,
            rgba(255, 252, 235, 0.38) 55%,
            rgba(255, 255, 255, 0.08) 65%,
            transparent 80%
          );
          background-size: 200% 100%;
        }

        .is-flipped .fortune-light-sweep {
          animation: fortuneSweep 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.65s 1 both;
        }

        @keyframes fortuneSweep {
          0% {
            opacity: 0;
            background-position: 120% 0;
          }
          10% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            background-position: -40% 0;
          }
        }

        /* — 微細な粒子光 — */
        .fortune-particles {
          position: absolute;
          inset: -8px;
          pointer-events: none;
        }

        .fortune-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          opacity: 0;
          background: radial-gradient(circle, rgba(255, 250, 230, 0.95), rgba(255, 248, 210, 0.4));
          box-shadow: 0 0 4px 1px rgba(255, 248, 220, 0.4);
        }

        .is-flipped .fortune-particle {
          animation: fortuneParticle 1.6s ease-out both;
        }

        .fortune-particle--1 {
          top: 12%;
          left: 8%;
          width: 3px;
          height: 3px;
          background: radial-gradient(circle, rgba(255, 252, 240, 0.9), rgba(255, 248, 210, 0.3));
        }
        .is-flipped .fortune-particle--1 { animation-delay: 0.7s; }

        .fortune-particle--2 {
          top: 6%;
          right: 15%;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(240, 232, 255, 0.9), rgba(220, 210, 255, 0.3));
          box-shadow: 0 0 5px 1px rgba(230, 220, 255, 0.35);
        }
        .is-flipped .fortune-particle--2 { animation-delay: 0.9s; }

        .fortune-particle--3 {
          bottom: 18%;
          right: 5%;
          width: 3px;
          height: 3px;
        }
        .is-flipped .fortune-particle--3 { animation-delay: 1.1s; }

        .fortune-particle--4 {
          bottom: 8%;
          left: 12%;
          width: 3.5px;
          height: 3.5px;
          background: radial-gradient(circle, rgba(255, 245, 200, 0.9), rgba(248, 232, 180, 0.3));
          box-shadow: 0 0 4px 1px rgba(248, 235, 190, 0.35);
        }
        .is-flipped .fortune-particle--4 { animation-delay: 0.85s; }

        .fortune-particle--5 {
          top: 40%;
          left: -4px;
          width: 3px;
          height: 3px;
          background: radial-gradient(circle, rgba(240, 232, 255, 0.85), rgba(225, 215, 255, 0.25));
          box-shadow: 0 0 4px 1px rgba(230, 220, 255, 0.3);
        }
        .is-flipped .fortune-particle--5 { animation-delay: 1.0s; }

        .fortune-particle--6 {
          top: 25%;
          right: -3px;
          width: 2.5px;
          height: 2.5px;
        }
        .is-flipped .fortune-particle--6 { animation-delay: 1.2s; }

        @keyframes fortuneParticle {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(4px);
          }
          25% {
            opacity: 0.85;
            transform: scale(1) translateY(0);
          }
          60% {
            opacity: 0.5;
            transform: scale(0.8) translateY(-6px);
          }
          100% {
            opacity: 0;
            transform: scale(0.4) translateY(-12px);
          }
        }

        .fortune-card-placeholder {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80%;
          height: 80%;
          border-radius: 0.9rem;
          border: 1px dashed rgba(180, 83, 9, 0.25);
          color: rgba(180, 83, 9, 0.7);
          font-size: 2rem;
          background: rgba(255, 255, 255, 0.5);
        }

        .tarot-image-fallback {
          position: relative;
          display: flex;
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 0.75rem;
          border: 1px dashed rgba(180, 83, 9, 0.28);
          background:
            radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.22), transparent 48%),
            radial-gradient(circle at 80% 25%, rgba(251, 113, 133, 0.16), transparent 55%),
            linear-gradient(160deg, rgba(31, 41, 55, 0.92), rgba(17, 24, 39, 0.96));
          color: #fef3c7;
          text-align: center;
          padding: 0.5rem;
        }

        .tarot-image-fallback__mark {
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          opacity: 0.9;
          font-weight: 700;
        }

        .tarot-image-fallback__name {
          position: absolute;
          inset-inline: 0.35rem;
          bottom: 0.45rem;
          font-size: 0.6rem;
          line-height: 1.2;
          color: rgba(255, 251, 235, 0.85);
        }

        .tarot-image-fallback__ornament {
          width: 56%;
          height: 56%;
          border-radius: 999px;
          border: 1px solid rgba(255, 251, 235, 0.55);
          box-shadow:
            0 0 0 10px rgba(196, 161, 92, 0.14),
            0 0 0 20px rgba(196, 161, 92, 0.08);
        }

        .fortune-result {
          opacity: 0;
          transform: translateY(8px);
          transition:
            opacity 360ms ease,
            transform 360ms ease;
          pointer-events: none;
        }

        .fortune-result.is-visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .reading-spinner {
          width: 1rem;
          height: 1rem;
          border-radius: 999px;
          border: 2px solid rgba(217, 119, 6, 0.25);
          border-top-color: rgba(217, 119, 6, 0.9);
          animation: spin 0.9s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fortune-card-inner,
          .fortune-result {
            transition-duration: 1ms !important;
          }

          .reading-spinner {
            animation-duration: 0.01ms;
            animation-iteration-count: 1;
          }

          .fortune-light-sweep,
          .fortune-particle {
            animation: none !important;
            opacity: 0 !important;
          }

          .is-flipped .fortune-card-frame {
            animation: none !important;
            box-shadow:
              0 0 14px 3px rgba(255, 248, 220, 0.18),
              0 0 32px 6px rgba(244, 226, 180, 0.08);
          }
        }
      `}</style>
    </PageShell>
  );
}
