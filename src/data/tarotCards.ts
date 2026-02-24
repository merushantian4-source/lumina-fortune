export type TarotCardEntry = {
  id: number;
  code: string;
  nameEn: string;
  nameJa: string;
  imagePath: string;
  meaningJa: string;
};

function toImagePath(stem: string): string {
  return `/cards/${stem}.jpg`;
}

const majorArcana: TarotCardEntry[] = [
  { id: 0, code: "major-00-fool", nameEn: "The Fool", nameJa: "愚者", imagePath: toImagePath("00-the-fool"), meaningJa: "新しい始まり。軽やかに一歩を出すほど流れが動きやすい日です。" },
  { id: 1, code: "major-01-magician", nameEn: "The Magician", nameJa: "魔術師", imagePath: toImagePath("01-the-magician"), meaningJa: "意思と工夫が鍵。手持ちの道具を活かすほど結果につながります。" },
  { id: 2, code: "major-02-high-priestess", nameEn: "The High Priestess", nameJa: "女教皇", imagePath: toImagePath("02-the-high-priestess"), meaningJa: "静かな直感が冴える日。急がず観察すると良い判断ができます。" },
  { id: 3, code: "major-03-empress", nameEn: "The Empress", nameJa: "女帝", imagePath: toImagePath("03-the-empress"), meaningJa: "豊かさと育てる力。心地よさを整えるほど運気が安定しやすいです。" },
  { id: 4, code: "major-04-emperor", nameEn: "The Emperor", nameJa: "皇帝", imagePath: toImagePath("04-the-emperor"), meaningJa: "土台づくりの日。段取りを決めて進めると安心感と成果が得られます。" },
  { id: 5, code: "major-05-hierophant", nameEn: "The Hierophant", nameJa: "教皇", imagePath: toImagePath("05-the-hierophant"), meaningJa: "基本に戻ることで整う日。信頼できる助言やルールが助けになります。" },
  { id: 6, code: "major-06-lovers", nameEn: "The Lovers", nameJa: "恋人", imagePath: toImagePath("06-the-lovers"), meaningJa: "対話と選択がテーマ。心が自然に向く方を丁寧に選ぶと良い流れです。" },
  { id: 7, code: "major-07-chariot", nameEn: "The Chariot", nameJa: "戦車", imagePath: toImagePath("07-the-chariot"), meaningJa: "前進力が高まる日。勢いを活かしつつ、方向を絞ると進みやすいです。" },
  { id: 8, code: "major-08-strength", nameEn: "Strength", nameJa: "力", imagePath: toImagePath("08-strength"), meaningJa: "やさしい粘り強さが効く日。強引さより落ち着いた対応が成果につながります。" },
  { id: 9, code: "major-09-hermit", nameEn: "The Hermit", nameJa: "隠者", imagePath: toImagePath("09-the-hermit"), meaningJa: "一人で整える時間が鍵。考えを整理すると次の一手が見えてきます。" },
  { id: 10, code: "major-10-wheel-of-fortune", nameEn: "Wheel of Fortune", nameJa: "運命の輪", imagePath: toImagePath("10-wheel-of-fortune"), meaningJa: "流れの切り替わり。偶然の動きに柔軟に乗るほどチャンスを拾えます。" },
  { id: 11, code: "major-11-justice", nameEn: "Justice", nameJa: "正義", imagePath: toImagePath("11-justice"), meaningJa: "バランスと判断の日。感情と事実を分けると迷いが減りやすいです。" },
  { id: 12, code: "major-12-hanged-man", nameEn: "The Hanged Man", nameJa: "吊るされた男", imagePath: toImagePath("12-the-hanged-man"), meaningJa: "視点転換が必要な日。少し待つことで見落としに気づきやすくなります。" },
  { id: 13, code: "major-13-death", nameEn: "Death", nameJa: "死神", imagePath: toImagePath("13-death"), meaningJa: "切り替えと手放しのサイン。古い流れを終えるほど次が入りやすくなります。" },
  { id: 14, code: "major-14-temperance", nameEn: "Temperance", nameJa: "節制", imagePath: toImagePath("14-temperance"), meaningJa: "調整力が活きる日。無理なく配分を整えると全体がスムーズになります。" },
  { id: 15, code: "major-15-devil", nameEn: "The Devil", nameJa: "悪魔", imagePath: toImagePath("15-the-devil"), meaningJa: "執着や惰性を見直す日。いつもの癖に気づくことが流れを変える鍵です。" },
  { id: 16, code: "major-16-tower", nameEn: "The Tower", nameJa: "塔", imagePath: toImagePath("16-the-tower"), meaningJa: "想定外の気づきが起こりやすい日。慌てず立て直しを優先すると安定します。" },
  { id: 17, code: "major-17-star", nameEn: "The Star", nameJa: "星", imagePath: toImagePath("17-the-star"), meaningJa: "希望と回復の流れ。先の明るさを意識すると心が軽くなりやすいです。" },
  { id: 18, code: "major-18-moon", nameEn: "The Moon", nameJa: "月", imagePath: toImagePath("18-the-moon"), meaningJa: "不安や曖昧さが出やすい日。結論を急がず確認を重ねると安心できます。" },
  { id: 19, code: "major-19-sun", nameEn: "The Sun", nameJa: "太陽", imagePath: toImagePath("19-the-sun"), meaningJa: "明るさと前向きさが追い風。素直な表現が人間関係を温めやすいです。" },
  { id: 20, code: "major-20-judgement", nameEn: "Judgement", nameJa: "審判", imagePath: toImagePath("20-judgement"), meaningJa: "再評価と再始動のタイミング。過去の経験を活かすほど前進しやすいです。" },
  { id: 21, code: "major-21-world", nameEn: "The World", nameJa: "世界", imagePath: toImagePath("21-the-world"), meaningJa: "ひと区切りと達成。仕上げや完了を意識すると満足度が高まりやすいです。" },
];

