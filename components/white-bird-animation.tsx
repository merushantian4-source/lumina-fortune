"use client";

import { motion } from "framer-motion";

function BirdSpirit() {
  return (
    <svg viewBox="0 0 140 92" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="luminaBirdWing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffefb" />
          <stop offset="100%" stopColor="#ede5d6" />
        </linearGradient>
        <linearGradient id="luminaBirdBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffdfa" />
          <stop offset="100%" stopColor="#f3ecdf" />
        </linearGradient>
      </defs>

      <motion.path
        d="M70 45 C41 13, 12 12, 4 34 C25 30, 45 37, 60 52 Z"
        fill="url(#luminaBirdWing)"
        stroke="#e7dece"
        strokeWidth="1.4"
        animate={{ rotate: [-10, 5, -4, 0], y: [-2, 1, -1, 0] }}
        transition={{ duration: 1.04, times: [0, 0.34, 0.72, 1], ease: "easeInOut" }}
        style={{ transformOrigin: "60px 42px" }}
      />
      <motion.path
        d="M72 43 C101 13, 129 13, 136 35 C116 30, 96 38, 81 52 Z"
        fill="url(#luminaBirdWing)"
        stroke="#e7dece"
        strokeWidth="1.4"
        animate={{ rotate: [10, -5, 4, 0], y: [-2, 1, -1, 0] }}
        transition={{ duration: 1.04, times: [0, 0.34, 0.72, 1], ease: "easeInOut" }}
        style={{ transformOrigin: "82px 42px" }}
      />
      <motion.ellipse
        cx="71"
        cy="50"
        rx="20"
        ry="13"
        fill="url(#luminaBirdBody)"
        stroke="#e5dccb"
        strokeWidth="1.4"
        animate={{ y: [-1.5, 1.2, -0.5, 0] }}
        transition={{ duration: 1.02, times: [0, 0.4, 0.78, 1], ease: "easeInOut" }}
      />
      <ellipse cx="51" cy="46" rx="9" ry="8" fill="#fffdfa" stroke="#e7dece" strokeWidth="1.3" />
      <path
        d="M41 47 C34 47, 30 50, 27 54 C35 54, 39 53, 43 50 Z"
        fill="#e5c5b7"
        stroke="#d9b7a7"
        strokeWidth="1"
      />
      <circle cx="48" cy="44" r="1.9" fill="#a86f7d" />
      <path
        d="M88 60 C100 63, 106 68, 108 75 C98 74, 90 70, 84 64 Z"
        fill="#f8f3ea"
        stroke="#e8dfcf"
        strokeWidth="1.1"
      />
    </svg>
  );
}

export function WhiteBirdAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="relative mx-auto my-2 h-[6.8rem] w-full max-w-[16.5rem] overflow-hidden rounded-[1.8rem] border border-[#ebe0cc]/78 bg-[linear-gradient(180deg,rgba(255,252,247,0.97),rgba(244,237,227,0.88))] px-3 shadow-[0_16px_32px_-26px_rgba(72,58,41,0.22)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,249,236,0.7),rgba(255,249,236,0)_72%)]" />
      <motion.div
        className="pointer-events-none absolute inset-y-3 left-8 w-16 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7),rgba(255,255,255,0))] blur-md"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0.55, 0], scale: [0.7, 1.15, 0.9] }}
        transition={{ duration: 1.04, ease: "easeOut" }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-7 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,rgba(234,223,201,0),rgba(234,223,201,0.82),rgba(234,223,201,0))]"
        initial={{ opacity: 0, scaleX: 0.7 }}
        animate={{ opacity: [0, 0.65, 0.08], scaleX: [0.7, 1, 1.04] }}
        transition={{ duration: 1.08, ease: "easeOut" }}
      />

      {[0, 1, 2, 3].map((index) => (
        <motion.span
          key={index}
          className="pointer-events-none absolute top-1/2 h-1.5 w-1.5 rounded-full bg-[#f6ecd8]"
          initial={{ x: 68 + index * 8, y: -8 + index * 4, opacity: 0 }}
          animate={{
            x: -36 + index * 24,
            y: -18 + index * 12,
            opacity: [0, 0.72, 0],
            scale: [0.45, 1, 0.45],
          }}
          transition={{ duration: 1.1, delay: 0.12 + index * 0.1, ease: "easeOut" }}
        />
      ))}

      <motion.div
        className="absolute left-[-22%] top-1/2 h-12 w-24 -translate-y-1/2 sm:h-14 sm:w-28"
        initial={{ x: 0, y: 8, opacity: 0, rotate: -5 }}
        animate={{ x: "145%", y: -6, opacity: [0, 1, 1, 0], rotate: [-5, -2, 2, 6] }}
        transition={{ duration: 1.18, ease: "easeInOut" }}
      >
        <div className="relative h-full w-full">
          <BirdSpirit />
          <motion.div
            className="absolute -bottom-1.5 right-0 h-8 w-6 rounded-[0.7rem] border border-[#eadfcb]/88 bg-[linear-gradient(180deg,rgba(255,251,244,0.98),rgba(244,236,223,0.95))] p-[2px]"
            animate={{
              rotate: [-10, -5, 2],
              y: [1, -1.5, 0],
              boxShadow: [
                "0 10px 20px -16px rgba(58,44,28,0.24)",
                "0 10px 24px -14px rgba(244,227,187,0.62)",
                "0 10px 20px -16px rgba(58,44,28,0.24)",
              ],
            }}
            transition={{ duration: 1.18, ease: "easeInOut" }}
          >
            <div className="h-full w-full rounded-[0.6rem] border border-[#efe4d5] bg-[radial-gradient(circle_at_top,rgba(255,254,249,0.96),rgba(235,225,208,0.92))]" />
          </motion.div>
        </div>
      </motion.div>

      <motion.p
        className="absolute bottom-2.5 left-1/2 w-full max-w-[12rem] -translate-x-1/2 text-center text-[10px] tracking-[0.18em] text-[#9b8c76]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.72, 0.42], y: [5, 0, 0] }}
        transition={{ duration: 1.02, ease: "easeOut" }}
      >
        白い鳥がそっとカードを運んできます
      </motion.p>
    </motion.div>
  );
}
