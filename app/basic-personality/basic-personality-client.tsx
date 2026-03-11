"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FortuneNumberBadge } from "@/components/fortune-number-badge";
import UnmeiVisual from "@/components/unmei/UnmeiVisual";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";
import { fortuneNumberNames } from "@/lib/fortune/names";
import type { FortuneNumber } from "@/lib/fortune/types";
import { BIRTHDATE_STORAGE_KEY, getInitialBirthdate } from "@/lib/profile/getProfile";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaButton } from "@/components/ui/button";

type PersonalityResult = {
  destinyNumber: FortuneNumber;
  soulName: string;
  catchCopy: string;
  description: string;
  oneWord: string;
  actions: [string, string, string];
};

const personalityProfiles: Record<
  FortuneNumber,
  Omit<PersonalityResult, "destinyNumber">
> = {
  1: {
    soulName: "はじまりの灯火",
    catchCopy: "あなたは、静かに先頭に立てる人。",
    description:
      "人に見せないところで強く踏ん張ってきたこと、ちゃんと伝わっています。今のあなたは『自分らしく進む』ことを、どこまで許せていますか？あなたの決断力は、周りを照らす確かな光です。",
    oneWord: "急がなくても、あなたの一歩には始める力があります。",
    actions: ["朝に今日の優先順位を1つだけ決める", "小さな決断を先送りしない", "背筋を伸ばして深呼吸を3回する"],
  },
  2: {
    soulName: "月影の調律者",
    catchCopy: "あなたは、人の心をやわらかく受け止める人。",
    description:
      "気を配りすぎて疲れてしまう日もあったのではないでしょうか。最近、自分の気持ちにも同じやさしさを向けられていますか？その繊細さは弱さではなく、人を安心させる美しい才能です。",
    oneWord: "あなたのやさしさは、まず自分に向けても大丈夫です。",
    actions: ["返事の前に3秒だけ間をつくる", "好きな飲み物を丁寧に飲む時間を取る", "今日は無理な誘いを1つ断ってみる"],
  },
  3: {
    soulName: "祝福の歌い手",
    catchCopy: "あなたは、場に明るい流れを生み出す人。",
    description:
      "空気を軽くしてきたあなたの言葉に、救われた人がきっといます。最近は、自分の本音も同じように軽やかに表現できていますか？あなたの表現力は、人の心を前に進める力になります。",
    oneWord: "楽しいだけでなく、あなたの言葉には癒やす力もあります。",
    actions: ["感じたことを短くメモに残す", "好きな音楽を1曲かけて気分を整える", "誰かに一言だけ明るい言葉を送る"],
  },
  4: {
    soulName: "大地の守り手",
    catchCopy: "あなたは、静かに土台を整え続けられる人。",
    description:
      "目立たない役割でも誠実にやり切ってきたことが、あなたの強さです。今抱えている責任の中に、少し軽くできるものはありますか？その安定感は、周囲に深い信頼を生む大切な資質です。",
    oneWord: "積み重ねてきたものは、もう十分にあなたの力になっています。",
    actions: ["作業前に机の上を1分だけ整える", "今日終えることを3つ書き出す", "寝る前に『できたこと』を1つ振り返る"],
  },
  5: {
    soulName: "風を渡る旅人",
    catchCopy: "あなたは、変化の中で風をつかめる人。",
    description:
      "動き続ける中で、知らないうちに心が散らかることもありますよね。今のあなたに必要なのは、新しい刺激でしょうか、それともひと息でしょうか？あなたの自由さは、可能性を開く貴重な才能です。",
    oneWord: "揺れているように見える時ほど、あなたは次の扉に近づいています。",
    actions: ["散歩コースを少しだけ変える", "気になったことを1つ試してみる", "通知を10分だけ切って頭を休める"],
  },
  6: {
    soulName: "愛を育てる灯",
    catchCopy: "あなたは、愛情で人と場を整える人。",
    description:
      "誰かのために動くことが自然すぎて、自分を後回しにしてきたかもしれません。今日は『私が心地いいこと』を先に選べていますか？あなたの思いやりは、周囲に安心と温度を届ける力です。",
    oneWord: "やさしさを配る人ほど、自分を満たす時間が必要です。",
    actions: ["部屋の一角を心地よく整える", "自分のために温かい飲み物を用意する", "感謝していることを1つ言葉にする"],
  },
  7: {
    soulName: "静寂の賢者",
    catchCopy: "あなたは、静けさの中で本質を見抜く人。",
    description:
      "ひとりで考える時間が、あなたにとって大切な回復になっているはずです。最近は、心の声を落ち着いて聞ける時間を持てていますか？その洞察力は、迷いの中でも道筋を見つける大きな強みです。",
    oneWord: "あなたの静けさは、迷いではなく深く見るための力です。",
    actions: ["5分だけ一人で静かに座る", "気になる問いをノートに1つ書く", "情報を増やす前に今の感覚を言語化する"],
  },
  8: {
    soulName: "現実を築く王",
    catchCopy: "あなたは、現実を動かして形にできる人。",
    description:
      "結果を出すために、見えないところで努力を重ねてきたのではないでしょうか。今の目標は、あなた自身の心ともちゃんとつながっていますか？その実行力は、理想を現実へ連れていく頼もしい力です。",
    oneWord: "強く進めるあなたには、休むことも同じくらい価値があります。",
    actions: ["今日のゴールを数字で1つ決める", "終わった作業を見える形でチェックする", "一区切りごとに肩の力を抜く"],
  },
  9: {
    soulName: "終わりなき慈愛",
    catchCopy: "あなたは、広い視野で人を包み込める人。",
    description:
      "いろいろな立場を理解できるぶん、心が忙しくなることもありますよね。今は誰かの期待より、自分の本音を優先できていますか？あなたの包容力は、人にも自分にも深い癒やしをもたらします。",
    oneWord: "手放すやさしさも、あなたの大切な才能のひとつです。",
    actions: ["今日終えたい感情をノートに書く", "ひとつだけ『やらないこと』を決める", "空を見上げて呼吸をゆっくり整える"],
  },
};

