"use client";

import { createContext, useContext } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SpecialOccasionCard } from "@/components/special-occasion-card";
import { BRAND } from "@/lib/brand";
import { getInitialBirthdate } from "@/lib/profile/getProfile";
import { getSpecialOccasionEvent, type SpecialOccasionEvent } from "@/lib/special-occasions";
import { getJstDateKey, getVisitStreakForVisitor, makeVisitorKey, updateVisitStreakForVisitor, type VisitStreakRecord } from "@/lib/visit-streak";

const TAROT_HREF = "/?start=tarot";
const TarotContext = createContext<(() => void) | undefined>(undefined);

const PROFILE_STORAGE_KEY = "lumina_profile";
const DEFAULT_WHISPER_MESSAGE = `今日は「整えること」が鍵になる日。
小さな違和感を見逃さないことで、
次の選択が静かに見えてきます。`;

type MenuCard = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
};

type MenuGroup = {
  heading: string;
  sub: string;
  image: string;
  items: MenuCard[];
};

const MOBILE_FORTUNE_VISIBLE_COUNT = 3;

const heroActions = [
  { label: "今日のカードを引く", href: "/daily-fortune", tone: "primary" as const },
  { label: "基本性格", href: "/basic-personality", tone: "secondary" as const },
  { label: "光の導きタロット占い", href: "/?start=tarot", tone: "secondary" as const },
];

const groupedMenus: MenuGroup[] = [
  {
    heading: "導きの間",
    sub: "カードが示す運命を受け取る",
    image: "/gazou/IMG_4213.webp",
    items: [
      { title: "基本性格", description: "生年月日からあなたの本質を読み解きます。", href: "/basic-personality", ctaLabel: "見る" },
      { title: "光の導きタロット占い", description: "いまの流れをカードで静かに読み解きます。", href: "/?start=tarot", ctaLabel: "ひらく" },
      { title: "毎日の占い", description: "今日の流れに寄り添うメッセージを受け取れます。", href: "/daily-fortune", ctaLabel: "見る" },
      { title: "毎月の運勢", description: "今月のテーマと過ごし方を確認できます。", href: "/fortune-monthly", ctaLabel: "開く" },
      { title: "2026年の運勢", description: "一年の流れを静かに見通します。", href: "/fortune-2026", ctaLabel: "開く" },
      { title: "相性占い", description: "ふたりの関係性をやさしく読み解きます。", href: "/compatibility", ctaLabel: "見る" },
      { title: "光の暦", description: "月の流れに合わせて毎日を整えます。", href: "/calendar", ctaLabel: "ひらく" },
    ],
  },
  {
    heading: "白の休息室",
    sub: "心を静かに整える場所",
    image: "/gazou/IMG_4223.webp",
    items: [
      { title: "光のワーク", description: "日常に静かな光を取り戻す小さな実践。", href: "/light-work", ctaLabel: "はじめる" },
      { title: "未来の手紙", description: "未来のあなたへ残した言葉を、白が静かに預かります。", href: "/future-letter", ctaLabel: "手紙を書く" },
      { title: "館の休息室", description: "静かなBGMと短い瞑想で心をゆるめます。", href: "/healing", ctaLabel: "休む" },
      { title: "光の願いの庭", description: "小さな願いを匿名で残せる場所です。", href: "/wish-garden", ctaLabel: "願いを残す" },
    ],
  },
  {
    heading: "光の書庫",
    sub: "静かな時間を受け取る",
    image: "/gazou/IMG_4219.webp",
    items: [
      { title: "白の庭の記録（物語）", description: "白の館とルミナの物語を辿ります。", href: "/library/records", ctaLabel: "読む" },
      { title: "館の書棚（コラム）", description: "心を整えるための短い読み物です。", href: "/columns", ctaLabel: "読む" },
      { title: "光の待ち受けお守り", description: "今月の待ち受けを受け取れます。", href: "/lucky-wallpapers", ctaLabel: "開く" },
      { title: "月灯りの間（動画）", description: "静かな動画をゆっくり楽しめます。", href: "/library/limited-video", ctaLabel: "見る" },
    ],
  },
  {
    heading: "ルミナの相談室",
    sub: "恋愛や仕事などを丁寧に相談",
    image: "/gazou/IMG_4222.webp",
    items: [
      { title: "ルミナへの手紙", description: "個人鑑定の前に、いまの気持ちを短く届けてみませんか。", href: "/letter", ctaLabel: "手紙を書く" },
      { title: "個人鑑定のご依頼", description: "今すぐ相談したい方はこちら。", href: "/consultation", ctaLabel: "依頼する" },
    ],
  },
];

