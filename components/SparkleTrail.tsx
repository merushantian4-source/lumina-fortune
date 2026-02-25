"use client"

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react"

type Sparkle = {
  id: number
  x: number
  y: number
  size: number
  dx: number
  dy: number
  durationMs: number
  delayMs: number
}

interface SparkleTrailProps {
  children: ReactNode
  className?: string
}

const MAX_SPARKLES = 30

export function SparkleTrail({ children, className = "" }: SparkleTrailProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const [reducedMotion, setReducedMotion] = useState(false)
  const idRef = useRef(0)
  const lastEmitAtRef = useRef(0)

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(mediaQuery.matches)

    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return

    const now = performance.now()
    if (now - lastEmitAtRef.current < 40) return
    lastEmitAtRef.current = now

    const rect = event.currentTarget.getBoundingClientRect()
    const baseX = event.clientX - rect.left
    const baseY = event.clientY - rect.top
    const burstCount = 1 + Math.floor(Math.random() * 3) // 1-3

    const nextSparkles: Sparkle[] = Array.from({ length: burstCount }, () => ({
      id: ++idRef.current,
      x: baseX + (Math.random() - 0.5) * 16,
      y: baseY + (Math.random() - 0.5) * 16,
      size: 3 + Math.random() * 5,
      dx: (Math.random() - 0.5) * 26,
      dy: -8 - Math.random() * 18,
      durationMs: 580 + Math.floor(Math.random() * 260),
      delayMs: Math.floor(Math.random() * 60),
    }))

    setSparkles((prev) => [...prev, ...nextSparkles].slice(-MAX_SPARKLES))

    nextSparkles.forEach((sparkle) => {
      window.setTimeout(() => {
        setSparkles((prev) => prev.filter((item) => item.id !== sparkle.id))
      }, sparkle.durationMs + sparkle.delayMs + 120)
    })
  }

  return (
    <div className={`relative ${className}`} onMouseMove={handleMouseMove}>
      {children}
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          {sparkles.map((sparkle) => (
            <span
              key={sparkle.id}
              className="sparkle-trail__dot"
              style={
                {
                  left: `${sparkle.x}px`,
                  top: `${sparkle.y}px`,
                  width: `${sparkle.size}px`,
                  height: `${sparkle.size}px`,
                  "--sparkle-dx": `${sparkle.dx}px`,
                  "--sparkle-dy": `${sparkle.dy}px`,
                  "--sparkle-duration": `${sparkle.durationMs}ms`,
                  "--sparkle-delay": `${sparkle.delayMs}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
      <style jsx>{`
        .sparkle-trail__dot {
          position: absolute;
          border-radius: 9999px;
          background:
            radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,248,220,0.85) 48%, rgba(255,244,210,0) 100%);
          box-shadow:
            0 0 10px rgba(255, 246, 214, 0.45),
            0 0 16px rgba(255, 255, 255, 0.28);
          transform: translate(-50%, -50%);
          opacity: 0;
          animation: sparkleTrailFade var(--sparkle-duration) ease-out var(--sparkle-delay) forwards;
        }

        .sparkle-trail__dot::before,
        .sparkle-trail__dot::after {
          content: "";
          position: absolute;
          inset: 50%;
          width: 140%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent);
          transform: translate(-50%, -50%);
          opacity: 0.8;
        }

        .sparkle-trail__dot::after {
          transform: translate(-50%, -50%) rotate(90deg);
          opacity: 0.55;
        }

        @keyframes sparkleTrailFade {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.7);
          }
          18% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--sparkle-dx)), calc(-50% + var(--sparkle-dy))) scale(0.35);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sparkle-trail__dot {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