const luminaMessages: Record<FortuneNumber, string> = {
  1: `あなたは、最初に火を灯す人。
まだ形のない場所に、
そっと一歩を踏み出せる勇気を持っています。

本当は不安もあるのに、
誰よりも先に決めてきたのではありませんか？

あなたの決断は、
誰かの道しるべになります。

迷いながらでもいい。火はもう灯っています。`,
  2: `あなたは、場の空気を整える人。
強く押さなくても、
あなたがいるだけで、なぜか穏やかになる。

本音を飲み込んでしまうこと、
ありませんか？

あなたのやさしさは力です。
でも、あなた自身も守られていい。

無理に合わせなくていい。あなたの静けさが基準です。`,
  3: `あなたは、空気を明るくする人。
言葉、笑顔、存在そのものが
誰かの救いになっています。

『ちゃんとしていなきゃ』と
自分を縛ることはありませんか？

あなたの軽やかさは、才能です。

楽しむことを、罪にしなくていい。`,
  4: `あなたは、揺れない土台。
派手さはなくても、
確実に積み重ねてきましたね。

弱さを見せないように
頑張りすぎていませんか？

あなたの誠実さは、
時間とともに光ります。

急がなくていい。あなたはもう築いている。`,
  5: `あなたは、変化を選べる人。
同じ場所に留まるよりも、
動くことで呼吸が整う。

でも、ときどき
落ち着かない自分を責めていませんか？

流れることは、逃げではありません。

動いていい。それがあなたの強さです。`,
  6: `あなたは、安心を生む人。
守ること、支えること、
自然にしてきたはずです。

でも、自分の疲れには
気づきにくいのではありませんか？

あなたの灯りは尊い。
まずはあなた自身を包んで。

あなたも、守られていい。`,
  7: `あなたは、深く潜る人。
答えを急がず、
静けさの中で考え続ける。

理解されない孤独を
感じたことはありませんか？

その深さは、強さです。

焦らなくていい。真実は静かに現れます。`,
  8: `あなたは、形にする人。
理想を夢で終わらせない。
現実に落とし込む力があります。

責任を背負いすぎて、
重たくなっていませんか？

あなたは支配者ではなく、創造者。

力は、誇っていい。`,
  9: `あなたは、包み込む人。
広く、深く、
すべてを理解しようとする。

でも、手放すことに
罪悪感を持っていませんか？

終わりは、優しさです。

抱えなくていい。愛は減りません。`,
};

