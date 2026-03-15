import { drawTarotSpread } from "@/lib/tarot/deck";
import { findTarotCardByJaName } from "@/src/data/tarotCards";
import { buildFukuenFrame, type InterpretationFrame } from "@/lib/ai/interpretation-frame";

export const FUKUEN_QUESTION_CHIPS = [
  "元彼は今私をどう思っていますか？",
  "私たちは復縁できますか？",
  "あの人は私をまだ想っていますか？",
  "復縁のタイミングはありますか？",
  "この縁はまだ続いていますか？",
  "あの人に今、新しい相手はいますか？",
  "ブロックが解除される可能性はありますか？",
  "もう一度信じ合える関係になれますか？",
  "別れてから気持ちが変わりましたか？",
  "あの人は後悔していますか？",
] as const;

type DrawnCard = ReturnType<typeof drawTarotSpread>[number];

export type FukuenReading = {
  question: string;
  cardName: string;
  cardMeaning: string;
  cardImagePath: string;
  isReversed: boolean;
  intro: string;
  cardSection: string;
  partnerEcho: string;
  partnerFeeling: string;
  possibility: string;
  futureAdvice: string;
  luminaMessage: string;
  shortMessage: string;
  fateTone: string;
  reunionLabel: string;
  guidanceLabel: string;
  /** Structured interpretation frame for Claude enhancement */
  interpretationFrame: InterpretationFrame;
};

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash || 1;
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickBySeed<T>(items: readonly T[], seed: number, offset = 0): T {
  const index = (seed + offset) % items.length;
  return items[index]!;
}

function buildIntro() {
  return ["白の魔女ルミナです。", "二人の縁を光の導きタロットに問いかけてみました。"].join("\n");
}

function buildCardSection(card: DrawnCard, seed: number) {
  const lead = `今現れたカードは「${card.card.nameJa}」。`;
  const base = `このカードは\n\n${card.reversed ? card.card.reversedMeaning : card.card.uprightMeaning}\n\nを示しています。`;
  const nuance = card.reversed
    ? pickBySeed(
        [
          "今は気持ちが揺れやすく、縁の流れもまっすぐではない時期かもしれません。",
          "心は残っていても、まだ整理が追いついていない気配があります。",
        ],
        seed,
        3,
      )
    : pickBySeed(
        [
          "離れていてもなお、二人の間に残る感情や学びが静かに息づいています。",
          "過去のつながりが、今も完全には消えていないことを示すカードです。",
        ],
        seed,
        5,
      );

  return `${lead}\n\n${base}\n${nuance}`;
}

function buildPartnerEcho(card: DrawnCard, seed: number) {
  if (card.reversed) {
    return pickBySeed(
      [
        "懐かしさや未練はあっても、それをどう受け止めるか迷っているようです。",
        "心に残る想いはあるものの、過去を振り返ることに慎重になっているようです。",
        "あなたを思い出す瞬間はあっても、気持ちを動かすにはまだ揺れがあるようです。",
      ],
      seed,
      7,
    );
  }

  return pickBySeed(
    [
      "やさしい記憶とともに、今もあなたを特別な存在として思い返している可能性があります。",
      "離れたあとも、心のどこかにあなたへの温かな感情が残っているようです。",
      "完全に終わったとは思いきれず、静かに縁を感じている気配があります。",
    ],
    seed,
    11,
  );
}

function buildPartnerFeeling(card: DrawnCard, seed: number) {
  /* 「あの人の心には〜が残っている」構文に埋め込む名詞句 */
  const echoPhrase = card.reversed
    ? pickBySeed(
        [
          "懐かしさや割り切れない想い",
          "あなたとの記憶への未練",
          "手放しきれなかった温もり",
        ],
        seed,
        7,
      )
    : pickBySeed(
        [
          "あなたとの温かい記憶",
          "特別な存在としてのあなたへの想い",
          "静かに残り続けている縁の感覚",
        ],
        seed,
        7,
      );

  const coreSentence = `あの人の心には\n\n${echoPhrase}\n\nが残っている可能性があります。`;

  if (card.reversed) {
    const caveat = pickBySeed(
      [
        "ただし、その想いはまだ過去の痛みや迷いと一緒に揺れているかもしれません。",
        "今は気持ちよりも現実的な不安が前に出やすいタイミングです。",
      ],
      seed,
      13,
    );
    return `${coreSentence}\n${caveat}`;
  }

  return pickBySeed(
    [
      coreSentence,
      "あの人の中では、思い出がやさしく形を変えながら、今も心に触れています。",
    ],
    seed,
    17,
  );
}

