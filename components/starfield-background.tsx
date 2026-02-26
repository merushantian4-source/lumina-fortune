"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  vx: number;
  vy: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createStars(width: number, height: number): Star[] {
  const area = width * height;
  const count = clamp(Math.round(area / 60000), 25, 45);

  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 0.5 + Math.random() * 1.2,
    alpha: 0.08 + Math.random() * 0.14,
    vx: (Math.random() - 0.5) * 0.018,
    vy: (Math.random() - 0.5) * 0.018,
  }));
}

export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let rafId = 0;
    let lastTime = 0;
    let reducedMotion = false;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
        ctx.fill();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = createStars(rect.width, rect.height);
      draw();
    };

    const tick = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const dt = clamp(time - (lastTime || time), 0, 48);
      lastTime = time;

      for (const star of stars) {
        star.x += star.vx * dt;
        star.y += star.vy * dt;

        if (star.x < -4) star.x = rect.width + 4;
        if (star.x > rect.width + 4) star.x = -4;
        if (star.y < -4) star.y = rect.height + 4;
        if (star.y > rect.height + 4) star.y = -4;
      }

      draw();
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const updateMotionPreference = () => {
      reducedMotion = media.matches;
      window.cancelAnimationFrame(rafId);
      rafId = 0;
      lastTime = 0;
      draw();
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    resize();
    updateMotionPreference();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    media.addEventListener("change", updateMotionPreference);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      media.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
}
