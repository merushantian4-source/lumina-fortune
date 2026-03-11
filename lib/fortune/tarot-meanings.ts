import { tarotDeckAll, type TarotDeckCard, type TarotRank, type TarotSuit } from "@/lib/tarot/deck";

export type TarotMeaningTheme = "general" | "love" | "work" | "future" | "advice";

export type TarotMeaningGuide = {
  cardName: string;
  coreMeaning: string;
  positiveMeaning: string;
  cautionMeaning: string;
  luminaTone: string;
  themes: Record<TarotMeaningTheme, string>;
};

const suitThemeText: Record<TarotSuit, { general: string; love: string; work: string; future: string; advice: string; tone: string }> = {
  wands: {
    general: "情熱や行動力がどこへ向かおうとしているかを見るカードです。",
    love: "気持ちの熱量、関係を動かす勢い、恋の進展を映しやすいカードです。",
    work: "挑戦、推進力、始動のタイミングを読みやすいカードです。",
    future: "これからの流れを切り開くための火種を示しやすいカードです。",
    advice: "勢いを活かしつつ、空回りしないよう向きを整える視点が大切です。",
    tone: "炎をあおりすぎず、勇気に静かな方向を与える語り方にする。",
  },
  cups: {
    general: "感情、受容、心の交流がどう揺れているかを見るカードです。",
    love: "恋愛や親密さ、安心感、気持ちの通い方を繊細に映すカードです。",
    work: "人との相性、満足感、共感の質が結果にどう影響するかを示します。",
    future: "心がどこへ向かいたがっているか、感情の流れから未来を照らします。",
    advice: "気持ちを否定せず受け止めながら、境界線も忘れない視点が大切です。",
    tone: "やさしく受け止めつつ、感傷に沈みすぎない語り方にする。",
  },
  swords: {
    general: "思考、言葉、判断の鋭さや緊張感を映しやすいカードです。",
    love: "気持ちそのものより、すれ違い、言葉、誤解の構造を示しやすいカードです。",
    work: "判断力、課題の切り分け、厳しさの扱い方を読み解くカードです。",
    future: "見ないふりをしていた課題や、整理すべき論点を明るみに出します。",
    advice: "切れ味を鈍らせずに、言葉の温度を少しやわらげる視点が大切です。",
    tone: "厳しさをそのまま突きつけず、理解と整理へ導く語り方にする。",
  },
  pentacles: {
    general: "現実、暮らし、仕事、お金、積み重ねを映しやすいカードです。",
    love: "関係の安心感、現実的な歩幅、長く続く土台を示しやすいカードです。",
    work: "成果、継続、実務、信頼の積み重ねを読み解くカードです。",
    future: "これから形になっていくもの、時間をかけて育つ実りを示します。",
    advice: "目の前の一歩を丁寧に積むことが、いちばん強い開運行動になります。",
    tone: "現実感を大切にしつつ、努力が実りへ変わる希望を添える語り方にする。",
  },
};