const suitMeta = [
  {
    key: "wands",
    nameJa: "ワンド",
    nameEn: "Wands",
    tone: "行動力や勢い",
    cue: "まず小さく着手すると流れが乗りやすい",
  },
  {
    key: "cups",
    nameJa: "カップ",
    nameEn: "Cups",
    tone: "感情や人間関係",
    cue: "気持ちを言葉にすると関係が整いやすい",
  },
  {
    key: "swords",
    nameJa: "ソード",
    nameEn: "Swords",
    tone: "思考や判断",
    cue: "情報整理を先にすると迷いが減りやすい",
  },
  {
    key: "pentacles",
    nameJa: "ペンタクル",
    nameEn: "Pentacles",
    tone: "現実面や積み重ね",
    cue: "足元を整えるほど安心して進みやすい",
  },
] as const;

const rankMeta = [
  { key: "ace", nameEn: "Ace", nameJa: "エース", fileSlug: "ace", focus: "始まりの兆し", angle: "新しいきっかけ" },
  { key: "two", nameEn: "Two", nameJa: "2", fileSlug: "2", focus: "調整と選択", angle: "バランス取り" },
  { key: "three", nameEn: "Three", nameJa: "3", fileSlug: "3", focus: "広がりと連携", angle: "協力の流れ" },
  { key: "four", nameEn: "Four", nameJa: "4", fileSlug: "4", focus: "安定と土台", angle: "守りの整え" },
  { key: "five", nameEn: "Five", nameJa: "5", fileSlug: "5", focus: "揺れや変化", angle: "立て直しの視点" },
  { key: "six", nameEn: "Six", nameJa: "6", fileSlug: "6", focus: "調和と前進", angle: "流れの回復" },
  { key: "seven", nameEn: "Seven", nameJa: "7", fileSlug: "7", focus: "工夫と見極め", angle: "作戦の見直し" },
  { key: "eight", nameEn: "Eight", nameJa: "8", fileSlug: "8", focus: "加速と継続", angle: "手を止めないこと" },
  { key: "nine", nameEn: "Nine", nameJa: "9", fileSlug: "9", focus: "仕上げ前の踏ん張り", angle: "最後の調整" },
  { key: "ten", nameEn: "Ten", nameJa: "10", fileSlug: "10", focus: "区切りと次段階", angle: "抱えすぎの整理" },
  { key: "page", nameEn: "Page", nameJa: "ペイジ", fileSlug: "page", focus: "学びと知らせ", angle: "素直な吸収" },
  { key: "knight", nameEn: "Knight", nameJa: "ナイト", fileSlug: "knight", focus: "行動と推進力", angle: "勢いの使い方" },
  { key: "queen", nameEn: "Queen", nameJa: "クイーン", fileSlug: "queen", focus: "受容と成熟", angle: "落ち着いた対応" },
  { key: "king", nameEn: "King", nameJa: "キング", fileSlug: "king", focus: "統率と責任", angle: "全体を整える視点" },
] as const;

