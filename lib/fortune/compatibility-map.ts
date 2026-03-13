import type { FortuneNumber } from "@/lib/fortune/types";

export type CompatibilityReading = {
  strengths: string;
  pitfalls: string;
  tips: string[];
  luminaMessage: string;
};

type NumberArchetype = {
  aura: string;
  gift: string;
  challenge: string;
  request: string;
  partnerTip: string;
};

type PairMood = {
  bond: string;
  caution: string;
  message: string;
};

const archetypes: Record<FortuneNumber, NumberArchetype> = {
  1: {
    aura: "前へ進む力がまっすぐで、思いを形にするのが早い人",
    gift: "関係に新しい風を入れて、迷いを晴らしていく",
    challenge: "答えを急ぎたくなる",
    request: "気持ちを言葉にする前に、ひと呼吸おいてみる",
    partnerTip: "率直な言葉で安心を返してあげること",
  },
  2: {
    aura: "気配をやわらかく読み取り、心の揺れに気づける人",
    gift: "相手の感情を受け止め、場の空気を穏やかに整える",
    challenge: "本音を胸の奥にしまいこみやすくなる",
    request: "遠慮より先に、小さな本音をひとつ渡してみる",
    partnerTip: "急がせず、やわらかく話を聞いてあげること",
  },
  3: {
    aura: "明るさと遊び心で、心の扉をふっと開ける人",
    gift: "重くなりすぎた空気をほどき、笑顔を呼び戻す",
    challenge: "気分の波で言葉が散らばりやすくなる",
    request: "楽しい気持ちと同じくらい、大切な話も丁寧に残す",
    partnerTip: "まず反応を返し、気持ちを受け止めてあげること",
  },
  4: {
    aura: "静かな誠実さで、関係を着実に育てていく人",
    gift: "約束や日々の積み重ねで信頼を深めていく",
    challenge: "正しさを守ろうとして気持ちが固くなる",
    request: "結論だけでなく、気持ちの背景も添えて伝える",
    partnerTip: "誠実さに気づいたら、きちんと言葉で返すこと",
  },
  5: {
    aura: "自由な感性で流れを変え、停滞を動かせる人",
    gift: "関係に軽やかさをもたらし、新しい景色を見せる",
    challenge: "縛られる気配に敏感になりすぎる",
    request: "距離を取りたくなった理由を、短くても言葉にする",
    partnerTip: "選べる余白を残しながら気持ちを伝えること",
  },
  6: {
    aura: "ぬくもり深く、愛情を形にして差し出せる人",
    gift: "相手を守り、安心できる居場所を育てる",
    challenge: "気づかないうちに抱え込みすぎる",
    request: "優しさと一緒に、無理しているサインも伝える",
    partnerTip: "感謝や愛情を、その場でまっすぐ返すこと",
  },
  7: {
    aura: "静かな洞察で物事の奥を見つめる、月影のような人",
    gift: "感情の深いところに光を当て、関係に意味を与える",
    challenge: "考え込みすぎて言葉が遅くなる",
    request: "答えがまとまる前でも、今の気持ちだけは知らせる",
    partnerTip: "ひとりの時間を急かさず見守ること",
  },
  8: {
    aura: "頼もしさと実行力で、未来を現実へ引き寄せる人",
    gift: "夢を具体的な形にし、ふたりの歩幅を整える",
    challenge: "正面から強く進めすぎてしまう",
    request: "結論を示す前に、相手の気持ちを先に確かめる",
    partnerTip: "任せたいことは、信頼の言葉と一緒に渡すこと",
  },
  9: {
    aura: "大きな優しさで包み込み、心の痛みに寄り添える人",
    gift: "違いを受け止め、関係に深い温度を与える",
    challenge: "我慢を重ねて限界まで黙ってしまう",
    request: "優しさの中に、譲れない気持ちもそっと置く",
    partnerTip: "気持ちを決めつけず、静かに受け止めてあげること",
  },
};

function getPairMood(a: FortuneNumber, b: FortuneNumber): PairMood {
  if (a === b) {
    return {
      bond: "似た波長で心が通いやすく、言葉にしなくても気配を感じ取りやすい",
      caution: "気持ちが似ているぶん、沈黙や迷いまで重なりやすい",
      message:
        "同じ灯りを持つふたりだからこそ、言葉にすることで絆はさらに澄んでいきます。",
    };
  }

  const diff = Math.abs(a - b);

  if (a + b === 10) {
    return {
      bond: "違う個性が美しく補い合い、欠けたところを自然に埋め合える",
      caution:
        "役割が分かれやすいぶん、どちらかだけが頑張っている気持ちになりやすい",
      message:
        "星と月がめぐり合うような相性です。違いを恐れないほど、ふたりの光は深まります。",
    };
  }

  if (diff <= 2) {
    return {
      bond: "感性の距離が近く、日々の小さな出来事を分かち合いやすい",
      caution:
        "似た悩みを抱えやすく、余裕がない日は視野が狭くなりやすい",
      message:
        "寄り添いやすいふたりです。近さに甘えず、丁寧に気持ちを重ねるほど安らぎが育ちます。",
    };
  }

  return {
    bond: "異なるリズムが刺激となり、お互いに新しい景色を見せ合える",
    caution:
      "大切にしたいものの順番がずれると、心のテンポが合いにくくなる",
    message:
      "歩幅の違いは、ふたりだけの物語を深くする余白です。合わせようとする優しさが、未来を照らします。",
  };
}

function buildStrengths(me: NumberArchetype, partner: NumberArchetype, mood: PairMood): string {
  return [
    `あなたは${me.aura}。お相手は${partner.aura}です。`,
    `あなたが${me.gift}ことと、お相手が${partner.gift}ことが響き合うと、${mood.bond}関係を育てやすいでしょう。`,
    "どちらかが無理に合わせなくても、それぞれの持ち味が自然に支え合いへ変わっていく相性です。",
  ].join(" ");
}

function buildPitfalls(me: NumberArchetype, partner: NumberArchetype, mood: PairMood): string {
  return [
    `ただ、あなたが${me.challenge}とき、お相手も${partner.challenge}と、すれ違いは静かに生まれやすくなります。`,
    `${mood.caution}ため、言わなくても伝わるはずと思い込まないことが大切です。`,
    "少しだけ立ち止まり、今の気持ちを確かめ合うだけでも、関係の空気はやわらかく整っていきます。",
  ].join(" ");
}

function buildTips(me: NumberArchetype, partner: NumberArchetype): string[] {
  return [
    `まずは、${me.request}。`,
    `お相手には、${partner.partnerTip}。`,
    "答えを急がず、うれしかったことを一日ひとつ伝え合いましょう。",
  ];
}

function buildLuminaMessage(mood: PairMood): string {
  return `魂の名が響き合うとき、ふたりのあいだには小さな灯火がともります。 ${mood.message}`;
}

export function getCompatibilityReading(
  myNumber: FortuneNumber,
  partnerNumber: FortuneNumber,
): CompatibilityReading {
  const me = archetypes[myNumber];
  const partner = archetypes[partnerNumber];
  const mood = getPairMood(myNumber, partnerNumber);

  return {
    strengths: buildStrengths(me, partner, mood),
    pitfalls: buildPitfalls(me, partner, mood),
    tips: buildTips(me, partner),
    luminaMessage: buildLuminaMessage(mood),
  };
}