const rankThemeText: Record<TarotRank, { core: string; positive: string; caution: string }> = {
  ace: {
    core: "新しい始まりと、まだ小さな可能性の灯り",
    positive: "小さな始まりを信じて動くほど、流れが育ちやすくなります。",
    caution: "始まりの勢いだけで満足せず、続ける形をつくる必要があります。",
  },
  two: {
    core: "選択、バランス、相手や状況との向き合い方",
    positive: "対話や比較を通して、自分に合う道を選びやすくなります。",
    caution: "迷い続けるだけでは流れが停滞しやすくなります。",
  },
  three: {
    core: "広がり、協力、動き出した流れの育ち方",
    positive: "一人で抱えず、つながりを使うほど物事が伸びます。",
    caution: "広げすぎると焦点がぼやけやすくなります。",
  },
  four: {
    core: "安定、守り、足元を固める意識",
    positive: "守るべきものを定めるほど、安心が生まれます。",
    caution: "守りに入りすぎると流れが固まりやすくなります。",
  },
  five: {
    core: "揺らぎ、摩擦、試される局面",
    positive: "揺れの中で何を大切にしたいかがはっきりします。",
    caution: "目の前の摩擦だけに囚われると、本質を見失いやすくなります。",
  },
  six: {
    core: "巡り、回復、受け取り直す流れ",
    positive: "過去の経験や助けが今の支えとして戻ってきやすい時期です。",
    caution: "懐かしさや安心に留まりすぎると前進が鈍ることがあります。",
  },
  seven: {
    core: "試行錯誤、見極め、視点の揺れ",
    positive: "本当に必要なものを選び直す力が育ちます。",
    caution: "迷いを放置するとエネルギーが散りやすくなります。",
  },
  eight: {
    core: "集中、継続、流れを前に進める工夫",
    positive: "手を動かし続けるほど、流れがはっきり整います。",
    caution: "急ぎすぎると、気持ちや周囲が追いつかなくなります。",
  },
  nine: {
    core: "仕上がりの手前で見える本音や完成度",
    positive: "ここまで積み上げてきたものの輪郭が見えやすい時期です。",
    caution: "あと一歩の不安が、必要以上の緊張を生むことがあります。",
  },
  ten: {
    core: "一区切り、完成、次へ渡すためのまとめ",
    positive: "ひとつの流れをきれいに閉じることで次が開きます。",
    caution: "抱え込みすぎた重みをそのまま持ち越さないようにする必要があります。",
  },
  page: {
    core: "新しい学び、素直な観察、小さな知らせ",
    positive: "未熟さを恐れず学ぶ姿勢が追い風になります。",
    caution: "受け身のままだと知らせを活かしきれないことがあります。",
  },
  knight: {
    core: "動き、使命感、進み方の癖",
    positive: "勢いをうまく使えれば流れは大きく動きます。",
    caution: "急ぎ方や熱量の偏りを整える必要があります。",
  },
  queen: {
    core: "成熟した受け止め方、内側の豊かさ、落ち着き",
    positive: "自分の感性や経験を信じるほど安定した力が出ます。",
    caution: "抱え込みや静かな我慢が続くと滞りになります。",
  },
  king: {
    core: "統率、成熟、責任ある扱い方",
    positive: "自分の力を落ち着いて使うほど信頼が高まります。",
    caution: "強さの出し方が固くなると圧に見えやすくなります。",
  },
};

const majorToneText: Record<string, string> = {
  愚者: "新しい扉の前に立つ心を、無邪気さと慎重さの両方で包むように伝える。",
  魔術師: "可能性を誇張せず、今ある力を丁寧に形へ変えるように伝える。",
  女教皇: "静かな直感の声を、急がせずに拾い上げるように伝える。",
  女帝: "受け取り、育てる豊かさを、やわらかな安心感とともに伝える。",
  皇帝: "強さや責任を硬くせず、頼もしさとして伝える。",
  法王: "学びや基本に戻ることを、古さではなく支えとして伝える。",
  恋人: "選択と関係性を、正解探しではなく納得へ向かう流れとして伝える。",
  戦車: "前進の勢いに、進む方向の明晰さを添えて伝える。",
  力: "激しさではなく、やわらかな強さが本質だと伝える。",
  隠者: "ひとりの時間を逃避ではなく、答えを迎える灯りとして伝える。",
  運命の輪: "変化を偶然ではなく、巡りの節目として伝える。",
  正義: "裁くのではなく、整えるための視点として伝える。",
  吊るされた男: "停滞を無意味とせず、見方を変える準備として伝える。",
  死神: "終わりを怖がらせず、再生の入口として伝える。",
  節制: "無理のない調和を、静かな回復として伝える。",
  悪魔: "執着を責めず、気づいた先に自由があると伝える。",
  塔: "崩れを破滅ではなく、本質へ戻る合図として伝える。",
  星: "希望を軽く言わず、回復の手触りとして伝える。",
  月: "不安を煽らず、霧の中では歩幅を小さくする知恵として伝える。",
  太陽: "明るさを無邪気に押しつけず、素直さの力として伝える。",
  審判: "再始動を急かさず、目覚めの呼び声として伝える。",
  世界: "完成をゴールに閉じず、次へ渡す祝福として伝える。",
};