type BasicPersonalitySection = {
  paragraphs: string[];
  pitfalls: [string, string, string];
  growthPoints: [string, string];
};

const basicPersonalitySections: Record<FortuneNumber, BasicPersonalitySection> = {
  1: {
    paragraphs: [
      "あなたは、何もないところに最初の一歩を置ける人です。\n迷いがあっても「まず動く」ことができる決断力と、自分の足で立とうとする強さを持っています。",
      "新しいことを始めるとき、あなたの中には不思議と火が灯ります。\n自分で道を選び、切り開いていくことに、自然な喜びを感じるタイプでしょう。",
      "一方で、頼るより先に抱え込みやすく、弱さを見せるのが少し苦手かもしれません。\n「自分がやらなきゃ」と思うほど、心の負担が増えることもあります。",
    ],
    pitfalls: [
      "助けを求める前に、一人で抱え込んでしまう",
      "決断が早いぶん、気持ちが追いつく前に走り出して疲れる",
      "うまくいかないと「自分の力が足りない」と厳しく責めてしまう",
    ],
    growthPoints: [
      "“頼ること”を弱さではなく、前に進むための選択として持つ",
      "走り出した後に、深呼吸して軌道修正する時間を意識的に作る",
    ],
  },
  2: {
    paragraphs: [
      "あなたは、場の空気の揺れを敏感に感じ取る人です。\n誰かが言葉にできない気持ちを察して、そっと整えることができます。",
      "強く主張しなくても、あなたがいるだけで安心する人がいます。\nそれはあなたが「相手の心が落ち着く場所」になれる人だからです。",
      "ただ、その優しさゆえに、自分の本音を後回しにしやすい傾向があります。\n気づいたら、心の中に小さな疲れが溜まっていることもあるでしょう。",
    ],
    pitfalls: [
      "合わせすぎて、自分が何を望んでいるか分からなくなる",
      "断ることに罪悪感を抱きやすい",
      "感情を飲み込み続けて、ある日急に限界が来る",
    ],
    growthPoints: [
      "“小さな本音”を言葉にする練習（短くていい）",
      "「今は休みたい」を予定に入れて、自分を守る",
    ],
  },
  3: {
    paragraphs: [
      "あなたは、言葉や表現で空気を明るくできる人です。\n笑顔、会話、発想——あなたの存在そのものが、場に軽やかさを運びます。",
      "ひらめきや好奇心が強く、心が動くものに出会うと一気に伸びます。\n楽しいこと、面白いことの中でこそ、本来の魅力が花開くタイプでしょう。",
      "ただ、気分が沈むと自分の良さを見失いやすく、\n「ちゃんとしなきゃ」と自分を縛るほど苦しくなることがあります。",
    ],
    pitfalls: [
      "気持ちが乗らないと自己否定が強くなる",
      "続ける前に飽きてしまい、罪悪感を抱く",
      "人を明るくしようとして、自分の疲れに気づきにくい",
    ],
    growthPoints: [
      "継続は“短く”でいい（3分でも毎日が勝ち）",
      "楽しさを取り戻すために、表現の場を小さくでも持つ",
    ],
  },
  4: {
    paragraphs: [
      "あなたは、揺れない土台をつくれる人です。\n派手さはなくても、確実に積み重ね、信頼を育てていく誠実さがあります。",
      "「当たり前のことを当たり前にやる」\nそれができる人は実は少なく、あなたの強さはそこにあります。",
      "ただし真面目さが強いほど、自分に厳しくなりやすい面も。\n少しのミスでも「もっと頑張らなきゃ」と背負い込んでしまうことがあるでしょう。",
    ],
    pitfalls: [
      "変化に慣れるまで時間がかかり、不安が大きくなる",
      "“ちゃんと”を求めすぎて、心が休まらない",
      "人の期待に応えようとして無理をする",
    ],
    growthPoints: [
      "7割でOKの日を作る（十分、立派）",
      "変化は一気にではなく「小さく試す」で慣れていく",
    ],
  },
  5: {
    paragraphs: [
      "あなたは、変化の中で呼吸が整う人です。\n新しい場所、新しい人、新しい体験が、あなたの感覚を目覚めさせます。",
      "「こうでなければ」に縛られない自由さがあり、\n状況に合わせて身軽に方向転換できる柔軟さを持っています。",
      "ただ、動けるぶん、落ち着けない自分を責めたり、\n続かないことに罪悪感を抱くこともあるかもしれません。",
    ],
    pitfalls: [
      "飽きると一気に手が止まり、自分を責める",
      "予定を詰めすぎて疲れる",
      "気分で決めて後悔することがある",
    ],
    growthPoints: [
      "“変わり続ける自分”を前提に、ゆるい軸を一つ持つ",
      "休む日を決めて、移動と回復のリズムを整える",
    ],
  },
  6: {
    paragraphs: [
      "あなたは、安心を育てる人です。\n守りたい人がいると力が湧き、相手の心が整うように自然と動けます。",
      "気配りや面倒見の良さがあり、\n人が安心できる“温度”を作れるタイプでしょう。",
      "ただ、優しさが強いほど「自分のことは後で」となりやすく、\n気づかないうちに疲れを溜めてしまうことがあります。",
    ],
    pitfalls: [
      "世話を焼きすぎて、自分の余裕がなくなる",
      "期待に応えようとして無理をする",
      "断れずに抱え込み、後で限界が来る",
    ],
    growthPoints: [
      "“自分を満たす時間”を先に確保する（最優先でOK）",
      "手放すことは冷たさではなく、信頼だと知る",
    ],
  },
  7: {
    paragraphs: [
      "あなたは、物事の奥にある意味を自然と探そうとする人です。\n表面的な答えでは満足できず、「なぜ」を静かに掘り下げていく探究心があります。",
      "ひとりの時間は、あなたにとって大切な回復です。\n静かな環境で思考を整理するとき、あなた本来の力が戻ってきます。",
      "感じたことをすぐに言葉にせず、内側で熟成させてから丁寧に伝えるタイプでしょう。\nそして少人数でも深くつながれる関係を大切にし、信頼が育つほど本音が出やすい傾向があります。",
    ],
    pitfalls: [
      "考えすぎて動けなくなる／心配が増える",
      "人に頼る前に一人で抱え込む",
      "“分かってもらえない”と感じると距離を取ってしまう",
    ],
    growthPoints: [
      "まとまってから話すより「途中でも共有」してみる",
      "深さを活かせる学び・研究・文章化が向く",
    ],
  },
  8: {
    paragraphs: [
      "あなたは、理想を“形”にできる人です。\n夢や目標をただ語るのではなく、現実として積み上げていく力があります。",
      "責任感が強く、結果を出すために必要な判断を下せるタイプでしょう。\n人に頼られるほど力を発揮します。",
      "ただ、背負えるぶん背負いすぎてしまい、\n「休む＝止まる」と感じてしまうことがあるかもしれません。",
    ],
    pitfalls: [
      "休むのが下手で、気づいた頃には限界が近い",
      "“成果”で自分の価値を測ってしまう",
      "強く見せようとして本音を隠す",
    ],
    growthPoints: [
      "委ねる・任せるを覚えるほど、器が広がる",
      "感情のケアを“仕事の一部”として扱う（成果が安定する）",
    ],
  },
  9: {
    paragraphs: [
      "あなたは、広く深く人を理解しようとする人です。\n相手の背景や痛みまで想像できる、あたたかな共感力があります。",
      "全体を見渡す視点があり、\n場の空気や流れを整える力も持っています。",
      "ただ、優しさが深いほど境界線が曖昧になり、\n抱えなくていいものまで背負ってしまうことがあります。",
    ],
    pitfalls: [
      "人の感情を自分のことのように抱え込む",
      "手放すことに罪悪感を持つ",
      "“優しくあるべき”で自分を縛ってしまう",
    ],
    growthPoints: [
      "区切りをつけることは冷たさではなく、愛の整理",
      "「自分の幸せ」を優先しても、優しさは減らない",
    ],
  },
};

