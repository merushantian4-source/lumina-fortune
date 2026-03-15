import { drawTarotSpread } from "@/lib/tarot/deck";
import { findTarotCardByJaName } from "@/src/data/tarotCards";
import { buildKataomoiFrame, type InterpretationFrame } from "@/lib/ai/interpretation-frame";

export const KATAOMOI_QUESTION_CHIPS = [
  "この恋は成就する可能性がありますか？",
  "この恋が動き出すタイミングはいつですか？",
  "あの人との距離はこれから近づいていきますか？",
  "今この恋はどんな流れの中にありますか？",
  "この恋、あきらめた方がいいですか？",
  "あの人には私よりも親しい人がいますか？",
  "私から連絡しても大丈夫ですか？",
  "告白するべきですか？",
  "付き合えますか？",
  "連絡が減ったのはなぜですか？",
  "あの人にとって特別な存在になれますか？",
  "あの人は私の気持ちに気が付いてますか？",
] as const;

type DrawnCard = ReturnType<typeof drawTarotSpread>[number];

export type KataomoiReading = {
  question: string;
  cardName: string;
  cardMeaning: string;
  cardImagePath: string;
  isReversed: boolean;
  intro: string;
  status: string;
  partnerFeeling: string;
  future: string;
  timing: string;
  timingShort: string;
  progressLabel: string;
  keyAction: string;
  advice: string;
  message: string;
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

function cardAxis(card: DrawnCard) {
  if (card.card.arcana === "major") {
    return card.reversed
      ? "大きな流れは来ていますが、相手も自分も気持ちの整理に時間が必要な段階です。"
      : "この恋にははっきりした意味があり、心が動く節目が近づいています。";
  }

  switch (card.card.suit) {
    case "cups":
      return card.reversed
        ? "感情はあるのに、うまく言葉や態度にできないもどかしさがにじんでいます。"
        : "気持ちの交流が育ちやすく、相手の中にもやわらかな関心があります。";
    case "wands":
      return card.reversed
        ? "勢いはあるのに噛み合わず、タイミングのずれが起きやすい時期です。"
        : "流れを動かす熱があり、きっかけひとつで一歩進みやすい状態です。";
    case "swords":
      return card.reversed
        ? "考えすぎや不安が先に立ち、本音が見えにくくなっています。"
        : "状況を見極める力が強く、冷静さの中に本気度が隠れています。";
    case "pentacles":
    default:
      return card.reversed
        ? "気持ちは急いでいません。形になるまで慎重に確かめたい空気があります。"
        : "派手さはなくても、少しずつ安心感を積み上げていける恋です。";
  }
}

function buildIntro(card: DrawnCard) {
  return [
    `今回のカードは「${card.card.nameJa}」でした。`,
    cardAxis(card),
    "片思いは答えを急ぐほど苦しくなりやすいものですが、今の流れを知ることで動き方が見えてきます。",
  ].join("\n");
}

function buildStatus(card: DrawnCard, seed: number) {
  const majorUpright = [
    "この恋は止まっているようでいて、水面下では確かに意味のある変化が進んでいます。\n今は派手な出来事より、心の向きが整っていくことが大切です。",
    "運命的な縁の気配があります。ただし、焦って結果だけを求めるより、丁寧に距離を縮めるほど流れが味方します。",
  ] as const;
  const majorReversed = [
    "縁そのものが消えたわけではありませんが、今は思い込みや不安が流れを曇らせやすい時期です。\nまずは気持ちを整え、相手を見失わないことが大切です。",
    "進展が遅く感じられても、それは悪い兆しではなく準備の時間です。\n急いで結論を出すより、落ち着いて空気を読み直すほど良い流れに戻れます。",
  ] as const;
  const cups = [
    "恋の中心にはちゃんと感情があります。相手もあなたの存在をやわらかく意識し始めています。",
    "心の交流は生まれやすい時期です。無理に関係を定義せず、安心できる会話を増やすほど恋が育ちます。",
  ] as const;
  const wands = [
    "動き出す力は十分あります。きっかけを待つだけでなく、軽やかな一歩が流れを変えます。",
    "勢いのある恋です。ただし、熱量だけで押すより、相手のペースも尊重した方がうまく進みます。",
  ] as const;
  const swords = [
    "今の恋は気持ちよりも考えが先に立ちやすい状況です。\n不安の想像だけで結論を決めないことが重要です。",
    "相手は状況を冷静に見ています。誠実さのあるやり取りが信頼につながります。",
  ] as const;
  const pentacles = [
    "大きな進展はゆっくりでも、現実に根づく恋になりやすい流れです。",
    "目立った動きが少なくても、日常の積み重ねがそのまま恋の土台になります。",
  ] as const;
  const reversedTail = [
    "ただ、今は受け取り方が少し不安寄りになりやすいので、事実より想像を大きくしすぎないようにしてください。",
    "迷いがあるときほど、相手の反応を一つずつ静かに見直すことが流れの修復につながります。",
  ] as const;

  if (card.card.arcana === "major") {
    return pickBySeed(card.reversed ? majorReversed : majorUpright, seed, 3);
  }

  const base =
    card.card.suit === "cups"
      ? pickBySeed(cups, seed, 5)
      : card.card.suit === "wands"
        ? pickBySeed(wands, seed, 7)
        : card.card.suit === "swords"
          ? pickBySeed(swords, seed, 11)
          : pickBySeed(pentacles, seed, 13);

  return card.reversed ? `${base}\n${pickBySeed(reversedTail, seed, 17)}` : base;
}

function buildPartnerFeeling(card: DrawnCard, seed: number) {
  const reversed = [
    "相手はあなたを意識していないわけではありません。ただ、自分の中の事情や迷いがあり、気持ちを外に出す余裕が少ないようです。\nそのため反応が薄く見えても、即座に脈なしと決める必要はありません。",
    "あなたへの関心はありつつも、今は慎重さが勝っています。\n気持ちを見せることで関係が変わることを少し怖がっている可能性があります。",
    "相手の心は揺れています。興味がゼロではなく、どう向き合うべきかをまだ決めきれていない印象です。",
  ] as const;

  const warm = [
    "相手の中には、あなたに対する好意や安心感が育っています。\nまだはっきり言葉にしていなくても、一緒にいると心地よい存在だと感じているでしょう。",
    "あなたのやさしさや雰囲気に、相手はちゃんと気づいています。\n恋愛として意識する手前の、あたたかな関心が強まっています。",
    "相手はあなたとのやり取りに前向きです。もっと知りたい、もう少し近づきたいという気持ちが芽生えています。",
  ] as const;

  const cool = [
    "相手はあなたを気にしつつも、感情より状況を優先して見ています。\n誠実さや落ち着きが伝わるほど、恋愛感情へと傾きやすくなります。",
    "今は気持ちを隠しやすいタイプの反応です。\n表に出る言葉が少なくても、内側ではしっかり見ています。",
  ] as const;

  if (card.reversed) {
    return pickBySeed(reversed, seed, 19);
  }

  if (card.card.arcana === "major" || card.card.suit === "cups") {
    return pickBySeed(warm, seed, 23);
  }

  return pickBySeed(cool, seed, 29);
}

function buildFuture(card: DrawnCard, seed: number) {
  const reversed = [
    "この先すぐに大きく動くというより、いったん気持ちや距離感を整える時間が必要になりそうです。\n無理に進めるより、自然な会話を続ける方が次のチャンスを呼び込みます。",
    "進展は遅めでも、ここで丁寧に関係を扱えば流れは持ち直します。\n焦って答えを求めると空回りしやすいので、安心感を育てることを優先してください。",
  ] as const;

  const major = [
    "この恋は節目を迎えやすく、近いうちに関係性の意味がはっきりしてくるでしょう。\nあなたが自然体でいるほど、相手も本音を見せやすくなります。",
    "未来には前向きな変化が見えています。小さなきっかけが一気に空気を変える可能性があります。",
  ] as const;

  const normal = [
    "これからの流れは悪くありません。少しずつでも会話や接点を重ねることで、恋は現実的に前へ進みます。",
    "今の片思いは育てるほど形になりやすい運びです。\n一度の反応で判断せず、継続の力を信じることが未来を明るくします。",
    "急展開よりも、確かな前進が見えます。相手との空気がやわらぐほど、恋愛の可能性も自然に高まります。",
  ] as const;

  if (card.reversed) {
    return pickBySeed(reversed, seed, 31);
  }

  if (card.card.arcana === "major") {
    return pickBySeed(major, seed, 37);
  }

  return pickBySeed(normal, seed, 41);
}

function buildTiming(card: DrawnCard, seed: number) {
  if (card.card.arcana === "major") {
    return card.reversed
      ? pickBySeed(
          [
            "タイミングは少し遅れ気味です。数日から数週間の間に気持ちの整理が入り、そのあとで動きやすくなります。\n今すぐ答えを出すより、相手の反応を見ながら待つ姿勢が合っています。",
            "大きく動く前に、気持ちを落ち着ける時間が必要です。\n急がず整えたあとに訪れる機会の方が、恋を育てやすいでしょう。",
          ],
          seed,
          43,
        )
      : pickBySeed(
          [
            "タイミングは近いです。数日から一か月ほどの間に、会話や距離感が変わるきっかけが入りやすいでしょう。\n軽い行動を起こすなら今は悪くありません。",
            "流れは少しずつ開いています。相手と自然に接する機会を増やすほど、恋の手応えを感じやすくなります。",
          ],
          seed,
          47,
        );
  }

  switch (card.card.suit) {
    case "wands":
      return "動きは早めです。勢いのあるやり取りや、突然の接点から進展しやすい時期です。";
    case "cups":
      return "気持ちがやわらぐ場面で流れが進みます。やさしい会話や落ち着いた時間が鍵になります。";
    case "swords":
      return "まずは考えや誤解を整理する時間が必要です。言葉選びを丁寧にすると、そのあとで流れが開きます。";
    case "pentacles":
    default:
      return "タイミングはゆっくりです。日常の積み重ねの先で、安心感とともに関係が深まりやすくなります。";
  }
}

function buildTimingShort(card: DrawnCard) {
  if (card.card.arcana === "major") {
    return card.reversed ? "少し待って整える時期" : "近いうちに流れが動く";
  }
  if (card.card.suit === "wands") return "早めに動きやすい";
  if (card.card.suit === "cups") return "やさしく進む流れ";
  if (card.card.suit === "swords") return "整理のあとで進展";
  return "ゆっくり育つ時期";
}

function buildProgressLabel(card: DrawnCard) {
  if (card.reversed) return "気持ちを整える段階";
  if (card.card.arcana === "major") return "運命の流れが強まる時";
  if (card.card.suit === "cups") return "心の距離が縮む途中";
  if (card.card.suit === "wands") return "動き出しの気配";
  if (card.card.suit === "swords") return "見極めながら前進";
  return "安心を育てる流れ";
}

function buildKeyAction(card: DrawnCard) {
  if (card.reversed) return "焦らず、受け取り方を整える";
  if (card.card.arcana === "major") return "自然体で縁の流れに乗る";
  if (card.card.suit === "cups") return "やさしい言葉を増やす";
  if (card.card.suit === "wands") return "小さくても一歩動く";
  if (card.card.suit === "swords") return "考えすぎず本音を見る";
  return "日常の信頼を積み重ねる";
}

function buildAdvice(card: DrawnCard, seed: number) {
  const reversed = [
    "今は恋そのものより、あなたの心を整えることが先です。\n相手の一つ一つの反応に振り回されず、自分が安心できる距離感を保ってください。",
    "思い込みで苦しくなりやすい時です。事実と想像を分けて受け取り、静かに流れを見直すことが恋を守ります。",
  ] as const;

  const normal = [
    "あなたの魅力は、無理をしない自然なやさしさの中にあります。\n相手に合わせすぎず、自分らしい言葉と表情を大切にしてください。",
    "恋を進めたいなら、結果を急がず接点を丁寧に増やすことです。\n一度の反応より、関係全体の空気を見るほど良い判断ができます。",
    "気持ちを抱え込みすぎず、軽やかに関わることが鍵です。\n安心感のある雰囲気が、相手の心を開くきっかけになります。",
  ] as const;

  return pickBySeed(card.reversed ? reversed : normal, seed, 53);
}

function buildMessage(card: DrawnCard) {
  if (card.reversed) {
    return "恋がゆっくりに感じられる日は、流れが止まっているのではなく整っている途中です。自分の心をやさしく守るほど、次の答えは見えやすくなります。";
  }

  if (card.card.arcana === "major") {
    return "この恋には意味があります。急がず信じて進むことで、必要な出来事がきちんとあなたの前に現れてきます。";
  }

  return "片思いは、小さなあたたかさの積み重ねで景色が変わります。今日できるやさしい一歩を大切にしてください。";
}

export function getKataomoiReading(question: string): KataomoiReading {
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
    intro: buildIntro(drawn),
    status: buildStatus(drawn, seed),
    partnerFeeling: buildPartnerFeeling(drawn, seed),
    future: buildFuture(drawn, seed),
    timing: buildTiming(drawn, seed),
    timingShort: buildTimingShort(drawn),
    progressLabel: buildProgressLabel(drawn),
    keyAction: buildKeyAction(drawn),
    advice: buildAdvice(drawn, seed),
    message: buildMessage(drawn),
    interpretationFrame: buildKataomoiFrame(
      { arcana: drawn.card.arcana, suit: drawn.card.arcana === "minor" ? drawn.card.suit : undefined, reversed: drawn.reversed },
      seed,
    ),
  };
}
