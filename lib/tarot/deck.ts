import type { TarotCardData } from "@/components/tarot-card";

export type TarotSuit = "wands" | "cups" | "swords" | "pentacles";
export type TarotRank =
  | "ace"
  | "two"
  | "three"
  | "four"
  | "five"
  | "six"
  | "seven"
  | "eight"
  | "nine"
  | "ten"
  | "page"
  | "knight"
  | "queen"
  | "king";

export type TarotPosition = "現状" | "課題" | "助言";

export type TarotDeckCard = {
  code: string;
  nameJa: string;
  nameEn: string;
  arcana: "major" | "minor";
  suit?: TarotSuit;
  rank?: TarotRank;
  symbolKeywords: string[];
  imageDescription: string;
  uprightMeaning: string;
  reversedMeaning: string;
};

export type DrawnTarotCard = {
  position: TarotPosition;
  card: TarotDeckCard;
  reversed: boolean;
};

type MinorCardGroup = Record<TarotSuit, TarotDeckCard[]>;

type MajorSeed = Omit<TarotDeckCard, "arcana">;

const majorSeeds: MajorSeed[] = [
  {
    code: "major-00-fool",
    nameJa: "愚者",
    nameEn: "The Fool",
    symbolKeywords: ["始まり", "自由", "可能性"],
    imageDescription: "崖の縁に立つ若者が空を見上げ、白い犬が足元で跳ねています。",
    uprightMeaning: "新しい流れに軽やかに踏み出す力",
    reversedMeaning: "勢いと慎重さの配分を見直すサイン",
  },
  {
    code: "major-01-magician",
    nameJa: "魔術師",
    nameEn: "The Magician",
    symbolKeywords: ["創造", "意志", "実行"],
    imageDescription: "赤白の衣の人物が卓上の道具を前に立ち、片手を天へ掲げています。",
    uprightMeaning: "手持ちの力を形に変えるタイミング",
    reversedMeaning: "力の使い方や焦点のズレに気づく時期",
  },
  {
    code: "major-02-high-priestess",
    nameJa: "女教皇",
    nameEn: "The High Priestess",
    symbolKeywords: ["直感", "静けさ", "内面"],
    imageDescription: "柱の間に座る女性が巻物を抱え、静かなまなざしで前を見ています。",
    uprightMeaning: "見えにくい本音や流れを読む力",
    reversedMeaning: "考えすぎや感情の閉じ込みをほどく必要",
  },
  {
    code: "major-03-empress",
    nameJa: "女帝",
    nameEn: "The Empress",
    symbolKeywords: ["豊かさ", "受容", "育成"],
    imageDescription: "実りある自然の中で女帝がゆったりと座り、豊穣の気配が広がっています。",
    uprightMeaning: "育てる姿勢が実りにつながる流れ",
    reversedMeaning: "与えすぎや自己後回しを整えるタイミング",
  },
  {
    code: "major-04-emperor",
    nameJa: "皇帝",
    nameEn: "The Emperor",
    symbolKeywords: ["秩序", "責任", "安定"],
    imageDescription: "石の玉座に座る王がまっすぐ前を見て、硬い地盤を背にしています。",
    uprightMeaning: "土台固めと判断の明確化",
    reversedMeaning: "強さの出し方を柔らかく調整する必要",
  },
  {
    code: "major-05-hierophant",
    nameJa: "教皇",
    nameEn: "The Hierophant",
    symbolKeywords: ["学び", "規範", "助言"],
    imageDescription: "儀式的な衣装の教皇が座り、前には教えを受ける人物たちがいます。",
    uprightMeaning: "基本に戻ることで道が見える流れ",
    reversedMeaning: "形式だけに縛られない工夫が必要な時期",
  },
  {
    code: "major-06-lovers",
    nameJa: "恋人",
    nameEn: "The Lovers",
    symbolKeywords: ["選択", "調和", "関係性"],
    imageDescription: "二人の人物の上に天使が描かれ、選択とつながりの場面が広がります。",
    uprightMeaning: "関係性の中で納得できる選択を育てる流れ",
    reversedMeaning: "迷いや温度差の整理が課題になる時期",
  },
  {
    code: "major-07-chariot",
    nameJa: "戦車",
    nameEn: "The Chariot",
    symbolKeywords: ["前進", "意思", "推進力"],
    imageDescription: "戦車に乗る人物が正面を見据え、異なる色の獣を従えています。",
    uprightMeaning: "方向を定めて進むことで動く流れ",
    reversedMeaning: "勢い先行や空回りを整える必要",
  },
  {
    code: "major-08-strength",
    nameJa: "力",
    nameEn: "Strength",
    symbolKeywords: ["忍耐", "優しさ", "内なる強さ"],
    imageDescription: "女性が穏やかな表情で獅子に触れ、静かな強さを示しています。",
    uprightMeaning: "やわらかな対応で状況を動かす力",
    reversedMeaning: "自信の揺れや消耗に気づくサイン",
  },
  {
    code: "major-09-hermit",
    nameJa: "隠者",
    nameEn: "The Hermit",
    symbolKeywords: ["内省", "探求", "慎重さ"],
    imageDescription: "老人が灯りを掲げて高所に立ち、足元を照らしています。",
    uprightMeaning: "一歩引いて整理することで見える答え",
    reversedMeaning: "閉じこもりすぎや孤立の見直し",
  },
  {
    code: "major-10-wheel-of-fortune",
    nameJa: "運命の輪",
    nameEn: "Wheel of Fortune",
    symbolKeywords: ["転換", "循環", "タイミング"],
    imageDescription: "大きな輪が中心に描かれ、周囲に象徴的な存在が配置されています。",
    uprightMeaning: "流れの切り替わりを活かしやすい時期",
    reversedMeaning: "波の揺れに合わせて姿勢を整える必要",
  },
  {
    code: "major-11-justice",
    nameJa: "正義",
    nameEn: "Justice",
    symbolKeywords: ["判断", "公平", "整合性"],
    imageDescription: "人物が剣と天秤を持ち、左右のバランスを示す姿で座っています。",
    uprightMeaning: "事実と感情を分けるほど整う流れ",
    reversedMeaning: "偏りや思い込みを修正するタイミング",
  },
  {
    code: "major-12-hanged-man",
    nameJa: "吊るされた男",
    nameEn: "The Hanged Man",
    symbolKeywords: ["視点転換", "保留", "受容"],
    imageDescription: "人物が片足を木にかけ逆さに吊られ、静かな表情で世界を見ています。",
    uprightMeaning: "待つことで得られる気づきが大きい流れ",
    reversedMeaning: "停滞を終えて動き方を変える合図",
  },
  {
    code: "major-13-death",
    nameJa: "死神",
    nameEn: "Death",
    symbolKeywords: ["終わり", "再生", "切り替え"],
    imageDescription: "白い馬に乗る骸骨の騎士が進み、場面の転換を象徴しています。",
    uprightMeaning: "不要な流れを終えて次へ進むタイミング",
    reversedMeaning: "手放しの遅れに気づく時期",
  },
  {
    code: "major-14-temperance",
    nameJa: "節制",
    nameEn: "Temperance",
    symbolKeywords: ["調和", "調整", "中庸"],
    imageDescription: "天使が二つの器の水を移し替え、配分の美しさを示しています。",
    uprightMeaning: "無理のない調整で安定しやすい流れ",
    reversedMeaning: "極端さや配分の乱れを整える必要",
  },
  {
    code: "major-15-devil",
    nameJa: "悪魔",
    nameEn: "The Devil",
    symbolKeywords: ["執着", "習慣", "束縛"],
    imageDescription: "角のある存在の下で人物たちが鎖につながれ、惰性や執着を示します。",
    uprightMeaning: "癖や依存パターンを直視するタイミング",
    reversedMeaning: "縛りから離れる兆しが見え始める流れ",
  },
  {
    code: "major-16-tower",
    nameJa: "塔",
    nameEn: "The Tower",
    symbolKeywords: ["衝撃", "気づき", "再構築"],
    imageDescription: "雷に打たれた塔から炎が上がり、価値観の揺れが描かれています。",
    uprightMeaning: "急な変化から本質が見えるタイミング",
    reversedMeaning: "崩れる前に調整する余地がある流れ",
  },
  {
    code: "major-17-star",
    nameJa: "星",
    nameEn: "The Star",
    symbolKeywords: ["希望", "回復", "素直さ"],
    imageDescription: "水辺の人物が器から水を注ぎ、夜空の星が静かに輝いています。",
    uprightMeaning: "回復と希望を取り戻しやすい流れ",
    reversedMeaning: "希望の見え方を整え直す時期",
  },
  {
    code: "major-18-moon",
    nameJa: "月",
    nameEn: "The Moon",
    symbolKeywords: ["不安", "曖昧さ", "感受性"],
    imageDescription: "月の下に道が伸び、遠景と水辺に不安定な気配が漂っています。",
    uprightMeaning: "曖昧さの中で慎重に進む必要がある流れ",
    reversedMeaning: "霧が晴れ始めて判断材料が増える時期",
  },
  {
    code: "major-19-sun",
    nameJa: "太陽",
    nameEn: "The Sun",
    symbolKeywords: ["明朗", "成功", "生命力"],
    imageDescription: "大きな太陽の下で子どもが馬に乗り、率直な喜びが描かれています。",
    uprightMeaning: "素直な表現が追い風になるタイミング",
    reversedMeaning: "明るさはあるが過信を整える必要",
  },
  {
    code: "major-20-judgement",
    nameJa: "審判",
    nameEn: "Judgement",
    symbolKeywords: ["再評価", "目覚め", "決断"],
    imageDescription: "天使のラッパに応える人々が描かれ、呼び戻される感覚があります。",
    uprightMeaning: "過去の経験を活かして再始動しやすい流れ",
    reversedMeaning: "決断の先送りや自己批判を緩める時期",
  },
  {
    code: "major-21-world",
    nameJa: "世界",
    nameEn: "The World",
    symbolKeywords: ["完成", "達成", "統合"],
    imageDescription: "リースに囲まれた中心人物の周りに象徴が配され、完成の景色が広がります。",
    uprightMeaning: "一区切りと達成をまとめやすいタイミング",
    reversedMeaning: "仕上げ前の微調整が鍵になる時期",
  },
];