function buildPersonalityResult(birthDate: string): PersonalityResult {
  const destinyNumber = destinyNumberFromBirthdate(birthDate);
  return {
    destinyNumber,
    ...personalityProfiles[destinyNumber],
  };
}

type BasicPersonalityClientProps = {
  serverBirthdate: string | null;
};

export default function BasicPersonalityPage({ serverBirthdate }: BasicPersonalityClientProps) {
  const [birthDate, setBirthDate] = useState(() => getInitialBirthdate(serverBirthdate));
  const [error, setError] = useState("");
  const [viewWithoutSaving, setViewWithoutSaving] = useState(false);
  const [result, setResult] = useState<PersonalityResult | null>(() => {
    if (!birthDate) return null;

    try {
      return buildPersonalityResult(birthDate);
    } catch {
      return null;
    }
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!birthDate) {
      setResult(null);
      setError("生年月日を入力してください。");
      return;
    }

    try {
      const nextResult = buildPersonalityResult(birthDate);
      if (!viewWithoutSaving) {
        localStorage.setItem(BIRTHDATE_STORAGE_KEY, birthDate);
      }
      setResult(nextResult);
    } catch {
      setResult(null);
      setError("正しい生年月日（YYYY-MM-DD）を入力してください。");
    }
  };

  const handleResetBirthdate = () => {
    localStorage.removeItem(BIRTHDATE_STORAGE_KEY);
    setBirthDate("");
    setError("");
    setResult(null);
  };

  return (
    <PageShell
      maxWidth="narrow"
      title="生年月日で占う（基本性格）"
      description="生年月日から運命数（1-9）を計算し、基本性格を表示します。"
      backHref="/"
      backLabel="トップへ戻る"
    >
      <GlassCard>

        {!result ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-base font-medium text-[#2e2a26]">
            生年月日（YYYY-MM-DD）
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="lumina-input mt-2 w-full rounded-lg px-4 py-3 text-base transition"
              required
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-[#544c42]">
            <input
              type="checkbox"
              checked={viewWithoutSaving}
              onChange={(event) => setViewWithoutSaving(event.target.checked)}
              className="h-4 w-4 accent-[#958cad]"
            />
            保存しないで見る
          </label>

          <LuminaButton type="submit" tone="primary">
            占う
          </LuminaButton>
          </form>
        ) : null}

        {error ? <p className="mt-4 text-base text-red-700">{error}</p> : null}

        {result ? (
          <section className="mt-6 space-y-4">
            {(() => {
              const basicPersonality = basicPersonalitySections[result.destinyNumber];
              return (
                <>
            <UnmeiVisual
              number={result.destinyNumber}
              variant="hero"
              title={`${fortuneNumberNames[result.destinyNumber]}の基本性格`}
              subtitle="あなたの魂の名前と、整え方のヒント"
              priority
            />
            <div className="overflow-hidden rounded-2xl border border-[#e1d5bf]/74 shadow-[0_14px_30px_-24px_rgba(82,69,53,0.24)]">
              <Image
                src={`/gazou/unmei/unmei${result.destinyNumber}.png`}
                alt={`${fortuneNumberNames[result.destinyNumber]}のイラスト`}
                width={720}
                height={400}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
            <GlassCard className="p-4 sm:p-5">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                <div className="shrink-0">
                  <p className="text-sm font-medium tracking-wide text-[#7d6d5a]">運命数</p>
                  <FortuneNumberBadge number={result.destinyNumber} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-[0.16em] text-[#847967]">SOUL NAME</p>
                  <h2 className="mt-1 text-2xl font-medium tracking-tight text-[#2e2a26] sm:text-[1.75rem]">
                    {result.soulName}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#544c42] sm:text-base">
                    {result.catchCopy}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 sm:p-5">
              <h3 className="text-sm font-medium tracking-wide text-[#2e2a26]">基本性格</h3>
              <div className="mt-3 space-y-4">
                {[
                  { title: "あなたの性質", text: basicPersonality.paragraphs[0] },
                  { title: "整う条件", text: basicPersonality.paragraphs[1] },
                  { title: "人との距離感", text: basicPersonality.paragraphs[2] },
                ].map((section) => (
                  <div
                    key={section.title}
                    className="rounded-xl border border-[#e1d5bf]/72 bg-white/70 p-4"
                  >
                    <h4 className="text-xs font-medium tracking-wide text-[#2e2a26] sm:text-sm">
                      {section.title}
                    </h4>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#544c42] sm:text-[15px]">
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <GlassCard className="p-4">
                  <p className="text-sm font-medium tracking-wide text-[#2e2a26]">つまずきやすい点</p>
                  <ul className="mt-3 space-y-2">
                    {basicPersonality.pitfalls.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm leading-relaxed text-[#544c42] transition hover:bg-white/70 sm:text-[15px]"
                      >
                        <span aria-hidden="true" className="mt-1 text-[10px] text-[#958cad]">
                          ✦
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>

                <GlassCard className="p-4">
                  <p className="text-sm font-medium tracking-wide text-[#2e2a26]">伸びるポイント</p>
                  <ul className="mt-3 space-y-2">
                    {basicPersonality.growthPoints.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm leading-relaxed text-[#544c42] transition hover:bg-white/70 sm:text-[15px]"
                      >
                        <span aria-hidden="true" className="mt-1 text-[10px] text-[#958cad]">
                          ✦
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </div>

            <GlassCard className="p-4 sm:p-5">
              <p className="text-sm font-medium tracking-wide text-[#2e2a26]">
                ルミナからのメッセージ
              </p>
              <blockquote className="mt-3 rounded-xl border-l-4 border-[#c4b8da] bg-[#f5f0ff]/55 p-4">
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#544c42]">
                  {luminaMessages[result.destinyNumber]}
                </p>
              </blockquote>
            </GlassCard>

            <GlassCard className="p-5">
              <span className="inline-flex items-center rounded-full border border-[#d2c4e7] bg-white/70 px-3 py-1 text-xs font-medium tracking-wide text-[#75658f]">
                今のあなたへのひとこと
              </span>
              <p className="mt-3 text-base font-medium leading-relaxed text-[#2e2a26]">
                {result.oneWord}
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-5">
              <h3 className="text-sm font-medium tracking-wide text-[#2e2a26]">開運アクション</h3>
              <ul className="mt-3 space-y-2">
                {result.actions.map((action) => (
                  <li
                    key={action}
                    className="flex items-start gap-3 rounded-xl px-2 py-2 text-[15px] leading-relaxed text-[#544c42] transition hover:bg-slate-50/40"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#d2c4e7] bg-[#f5f0ff] text-xs text-[#75658f]"
                    >
                      ✓
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <div className="flex flex-wrap gap-3">
              <LuminaButton asChild tone="secondary">
                <Link href="/profile">プロフィールを変更する</Link>
              </LuminaButton>
              <LuminaButton asChild tone="primary">
                <Link href="/consultation">個人鑑定を依頼する</Link>
              </LuminaButton>
            </div>
                </>
              );
            })()}
          </section>
        ) : null}
      </GlassCard>
    </PageShell>
  );
}
