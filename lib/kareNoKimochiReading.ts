import { drawTarotSpread } from "@/lib/tarot/deck";
import { findTarotCardByJaName } from "@/src/data/tarotCards";
import { buildKareNoKimochiFrame, type InterpretationFrame } from "@/lib/ai/interpretation-frame";

export const KARE_NO_KIMOCHI_QUESTION_CHIPS = [
  "今あの人は私をどう思っていますか？",
  "あの人の心の中に私はまだいますか？",
  "あの人は私を恋愛対象として見ていますか？",
  "あの人は今、私に会いたいと思っていますか？",
  "あの人の本音を教えてください。",
  "あの人は今、何に悩んでいますか？",
  "あの人は今、寂しいと感じていますか？",
  "あの人は今、幸せですか？",
  "私がいなくなったら気づきますか？",
  "連絡してこない本当の理由は何ですか？",
] as const;

type DrawnCard = ReturnType<typeof drawTarotSpread>[number];

export type KareNoKimochiReading = {
  question: string;
  cardName: string;
  cardMeaning: string;
  cardImagePath: string;
  isReversed: boolean;
  intro: string;
  cardInterpretation: string;
  partnerEmotion: string;
  partnerFeeling: string;
  relationshipFlow: string;
  luminaMessage: string;
  shortMessage: string;
  heartTone: string;
  distanceLabel: string;
  guidanceLabel: string;
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

/** 相談内容から現実的配慮が必要なケースを検出する */
function detectRealisticContext(question: string): {
  needsRealism: boolean;
  isMarried: boolean;
  longNoContact: boolean;
  longNoMeet: boolean;
} {
  const isMarried = /既婚|結婚して(いる|る|た)|奥さん|妻|旦那|夫|嫁/.test(question);
  const longNoContact = /連絡.*(ない|ない|途絶|取れ)|音信不通|ブロック|既読.*(つかない|無視)|未読/.test(question);
  const longNoMeet =
    /([5-9]|[1-9]\d)年.*会って(い?ない|ません)|何年も会って(い?ない|ません)|長年.*会って(い?ない|ません)|ずっと会って(い?ない|ません)/.test(question);

  return {
    needsRealism: isMarried || longNoContact || longNoMeet,
    isMarried,
    longNoContact,
    longNoMeet,
  };
}

function buildIntro() {
  return [
    "こんにちは。白の魔女ルミナです。",
    "光の導きタロットに、あなたの想いを預けてみました。",
  ].join("\n");
}

function buildCardInterpretation(card: DrawnCard, seed: number) {
  const symbol = card.reversed ? "まだ言葉になっていない想い" : "心の奥で静かに育っている本音";

  const suitText =
    card.card.arcana === "major"
      ? pickBySeed(
          [
            "このカードは、心の深い層で動いている大きな気持ちを象徴しています。",
            "このカードは、表面だけでは見えない運命的な心の流れを映しています。",
            "このカードは、相手の内側で確かに揺れている本質的な想いを示しています。",
          ],
          seed,
          3,
        )
      : pickBySeed(
          [
            "このカードは、日々の中で少しずつ形になっている感情を象徴しています。",
            "このカードは、相手の態度の奥で動いている本音の方向を示しています。",
            "このカードは、今の関係の空気と心の反応をやさしく教えてくれます。",
          ],
          seed,
          5,
        );

  return `今現れたカードは「${card.card.nameJa}」。\nこのカードは、${symbol}を象徴しています。\n${suitText}`;
}

function buildPartnerEmotion(card: DrawnCard, seed: number) {
  if (card.reversed) {
    return pickBySeed(
      [
        "気になっているのに、素直に近づくには少し迷いが残っているようです。",
        "あなたの存在を意識しながらも、気持ちを表に出すことをためらっているようです。",
        "心の中に想いはあるものの、どう扱えばいいのかを静かに考えているようです。",
      ],
      seed,
      7,
    );
  }

  return pickBySeed(
    [
      "あなたに対してやわらかな関心と親しみを抱いている気配があります。",
      "あなたのことを特別な存在として意識しはじめている流れが見えます。",
      "会話や距離感の中に、もっと知りたいという前向きな想いが宿っています。",
    ],
    seed,
    11,
  );
}

function buildPartnerFeeling(card: DrawnCard, seed: number) {
  const base = `あの人の心の中には\n\n${buildPartnerEmotion(card, seed)}\n\nという想いが見えてきます。`;

  const supplement = card.reversed
    ? pickBySeed(
        [
          "ただし、その気持ちはまだ整理の途中にあり、はっきりした行動には結びついていないかもしれません。",
          "今は感情よりも状況を優先していて、想いを見せるまでに少し時間が必要そうです。",
        ],
        seed,
        13,
      )
    : pickBySeed(
        [
          "相手の中では、あなたへの印象がゆっくりと温度を持ちはじめています。",
          "その想いは無理に強い形ではなくても、やさしく確かなものとして育っています。",
        ],
        seed,
        17,
      );

  return `${base}\n${supplement}`;
}

function buildRelationshipFlow(card: DrawnCard, seed: number) {
  const state = card.reversed
    ? pickBySeed(
        ["気持ちはあるのに動きがゆっくりな状態", "心の中で行き来しながら様子を見ている状態", "近づきたい思いと慎重さが並んでいる状態"],
        seed,
        19,
      )
    : pickBySeed(
        ["静かに距離が縮まりつつある状態", "まだ繊細ながらも好意が育っている状態", "自然なつながりの中で想いが深まっている状態"],
        seed,
        23,
      );

  const next = card.reversed
    ? "焦って答えを求めるより、安心できる空気を重ねることで本音が見えやすくなります。"
    : "やさしいやり取りを重ねるほど、相手も素直な気持ちを見せやすくなるでしょう。";

  return `今二人の関係は\n\n${state}\n\nのような状態にあります。\n${next}`;
}

function buildLuminaMessage(card: DrawnCard, seed: number) {
  const close = card.reversed
    ? pickBySeed(
        [
          "言葉にならない想いも、心の奥には静かに残っていることがあります。",
          "今は曖昧に見える気持ちも、やがてやさしい形で輪郭を持ち始めます。",
        ],
        seed,
        29,
      )
    : pickBySeed(
        [
          "カードは、あなたとあの人の間に流れているやさしい想いを映し出しています。",
          "心の奥で育っている温かな感情は、無理をしなくても少しずつ届いていくでしょう。",
        ],
        seed,
        31,
      );

  return `言葉にならない想いも、\n心の奥には静かに残っていることがあります。\n\n${close}`;
}

/* ── 現実的配慮が必要な場合の鑑定テンプレート ── */

function buildRealisticPartnerEmotion(
  seed: number,
  ctx: { isMarried: boolean; longNoMeet: boolean },
) {
  if (ctx.isMarried) {
    return pickBySeed(
      [
        "彼は今の生活の中で穏やかに過ごしているようです。ただ、人の記憶は完全に消えるものではありません。ふとした瞬間、あなたとの時間を思い出すこともあるかもしれません。",
        "今のパートナーとの暮らしを大切にしながらも、過去の記憶として、あなたとの日々がやさしく残っているようです。",
        "彼の日常は今の家庭の中にあります。けれど、かつてのあなたとの時間は、心のどこかに静かにしまわれているようです。",
      ],
      seed,
      7,
    );
  }

  if (ctx.longNoMeet) {
    return pickBySeed(
      [
        "長い時間が経っているため、あの人の中であなたの存在は「過去の大切な記憶」として残っているようです。今の気持ちは、当時とは形を変えている可能性があります。",
        "時間が距離をつくる一方で、ふとした瞬間にあなたのことを思い出すことはあるかもしれません。ただ、それは恋愛感情というより、懐かしさに近いもののようです。",
        "あの頃の記憶は、あの人の中でやさしい思い出として残っています。ただ、今の生活の中では、別の日常が中心になっているようです。",
      ],
      seed,
      7,
    );
  }

  return pickBySeed(
    [
      "連絡が途絶えている今、あの人の中であなたの存在は少しずつ日常から離れているかもしれません。ただ、完全に忘れているわけではないようです。",
      "距離ができたことで、あの人はあなたのことを考える頻度は減っているかもしれません。それでも、思い出がゼロになることはないようです。",
      "今のあの人は、目の前の生活に集中しているようです。あなたとの記憶は心の奥にありますが、それを積極的に取り出すことは少なくなっているかもしれません。",
    ],
    seed,
    7,
  );
}

function buildRealisticPartnerFeeling(
  seed: number,
  ctx: { isMarried: boolean; longNoMeet: boolean },
) {
  if (ctx.isMarried) {
    return pickBySeed(
      [
        "あの人は今、家庭という現実の中で日々を重ねています。\n\nあなたとの思い出は、心の引き出しの中にそっとしまわれているようなもの。開くことはあっても、それを今の生活に持ち込むことには慎重です。\n\n大切なのは、あの人の今の幸せを尊重しながら、あなた自身の心も大切にすることかもしれません。",
        "彼の気持ちの中心は、今の生活にあります。\n\nかつてのあなたとの関係は、否定されているのではなく、過去の大切な一章として心に残っています。\n\nその記憶があるからこそ、あの人は今の日々を丁寧に生きようとしているのかもしれません。",
      ],
      seed,
      13,
    );
  }

  if (ctx.longNoMeet) {
    return pickBySeed(
      [
        "長い年月は、人の気持ちをゆるやかに変えていきます。\n\nあの人の中にあなたの記憶は残っていますが、それは「今の感情」というより「かつての大切な思い出」に近いものかもしれません。\n\n今のあなたにとって大切なのは、過去に戻ることよりも、自分自身の今を満たしていくことではないでしょうか。",
        "時間が経つほど、記憶はやさしく丸みを帯びていきます。\n\nあの人もきっと、あなたとの日々を否定はしていません。ただ、今の生活の中で新しい日常を積み重ねています。\n\nあなたの想いは本物です。だからこそ、その気持ちを未来の自分のために使ってほしいと、カードは伝えています。",
      ],
      seed,
      13,
    );
  }

  return pickBySeed(
    [
      "連絡が途絶えているということは、あの人にとって今は自分の生活に集中している時期なのかもしれません。\n\nあなたのことを完全に忘れたわけではないけれど、積極的に関係を動かそうという気持ちには至っていないようです。\n\n今は距離を受け入れながら、あなた自身の時間を充実させることが、結果的に良い方向へ向かう鍵になりそうです。",
      "今のあの人は、あなたとの関係よりも目の前のことに意識が向いているようです。\n\nそれはあなたを否定しているのではなく、今の状況の中で精一杯なのかもしれません。\n\n無理に答えを急がず、あなた自身の心を整える時間にしてみてください。",
    ],
    seed,
    13,
  );
}

function buildRealisticRelationshipFlow(seed: number, ctx: { isMarried: boolean; longNoMeet: boolean }) {
  if (ctx.isMarried) {
    return pickBySeed(
      [
        "今の関係は、大きく動く時期ではないようです。\n\nあの人には守るべき日常があり、その中であなたの存在は「過去の大切な人」として位置づけられています。\n\n今あなたにできるのは、あの人の幸せを遠くから願いながら、自分自身の人生を豊かにしていくことかもしれません。",
        "この関係が恋愛として再び動き出す可能性は、今のところ穏やかです。\n\nあの人は今の環境を大切にしています。あなたとの縁は消えていませんが、それが恋愛という形で再燃するかどうかは、慎重に見つめる必要があります。\n\nまずは、あなた自身の心の平穏を優先してください。",
      ],
      seed,
      19,
    );
  }

  return pickBySeed(
    [
      "今は関係が停滞しているように見えますが、それは「終わり」ではなく「間」の時期です。\n\nただし、この間が長く続くほど、お互いの日常は別々の方向に進んでいきます。\n\n動くべきときが来たら、あなたの直感がそれを教えてくれるでしょう。それまでは、自分を大切にする時間にしてみてください。",
      "距離や時間が空いている今、関係をすぐに動かそうとするよりも、あなた自身が穏やかでいることが大切です。\n\n心が整ったときに見える景色は、焦っているときとはまったく違います。\n\nカードは「待つ」ことと「自分を満たす」ことを静かに伝えています。",
    ],
    seed,
    19,
  );
}

function buildRealisticLuminaMessage(seed: number, ctx: { isMarried: boolean; longNoMeet: boolean }) {
  if (ctx.isMarried) {
    return pickBySeed(
      [
        "あの人の幸せを願えるあなたは、とても強くてやさしい人です。\n\nたとえ今の答えが望んだものと違っても、あなたの想いは決して無駄ではありません。\n\n人を深く愛せるその心は、これからのあなたの人生を必ず豊かにしてくれます。\n\nルミナは、あなたの未来にやさしい光が届くことを信じています。",
        "叶わない想いを抱えることは、とても苦しいことです。\n\nでも、その痛みの分だけ、あなたは人の気持ちがわかる人になっています。\n\n今は少しだけ、自分自身にやさしくしてあげてください。\n\nあなたの心が癒されるとき、新しい出会いの扉も静かに開き始めます。",
      ],
      seed,
      29,
    );
  }

  return pickBySeed(
    [
      "想い続けることは、決して弱さではありません。\n\nでも、その想いにずっと縛られていると、あなた自身の輝きが少しずつ曇ってしまうことがあります。\n\n今大切なのは、あの人の気持ちを追いかけることよりも、あなた自身が笑顔でいられる時間を増やすこと。\n\nカードは、あなたの中にある「前に進む力」を、静かに照らしています。",
      "答えがすぐに見えない恋は、不安で胸がいっぱいになります。\n\nでも、あなたがこうして想い続けていること自体が、あなたの心の深さを証明しています。\n\n焦らなくていい。急がなくていい。\n\nあなたの心が穏やかになったとき、自然と次の一歩が見えてきます。ルミナはそう信じています。",
    ],
    seed,
    29,
  );
}

function buildHeartTone(card: DrawnCard) {
  if (card.reversed) return "揺れながらも意識している";
  if (card.card.arcana === "major") return "深く、はっきり響いている";
  switch (card.card.suit) {
    case "cups":
      return "やさしい好意がにじむ";
    case "wands":
      return "気になって目で追っている";
    case "swords":
      return "考えながら距離を測っている";
    case "pentacles":
    default:
      return "静かに信頼を育てている";
  }
}

function buildDistanceLabel(card: DrawnCard) {
  if (card.reversed) return "近づきたいが慎重";
  if (card.card.arcana === "major") return "心では強くつながる";
  switch (card.card.suit) {
    case "cups":
      return "感情は近づいている";
    case "wands":
      return "きっかけ待ち";
    case "swords":
      return "様子見が続く";
    case "pentacles":
    default:
      return "ゆっくり安定へ";
  }
}

function buildGuidanceLabel(card: DrawnCard) {
  if (card.reversed) return "急がず、安心を重ねる";
  if (card.card.arcana === "major") return "自然体で受け止める";
  switch (card.card.suit) {
    case "cups":
      return "やさしく気持ちを返す";
    case "wands":
      return "軽やかに話しかける";
    case "swords":
      return "答えを急がない";
    case "pentacles":
    default:
      return "穏やかに信頼を育てる";
  }
}

export function getKareNoKimochiReading(question: string): KareNoKimochiReading {
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
  const ctx = detectRealisticContext(normalizedQuestion);
  const cardInfo = { arcana: drawn.card.arcana as "major" | "minor", suit: drawn.card.arcana === "minor" ? drawn.card.suit as "cups" | "wands" | "swords" | "pentacles" : undefined, reversed: drawn.reversed };
  const frame = buildKareNoKimochiFrame(cardInfo, seed, ctx.needsRealism);

  /* 現実的配慮が必要な場合は復縁を強く示唆しない鑑定に切り替え */
  if (ctx.needsRealism) {
    return {
      question: normalizedQuestion,
      cardName: drawn.card.nameJa,
      cardMeaning: drawn.reversed ? drawn.card.reversedMeaning : drawn.card.uprightMeaning,
      cardImagePath: cardImage?.imagePath ?? "/cards/00-the-fool.png",
      isReversed: drawn.reversed,
      intro: buildIntro(),
      cardInterpretation: buildCardInterpretation(drawn, seed),
      partnerEmotion: buildRealisticPartnerEmotion(seed, ctx),
      partnerFeeling: buildRealisticPartnerFeeling(seed, ctx),
      relationshipFlow: buildRealisticRelationshipFlow(seed, ctx),
      luminaMessage: buildRealisticLuminaMessage(seed, ctx),
      shortMessage: ctx.isMarried
        ? "あの人の今の幸せを、静かに見守ることも愛の形です。"
        : "想いの深さは、あなたの心の豊かさの証です。",
      heartTone: ctx.isMarried ? "穏やかな記憶として残っている" : "過去の思い出として心にある",
      distanceLabel: ctx.isMarried ? "今は別々の日常の中に" : "時間が距離をつくっている",
      guidanceLabel: ctx.isMarried ? "あなた自身の幸せを優先する" : "自分の心を整える時間にする",
      interpretationFrame: frame,
    };
  }

  return {
    question: normalizedQuestion,
    cardName: drawn.card.nameJa,
    cardMeaning: drawn.reversed ? drawn.card.reversedMeaning : drawn.card.uprightMeaning,
    cardImagePath: cardImage?.imagePath ?? "/cards/00-the-fool.png",
    isReversed: drawn.reversed,
    intro: buildIntro(),
    cardInterpretation: buildCardInterpretation(drawn, seed),
    partnerEmotion: buildPartnerEmotion(drawn, seed),
    partnerFeeling: buildPartnerFeeling(drawn, seed),
    relationshipFlow: buildRelationshipFlow(drawn, seed),
    luminaMessage: buildLuminaMessage(drawn, seed),
    shortMessage: pickBySeed(
      [
        "あの人の心には、まだやさしい余白があります。",
        "本音は急がせずに見るほど、自然に輪郭が見えてきます。",
        "相手の心は、静かな温度であなたを意識しています。",
      ],
      seed,
      37,
    ),
    heartTone: buildHeartTone(drawn),
    distanceLabel: buildDistanceLabel(drawn),
    guidanceLabel: buildGuidanceLabel(drawn),
    interpretationFrame: frame,
  };
}