function buildMinorMeaning(
  suit: (typeof suitMeta)[number],
  rank: (typeof rankMeta)[number]
): string {
  return `${suit.tone}で「${rank.focus}」が出やすい日です。${rank.angle}を意識し、${suit.cue}。`;
}

function buildMinorArcana(): TarotCardEntry[] {
  return suitMeta.flatMap((suit) =>
    rankMeta.map((rank, rankIndex) => ({
      id: 22 + suitMeta.findIndex((s) => s.key === suit.key) * rankMeta.length + rankIndex,
      code: `minor-${suit.key}-${rank.key}`,
      nameEn: `${rank.nameEn} of ${suit.nameEn}`,
      nameJa: `${suit.nameJa}の${rank.nameJa}`,
      imagePath: toImagePath(
        `${String(
          22 + suitMeta.findIndex((s) => s.key === suit.key) * rankMeta.length + rankIndex
        ).padStart(2, "0")}-${suit.key}-${rank.fileSlug}`
      ),
      meaningJa: buildMinorMeaning(suit, rank),
    }))
  );
}

export const tarotCards: TarotCardEntry[] = [...majorArcana, ...buildMinorArcana()];
const tarotCardsByNormalizedJaName = new Map<string, TarotCardEntry>();

function normalizeJaCardName(name: string): string {
  const toHalfWidthDigits = name.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
  return toHalfWidthDigits
    .replace(/[ 　\t\r\n]+/g, "")
    .replace(/のカード/g, "")
    .replace(/カード/g, "")
    .replace(/の/g, "")
    .replace(/\d+/g, (digits) => String(Number.parseInt(digits, 10)))
    .trim();
}

for (const card of tarotCards) {
  tarotCardsByNormalizedJaName.set(normalizeJaCardName(card.nameJa), card);
}

if (tarotCards.length !== 78) {
  throw new Error(`tarotCards must contain 78 cards, got ${tarotCards.length}`);
}
if (!tarotCards.every((card, index) => card.id === index)) {
  throw new Error("tarotCards ids must be sequential 0..77");
}
if (!tarotCards.every((card) => /^\/cards\/\d{2}-[a-z0-9-]+\.jpg$/.test(card.imagePath))) {
  throw new Error("tarotCards imagePath must follow /cards/xx-slug.jpg");
}

export function pickRandomTarotCard(random = Math.random): TarotCardEntry {
  const index = Math.floor(random() * tarotCards.length);
  return tarotCards[index] ?? tarotCards[0];
}

export function findTarotCardByJaName(nameJa: string): TarotCardEntry | null {
  return tarotCardsByNormalizedJaName.get(normalizeJaCardName(nameJa)) ?? null;
}
