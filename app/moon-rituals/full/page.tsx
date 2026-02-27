import { GlassCard } from "@/components/ui/glass-card";
import { PageShell } from "@/components/ui/page-shell";
import { LuminaLinkButton } from "@/components/ui/button";

export default function FullMoonRitualPage() {
  return (
    <PageShell
      maxWidth="content"
      title="満月の小さな儀式"
      description="受け取り、ほどき、次へ進むための静かな振り返りの時間です。"
      backHref="/moon-rituals"
      backLabel="儀式一覧へ戻る"
    >
      <div className="space-y-4">
        <GlassCard className="overflow-hidden">
          <div className="rounded-xl border border-[#e8dcc7] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,240,229,0.88))] p-5">
            <p className="text-xs font-medium tracking-wide text-[#847967]">FULL MOON RITUAL</p>
            <h2 className="mt-2 text-xl font-medium text-[#2e2a26]">🌕 満月の小さな儀式</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
              できたことを受け取り、
              <br />
              重さをそっとほどくための振り返りです。
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
              満月は、増やす日ではなく、
              <br />
              “受け取る”日。
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
              がんばったことも、
              <br />
              揺れたことも、
              <br />
              どちらも含めて、いまのあなたです。
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#544c42]">今夜は、静かな問いかけを。</p>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium text-[#2e2a26]">🌿 振り返りの5つの問い</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
            ゆっくりと、紙に書いてもいいですし、
            <br />
            心の中で答えてもかまいません。
          </p>

          <ol className="mt-4 space-y-3">
            <li className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="inline-flex rounded-full bg-[#efe4d0] px-2 py-0.5 text-xs font-semibold text-[#6a5d4c]">
                1.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
                今月、少しでも前に進んだと感じることは何ですか？
                <br />
                ほんの小さな一歩でも大丈夫です。
              </p>
            </li>
            <li className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="inline-flex rounded-full bg-[#efe4d0] px-2 py-0.5 text-xs font-semibold text-[#6a5d4c]">
                2.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
                無理をしていた場面は、どこにありましたか？
                <br />
                がんばりすぎていた自分に、気づいてあげます。
              </p>
            </li>
            <li className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="inline-flex rounded-full bg-[#efe4d0] px-2 py-0.5 text-xs font-semibold text-[#6a5d4c]">
                3.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
                受け取ってうれしかった言葉や出来事は何ですか？
                <br />
                見落としていた光が、きっとあります。
              </p>
            </li>
            <li className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="inline-flex rounded-full bg-[#efe4d0] px-2 py-0.5 text-xs font-semibold text-[#6a5d4c]">
                4.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
                もう背負わなくてよさそうな思い込みはありますか？
                <br />
                「こうあるべき」という重さを、少しゆるめてみます。
              </p>
            </li>
            <li className="rounded-xl border border-[#e1d5bf]/72 bg-white/65 p-4">
              <p className="inline-flex rounded-full bg-[#efe4d0] px-2 py-0.5 text-xs font-semibold text-[#6a5d4c]">
                5.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
                次の月に持っていきたい感覚をひとつ選ぶなら、何ですか？
                <br />
                勇気でも、安心でも、静けさでも。
                <br />
                感覚を選ぶだけで十分です。
              </p>
            </li>
          </ol>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium text-[#2e2a26]">🌙 手放しのひとこと</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">最後に、静かに声に出します。</p>
          <p className="mt-3 rounded-lg border border-[#e8dcc7] bg-[#fff8ed]/90 px-3 py-2 text-sm font-medium leading-relaxed text-[#5f5344]">
            「今の私に重すぎるものは、感謝とともにそっと手放します。」
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
            吐く息と一緒に、
            <br />
            肩の力を少し抜きましょう。
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
            満月は、完璧を求める日ではありません。
            <br />
            “気づけたこと”を受け取る日です。
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">
            手放すとは、否定することではなく、
            <br />
            もう必要のない重さを、やさしく置いていくこと。
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#544c42]">あなたは、もう十分に歩いてきました。</p>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium text-[#2e2a26]">🌿 今日のアファメーション</h2>
          <p className="mt-3 rounded-lg border border-[#e8dcc7] bg-[#fff8ed]/90 px-3 py-2 text-sm font-medium leading-relaxed text-[#5f5344]">
            私は、満ちた光を受け取り、軽やかに次へ進んでいきます。
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
