"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type WishAnimationOverlayProps = {
  open: boolean;
  text: string;
  onComplete: () => void;
  birdImageSrc?: string;
};

type Phase = "idle" | "paper" | "birdIn" | "grab" | "fly";

function BirdIllustration({ flapping }: { flapping: boolean }) {
  return (
    <svg viewBox="0 0 120 92" className="h-20 w-24 drop-shadow-[0_4px_10px_rgba(255,255,255,0.14)]" aria-hidden="true">
      <defs>
        <linearGradient id="birdBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffefb" />
          <stop offset="100%" stopColor="#f6f1e8" />
        </linearGradient>
      </defs>

      <motion.ellipse
        cx="58"
        cy="52"
        rx="34"
        ry="24"
        fill="url(#birdBody)"
        stroke="#e5dbc8"
        strokeWidth="1.5"
        animate={flapping ? { y: [-1.5, 1.5, -1.5], rotate: [-1, 1, -1] } : undefined}
        transition={flapping ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" } : undefined}
        style={{ transformOrigin: "58px 52px" }}
      />

      <motion.ellipse
        cx="34"
        cy="36"
        rx="14"
        ry="13"
        fill="#fffefb"
        stroke="#e5dbc8"
        strokeWidth="1.4"
        animate={flapping ? { y: [-1, 1, -1] } : undefined}
        transition={flapping ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : undefined}
      />

      <motion.path
        d="M62 36 C76 28, 95 34, 98 50 C84 56, 70 52, 62 42 Z"
        fill="#fffdf9"
        stroke="#e6ddcb"
        strokeWidth="1.3"
        animate={flapping ? { y: [-3, 3, -3], rotate: [-2, 2, -2] } : undefined}
        transition={flapping ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" } : undefined}
        style={{ transformOrigin: "68px 42px" }}
      />

      <path d="M93 48 C103 49, 109 52, 114 57 C104 58, 97 57, 92 54 Z" fill="#e7c7b5" stroke="#ddbea7" strokeWidth="1.1" />
      <circle cx="31" cy="34" r="2.1" fill="#b96577" />
      <path d="M84 66 C96 68, 103 74, 106 81 C95 79, 87 76, 81 71 Z" fill="#f7f1e8" stroke="#e2d8c6" strokeWidth="1.1" />
    </svg>
  );
}

export function WishAnimationOverlay({ open, text, onComplete, birdImageSrc }: WishAnimationOverlayProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [typedText, setTypedText] = useState("");
  const lines = useMemo(() => Array.from(text.trim()), [text]);

  useEffect(() => {
    if (!open) return;

    let typingTimer: number | null = null;
    let typingIndex = 0;
    const timers: number[] = [];

    timers.push(
      window.setTimeout(() => {
        setPhase("paper");
        setTypedText("");
      }, 0)
    );

    const typeSpeed = Math.max(14, Math.floor(800 / Math.max(lines.length, 1)));
    typingTimer = window.setInterval(() => {
      typingIndex += 1;
      setTypedText(lines.slice(0, typingIndex).join(""));
      if (typingIndex >= lines.length && typingTimer !== null) {
        window.clearInterval(typingTimer);
        typingTimer = null;
      }
    }, typeSpeed);

    timers.push(window.setTimeout(() => setPhase("birdIn"), 1000));
    timers.push(window.setTimeout(() => setPhase("grab"), 1500));
    timers.push(window.setTimeout(() => setPhase("fly"), 1900));
    timers.push(window.setTimeout(() => onComplete(), 3100));

    return () => {
      if (typingTimer !== null) window.clearInterval(typingTimer);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [open, lines, onComplete]);

  if (!open) return null;

  const isBirdVisible = phase === "birdIn" || phase === "grab" || phase === "fly";
  const isFlying = phase === "fly";

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden bg-[rgba(20,27,45,0.22)] backdrop-blur-[2px]">
      <div className="pointer-events-none absolute right-8 top-8 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(255,247,218,0.58)_0%,rgba(255,247,218,0.18)_46%,rgba(255,247,218,0)_74%)]" />

      <div className="relative mx-auto flex h-full w-full max-w-4xl items-center justify-center px-4">
        <motion.article
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={
            isFlying
              ? { opacity: 0, x: 260, y: -180, rotate: -10, scale: 0.95 }
              : phase === "grab"
                ? { opacity: 1, scale: 1, y: 0, rotate: 3 }
                : { opacity: 1, scale: 1, y: 0, rotate: 0 }
          }
          transition={{ duration: isFlying ? 1.1 : 0.42, ease: "easeInOut" }}
          className="relative w-[min(88vw,34rem)] rounded-2xl border border-[#e8dfcf] bg-[linear-gradient(160deg,rgba(255,255,255,0.97),rgba(252,247,237,0.94))] p-6 shadow-[0_18px_36px_-24px_rgba(64,54,40,0.45)]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_16%,rgba(255,255,255,0.8),rgba(255,255,255,0)_42%)]" />
          <p className="relative whitespace-pre-wrap text-[15px] leading-8 tracking-[0.01em] text-[#4f473d]">{typedText}</p>
        </motion.article>

        {isBirdVisible ? (
          <motion.div
            initial={{ opacity: 0, x: 180, y: 100, rotate: 12, scale: 0.96 }}
            animate={
              isFlying
                ? { opacity: 0, x: 360, y: -160, rotate: -16, scale: 0.92 }
                : phase === "grab"
                  ? { opacity: 1, x: 108, y: -24, rotate: -8, scale: 1 }
                  : { opacity: 1, x: 96, y: -10, rotate: -5, scale: 1 }
            }
            transition={{ duration: isFlying ? 1.05 : 0.5, ease: "easeInOut" }}
            className="pointer-events-none absolute left-1/2 top-1/2"
          >
            {birdImageSrc ? <Image src={birdImageSrc} alt="" width={100} height={80} className="h-20 w-24 object-contain" /> : <BirdIllustration flapping />}
          </motion.div>
        ) : null}

        {isFlying ? (
          <div className="pointer-events-none absolute left-1/2 top-1/2">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={`trail-${dot}`}
                className="absolute block h-2.5 w-2.5 rounded-full bg-[#fff2c8]"
                initial={{ opacity: 0.65, x: 110 - dot * 12, y: -8 + dot * 5, scale: 0.7 }}
                animate={{ opacity: 0, x: 68 - dot * 26, y: 10 + dot * 16, scale: 0.2 }}
                transition={{ duration: 0.55 + dot * 0.15, ease: "easeOut" }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