const mapCards = [
  {
    tag: "玄関",
    title: "はじめての方へ",
    description: "プロフィールを登録して、ルミナの言葉をあなた仕様に。",
    href: "/profile",
    ctaLabel: "プロフィールを登録する",
  },
  {
    tag: "書庫",
    title: "白の庭の記録",
    description: "ルミナについてと、白の館の物語。",
    href: "/library/records",
    ctaLabel: "物語をひらく",
  },
  {
    tag: "相談室",
    title: "2026年の運勢",
    description: "一年の流れを静かに見通します。",
    href: "/fortune-2026",
    ctaLabel: "運勢をひらく",
  },
];

const bridgeSocialLinks = [
  { name: "TikTok", href: "https://www.tiktok.com/@luminousmagic0?_r=1&_t=ZS-94P8u7q3O5g", ariaLabel: "TikTokを開く" },
  { name: "Instagram", href: "https://www.instagram.com/luminousmagic0?igsh=MXZqNmtkazllZHpqNg%3D%3D&utm_source=qr", ariaLabel: "Instagramを開く" },
  { name: "YouTube", href: "https://youtube.com/channel/UCgmijIrv50RWonl2XgO8fiA?si=k60PNOj1RXFB3wcG", ariaLabel: "YouTubeを開く" },
] as const;