const suitMeta: Record<
  TarotSuit,
  {
    nameJa: string;
    nameEn: string;
    symbol: string;
    theme: string;
    scene: string;
  }
> = {
  wands: {
    nameJa: "ワンド",
    nameEn: "Wands",
    symbol: "棒",
    theme: "行動力",
    scene: "火の気のある情熱的な場面",
  },
  cups: {
    nameJa: "カップ",
    nameEn: "Cups",
    symbol: "杯",
    theme: "感情",
    scene: "水辺や感情の交流を感じる場面",
  },
  swords: {
    nameJa: "ソード",
    nameEn: "Swords",
    symbol: "剣",
    theme: "思考と判断",
    scene: "風のように張りつめた判断の場面",
  },
  pentacles: {
    nameJa: "ペンタクル",
    nameEn: "Pentacles",
    symbol: "金貨",
    theme: "現実と積み重ね",
    scene: "暮らしや仕事の基盤を感じる場面",
  },
};

const rankMeta: Array<{
  rank: TarotRank;
  nameJa: string;
  nameEn: string;
  count?: number;
  sceneDescription: string;
  upright: string;
  reversed: string;
  keywords: string[];
}> = [
  {
    rank: "ace",
    nameJa: "エース",
    nameEn: "Ace",
    sceneDescription: "雲から差し出される手がひとつの象徴を掲げ、新しい入口を示しています。",
    upright: "新しい入口を活かしやすいタイミング",
    reversed: "始まりの勢いを整えてから進む必要",
    keywords: ["始まり", "種", "入口"],
  },
  {
    rank: "two",
    nameJa: "2",
    nameEn: "Two",
    count: 2,
    sceneDescription: "二つの象徴の間で人物が調整し、配分や選択を試している場面です。",
    upright: "バランス調整が機能しやすい流れ",
    reversed: "優先順位の混線をほどく必要",
    keywords: ["調整", "選択", "均衡"],
  },
  {
    rank: "three",
    nameJa: "3",
    nameEn: "Three",
    count: 3,
    sceneDescription: "三つの象徴が並び、広がりや連携の気配が見える構図です。",
    upright: "連携や広がりを作りやすい流れ",
    reversed: "連携不足や見通しのズレを整える時期",
    keywords: ["連携", "拡張", "共有"],
  },
  {
    rank: "four",
    nameJa: "4",
    nameEn: "Four",
    count: 4,
    sceneDescription: "四つの象徴が安定した配置で描かれ、守りと土台を感じる場面です。",
    upright: "土台を固めるほど安定する流れ",
    reversed: "守りすぎや停滞を見直す必要",
    keywords: ["安定", "土台", "保守"],
  },
  {
    rank: "five",
    nameJa: "5",
    nameEn: "Five",
    count: 5,
    sceneDescription: "五つの象徴の配置に揺れがあり、葛藤や変化の気配が漂います。",
    upright: "揺れを通じて課題が見えやすいタイミング",
    reversed: "立て直しや和解の余地が出る時期",
    keywords: ["揺れ", "葛藤", "変化"],
  },
  {
    rank: "six",
    nameJa: "6",
    nameEn: "Six",
    count: 6,
    sceneDescription: "六つの象徴が流れを作り、移動や調和の方向性が見えます。",
    upright: "流れの回復や調和が進みやすい時期",
    reversed: "動きづらさや未解決点の整理が必要",
    keywords: ["回復", "調和", "移行"],
  },
  {
    rank: "seven",
    nameJa: "7",
    nameEn: "Seven",
    count: 7,
    sceneDescription: "七つの象徴と人物の構図が、試行錯誤や見極めを促しています。",
    upright: "作戦や見方を工夫すると伸びやすい流れ",
    reversed: "迷いの長引きを止める判断が必要",
    keywords: ["見極め", "工夫", "試行錯誤"],
  },
  {
    rank: "eight",
    nameJa: "8",
    nameEn: "Eight",
    count: 8,
    sceneDescription: "八つの象徴が勢いよく配置され、加速や集中の空気があります。",
    upright: "手を止めず進めるほど前進しやすい時期",
    reversed: "急ぎすぎや散漫さの調整が必要",
    keywords: ["加速", "集中", "継続"],
  },
  {
    rank: "nine",
    nameJa: "9",
    nameEn: "Nine",
    count: 9,
    sceneDescription: "九つの象徴と人物の表情が、仕上げ前の踏ん張りを示しています。",
    upright: "最終調整に力を注ぐ価値が高い流れ",
    reversed: "疲れや不安を先に整える必要",
    keywords: ["踏ん張り", "終盤", "警戒"],
  },
  {
    rank: "ten",
    nameJa: "10",
    nameEn: "Ten",
    count: 10,
    sceneDescription: "十の象徴が節目を描き、完了と次の段階の入口を示します。",
    upright: "区切りをつけるほど次へ進みやすい時期",
    reversed: "抱え込みや完了遅れの見直しが必要",
    keywords: ["区切り", "完了", "次段階"],
  },
  {
    rank: "page",
    nameJa: "ペイジ",
    nameEn: "Page",
    sceneDescription: "若い人物が象徴を見つめ、知らせや学びに心を向けています。",
    upright: "素直な吸収や小さな一歩が活きる流れ",
    reversed: "未熟さや受け取り違いを整える時期",
    keywords: ["学び", "知らせ", "素直さ"],
  },
  {
    rank: "knight",
    nameJa: "ナイト",
    nameEn: "Knight",
    sceneDescription: "騎士が象徴を携えて進み、推進力と行動の圧が前に出ています。",
    upright: "行動力を目的に沿って使いやすいタイミング",
    reversed: "突進や停滞の極端さを調整する必要",
    keywords: ["行動", "推進", "勢い"],
  },
  {
    rank: "queen",
    nameJa: "クイーン",
    nameEn: "Queen",
    sceneDescription: "女王が象徴を抱え、落ち着いた視線で場全体を見渡しています。",
    upright: "受容と成熟した対応が支えになる流れ",
    reversed: "気疲れや抱え込みの緩和が課題",
    keywords: ["受容", "成熟", "安定感"],
  },
  {
    rank: "king",
    nameJa: "キング",
    nameEn: "King",
    sceneDescription: "王が象徴を持って座り、責任と統率の姿勢が強く表れています。",
    upright: "全体を整える判断が活きやすいタイミング",
    reversed: "硬さや支配的な姿勢の調整が必要",
    keywords: ["統率", "責任", "判断"],
  },
];

