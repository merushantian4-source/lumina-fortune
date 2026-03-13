"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { SpecialOccasionCard } from "@/components/special-occasion-card";
import { BRAND } from "@/lib/brand";
import { getInitialBirthdate } from "@/lib/profile/getProfile";
import { getSpecialOccasionEvent, type SpecialOccasionEvent } from "@/lib/special-occasions";
import {
  getJstDateKey,
  getVisitStreakForVisitor,
  makeVisitorKey,
  updateVisitStreakForVisitor,
  type VisitStreakRecord,
} from "@/lib/visit-streak";

const TAROT_HREF = "/?start=tarot";
const TarotContext = createContext<(() => void) | undefined>(undefined);

const PROFILE_STORAGE_KEY = "lumina_profile";
const DEFAULT_WHISPER_MESSAGE = `今日は「整えること」が鍵になる日。
小さな違和感を見逃さないことで、
次の選択が静かに見えてきます。`;

type NavigationCard = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  badge?: string;
};

type SectionGroup = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  items: NavigationCard[];
  backgroundImage?: string;
  backgroundOverlayClassName?: string;
  sectionImage?: string;
};

const heroActions = [
  { label: "今日の運勢", href: "/daily-fortune", tone: "primary" as const },
  { label: "恋愛占い", href: "/uranai/kataomoi", tone: "secondary" as const },
  { label: "タロット占い", href: TAROT_HREF, tone: "secondary" as const },
];

const loveFortuneSection: SectionGroup = {
  id: "love-fortune",
  eyebrow: "Love",
  title: "恋愛占い",
  description: "恋の悩みに寄り添う5つの占い",
  items: [
    { title: "片思い占い", description: "恋の行方と進展のきっかけ", href: "/uranai/kataomoi", ctaLabel: "カードを引く" },
    { title: "あの人の気持ち占い", description: "相手の本音と今の距離感", href: "/uranai/kare-no-kimochi", ctaLabel: "カードを引く" },
    { title: "復縁占い", description: "復縁の可能性と流れ", href: "/uranai/fukuen", ctaLabel: "カードを引く" },
    { title: "相性占い", description: "二人の相性とアドバイス", href: "/compatibility", ctaLabel: "生年月日で占う" },
    { title: "結婚占い", description: "結婚の時期とご縁の流れ", href: "/marriage-timing", ctaLabel: "生年月日で占う" },
  ],
  sectionImage: "/gazou/tarot2.png",
};

const fortuneSection: SectionGroup = {
  id: "fortune-tarot",
  eyebrow: "Fortune",
  title: "運勢占い",
  description: "日々の流れを整える5つの占い",
  items: [
    { title: "毎日の運勢", description: "今日の流れとヒント", href: "/daily-fortune", ctaLabel: "生年月日で占う" },
    { title: "毎月の運勢", description: "今月のテーマと過ごし方", href: "/fortune-monthly", ctaLabel: "生年月日で占う" },
    { title: "2026年の運勢", description: "一年全体の流れ", href: "/fortune-2026", ctaLabel: "生年月日で占う" },
    { title: "光の暦カレンダー", description: "月の満ち欠けと開運日", href: "/calendar", ctaLabel: "カレンダーを見る" },
    { title: "基本性格", description: "生年月日から本質を読み解く", href: "/basic-personality", ctaLabel: "生年月日で占う" },
  ],
  sectionImage: "/gazou/unsei2.png",
};

const firstVisitSection: SectionGroup = {
  id: "first-visit",
  eyebrow: "Guide",
  title: "はじめての方へ",
  items: [
    { title: "初めての方へ", description: "", href: "/profile", ctaLabel: "プロフィールを登録" },
    { title: "ルミナについて", description: "", href: "/library/world", ctaLabel: "読む" },
    { title: "相性占い", description: "", href: "/compatibility", ctaLabel: "見る" },
  ],
};

const mansionSection: SectionGroup = {
  id: "mansion",
  eyebrow: "Mansion",
  title: "白の館をめぐる",
  description: "体験と実践のコーナー",
  items: [
    { title: "光のワーク", description: "日常を整える小さな実践", href: "/light-work", ctaLabel: "" },
    { title: "未来の手紙", description: "未来の自分へのメッセージ", href: "/future-letter", ctaLabel: "" },
    { title: "音の休息室", description: "心癒される音楽と瞑想の時間", href: "/healing", ctaLabel: "" },
    { title: "光の願いの庭", description: "小さな願いを残せる場所", href: "/wish-garden", ctaLabel: "" },
  ],
  backgroundImage: "/gazou/sasayaki.jpg",
  backgroundOverlayClassName: "bg-[linear-gradient(135deg,rgba(255,250,244,0.62),rgba(247,240,232,0.68))]",
};