function BridgeSocialIcon({ name }: { name: (typeof bridgeSocialLinks)[number]["name"] }) {
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

function MenuCardItem({ item }: { item: MenuCard }) {
  return (
    <article className="rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(162deg,rgba(255,252,246,0.9),rgba(248,242,231,0.86))] p-4 shadow-[0_12px_22px_-20px_rgba(82,69,53,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-medium leading-tight text-[#2e2a26]">{item.title}</h3>
        <SmartLink
          href={item.href}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-[#baa98d]/72 bg-[#fdf8ee] px-3 text-sm font-medium text-[#6f6556] transition hover:bg-[#f9f3e7]"
        >
          {item.ctaLabel}
        </SmartLink>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[#544c42]">{item.description}</p>
    </article>
  );
}

type FeatherIconProps = {
  size?: "small" | "large";
  dimmed?: boolean;
  alt?: string;
};

function FeatherIcon({ size = "small", dimmed = false, alt = "" }: FeatherIconProps) {
  const wrapperClass = size === "large" ? "h-11 w-14" : "h-3 w-4";
  const imageClass = dimmed
    ? "object-contain opacity-[0.46] grayscale-[0.2] brightness-[1.06] contrast-[1.08]"
    : "object-contain opacity-[0.78] brightness-[1.08] contrast-[1.12] drop-shadow-[0_0_3px_rgba(255,255,255,0.28)]";

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

const featherCardClassName =
  "rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(180deg,#f0e8da_0%,#f5efe4_60%,#faf6ef_100%)] px-5 py-4 text-left shadow-[0_10px_22px_-22px_rgba(82,69,53,0.18)]";

type WelcomeScreenProps = {
  initialDailyWhisper?: string;
  serverBirthdate?: string | null;
  onStartTarot?: () => void;
};

export function WelcomeScreen({ initialDailyWhisper, serverBirthdate = null, onStartTarot }: WelcomeScreenProps) {
  const dailyWhisper = initialDailyWhisper?.trim() || DEFAULT_WHISPER_MESSAGE;
  const [mobileFortuneExpanded, setMobileFortuneExpanded] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
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

  useEffect(() => {
    setSpecialOccasion(getSpecialOccasionEvent(getInitialBirthdate(serverBirthdate)));
  }, [serverBirthdate]);

  useEffect(() => {
    let timeoutId: number | null = null;
    try {
      const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      const profile = rawProfile ? (JSON.parse(rawProfile) as { nickname?: string }) : {};
      const visitorKey = makeVisitorKey(typeof profile.nickname === "string" ? profile.nickname : "");
      const previous = getVisitStreakForVisitor(localStorage, visitorKey);
      const next = updateVisitStreakForVisitor(localStorage, visitorKey);
      const earnedToday = previous?.lastVisited !== getJstDateKey();
      timeoutId = window.setTimeout(() => {
        setVisitStreak(next);
        setFeatherNotice(earnedToday ? "白が羽を落としていきました" : null);
      }, 0);
    } catch {
      // keep defaults
    }
    return () => {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, []);

  const handleShareWhisper = () => {
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
    const shareText = ["今日のルミナのささやき", "", dailyWhisper, "", BRAND.name, BRAND.tagline, siteUrl].join("\n");
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  };

  const remainingDays = Math.max(0, 7 - visitStreak.monthlyVisitCount);
  const collectedFeathers = Math.min(visitStreak.monthlyVisitCount, 7);
  const giftStatusText =
    visitStreak.monthlyVisitCount >= 7 || visitStreak.monthlyClaimed
      ? "七枚の羽がそろいました。白の贈り物を受け取れます"
      : `白が落としていく羽は、あと${remainingDays}枚でそろいます。`;
  const mobileQuickMenus = [
    { label: "今日の占い", href: "/daily-fortune" },
    { label: "光の導きタロット", href: "/?start=tarot" },
    { label: "白の庭の記録", href: "/library/records" },
    { label: "個人鑑定", href: "/consultation" },
  ];
  const mobileFortuneMenu = groupedMenus.find((group) => group.heading === "導きの間");
  const mobileFortuneItems = mobileFortuneExpanded
    ? (mobileFortuneMenu?.items ?? [])
    : (mobileFortuneMenu?.items ?? []).slice(0, MOBILE_FORTUNE_VISIBLE_COUNT);
  const hasMoreMobileFortuneItems = (mobileFortuneMenu?.items.length ?? 0) > MOBILE_FORTUNE_VISIBLE_COUNT;
  const mobileHiddenGroups = groupedMenus.filter((group) =>
    ["白の休息室", "光の書庫", "ルミナの相談室"].includes(group.heading)
  );

  return (
    <TarotContext.Provider value={onStartTarot}>
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(255,255,247,0.2),transparent_46%),radial-gradient(circle_at_78%_14%,rgba(246,233,202,0.16),transparent_50%),radial-gradient(circle_at_36%_74%,rgba(223,242,226,0.12),transparent_56%)]" />

      <section className="relative mx-auto w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
          className="lumina-shell relative overflow-hidden rounded-3xl border border-[#e4dbc9]/85 bg-[linear-gradient(155deg,rgba(255,255,251,0.9),rgba(248,242,231,0.84))] px-5 py-8 shadow-[0_18px_34px_-26px_rgba(82,69,53,0.24)] sm:px-8 sm:py-10"
        >
          <div className="pointer-events-none absolute inset-0">
            <Image src="/gazou/yakata.jpg" alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 1024px" />
            <div className="absolute inset-0 bg-[rgba(255,252,246,0.84)]" />
          </div>
          <div className="relative z-10 text-center">
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-[#f2ebde]/85 bg-[#fffdf8]/85">
              <Image src="/lumina-icon.png" alt="ルミナのアイコン" width={128} height={128} className="h-full w-full object-cover" priority />
            </div>
            <p className="mt-4 text-xs tracking-[0.24em] text-[#766e62]">WHITE WITCH TAROT</p>
            <h1 className="mt-1 font-[var(--font-playfair-display)] text-4xl tracking-[0.14em] text-[#2e2a26] sm:text-5xl">{BRAND.name}</h1>
            <p className="mt-2 text-base leading-relaxed text-[#544c42]">{BRAND.tagline}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#665d51]">
              がんばりすぎた心に、静かな光を。
              {"\n"}LUMINAの占いは、あなたを整えるための言葉です。
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {heroActions.map((action) => (
                <SmartLink
                  key={action.href}
                  href={action.href}
                  className={
                    action.tone === "primary"
                      ? "inline-flex min-h-10 min-w-[9.5rem] items-center justify-center rounded-full border border-[#a79678]/80 bg-[#b7a076] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#ad9568]"
                      : "inline-flex min-h-10 min-w-[9.5rem] items-center justify-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-4 py-1.5 text-sm font-medium text-[#6f6556] transition hover:bg-[#fffaf0]"
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

      <section className="relative mx-auto mt-4 w-full max-w-5xl md:hidden">
        <div className="grid grid-cols-2 gap-2">
          {mobileQuickMenus.map((item) => (
            <SmartLink
              key={item.href}
              href={item.href}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#baa98d]/72 bg-[#fdf8ee] px-3 py-2 text-sm font-medium text-[#6f6556] transition hover:bg-[#f9f3e7]"
            >
              {item.label}
            </SmartLink>
          ))}
        </div>
      </section>

      <section className="relative mx-auto mt-6 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="lumina-glow-card relative overflow-hidden rounded-2xl border border-[#d9ccb3]/80 px-6 py-7 text-center shadow-[0_12px_24px_-20px_rgba(96,80,60,0.28)]"
        >
          <div className="pointer-events-none absolute inset-0">
            <Image src="/gazou/sasayaki.jpg" alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 960px" />
            <div className="absolute inset-0 bg-[rgba(255,252,246,0.84)]" />
          </div>
          <div className="relative z-10">
            <h2 className="text-base font-medium text-[#2f2a25]">今日のルミナのささやき</h2>
            <p className="mx-auto mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-[#544c42]">{dailyWhisper}</p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleShareWhisper}
                className="inline-flex min-h-9 min-w-[10.5rem] items-center justify-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-4 py-1.5 text-sm font-medium text-[#6f6556] transition hover:bg-[#fffaf0]"
              >
                この言葉をシェア
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative mx-auto mt-4 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.09 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <article className={featherCardClassName}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-[#6f6658]">白の羽</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#544c42]">白が落としていった羽を ひとつ拾いました。</p>
              </div>
              <div className="shrink-0 pt-1">
                <FeatherIcon size="large" alt="白い羽" />
              </div>
            </div>
            <div className="mt-3 space-y-2" aria-label="白の羽の記録">
              <div className="flex items-center gap-1.5 leading-none">
                {Array.from({ length: 7 }).map((_, i) => (
                  <FeatherIcon key={`feather-dot-${i}`} dimmed={i >= collectedFeathers} />
                ))}
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] tracking-[0.12em] text-[#8b8376]">進捗</p>
                <p className="text-lg font-medium tracking-[0.08em] text-[#4f4a42]">{collectedFeathers} / 7</p>
                <p className="text-sm text-[#6f6556]">あと{remainingDays}枚でそろいます。</p>
              </div>
            </div>
            {featherNotice ? <p className="mt-1 text-xs text-[#8b7e6b]">{featherNotice}</p> : null}
          </article>

          <article className={featherCardClassName}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-[#6f6658]">白の贈り物</h3>
                <p className="mt-1 text-xs text-[#8b7e6b]">七枚そろうと、白が小さな贈り物を届けます</p>
              </div>
              <div className="shrink-0 pt-1">
                <FeatherIcon size="large" alt="白い羽" />
              </div>
            </div>
            <div className="mt-3 space-y-0.5">
              <p className="text-[11px] tracking-[0.12em] text-[#8b8376]">進捗</p>
              <p className="text-lg font-medium tracking-[0.08em] text-[#4f4a42]">{collectedFeathers} / 7</p>
            </div>
            <p className="mt-1 text-sm text-[#6f6556]">{giftStatusText}</p>
            <Link href="/library/wallpapers" className="mt-2 inline-block text-xs text-[#6f6556] underline-offset-4 hover:underline">
              詳細 →
            </Link>
          </article>
        </motion.div>
      </section>

      <section className="relative mx-auto mt-6 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.11 }}
          className="rounded-3xl border border-[#e1d5bf]/72 bg-[linear-gradient(165deg,rgba(255,252,246,0.76),rgba(248,242,231,0.68))] p-4 shadow-[0_10px_20px_-22px_rgba(82,69,53,0.2)] sm:p-5"
        >
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-lg font-medium text-[#3c352d]">✧ 館の入口</h2>
            <p className="text-xs tracking-[0.08em] text-[#8b7e6b]">迷ったら、まずこの3つから。</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {mapCards.map((card) => (
              <article
                key={card.href}
                className="rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(162deg,rgba(255,252,246,0.92),rgba(248,242,231,0.88))] p-4 shadow-[0_12px_22px_-20px_rgba(82,69,53,0.22)]"
              >
                <p className="text-xs tracking-[0.1em] text-[#8b7e6b]">{card.tag}</p>
                <h3 className="mt-1 text-lg font-medium text-[#2e2a26]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#544c42]">{card.description}</p>
                <SmartLink
                  href={card.href}
                  className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-4 py-1.5 text-sm font-medium text-[#6f6556] transition hover:bg-[#f9f3e7]"
                >
                  + {card.ctaLabel} →
                </SmartLink>
              </article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative mx-auto mt-6 w-full max-w-5xl md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="space-y-3"
        >
          <div className="rounded-2xl border border-[#e1d5bf]/72 bg-[linear-gradient(165deg,rgba(255,252,246,0.76),rgba(248,242,231,0.68))] p-4">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="text-lg font-medium text-[#3c352d]">占いメニュー</h2>
              <p className="text-xs tracking-[0.08em] text-[#8b7e6b]">横にスワイプ</p>
            </div>
            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex gap-3 px-1">
                {mobileFortuneItems.map((item) => (
                  <article
                    key={`mobile-fortune-${item.href}`}
                    className="w-[260px] shrink-0 rounded-2xl border border-[#e1d5bf]/75 bg-[linear-gradient(162deg,rgba(255,252,246,0.92),rgba(248,242,231,0.88))] p-4"
                  >
                    <h3 className="text-base font-medium text-[#2e2a26]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#544c42]">{item.description}</p>
                    <SmartLink
                      href={item.href}
                      className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-4 py-1.5 text-sm font-medium text-[#6f6556] transition hover:bg-[#f9f3e7]"
                    >
                      {item.ctaLabel} →
                    </SmartLink>
                  </article>
                ))}
              </div>
            </div>
            {hasMoreMobileFortuneItems ? (
              <button
                type="button"
                onClick={() => setMobileFortuneExpanded((prev) => !prev)}
                className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-4 py-1.5 text-xs font-medium text-[#6f6556] transition hover:bg-[#f9f3e7]"
              >
                {mobileFortuneExpanded ? "折りたたむ" : "もっと見る"}
              </button>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[#e1d5bf]/72 bg-[linear-gradient(165deg,rgba(255,252,246,0.76),rgba(248,242,231,0.68))] p-4">
            {!mobileExpanded ? (
              <button
                type="button"
                onClick={() => setMobileExpanded(true)}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-5 py-2 text-sm font-medium text-[#6f6556] transition hover:bg-[#f9f3e7]"
              >
                もっと見る
              </button>
            ) : (
              <div className="space-y-4">
                {mobileHiddenGroups.map((group) => (
                  <section key={`mobile-group-${group.heading}`} className="rounded-2xl border border-[#e1d5bf]/70 bg-white/60 p-3">
                    <div className="mb-2 flex items-end justify-between gap-2">
                      <h3 className="text-base font-medium text-[#3c352d]">{group.heading}</h3>
                      <p className="text-[11px] tracking-[0.06em] text-[#8b7e6b]">{group.sub}</p>
                    </div>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <article key={`mobile-item-${item.href}`} className="rounded-xl border border-[#e1d5bf]/75 bg-white/75 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-[#2e2a26]">{item.title}</h4>
                            <SmartLink
                              href={item.href}
                              className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#baa98d]/72 bg-[#fdf8ee] px-2.5 text-xs font-medium text-[#6f6556] transition hover:bg-[#f9f3e7]"
                            >
                              {item.ctaLabel}
                            </SmartLink>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[#544c42]">{item.description}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
                <button
                  type="button"
                  onClick={() => setMobileExpanded(false)}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#baa98d]/72 bg-[#fdf8ee] px-5 py-2 text-sm font-medium text-[#6f6556] transition hover:bg-[#f9f3e7]"
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      <section className="relative mx-auto mt-6 hidden w-full max-w-5xl md:block">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }} className="space-y-5">
          {groupedMenus.map((group) => (
            <section
              key={group.heading}
              className="relative overflow-hidden rounded-3xl border border-[#e1d5bf]/72 bg-[linear-gradient(165deg,rgba(255,252,246,0.76),rgba(248,242,231,0.68))] p-4 shadow-[0_10px_20px_-22px_rgba(82,69,53,0.2)] sm:p-5"
            >
              <div className="pointer-events-none absolute inset-0 opacity-55">
                <Image src={group.image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 960px" />
                <div className="absolute inset-0 bg-[rgba(255,252,246,0.52)]" />
              </div>
              <div className="relative z-10 mb-3 flex items-end justify-between gap-3">
                <h2 className="text-lg font-medium text-[#3c352d]">{group.heading}</h2>
                <p className="text-xs tracking-[0.08em] text-[#8b7e6b]">{group.sub}</p>
              </div>
              <div className="relative z-10 grid grid-cols-1 gap-3 md:grid-cols-2">
                {group.items.map((item) => (
                  <MenuCardItem key={item.href} item={item} />
                ))}
              </div>
            </section>
          ))}
        </motion.div>
      </section>

      <section className="relative mx-auto mt-8 w-full max-w-5xl pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="rounded-2xl border border-[#ddd1ba]/78 bg-[linear-gradient(160deg,rgba(255,252,246,0.92),rgba(246,238,226,0.86))] px-6 py-6 text-center"
        >
          <p className="text-xs tracking-[0.14em] text-[#8f826f]">WHITE MANSION</p>
          <p className="text-base leading-relaxed text-[#6a5f52]">ここで過ごした時間が、あなたの静かな支えになりますように。</p>
        </motion.div>
        <div className="mt-3 flex items-center justify-center gap-3">
          {bridgeSocialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.ariaLabel}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cdbb9f]/85 bg-[linear-gradient(160deg,#fffdf8,#f2e8d7)] text-[#6b6152] shadow-[0_8px_18px_-14px_rgba(82,69,53,0.35)] transition hover:-translate-y-0.5 hover:bg-[#fffaf0]"
            >
              <BridgeSocialIcon name={link.name} />
            </a>
          ))}
        </div>
      </section>

    </div>
    </TarotContext.Provider>
  );
}