function buildMajor(): TarotDeckCard[] {
  return majorSeeds.map((card) => ({ ...card, arcana: "major" as const }));
}

function buildMinorCard(suit: TarotSuit, rankInfo: (typeof rankMeta)[number]): TarotDeckCard {
  const suitInfo = suitMeta[suit];
  const numberScene =
    typeof rankInfo.count === "number"
      ? `${rankInfo.count}つの${suitInfo.symbol}が描かれ、${suitInfo.scene}が伝わります。`
      : `${suitInfo.symbol}を携えた人物が中心に描かれ、${suitInfo.scene}が印象に残ります。`;

  return {
    code: `minor-${suit}-${rankInfo.rank}`,
    nameJa: `${suitInfo.nameJa}の${rankInfo.nameJa}`,
    nameEn: `${rankInfo.nameEn} of ${suitInfo.nameEn}`,
    arcana: "minor",
    suit,
    rank: rankInfo.rank,
    symbolKeywords: [suitInfo.theme, ...rankInfo.keywords],
    imageDescription: `${numberScene}${rankInfo.sceneDescription}`,
    uprightMeaning: `${suitInfo.theme}の領域で、${rankInfo.upright}`,
    reversedMeaning: `${suitInfo.theme}の領域で、${rankInfo.reversed}`,
  };
}

