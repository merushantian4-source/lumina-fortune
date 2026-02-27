import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";
import { LuminaLinkButton } from "@/components/ui/button";

export default function NewMoonRitualPage() {
  return (
    <PageShell
      maxWidth="content"
      title="新月の小さな儀式"
      description="整える、書く、ひとこと。やさしい順番で願いをそっと置く時間です。"
      backHref="/moon-rituals"
      backLabel="儀式一覧へ戻る"
    >
      <div className="space-y-4">
        <GlassCard className="overflow-hidden">
          <div className="rounded-xl border border-[#e8dcc7] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,240,229,0.88))] p-5">
            <p className="text-xs font-medium tracking-wide text-[#847967]">NEW MOON RITUAL</p>
            <h2 className="mt-2 text-xl font-medium text-[#2e2a26]">🌑 新月の小さな儀式</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
              整える、書く、ひとこと。
              <br />
              やさしい3つの順番で、願いをそっと置く時間です。
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium text-[#2e2a26]">🌿 3つの順番</h2>
          <ol className="mt-4 space-y-3">
            <li className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="inline-flex rounded-full bg-[#efe4d0] px-2 py-0.5 text-xs font-semibold text-[#6a5d4c]">
                1. 整える
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
                深呼吸をゆっくり3回。
                <br />
                吸う息よりも、吐く息を少し長めに。
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
                そして、今の気持ちをひとことで確かめます。
                <br />
                「少し疲れている」でも、
                <br />
                「わくわくしている」でも構いません。
                <br />
                正解はありません。
              </p>
            </li>

            <li className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="inline-flex rounded-full bg-[#efe4d0] px-2 py-0.5 text-xs font-semibold text-[#6a5d4c]">
                2. 願いを書く
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
                「こうなったらいいな」を、
                <br />
                短い一文で2〜3個だけ書きます。
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
                できるだけ、やわらかい言い方で。
                <br />
                強い決意よりも、育てる言葉で。
              </p>
              <div className="mt-3 rounded-lg border border-[#e8dcc7] bg-[#fff8ed]/90 p-3 text-sm leading-relaxed text-[#544c42]">
                たとえば
                <br />
                「〜できますように」よりも、
                <br />
                「〜を育てていきます」と書いてみる。
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
                新月は、種を置く日。
                <br />
                多すぎないほうが、心に残ります。
              </p>
            </li>

            <li className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="inline-flex rounded-full bg-[#efe4d0] px-2 py-0.5 text-xs font-semibold text-[#6a5d4c]">
                3. ひとこと
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">最後に、静かに声に出します。</p>
              <p className="mt-3 rounded-lg border border-[#e8dcc7] bg-[#fff8ed]/90 px-3 py-2 text-sm font-medium text-[#5f5344]">
                「今日はここまでで十分」
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
                小さくてもいい。
                <br />
                その一言で、儀式は閉じられます。
              </p>
            </li>
          </ol>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium text-[#2e2a26]">🌙 願いごとの例</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#544c42]">
            <li className="rounded-lg border border-[#e1d5bf]/72 bg-white/65 px-3 py-2">
              私は、毎日の生活リズムをやさしく整えていきます。
            </li>
            <li className="rounded-lg border border-[#e1d5bf]/72 bg-white/65 px-3 py-2">
              私は、必要なご縁を落ち着いて受け取っていきます。
            </li>
            <li className="rounded-lg border border-[#e1d5bf]/72 bg-white/65 px-3 py-2">
              私は、自分の気持ちを丁寧に言葉にしていきます。
            </li>
          </ul>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium text-[#2e2a26]">🌿 注意しておきたいこと</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
            願いは、多すぎないほうが心に残ります。
            <br />
            焦って完成させなくても大丈夫。
            <br />
            <br />
            短くても、整っていなくても、
            <br />
            “今のあなたの言葉”であれば、それで十分です。
            <br />
            <br />
            新月は、静かなはじまりの日。
            <br />
            大きな決断よりも、小さな種を大切に。
          </p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium text-[#2e2a26]">🌿 今日のアファメーション</h2>
          <p className="mt-3 rounded-lg border border-[#e8dcc7] bg-[#fff8ed]/90 px-3 py-2 text-sm font-medium leading-relaxed text-[#5f5344]">
            私は、静かなはじまりをやさしく育てていきます。
          </p>
        </GlassCard>

        <div className="pt-1">
          <LuminaLinkButton href="/calendar" className="inline-flex">
            カレンダーへ戻る
          </LuminaLinkButton>
        </div>
      </div>
    </PageShell>
  );
}
