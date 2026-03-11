"use client";

import Link from "next/link";
import { useState } from "react";

import { saveMembershipTier } from "@/lib/membership";

export default function MembershipPage() {
  const [activated, setActivated] = useState(false);

  const handleActivate = () => {
    saveMembershipTier("paid");
    setActivated(true);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f1e6_0%,#efe5d2_100%)] px-4 py-8 text-[#2f2a24]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e6dac5]/80 bg-[linear-gradient(180deg,rgba(255,252,246,0.94),rgba(246,239,227,0.9))] p-6 shadow-[0_18px_40px_-28px_rgba(70,58,44,0.28)]">
        <p className="text-[11px] tracking-[0.24em] text-[#8a7b67]">MEMBERSHIP</p>
        <h1 className="mt-1 text-2xl">有料会員登録</h1>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#6f6458]">
          {"有料会員さまは、星の導きタロット占いを何度でもお使いいただけます。\n気になる流れを、必要なときにその都度たしかめられるようになります。"}
        </p>

        <div className="mt-6 rounded-[1.4rem] border border-[#e7dcc8]/90 bg-white/70 p-4">
          <p className="text-sm leading-relaxed text-[#544a3f]">
            今回は導線実装に合わせた簡易ページです。会員状態を反映すると、以後のチャット占いでは回数制限なしとして扱われます。
          </p>
          <button
            type="button"
            onClick={handleActivate}
            className="mt-4 rounded-xl bg-[#e8d9b8] px-4 py-3 text-sm font-medium text-[#4f4538] transition hover:bg-[#e2cfaa]"
          >
            有料会員登録をする
          </button>
          {activated ? <p className="mt-3 text-sm text-[#5b704f]">有料会員として利用できる状態に切り替わりました。</p> : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="rounded-xl border border-[#d9cdb8] bg-white/80 px-4 py-3 text-sm text-[#5d5449] transition hover:bg-white">
            白の館へ戻る
          </Link>
          <Link href="/consultation" className="rounded-xl border border-[#d9cdb8] bg-white/80 px-4 py-3 text-sm text-[#5d5449] transition hover:bg-white">
            個人鑑定を依頼する
          </Link>
        </div>
      </div>
    </main>
  );
}