function buildPossibility(card: DrawnCard, seed: number) {
  const flow = card.reversed
    ? pickBySeed(
        [
          "すぐに戻るよりも、まず時間と整理を必要とする",
          "縁は残っていても、今は慎重に見守るべき",
          "再会のきっかけはあるが、急ぐと遠のきやすい",
        ],
        seed,
        19,
      )
    : pickBySeed(
        [
          "ゆっくりと再びつながり直せる",
          "やさしい形で再会へ向かいやすい",
          "縁の流れがもう一度動き出しやすい",
        ],
        seed,
        23,
      );

  const tail = card.reversed
    ? "焦って答えを出すより、心を整えながら流れを待つことが大切です。"
    : "無理に急がず、自然なタイミングを受け取ることで可能性は育っていくでしょう。";

  return `二人の関係は\n\n${flow}\n\nの流れの中にあるようです。\n${tail}`;
}

function buildFutureAdvice(card: DrawnCard, seed: number) {
  const advice = card.reversed
    ? pickBySeed(
        [
          "過去の悲しみを静かに癒すこと",
          "連絡や行動を急がず、自分の心を整えること",
          "答えを求めすぎず、縁の呼吸を待つこと",
        ],
        seed,
        29,
      )
    : pickBySeed(
        [
          "やわらかな気持ちで縁を信じること",
          "自分らしさを取り戻しながら再会の流れを待つこと",
          "懐かしさを責めず、今の自分を丁寧に育てること",
        ],
        seed,
        31,
      );

  return `今は\n\n${advice}\n\nが大切な時期かもしれません。`;
}

function buildLuminaMessage() {
  return [
    "縁というものは、",
    "時に離れてもまた巡り合うことがあります。",
    "",
    "焦らず心を整えることで、",
    "二人の物語が再び動き出すこともあります。",
  ].join("\n");
}

function buildFateTone(card: DrawnCard) {
  if (card.reversed) return "切れずに揺れている";
  if (card.card.arcana === "major") return "深く結ばれた余韻がある";
  switch (card.card.suit) {
    case "cups":
      return "想いがまだ残っている";
    case "wands":
      return "再会の火種がある";
    case "swords":
      return "整理の途中にある";
    case "pentacles":
    default:
      return "静かな縁が続いている";
  }
}

function buildReunionLabel(card: DrawnCard) {
  if (card.reversed) return "今は待つ流れ";
  if (card.card.arcana === "major") return "巡り直す可能性あり";
  switch (card.card.suit) {
    case "cups":
      return "感情の再会が近い";
    case "wands":
      return "きっかけ待ち";
    case "swords":
      return "対話の準備が必要";
    case "pentacles":
    default:
      return "ゆっくり戻る";
  }
}

function buildGuidanceLabel(card: DrawnCard) {
  if (card.reversed) return "急がず癒しを優先";
  if (card.card.arcana === "major") return "縁を信じて整える";
  switch (card.card.suit) {
    case "cups":
      return "感情をやさしく保つ";
    case "wands":
      return "軽いきっかけを待つ";
    case "swords":
      return "気持ちを整理する";
    case "pentacles":
    default:
      return "時間を味方にする";
  }
}

export function getFukuenReading(question: string): FukuenReading {
  const normalizedQuestion = question.trim();

  if (!normalizedQuestion) {
    throw new Error("question is required");
  }

  const seed = hashString(normalizedQuestion);
  const random = createSeededRandom(seed);
  const drawn = drawTarotSpread(random, undefined)[0];

  if (!drawn) {
    throw new Error("failed to draw tarot card");
  }

  const cardImage = findTarotCardByJaName(drawn.card.nameJa);

  return {
    question: normalizedQuestion,
    cardName: drawn.card.nameJa,
    cardMeaning: drawn.reversed ? drawn.card.reversedMeaning : drawn.card.uprightMeaning,
    cardImagePath: cardImage?.imagePath ?? "/cards/00-the-fool.png",
    isReversed: drawn.reversed,
    intro: buildIntro(),
    cardSection: buildCardSection(drawn, seed),
    partnerEcho: buildPartnerEcho(drawn, seed),
    partnerFeeling: buildPartnerFeeling(drawn, seed),
    possibility: buildPossibility(drawn, seed),
    futureAdvice: buildFutureAdvice(drawn, seed),
    luminaMessage: buildLuminaMessage(),
    shortMessage: pickBySeed(
      [
        "縁は消えるより、静かに形を変えて残ることがあります。",
        "今は答えを急がず、再会できる自分を整える時です。",
        "やさしい余白が戻るとき、縁もまた動きやすくなります。",
      ],
      seed,
      37,
    ),
    fateTone: buildFateTone(drawn),
    reunionLabel: buildReunionLabel(drawn),
    guidanceLabel: buildGuidanceLabel(drawn),
    interpretationFrame: buildFukuenFrame(
      { arcana: drawn.card.arcana, suit: drawn.card.arcana === "minor" ? drawn.card.suit : undefined, reversed: drawn.reversed },
      seed,
    ),
  };
}
