"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

interface ChatHeaderProps {
  onBackToTop?: () => void
}

export function ChatHeader({ onBackToTop }: ChatHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    onBackToTop?.()
    router.push("/")
  }

  return (
    <header className="relative z-20 border-b border-slate-200/70 bg-white/65 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-white via-slate-50 to-emerald-50 ring-2 ring-slate-200/70">
            <Image
              src="/lumina-icon.png"
              alt="ルミナのアイコン"
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">白の魔女ルミナ</h2>
            <p className="text-xs text-slate-600/80">光とハーブを操るやさしい案内役</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="lumina-link pointer-events-auto rounded-full border border-slate-200/70 bg-white/75 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition hover:bg-white/90"
        >
          ← トップへ戻る
        </button>
      </div>
    </header>
  )
}
