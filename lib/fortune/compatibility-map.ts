import type { FortuneNumber } from "@/lib/fortune/types";

export type CompatibilityReading = {
  strengths: string;
  pitfalls: string;
  tips: string[];
  luminaMessage: string;
};

type NumberArchetype = {
  trait: string;
  strengthInLove: string;
  stressPoint: string;
  healingAction: string;
};

const archetypes: Record<FortuneNumber, NumberArchetype> = {
  1: {
    trait: "道を切り開く",
    strengthInLove: "関係を前進させる決断力",
    stressPoint: "答えを急ぎすぎる",
    healingAction: "結論を出す前に気持ちを言葉にする",
  },
  2: {
    trait: "気配を読む",
    strengthInLove: "相手の安心を育てる聞く力",
    stressPoint: "本音を後回しにする",
    healingAction: "短い本音を先に伝える",
  },
  3: {
    trait: "空気を明るくする",
    strengthInLove: "会話を温める表現力",
    stressPoint: "気分で距離が揺れる",
    healingAction: "一日一つ感謝を伝える",
  },
  4: {
    trait: "土台を整える",
    strengthInLove: "約束を守る誠実さ",
    stressPoint: "正しさに寄りすぎる",
    healingAction: "相手の気持ちを確認してから提案する",
  },
  5: {
    trait: "風をつかむ",
    strengthInLove: "関係に新鮮さを運ぶ柔軟さ",
    stressPoint: "自由を守ろうとして説明不足になる",
    healingAction: "予定変更は理由と一緒に共有する",
  },
  6: {
    trait: "愛を育てる",
    strengthInLove: "日常に安心をつくる包容力",
    stressPoint: "抱えすぎて疲れを隠す",
    healingAction: "自分の回復時間を先に確保する",
  },
  7: {
    trait: "本質を見抜く",
    strengthInLove: "深い理解で関係を支える洞察",
    stressPoint: "考えすぎて沈黙が長くなる",
    healingAction: "考え途中でも短く共有する",
  },
  8: {
    trait: "現実を動かす",
    strengthInLove: "未来設計を形にする実行力",
    stressPoint: "責任を背負いすぎる",
    healingAction: "役割分担を言語化して負荷を分ける",
  },
  9: {
    trait: "広く包み込む",
    strengthInLove: "違いを受け止める共感力",
    stressPoint: "相手の感情を抱え込みすぎる",
    healingAction: "境界線を丁寧に引く",
  },
};

type PairTemplate = {
  strengths: string;
  pitfalls: string;
  tips: string[];
  luminaMessage: string;
};

function toPairKey(a: FortuneNumber, b: FortuneNumber): string {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return `${min}-${max}`;
}

const pairTemplateMap: Record<string, PairTemplate> = {
  "1-7": {
    strengths: "進む力と深く考える力が合わさることで、勢いと慎重さのバランスが整う相性です。",
    pitfalls: "結論の速度に差が出ると、急かされた側は距離を取り、急ぎたい側は不安を抱えやすくなります。",
    tips: [
      "結論の期限を先に決める",
      "互いに一度ずつ『今の気持ち』を先に話す",
      "大事な話は夜遅くを避ける",
    ],
    luminaMessage: "急ぐ光と静かな光は、交わるほど澄んでいきます。歩幅をそろえる対話が鍵です。",
  },
  "2-6": {
    strengths: "思いやりが自然に循環し、安心感の高い関係を作りやすい組み合わせです。",
    pitfalls: "どちらも我慢が先に立つと、気づかない疲れが蓄積して突然重たくなりやすいです。",
    tips: [
      "週1回は『してほしいこと』を一つずつ言う",
      "気遣いを言語化して受け取り直す",
      "一人時間を予定として確保する",
    ],
    luminaMessage: "優しさは与えるだけでなく、受け取ることで深まります。",
  },
  "3-5": {
    strengths: "変化と楽しさを共有しやすく、軽やかに距離を縮められる相性です。",
    pitfalls: "勢いで進みすぎると、すれ違いの原因を確認しないまま流してしまう傾向があります。",
    tips: [
      "予定変更時は一言メモでも共有する",
      "月に一度は落ち着いて振り返る時間を作る",
      "楽しい話と同じ熱量で不安も話す",
    ],
    luminaMessage: "笑い合える関係ほど、静かな確認が未来を守ります。",
  },
};

export function getCompatibilityReading(
  myNumber: FortuneNumber,
  partnerNumber: FortuneNumber
): CompatibilityReading {
  const key = toPairKey(myNumber, partnerNumber);
  const mapped = pairTemplateMap[key];
  if (mapped) {
    return mapped;
  }

  const me = archetypes[myNumber];
  const partner = archetypes[partnerNumber];

  return {
    strengths: `あなたの「${me.trait}」と相手の「${partner.trait}」が噛み合うと、${me.strengthInLove}と${partner.strengthInLove}が互いを支え合います。`,
    pitfalls: `一方で、あなたは${me.stressPoint}、相手は${partner.stressPoint}が出ると、気持ちの温度差が生まれやすくなります。`,
    tips: [me.healingAction, partner.healingAction, "週に一度、今週の嬉しかったことを伝え合う"],
    luminaMessage: "違いは壁ではなく、灯りの角度です。互いの光を知るほど、関係はやさしく強くなります。",
  };
}