function buildMinorCardGuide(card: TarotDeckCard): TarotMeaningGuide {
  const suit = card.suit ?? "wands";
  const rank = card.rank ?? "ace";
  const suitText = suitThemeText[suit];
  const rankText = rankThemeText[rank];

  return {
    cardName: card.nameJa,
    coreMeaning: `${rankText.core}。${card.uprightMeaning}。`,
    positiveMeaning: `${rankText.positive} ${suitText.general}`,
    cautionMeaning: `${card.reversedMeaning}。${rankText.caution}`,
    luminaTone: suitText.tone,
    themes: {
      general: `${suitText.general} ${card.uprightMeaning}を軸に読む。`,
      love: `${suitText.love} ${card.reversedMeaning}が出ているなら気持ちのすれ違いも丁寧に拾う。`,
      work: `${suitText.work} ${card.uprightMeaning}を現実的な行動へ結びつける。`,
      future: `${suitText.future} ${card.reversedMeaning}なら歩幅の調整を意識して読む。`,
      advice: `${suitText.advice} ${rankText.caution}`,
    },
  };
}

function buildMajorCardGuide(card: TarotDeckCard): TarotMeaningGuide {
  return {
    cardName: card.nameJa,
    coreMeaning: `${card.uprightMeaning}。${card.symbolKeywords.join("、")}がこのカードの核です。`,
    positiveMeaning: `${card.uprightMeaning}が追い風として働きやすい時期です。`,
    cautionMeaning: `${card.reversedMeaning}を注意深く見て、流れの偏りを整える視点が必要です。`,
    luminaTone: majorToneText[card.nameJa] ?? "カードの象徴を大げさにせず、静かな気づきとして手渡すように伝える。",
    themes: {
      general: `${card.uprightMeaning}を今の流れ全体に重ねて読む。`,
      love: `関係性や感情の動きに照らすなら、${card.uprightMeaning}と${card.reversedMeaning}の揺れを丁寧に扱う。`,
      work: `仕事や役割に照らすなら、${card.uprightMeaning}を現実的な判断へつなげる。`,
      future: `未来を見るなら、${card.uprightMeaning}がどんな変化や節目を告げるかに注目する。`,
      advice: `助言としては、${card.reversedMeaning}に偏らないための姿勢を示す。`,
    },
  };
}

export const tarotMeaningGuides: Record<string, TarotMeaningGuide> = Object.fromEntries(
  tarotDeckAll.map((card) => [
    card.nameJa,
    card.arcana === "major" ? buildMajorCardGuide(card) : buildMinorCardGuide(card),
  ])
);

export function getTarotMeaningGuide(cardName: string): TarotMeaningGuide | null {
  return tarotMeaningGuides[cardName] ?? null;
}

export function formatTarotMeaningGuide(card: TarotDeckCard): string {
  const guide = getTarotMeaningGuide(card.nameJa);
  if (!guide) return `${card.nameJa}: ${card.uprightMeaning}`;

  return [
    `カード名: ${guide.cardName}`,
    `- coreMeaning: ${guide.coreMeaning}`,
    `- positiveMeaning: ${guide.positiveMeaning}`,
    `- cautionMeaning: ${guide.cautionMeaning}`,
    `- luminaTone: ${guide.luminaTone}`,
    `- general: ${guide.themes.general}`,
    `- love: ${guide.themes.love}`,
    `- work: ${guide.themes.work}`,
    `- future: ${guide.themes.future}`,
    `- advice: ${guide.themes.advice}`,
  ].join("\n");
}
