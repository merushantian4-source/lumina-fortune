"use client";

import { motion } from "framer-motion";

import { TarotCardArtwork } from "@/components/tarot-card-artwork";

type LightTarotDisplayProps = {
  imagePath: string;
  alt: string;
  isReversed?: boolean;
  sizes?: string;
  className?: string;
  artworkClassName?: string;
};

const PARTICLES = [
  { top: "10%", left: "16%", size: 5, delay: 0.08, color: "#fff8ea" },
  { top: "18%", right: "12%", size: 4, delay: 0.18, color: "#f8e7bf" },
  { top: "66%", left: "10%", size: 4, delay: 0.28, color: "#f3efff" },
  { top: "74%", right: "16%", size: 5, delay: 0.4, color: "#fff7df" },
  { top: "48%", left: "84%", size: 3, delay: 0.54, color: "#efe8ff" },
  { top: "36%", left: "8%", size: 3, delay: 0.62, color: "#fffaf1" },
] as const;

export function LightTarotDisplay({
  imagePath,
  alt,
  isReversed = false,
  sizes,
  className = "",
  artworkClassName = "",
}: LightTarotDisplayProps) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`.trim()}>
      <motion.div
        className="pointer-events-none absolute inset-2 rounded-[1.2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.52),rgba(245,233,207,0.16),rgba(241,236,255,0.08),rgba(255,255,255,0))]"
        initial={{ opacity: 0.12, scale: 0.95 }}
        animate={{ opacity: 0.28, scale: 1 }}
        transition={{ duration: 0.72, ease: "easeOut" }}
      />
      <motion.div
        className="pointer-events-none absolute inset-3 rounded-[1.25rem]"
        initial={{ opacity: 0.16, scale: 0.97 }}
        animate={{ opacity: 0.34, scale: 1 }}
        transition={{ duration: 0.82, ease: "easeOut" }}
        style={{
          boxShadow:
            "0 0 20px rgba(255,243,214,0.18), 0 0 34px rgba(244,232,202,0.12), 0 0 48px rgba(234,226,255,0.08)",
        }}
      />

      {PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          className="pointer-events-none absolute rounded-full"
          style={{
            ...("left" in particle ? { left: particle.left } : {}),
            ...("right" in particle ? { right: particle.right } : {}),
            top: particle.top,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 12px ${particle.color}`,
          }}
          initial={{ opacity: 0, scale: 0.35, y: 8 }}
          animate={{ opacity: [0, 0.85, 0], scale: [0.35, 1, 0.6], y: [8, -6, -12] }}
          transition={{ duration: 1.3, delay: particle.delay, ease: "easeOut" }}
        />
      ))}

      <div className="relative z-[1]">
        <TarotCardArtwork
          imagePath={imagePath}
          alt={alt}
          isReversed={isReversed}
          className={artworkClassName}
          sizes={sizes}
        />
      </div>

      <motion.div
        className="pointer-events-none absolute inset-y-0 left-[-42%] z-[2] w-[42%] rounded-full bg-[linear-gradient(115deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.08)_24%,rgba(255,251,239,0.62)_50%,rgba(247,230,190,0.24)_68%,rgba(255,255,255,0)_100%)] blur-[2px]"
        initial={{ x: "0%", opacity: 0 }}
        animate={{ x: "430%", opacity: [0, 0.94, 0] }}
        transition={{ duration: 1.08, delay: 0.14, ease: "easeInOut" }}
      />
    </div>
  );
}
