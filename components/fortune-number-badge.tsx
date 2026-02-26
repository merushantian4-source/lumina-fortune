import type { FortuneNumber } from "@/lib/fortune/types"

type FortuneNumberBadgeProps = {
  number: FortuneNumber
}

export function FortuneNumberBadge({ number }: FortuneNumberBadgeProps) {
  return (
    <div className="relative mt-2 inline-flex h-[88px] w-[88px] items-center justify-center rounded-full sm:h-[96px] sm:w-[96px]">
      <div className="absolute inset-0 rounded-full bg-[#A999FF]/14 blur-md" aria-hidden="true" />
      <div className="absolute inset-[3px] rounded-full bg-gradient-to-b from-white/90 to-[#F6F2FF]/85" aria-hidden="true" />
      <div
        className="absolute inset-0 rounded-full ring-1 ring-[#B7A8FF]/45 shadow-[0_0_24px_rgba(142,124,255,0.16),inset_0_1px_0_rgba(255,255,255,0.7)]"
        aria-hidden="true"
      />
      <span className="relative text-3xl font-semibold text-slate-900 sm:text-4xl">{number}</span>
    </div>
  )
}