const recordsSection: SectionGroup = {
  id: "records",
  eyebrow: "Records",
  title: "白の書庫",
  description: "読みものと待ち受け",
  backgroundImage: "/gazou/IMG_4219.webp",
  backgroundOverlayClassName: "bg-[linear-gradient(135deg,rgba(255,251,243,0.56),rgba(247,241,231,0.62))]",
  items: [
    { title: "白の庭の記録", description: "白の館とルミナについて", href: "/library/records", ctaLabel: "" },
    { title: "館の書棚（コラム）", description: "心を落ち着ける読み物", href: "/columns", ctaLabel: "" },
    { title: "光の待ち受け", description: "静かな光を受け取る待ち受け", href: "/lucky-wallpapers", ctaLabel: "" },
    { title: "月灯りの間", description: "限定動画を公開", href: "/library/limited-video", ctaLabel: "" },
  ],
};

const consultationSection: SectionGroup = {
  id: "consultation",
  eyebrow: "Consultation",
  title: "個人相談・手紙",
  items: [
    { title: "ルミナへの手紙", description: "今の気持ちを言葉にして届けます。", href: "/letter", ctaLabel: "" },
    { title: "個人鑑定のご依頼", description: "恋愛や仕事を個別に相談できます。", href: "/consultation", ctaLabel: "" },
  ],
  backgroundImage: "/gazou/tarot.png",
  backgroundOverlayClassName: "bg-[linear-gradient(135deg,rgba(255,250,244,0.62),rgba(247,240,232,0.68))]",
};

const socialLinks = [
  { name: "TikTok", href: "https://www.tiktok.com/@luminousmagic0?_r=1&_t=ZS-94P8u7q3O5g", ariaLabel: "TikTokを開く" },
  { name: "Instagram", href: "https://www.instagram.com/luminousmagic0?igsh=MXZqNmtkazllZHpqNg%3D%3D&utm_source=qr", ariaLabel: "Instagramを開く" },
  { name: "YouTube", href: "https://youtube.com/channel/UCgmijIrv50RWonl2XgO8fiA?si=k60PNOj1RXFB3wcG", ariaLabel: "YouTubeを開く" },
] as const;

type FeatherIconProps = {
  size?: "small" | "large";
  dimmed?: boolean;
  alt?: string;
};

function BridgeSocialIcon({ name }: { name: (typeof socialLinks)[number]["name"] }) {
  if (name === "TikTok") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M14.1 3c.4 1.8 1.4 2.9 3.3 3.1v2.4a6.7 6.7 0 0 1-3.1-.8v6.3c0 2.8-2.2 5-5.1 5A5 5 0 0 1 4 14c0-2.8 2.3-5 5.1-5 .3 0 .7 0 1 .1v2.5a2.7 2.7 0 0 0-1-.2c-1.5 0-2.6 1.1-2.6 2.6 0 1.4 1.1 2.6 2.6 2.6 1.4 0 2.6-1.1 2.6-2.6V3h2.4Z" />
      </svg>
    );
  }

  if (name === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <rect x="3" y="6.5" width="18" height="11" rx="3.2" />
      <polygon points="11,10 11,14 15,12" className="fill-[#fffdf8]" />
    </svg>
  );
}

function SmartLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  const onStartTarot = useContext(TarotContext);

  if (href === TAROT_HREF && onStartTarot) {
    return (
      <button type="button" onClick={onStartTarot} className={className}>
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function FeatherIcon({ size = "small", dimmed = false, alt = "" }: FeatherIconProps) {
  const wrapperClass = size === "large" ? "h-11 w-14" : "h-3 w-4";
  const imageClass = dimmed
    ? "object-contain opacity-[0.42] grayscale-[0.2] brightness-[1.04]"
    : "object-contain opacity-[0.8] brightness-[1.08] contrast-[1.1]";

  return (
    <span className={`relative block ${wrapperClass}`.trim()}>
      <Image
        src="/gazou/siroihane-removebg-preview.png"
        alt={alt}
        fill
        className={imageClass}
        sizes={size === "large" ? "56px" : "16px"}
        aria-hidden={alt ? undefined : true}
      />
    </span>
  );
}

function SectionHeader({ eyebrow, title, description }: Omit<SectionGroup, "id" | "items" | "backgroundImage" | "backgroundOverlayClassName">) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-[11px] tracking-[0.22em] text-[#8b7e6b] uppercase">{eyebrow}</p> : null}
        <h2 className="mt-1 text-2xl font-medium tracking-[0.04em] text-[#2f2a25] sm:text-[1.8rem]">{title}</h2>
      </div>
      {description ? <p className="max-w-xl text-sm leading-7 text-[#665d51] sm:text-right">{description}</p> : null}
    </div>
  );
}

function NavigationCardItem({ item, featured = false, compact = false }: { item: NavigationCard; featured?: boolean; compact?: boolean }) {
  return (
    <SmartLink
      href={item.href}
      className={`group flex h-full flex-col justify-between rounded-[1.35rem] border shadow-[0_14px_28px_-24px_rgba(82,69,53,0.24)] transition hover:-translate-y-0.5 hover:border-[#d2bd96] hover:bg-white/72 ${
        compact ? "min-h-0 px-4 py-2.5" : "min-h-[5.6rem] px-4 py-4 sm:min-h-[6rem]"
      } ${
        featured
          ? "border-[#d6c39d]/85 bg-[linear-gradient(160deg,rgba(255,252,246,0.7),rgba(245,236,219,0.62))]"
          : "border-[#e6dbc8]/85 bg-white/60"
      }`}
    >
      <div className={compact ? "flex items-center gap-3" : "flex flex-col"}>
        {!compact && item.badge ? <p className="mb-1.5 text-[11px] tracking-[0.16em] text-[#8d816f] uppercase">{item.badge}</p> : null}
        <h3 className={`font-medium leading-tight text-[#2e2a26] group-hover:text-[#5d513f] ${compact ? "text-sm" : "text-base sm:text-lg"}`}>{item.title}</h3>
        {compact ? (
          item.description ? <p className="text-[12px] leading-5 text-[#7a7063]">{item.description}</p> : null
        ) : (
          <p className="mt-1.5 text-[13px] leading-5 text-[#7a7063]">{item.description}</p>
        )}
        {compact ? (
          item.ctaLabel ? <p className="ml-auto shrink-0 text-[12px] font-medium tracking-[0.08em] text-[#b09a6f] group-hover:text-[#9a8455]">{item.ctaLabel} →</p> : null
        ) : null}
      </div>
      {compact ? null : (
        item.ctaLabel ? <p className="mt-3 text-[12px] font-medium tracking-[0.08em] text-[#b09a6f] group-hover:text-[#9a8455]">{item.ctaLabel} →</p> : null
      )}
    </SmartLink>
  );
}

function CardSection({ section, columns = "three", compact = false }: { section: SectionGroup; columns?: "two" | "three"; compact?: boolean }) {
  const gridClass =
    section.id === "love-fortune" || section.id === "fortune-tarot"
      ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      : section.id === "first-visit"
        ? "grid grid-cols-1 gap-3 sm:grid-cols-3"
        : section.id === "mansion"
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
          : section.id === "records"
            ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
          : columns === "two"
            ? "grid grid-cols-1 gap-4 md:grid-cols-2"
            : "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3";

  return (
    <section id={section.id} className="relative mx-auto w-full max-w-6xl px-4">
      <div className={`relative overflow-hidden rounded-[2rem] border border-[#ebe1cf]/80 bg-[rgba(255,252,247,0.58)] shadow-[0_18px_32px_-30px_rgba(82,69,53,0.24)] backdrop-blur-[1px] ${compact ? "px-5 py-3 sm:px-8 sm:py-4" : "px-5 py-6 sm:px-8 sm:py-7"}`}>
        {section.backgroundImage ? (
          <div className="pointer-events-none absolute inset-0">
            <Image src={section.backgroundImage} alt="" fill className="object-cover opacity-[0.82]" sizes="(max-width: 768px) 100vw, 1200px" />
            <div className={`absolute inset-0 ${section.backgroundOverlayClassName ?? "bg-[rgba(255,252,246,0.74)]"}`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_86%_76%,rgba(231,214,181,0.18),transparent_28%)]" />
          </div>
        ) : null}
        <div className="relative z-10">
          {section.sectionImage ? (
            <div className="flex flex-col gap-5 md:flex-row md:items-stretch">
              <div className="relative mx-auto aspect-[4/5] w-[60%] shrink-0 overflow-hidden rounded-2xl border border-[#e2d6c0]/60 shadow-[0_12px_32px_-12px_rgba(82,69,53,0.18)] md:mx-0 md:aspect-auto md:w-[200px]">
                <Image src={section.sectionImage} alt="" fill className="object-cover" sizes="(max-width: 768px) 60vw, 200px" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-white/20" />
              </div>
              <div className="flex-1">
                <SectionHeader eyebrow={section.eyebrow} title={section.title} description={section.description} />
                <div className="mt-4 grid grid-cols-1 content-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((item, index) => (
                    <NavigationCardItem key={item.href} item={item} featured={index === 0 && columns === "two"} compact={compact} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {compact ? null : <SectionHeader eyebrow={section.eyebrow} title={section.title} description={section.description} />}
              <div className={`${compact ? "" : "mt-4 "}${gridClass}`}>
                {section.items.map((item, index) => (
                  <NavigationCardItem key={item.href} item={item} featured={index === 0 && columns === "two"} compact={compact} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

type WelcomeScreenProps = {
  initialDailyWhisper?: string;
  serverBirthdate?: string | null;
  onStartTarot?: () => void;
};

export function WelcomeScreen({ initialDailyWhisper, serverBirthdate = null, onStartTarot }: WelcomeScreenProps) {
  const dailyWhisper = initialDailyWhisper?.trim() || DEFAULT_WHISPER_MESSAGE;
  const [featherNotice, setFeatherNotice] = useState<string | null>(null);
  const [specialOccasion, setSpecialOccasion] = useState<SpecialOccasionEvent | null>(() =>
    getSpecialOccasionEvent(serverBirthdate)
  );
  const [visitStreak, setVisitStreak] = useState<VisitStreakRecord>({
    streak: 1,
    lastVisited: "",
    monthKey: "",
    monthlyVisitCount: 1,
    monthlyClaimed: false,
  });
  const [visitorName, setVisitorName] = useState<string>("ゲスト");
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    setSpecialOccasion(getSpecialOccasionEvent(getInitialBirthdate(serverBirthdate)));
  }, [serverBirthdate]);

  useEffect(() => {
    let timeoutId: number | null = null;

    try {
      const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      const profile = rawProfile ? (JSON.parse(rawProfile) as { nickname?: string }) : {};
      const nickname = typeof profile.nickname === "string" && profile.nickname.trim() ? profile.nickname.trim() : "";
      if (nickname) setVisitorName(nickname);
      const hasVisited = localStorage.getItem("lumina_has_visited");
      if (!hasVisited) {
        setIsFirstVisit(true);
        localStorage.setItem("lumina_has_visited", "1");
      }
      const visitorKey = makeVisitorKey(nickname);
      const previous = getVisitStreakForVisitor(localStorage, visitorKey);
      const next = updateVisitStreakForVisitor(localStorage, visitorKey);
      const earnedToday = previous?.lastVisited !== getJstDateKey();

      timeoutId = window.setTimeout(() => {
        setVisitStreak(next);
        setFeatherNotice(earnedToday ? "今日の贈り物に白い羽が加わりました。" : null);
      }, 0);
    } catch {
      // Keep defaults when localStorage is unavailable.
    }

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleShareWhisper = () => {
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
    const shareText = ["今日のルミナのささやき", "", dailyWhisper, "", BRAND.name, siteUrl].join("\n");
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  };

  const remainingDays = Math.max(0, 7 - visitStreak.monthlyVisitCount);
  const collectedFeathers = Math.min(visitStreak.monthlyVisitCount, 7);
  const giftStatusText =
    visitStreak.monthlyVisitCount >= 7 || visitStreak.monthlyClaimed
      ? "今月の白い羽はすべて揃いました。\n来月、また新しい羽が舞い降ります。"
      : `あと${remainingDays}枚でそろいます。`;

  return (
    <TarotContext.Provider value={onStartTarot}>
      <div className="relative min-h-screen overflow-hidden px-0 py-5 sm:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(247,244,237,0.32)_0%,rgba(245,240,230,0.22)_46%,rgba(247,244,237,0.32)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(255,252,245,0.5),transparent_72%)]" />

        <section className="relative mx-auto w-full max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[2.25rem] border border-[#e6dac7]/85 px-6 py-8 shadow-[0_24px_44px_-34px_rgba(82,69,53,0.35)] sm:px-10 sm:py-10"
          >
            <div className="pointer-events-none absolute inset-0">
              <Image src="/gazou/yakata.jpg" alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 1200px" priority />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,253,248,0.94),rgba(246,238,226,0.84))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_52%)]" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative h-36 w-36 overflow-hidden rounded-full border border-white/70 bg-white/80 shadow-[0_10px_24px_-16px_rgba(82,69,53,0.28)]">
                <Image src="/lumina-icon.png" alt="ルミナのアイコン" fill className="object-cover" sizes="144px" priority />
              </div>
              <p className="mt-4 text-[11px] tracking-[0.3em] text-[#7b6f5f]">WHITE WITCH TAROT</p>
              <h1 className="mt-2 font-[var(--font-playfair-display)] text-4xl tracking-[0.12em] text-[#2e2a26] sm:text-5xl">
                {BRAND.name}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#554c41] sm:text-xl">
                無料タロット占い・恋愛占い・今日の運勢
              </p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#6a6054] sm:text-base">
                片思い・復縁・相性・結婚の恋愛占いから、毎日の運勢まで。
                <br />
                白の魔女ルミナがあなたの悩みに寄り添います。
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                {heroActions.map((action) => (
                  <SmartLink
                    key={action.href}
                    href={action.href}
                    className={
                      action.tone === "primary"
                        ? "inline-flex min-h-11 items-center justify-center rounded-full border border-[#c7ab73]/90 bg-[#c1a062] px-6 text-sm font-medium text-white shadow-[0_14px_28px_-18px_rgba(106,86,52,0.52)] transition hover:bg-[#b59558]"
                        : "inline-flex min-h-11 items-center justify-center rounded-full border border-[#d4c19f]/85 bg-[rgba(255,251,244,0.94)] px-6 text-sm font-medium text-[#695e50] shadow-[0_8px_20px_-18px_rgba(82,69,53,0.2)] transition hover:bg-[#fff7eb]"
                    }
                  >
                    {action.label}
                  </SmartLink>
                ))}
              </div>

            </div>
          </motion.div>
        </section>

        {specialOccasion ? <SpecialOccasionCard event={specialOccasion} /> : null}

        {isFirstVisit ? (
          <section className="relative mx-auto mt-5 w-full max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-[2rem] border-2 border-[#d4c19f]/90 bg-[linear-gradient(135deg,rgba(255,250,240,0.95),rgba(248,240,225,0.92))] px-5 py-5 shadow-[0_18px_32px_-20px_rgba(106,86,52,0.3)] sm:px-8 sm:py-6"
            >
              <div className="mb-4 text-center">
                <p className="text-[11px] tracking-[0.22em] text-[#8b7e6b] uppercase">Welcome</p>
                <h2 className="mt-1 text-xl font-medium tracking-[0.04em] text-[#2f2a25]">はじめまして、白の館へようこそ</h2>
                <p className="mt-2 text-sm text-[#6a6054]">まずはこちらからお試しください</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {firstVisitSection.items.map((item) => (
                  <NavigationCardItem key={item.href} item={item} compact />
                ))}
              </div>
            </motion.div>
          </section>
        ) : null}

        <section className="relative mx-auto mt-5 w-full max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <article className="rounded-[1.8rem] border border-[#e2d6c0]/85 bg-[rgba(245,239,227,0.92)] px-4 py-3 shadow-[0_14px_28px_-24px_rgba(82,69,53,0.22)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] tracking-[0.2em] text-[#8d816f] uppercase">Whisper</p>
                  <h3 className="mt-1 text-lg font-medium text-[#2f2a25]">ルミナのささやき</h3>
                </div>
                <button
                  type="button"
                  onClick={handleShareWhisper}
                  className="mt-1 shrink-0 inline-flex min-h-8 items-center justify-center rounded-full border border-[#cfbe9f]/85 bg-[#fffaf0] px-3 text-[12px] font-medium text-[#6f6556] transition hover:bg-[#f8f0e2]"
                >
                  共有する
                </button>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#5e5549]">こんにちは、{visitorName}さん</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#5e5549]">今日は{dailyWhisper}</p>
            </article>

            <article className="rounded-[1.8rem] border border-[#e2d6c0]/85 bg-[rgba(245,239,227,0.92)] px-4 py-3 shadow-[0_14px_28px_-24px_rgba(82,69,53,0.22)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] tracking-[0.2em] text-[#8d816f] uppercase">Gift</p>
                  <h3 className="mt-1 text-lg font-medium text-[#2f2a25]">白の贈り物</h3>
                </div>
                <Link
                  href="/library/wallpapers"
                  className="mt-1 shrink-0 inline-flex min-h-8 items-center justify-center rounded-full border border-[#cfbe9f]/85 bg-[#fffaf0] px-3 text-[12px] font-medium text-[#6f6556] transition hover:bg-[#f8f0e2]"
                >
                  贈り物を見る
                </Link>
              </div>
              <div className="mt-2 flex items-center gap-1.5" aria-label="白い羽の進捗">
                {Array.from({ length: 7 }).map((_, index) => (
                  <FeatherIcon key={`feather-${index}`} dimmed={index >= collectedFeathers} />
                ))}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-5 text-[#5e5549]">{giftStatusText}</p>
              {featherNotice ? <p className="mt-1 text-xs text-[#8d816f]">{featherNotice}</p> : null}
            </article>
          </motion.div>
        </section>

        <div className="mt-6 space-y-5 sm:space-y-6">
          <section className="relative mx-auto w-full max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.09 }}
              className="relative overflow-hidden rounded-[2rem] border border-[#dfcfb0]/80 px-5 py-7 shadow-[0_20px_36px_-28px_rgba(106,86,52,0.34)] sm:px-8 sm:py-8"
            >
              <div className="pointer-events-none absolute inset-0">
                <Image src="/gazou/IMG_4213.webp" alt="" fill className="object-cover opacity-[0.86]" sizes="(max-width: 768px) 100vw, 1200px" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(251,246,235,0.62),rgba(242,232,211,0.68))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.34),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(216,199,164,0.2),transparent_26%)]" />
              </div>
              <div className="pointer-events-none absolute right-[-8%] top-[-12%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.82),transparent_70%)]" />

              <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <p className="text-[11px] tracking-[0.24em] text-[#8d7f69] uppercase">Tarot</p>
                  <h2 className="mt-2 text-3xl font-medium tracking-[0.04em] text-[#2f2a25] sm:text-[2rem]">光の導きタロット占い</h2>
                  <p className="mt-3 text-base leading-8 text-[#5d5346]">一枚のカードが、今のあなたに寄り添います</p>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6b6053]">
                    恋愛、仕事、人間関係——どんな悩みにも、白の魔女ルミナがタロットカードで光の導きをお届けします。
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <SmartLink
                      href={TAROT_HREF}
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#c7ab73]/90 bg-[#c1a062] px-6 text-sm font-medium text-white transition hover:bg-[#b59558]"
                    >
                      タロット占いをはじめる
                    </SmartLink>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/65 bg-white/65 px-4 py-4">
                    <p className="text-[11px] tracking-[0.16em] text-[#8d816f] uppercase">無料で占える</p>
                    <p className="mt-2 text-sm leading-7 text-[#5f564a]">会員登録なしで、今すぐタロット占いを体験できます。</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/65 bg-white/65 px-4 py-4">
                    <p className="text-[11px] tracking-[0.16em] text-[#8d816f] uppercase">あなただけの鑑定</p>
                    <p className="mt-2 text-sm leading-7 text-[#5f564a]">相談内容に合わせて、一枚のカードを深く読み解きます。</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          <CardSection section={loveFortuneSection} columns="two" />

          <CardSection section={fortuneSection} />

          <CardSection section={recordsSection} columns="two" />
          <CardSection section={mansionSection} />
          <CardSection section={consultationSection} columns="two" />
        </div>

        <section className="relative mx-auto mt-6 w-full max-w-6xl px-4 pb-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="rounded-[1.9rem] border border-[#e6dac7]/85 bg-[rgba(255,252,247,0.8)] px-6 py-6 text-center shadow-[0_16px_28px_-28px_rgba(82,69,53,0.26)]"
          >
            <p className="text-[11px] tracking-[0.24em] text-[#8d806e] uppercase">White Mansion</p>
            <p className="mt-3 text-base leading-8 text-[#665c50]">
              ここで過ごす時間が、次の一歩を静かに整える支えになりますように。
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.ariaLabel}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d4c19f]/85 bg-white/75 text-[#6b6152] shadow-[0_8px_18px_-14px_rgba(82,69,53,0.35)] transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <BridgeSocialIcon name={link.name} />
                </a>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </TarotContext.Provider>
  );
}