function buildMinor(): MinorCardGroup {
  return {
    wands: rankMeta.map((rank) => buildMinorCard("wands", rank)),
    cups: rankMeta.map((rank) => buildMinorCard("cups", rank)),
    swords: rankMeta.map((rank) => buildMinorCard("swords", rank)),
    pentacles: rankMeta.map((rank) => buildMinorCard("pentacles", rank)),
  };
}

export const tarotDeck = {
  major: buildMajor(),
  minor: buildMinor(),
} as const;

export const tarotDeckAll: TarotDeckCard[] = [
  ...tarotDeck.major,
  ...tarotDeck.minor.wands,
  ...tarotDeck.minor.cups,
  ...tarotDeck.minor.swords,
  ...tarotDeck.minor.pentacles,
];

const tarotDeckByJaName = new Map<string, TarotDeckCard>(
  tarotDeckAll.map((card) => [card.nameJa, card])
);

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function findTarotDeckCardByJaName(nameJa: string): TarotDeckCard | null {
  return tarotDeckByJaName.get(nameJa) ?? null;
}

export function drawTarotSpread(
  random: () => number = Math.random,
  positions: TarotPosition[] = ["現状", "課題", "助言"]
): DrawnTarotCard[] {
  const picked = shuffle(tarotDeckAll, random).slice(0, positions.length);
  return picked.map((card, index) => ({
    position: positions[index] ?? "助言",
    card,
    reversed: random() < 0.5,
  }));
}

export function toUiTarotCardData(drawn: DrawnTarotCard): TarotCardData {
  return {
    id: `${drawn.card.code}-${drawn.position}`,
    name: drawn.card.nameJa,
    meaning: drawn.reversed ? drawn.card.reversedMeaning : drawn.card.uprightMeaning,
    reversed: drawn.reversed,
  };
}

// Sample draw (minor arcana included):
// [現状] カップの8（逆位置） / [課題] 皇帝（正位置） / [助言] ペンタクルの3（正位置）
