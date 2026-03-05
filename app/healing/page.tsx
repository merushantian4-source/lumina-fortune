"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";
import { PageShell } from "@/components/ui/page-shell";

type Track = {
  id: string;
  title: string;
  src: string;
};

const TRACKS: Track[] = [
  { id: "forest-breeze", title: "森のそよ風", src: "/audio/forest-breeze.mp3" },
  { id: "sunlit-river", title: "陽だまりの川辺", src: "/audio/sunlit-river.mp3" },
  { id: "quiet-library", title: "館の静かな書斎", src: "/audio/quiet-library.mp3" },
];

const MEDITATION_TABS = [
  { key: "3", label: "3分", seconds: 3 * 60 },
  { key: "5", label: "5分", seconds: 5 * 60 },
  { key: "10", label: "10分", seconds: 10 * 60 },
] as const;

const MEDITATION_GUIDES: Record<(typeof MEDITATION_TABS)[number]["key"], string> = {
  "3":
    "椅子に深く腰かけ、肩の力を抜きます。吸う息で胸の奥にやわらかな光が満ち、吐く息で余分な緊張が静かにほどける感覚をたどります。",
  "5":
    "呼吸に意識を向けながら、足先から順番に力みをほどいていきます。いま浮かぶ思考は追いかけず、雲を見送るようにそっと手放します。",
  "10":
    "白い館の窓辺にいるイメージで、ゆっくりと呼吸を整えます。吸うたびに穏やかさを受け取り、吐くたびに心のざわめきを床に預けていきます。",
};

function formatTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function HealingPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [tabKey, setTabKey] = useState<(typeof MEDITATION_TABS)[number]["key"]>("3");
  const selectedMeditation = MEDITATION_TABS.find((item) => item.key === tabKey) ?? MEDITATION_TABS[0];
  const [remainingSeconds, setRemainingSeconds] = useState(selectedMeditation.seconds);
  const [isMeditating, setIsMeditating] = useState(false);

  const track = TRACKS[trackIndex] ?? TRACKS[0];
  const progress = useMemo(() => {
    if (duration <= 0) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setAudioError(null);
    };
    const onEnded = () => setIsPlaying(false);
    const onError = () => {
      setAudioError("音源を読み込めませんでした。/public/audio/ のファイルをご確認ください。");
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!isMeditating) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setIsMeditating(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [isMeditating]);

  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setAudioError(null);
      setIsPlaying(true);
    } catch {
      setAudioError("この環境では再生を開始できませんでした。");
      setIsPlaying(false);
    }
  };

  const handleTrackSelect = async (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const shouldResume = isPlaying;
    setTrackIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setAudioError(null);
    audio.pause();
    audio.load();
    if (shouldResume) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (nextPercent: number) => {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;
    const clamped = Math.max(0, Math.min(100, nextPercent));
    const nextTime = (clamped / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <PageShell
      maxWidth="wide"
      title="館の休息室"
      description="呼吸を整え、音に身をあずけるための静かな部屋です。"
      backHref="/"
      backLabel="トップへ戻る"
    >
      <GlassCard>
        <p className="text-sm leading-relaxed text-[#544c42]">
          がんばりが続いた日ほど、心を休めるやさしいひとときが必要です。ここではBGMと短い瞑想ガイドで、静かに整える時間をご用意しています。
        </p>
      </GlassCard>

      <GlassCard className="mt-4">
        <h2 className="text-xl font-medium text-[#2e2a26]">BGMプレイヤー</h2>
        <p className="mt-2 text-sm text-[#544c42]">今の気分に合う音を選び、呼吸のリズムをゆるやかに整えます。</p>

        <audio ref={audioRef} src={track.src} preload="metadata" />

        <div className="mt-4 rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
          <p className="text-xs font-medium tracking-wide text-[#847967]">現在の曲</p>
          <p className="mt-1 text-base font-medium text-[#2e2a26]">{track.title}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <LuminaButton type="button" onClick={handleTogglePlay}>
              {isPlaying ? "停止" : "再生"}
            </LuminaButton>
            <span className="text-sm text-[#6f6556]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium tracking-wide text-[#847967]" htmlFor="healing-seek">
              シーク
            </label>
            <input
              id="healing-seek"
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="mt-2 w-full accent-[#a7906c]"
            />
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium tracking-wide text-[#847967]" htmlFor="healing-volume">
              音量
            </label>
            <input
              id="healing-volume"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="mt-2 w-full accent-[#a7906c]"
            />
          </div>

          {audioError ? <p className="mt-3 text-sm text-[#8a4f44]">{audioError}</p> : null}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {TRACKS.map((item, index) => (
            <button
              type="button"
              key={item.id}
              onClick={() => void handleTrackSelect(index)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                index === trackIndex
                  ? "border-[#b9a78b] bg-[#fff8ed] text-[#2e2a26]"
                  : "border-[#e1d5bf]/72 bg-white/60 text-[#544c42] hover:bg-[#fff8ed]/80"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="relative mt-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <Image src="/gazou/meisou.jpg" alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 960px" />
          <div className="absolute inset-0 bg-[rgba(255,252,246,0.82)]" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-medium text-[#2e2a26]">瞑想ガイド</h2>
          <p className="mt-2 text-sm text-[#544c42]">3分・5分・10分から選んで、いまの呼吸に合うペースで整えます。</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {MEDITATION_TABS.map((tab) => (
              <LuminaButton
                key={tab.key}
                type="button"
                tone={tabKey === tab.key ? "primary" : "secondary"}
                onClick={() => {
                  setTabKey(tab.key);
                  setIsMeditating(false);
                  setRemainingSeconds(tab.seconds);
                }}
              >
                {tab.label}
              </LuminaButton>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
            <p className="text-xs font-medium tracking-wide text-[#847967]">残り時間</p>
            <p className="mt-1 text-3xl font-medium text-[#2e2a26]">{formatTime(remainingSeconds)}</p>

            <div className="mt-4 flex gap-2">
              <LuminaButton type="button" onClick={() => setIsMeditating((prev) => !prev)}>
                {isMeditating ? "停止" : "開始"}
              </LuminaButton>
              <LuminaButton
                type="button"
                tone="secondary"
                onClick={() => {
                  setIsMeditating(false);
                  setRemainingSeconds(selectedMeditation.seconds);
                }}
              >
                リセット
              </LuminaButton>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#544c42]">{MEDITATION_GUIDES[tabKey]}</p>
          </div>
        </div>
      </GlassCard>
    </PageShell>
  );
}
