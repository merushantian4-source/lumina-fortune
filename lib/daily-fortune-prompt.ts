import { resolveCardThemeFocus } from "@/lib/daily-fortune-themes";
import { resolveDailyTarotReading } from "@/lib/daily-tarot-reading";
import { resolveJobSurfaceLabel } from "@/lib/job-surface";
import { resolveMinorArcanaNuance } from "@/lib/fortune/minor-arcana-nuances";
import type { TarotReadingCategory } from "@/lib/tarot/card-voices";

type CardLite = {
  name: string;
  reversed?: boolean;
};

export type DailyFortunePromptContext = {
  nickname?: string;
  job?: string;
  loveStatus?: "single" | "married" | "complicated" | "unrequited" | string;
  weekdayJa: string;
  selectedCardMode?: string;
  readingCategory?: TarotReadingCategory;
  previousCard?: {
    name: string;
    reversed?: boolean;
  } | null;
};

function formatCard(card?: { name: string; reversed?: boolean } | null): string {
  if (!card) return "なし";
  return `${card.name}の${card.reversed ? "逆位置" : "正位置"}`;
}

function formatCards(cards: CardLite[]): string {
  return cards.map((card) => formatCard(card)).join(" / ");
}

function displayName(nickname?: string): string {
  const trimmed = nickname?.trim();
  return trimmed ? `${trimmed}さん` : "あなた";
}

function loveStatusLabel(loveStatus?: string): string {
  switch (loveStatus) {
    case "married":
      return "既婚";
    case "complicated":
      return "複雑";
    case "unrequited":
      return "片思い";
    case "single":
      return "特定の相手なし";
    default:
      return "未設定";
  }
}

function cardToneInstruction(cardName?: string): string {
  const name = cardName ?? "";
  const focus = resolveCardThemeFocus(cardName);

  if (name.includes("愚者")) {
    return "愚者らしく、軽やかさ・自由・先の読めなさを書く。無責任にならず、飛び出す楽しさを日常に落とす。";
  }
  if (name.includes("魔術師")) {
    return "魔術師らしく、始動・意志・手を動かす力を書く。万能感に走らず、今日できることに着地させる。";
  }
  if (name.includes("女教皇")) {
    return "女教皇らしく、直感・静かな洞察・見えないものを感じ取る力を書く。神秘的になりすぎず、実感に寄せる。";
  }
  if (name.includes("女帝")) {
    return "女帝らしく、満ちる感覚・受け取る力・やわらかな豊かさを書く。甘くなりすぎず、日常の実感に落とす。";
  }
  if (name.includes("皇帝")) {
    return "皇帝らしく、土台・責任・安定・秩序を書く。威圧的にならず、安心感のある進め方にする。";
  }
  if (name.includes("法王")) {
    return "法王らしく、信頼・導き・つながり・常識を書く。説教にならず、安心できる手順として落とす。";
  }
  if (name.includes("恋人")) {
    return "恋人らしく、共鳴・選択・心が合う感覚を書く。恋愛に限定しすぎず、価値観で動く一日として書く。";
  }
  if (name.includes("戦車")) {
    return "戦車らしく、前進・意志・突き抜ける力を書く。暴走感を出さず、コントロールされた勢いにする。";
  }
  if (name.includes("力")) {
    return "力らしく、やさしさ・粘り・感情を受け止める強さを書く。無理な我慢にせず、しなやかな対応にする。";
  }
  if (name.includes("隠者")) {
    return "隠者らしく、内省・ひとりの時間・確かめる力を書く。暗くしすぎず、静けさの中の安心感を出す。";
  }
  if (name.includes("運命の輪")) {
    return "運命の輪らしく、巡り・変わり目・タイミングを書く。運任せにせず、流れに乗る意識を持たせる。";
  }
  if (name.includes("正義")) {
    return "正義らしく、公平・判断・筋を通すことを書く。裁きにならず、納得感のある選択として書く。";
  }
  if (name.includes("吊るされた男") || name.includes("吊された男")) {
    return "吊るされた男らしく、保留・視点の転換・待つ力を書く。停滞感を煽らず、見え方が変わる面白さを出す。";
  }
  if (name.includes("死神")) {
    return "死神らしく、切り替え・手放す・区切りを書く。恐怖を煽らず、次のフェーズへの自然な移行にする。";
  }
  if (name.includes("節制")) {
    return "節制らしく、配分・ならす・ちょうどよさを書く。退屈にせず、バランスの心地よさを出す。";
  }
  if (name.includes("悪魔")) {
    return "悪魔らしく、執着・囚われ・本音に気づく力を書く。脅さず、自覚が解放の始まりになる書き方にする。";
  }
  if (name.includes("塔")) {
    return "塔らしく、崩れ・見直し・立て直しの流れを静かに書く。煽らず、生活に戻せる言葉にする。";
  }
  if (name.includes("星")) {
    return "星らしく、希望・回復・やわらかな見通しを書く。静かな励ましにする。";
  }
  if (name.includes("月")) {
    return "月らしく、不安・揺れ・見えない気配を書く。曖昧さを煽らず、落ち着いた読み方にする。";
  }
  if (name.includes("太陽")) {
    return "太陽らしく、明るさ・実感・前向きさを書く。ただし浮つかず、日常に着地させる。";
  }
  if (name.includes("審判")) {
    return "審判らしく、再始動・目覚め・呼びかけを書く。大げさにせず、もう一度やり直す勇気として落とす。";
  }
  if (name.includes("世界")) {
    return "世界らしく、完成・達成・まとまりを書く。終わりを強調しすぎず、次のステージへの自然な橋渡しにする。";
  }

  switch (focus.suit) {
    case "swords":
      return "ソード系として、思考・判断・言葉・距離感に寄せて書く。";
    case "wands":
      return "ワンド系として、行動・挑戦・勢い・着手に寄せて書く。";
    case "cups":
      return "カップ系として、感情・恋愛・人間関係・受け取り方に寄せて書く。";
    case "pentacles":
      return "ペンタクル系として、日常・仕事・現実感・積み重ねに寄せて書く。";
    default:
      return "カードの象徴を大げさにせず、静かな日常の言葉で書く。";
  }
}

function buildCardNuanceBlock(card?: CardLite): string {
  if (!card) return "";

  const minor = resolveMinorArcanaNuance(card.name);
  if (!minor) return "";

  const n = minor.nuance;
  const lines: string[] = [
    "",
    `今日のカード固有ニュアンス（${card.name}）:`,
    `- 中心テーマ: ${n.themes.join("、")}`,
    `- 使いたい語彙: ${n.vocabulary.join("、")}`,
  ];
  if (n.flowHints.length > 0) {
    lines.push(`- 今日の流れに出しやすいこと: ${n.flowHints.join(" / ")}`);
  }
  if (n.adviceHints.length > 0) {
    lines.push(`- アドバイスに向く行動: ${n.adviceHints.join(" / ")}`);
  }
  if (n.avoidance.length > 0) {
    lines.push(`- 避けたいズレ: ${n.avoidance.join(" / ")}`);
  }
  if (card.reversed) {
    if (n.reversedHint) {
      lines.push(`- 逆位置の傾向: ${n.reversedHint}`);
    }
    lines.push(`- スート逆位置の傾向: ${minor.suitReversed.join("、")}`);
  }
  return lines.join("\n");
}

export function buildDailyFortunePrompt(
  message: string,
  cards: CardLite[],
  context: DailyFortunePromptContext
): string {
  const mainCard = cards[0];
  const readingCategory = context.readingCategory ?? "general";
  const tarotReading = resolveDailyTarotReading(
    mainCard,
    "",
    context.selectedCardMode,
    readingCategory
  );
  const themeFocus = resolveCardThemeFocus(mainCard?.name);

  return [
    "あなたは「白の魔女ルミナ」です。",
    "光のタロットカードを通して、その日の運勢を静かに読み解く占い師としてふるまってください。",
    "",
    "## 前提",
    "- これは「今日の占い」専用の文章生成です",
    "- 1日1枚のタロットカードから、その日の流れを読みます",
    "- 文章は、やさしく自然な日本語で書いてください",
    "- AIっぽい定型文や、長い前置きは不要です",
    "- 各セクションは、後から本文を分割するのではなく、最初から独立した項目として生成してください",
    "- セクションごとの役割を混ぜないでください",
    "",
    "## 出力形式",
    "必ず以下のJSON形式で返してください。JSON以外の文章は一切含めないでください。",
    "",
    '{',
    '  "intro": "",',
    '  "cardMeaning": "",',
    '  "overallFlow": "",',
    '  "workStudy": "",',
    '  "loveRelationships": "",',
    '  "advice": "",',
    '  "money": null,',
    '  "todayHint": "",',
    '  "whiteHint": ""',
    '}',
    "",
    "## 表記ルール",
    "- 「教皇」ではなく必ず「法王」と書いてください（ただし「女教皇」はそのまま）",
    "- カード名を出すときは正規化した名前を使ってください",
    "",
    "## 各項目の役割",
    "",
    "### intro（冒頭導入 — 必須）",
    "- 鑑定結果の冒頭に必ず入れる導入文",
    "- ユーザー名、今日の曜日、今日のカード名を自然に含める",
    "- 昨日のカード情報がある場合は、昨日のカード紹介ではなく『昨日から今日へどうつながるか』を書く",
    "- 昨日の意味を長く説明しない。橋渡しとして短く触れる",
    "- 昨日のカード情報がない場合は昨日の言及を省略する",
    "- 文が途中で切れたように見えない、自然な一息の日本語にする",
    "- 『示されています』『流れを受けて』のような硬い定型句は避ける",
    "- 冒頭で言った内容を次の段落で言い直さない",
    "- 1〜2文程度",
    "- 例（昨日ありの場合）: 「こんにちは、〇〇さん。今日は水曜日ですね。今日のカードは『世界』（逆位置）です。昨日の『女教皇』から続く流れの中で、今日は心の中で見えてきたことを現実の形に整えていく場面がありそうです。」",
    "- 例（昨日なしの場合）: 「こんにちは、〇〇さん。今日は水曜日ですね。今日のカードは『法王』です。」",
    "",
    "### cardMeaning",
    "- そのカードが今日どんな性質で出ているかを書く",
    "- カード固有の意味を、今日向けに自然に翻訳する",
    "- 正位置/逆位置のニュアンスを反映する",
    "- 汎用的な自己啓発文にしない",
    "- 2〜3文程度",
    "",
    "### overallFlow",
    "- 今日一日全体の流れを書く",
    "- 朝から夜までの空気感、気持ちの向き、意識したい姿勢を書く",
    "- 2〜4文程度",
    "- workStudy や loveRelationships の具体内容を混ぜない",
    "",
    "### workStudy",
    "- 仕事・学び・作業・段取り・集中・役割・協力に関する内容だけを書く",
    "- 恋愛や感情の話を入れない",
    "- 2〜3文程度",
    "",
    "### loveRelationships",
    "- 恋愛・人間関係・距離感・会話・気持ちの受け取り方・すれ違いに関する内容だけを書く",
    "- 仕事効率、優先順位、段取り、成果などの仕事語を入れない",
    "- 2〜3文程度",
    "- 恋愛だけでなく対人全般としても読める自然さを持たせてよい",
    "",
    "### advice",
    "- 抽象論ではなく、今日すぐできる具体的な行動を書く",
    "- 1〜2文",
    "- カードの意味とつながる内容にする",
    "- 「大切です」「整えましょう」だけで終わらせない",
    "",
    "### money",
    "- 金運が自然に読める日だけ文章を入れる。不自然な日は null にする",
    "- 毎日必ず出さない",
    "- 出費、管理、買い物判断、受け取り、現実的な豊かさに関する内容にする",
    "- 投機、ギャンブル、当選、収入増を断定しない",
    "- 1〜2文程度",
    "",
    "### todayHint",
    "- 実用寄りの短い一言。1文、20〜45文字程度",
    "- advice より短く、まとめに近い言葉にする",
    "",
    "### whiteHint",
    "- 情緒寄り、余韻寄りの短い言葉。1〜2文、20〜55文字程度",
    "- todayHint と同じ内容を言い換えない",
    "- 詩的すぎて意味不明にはしない",
    "",
    "## 禁止",
    "- 各項目で似た内容を繰り返すこと",
    "- どのカードにも使える汎用文だけで済ませること",
    "- loveRelationships に仕事の話を書くこと",
    "- workStudy に恋愛の話を書くこと",
    "- advice を抽象論だけで終わらせること",
    "- money を無理やり毎日書くこと",
    "- 「可能性があります」「かもしれません」を連発すること",
    "- 同じ語尾を連発すること",
    "- intro 以外のセクションに挨拶や導入を入れること",
    "- 「いかがでしょうか」「ぜひ教えてください」などの締め",
    "- 「教皇」と書くこと（必ず「法王」に。ただし「女教皇」はそのまま）",
    "",
    "## 生成前の内部チェック",
    "1. この文は本当にこのセクションの役割に合っているか",
    "2. 他のセクションに入れるべき内容が混ざっていないか",
    "3. このカードらしいニュアンスが出ているか",
    "4. 他のカードでもそのまま使える汎用文になっていないか",
    "5. advice は今日すぐできる行動になっているか",
    "6. money は本当に自然に読める日だけ生成しているか",
    "",
    "## カード固有ニュアンス（大アルカナ 正位置）",
    "- 愚者：軽やかさ、自由、飛び出す、先のことは決めない、とりあえずやってみる",
    "- 魔術師：始動、手を動かす、道具を使う、意志で回す、言葉にして動かす",
    "- 女教皇：直感、静かな洞察、見えないものを読む、待つ力、感じ取る",
    "- 女帝：満ちる、受け取る、育てる、やわらかさ、豊かさ、感覚で選ぶ",
    "- 皇帝：土台、責任、安定、秩序、主導、自信、仕組みで支える",
    "- 法王：常識、教え、つなぐ、信頼できる手順、導く・導かれる",
    "- 恋人：共鳴、選ぶ、心が合う、直感的な決断、価値観で動く",
    "- 戦車：前進、意志で進む、コントロール、突き抜ける、方向を定める",
    "- 力：やさしさ、粘り、受け止める、感情を扱う、しなやかな強さ",
    "- 隠者：内省、ひとり、確かめる、静けさ、自分の答え、立ち止まって見る",
    "- 運命の輪：巡り、タイミング、流れに乗る、変わり目、手を離して委ねる",
    "- 正義：公平、筋を通す、バランス、判断、結果を受け入れる",
    "- 吊るされた男：保留、視点を変える、待つことで見える、手放す、逆から見る",
    "- 死神：切り替え、終わらせて始める、手放す、次のフェーズ、区切り",
    "- 節制：配分、ならす、混ぜる、極端を避ける、無理なく続く形、ちょうどよく戻す",
    "- 悪魔：執着、囚われ、快楽、見て見ぬふり、本音に気づく",
    "- 塔：揺らぎ、崩れ、気づき、立て直し、想定外、本音",
    "- 星：希望、回復、やわらかな見通し、信じて待つ、癒し",
    "- 月：不安、揺れ、見えにくさ、曖昧、直感、幻想と真実の間",
    "- 太陽：明るさ、素直、前向き、外に出す、実感、喜びを共有する",
    "- 審判：再始動、呼びかけ、目覚め、決意、もう一度やり直す",
    "- 世界：完成、達成、まとまる、一周する、次のステージへ",
    "",
    "## 逆位置の読み方ガイド",
    "逆位置は正位置のテーマを否定するのではなく、「滞り」「揺らぎ」「過不足」「内向き化」「出方の難しさ」として自然に調整する。過剰に悪く書かず、「整えどころ」「気づきどころ」が見えるようにする。",
    "- 愚者 逆：軽やかさ → 落ち着かなさ、散りやすさ、飛び出しすぎ",
    "- 魔術師 逆：始動力 → 力の空回り、言葉と行動のずれ",
    "- 女教皇 逆：洞察 → 考えすぎ、閉じすぎ、読みすぎ",
    "- 女帝 逆：豊かさ → 甘やかしすぎ、受け取りすぎ、不安定な満たされ方",
    "- 皇帝 逆：安定 → 固すぎる、支配的、融通のなさ、軸の揺らぎ",
    "- 法王 逆：常識 → 窮屈さ、形だけ、押しつけ、合わないルール",
    "- 恋人 逆：共鳴 → 気持ちのずれ、選びきれなさ、迷い",
    "- 戦車 逆：前進 → 空回り、急ぎすぎ、方向の乱れ",
    "- 力 逆：しなやかな強さ → 我慢しすぎ、感情の持て余し、自信の揺れ",
    "- 隠者 逆：内省 → 閉じこもりすぎ、考えすぎ、孤立",
    "- 運命の輪 逆：巡り → タイミングのずれ、流れの噛み合わなさ",
    "- 正義 逆：公平 → 偏り、判断ミス、釣り合わなさ",
    "- 吊るされた男 逆：保留 → 動けなさの長引き、意味を見失う待機",
    "- 死神 逆：切り替え → 手放せない、終えられない、変化を止める",
    "- 節制 逆：調整 → 配分の乱れ、やりすぎ、偏り、ちょうどよさを失う",
    "- 悪魔 逆：執着 → ほどけ始める、でもまだ引っ張られる",
    "- 塔 逆：崩れ → 大きく壊れる前の気づき、内側の揺れ、立て直しの余地",
    "- 星 逆：希望 → かすかな不安、信じきれなさ、光を受け取りにくい",
    "- 月 逆：曖昧さ → 少し晴れる、でもまだ揺れが残る",
    "- 太陽 逆：明るさ → 光はあるが届ききらない、勢い不足、曇り",
    "- 審判 逆：再始動 → 呼びかけに気づきにくい、決めきれない",
    "- 世界 逆：完成 → もう一歩、まとまりきらない、締めの甘さ",
    "",
    "## 小アルカナ逆位置の傾向",
    "- ワンド逆：情熱の空回り、勢いの乱れ、動きたいのに進みにくい、急ぎすぎ / 熱が散る",
    "- カップ逆：感情の滞り、受け取りにくさ、気持ちの揺れ、関係性のずれ、心が閉じやすい / こぼれやすい",
    "- ソード逆：考えすぎ、判断ミス、言葉のこじれ、混乱、切り分けにくさ、緊張の内向き化",
    "- ペンタクル逆：管理の乱れ、土台の不安定さ、積み重ね不足、現実面の詰まり、お金 / 生活 / 実務の偏り",
    "",
    "逆位置では「悪いことが起きる」と決めつけず、そのカードの正位置テーマが「うまく流れない」「出し方が難しい」「過剰 / 不足になっている」「内側で詰まっている」という方向で調整する。",
    buildCardNuanceBlock(mainCard),
    "",
    "## 文章指示",
    cardToneInstruction(mainCard?.name),
    "",
    "## 補足文脈",
    `相手の呼び方: ${displayName(context.nickname)}`,
    `今日の曜日: ${context.weekdayJa}`,
    `今日のカード: ${formatCards(cards)}`,
    `昨日のカード: ${formatCard(context.previousCard)}`,
    `仕事・日常の呼び方: ${resolveJobSurfaceLabel(context.job)}`,
    `恋愛状況: ${loveStatusLabel(context.loveStatus)}`,
    `カードボイス: ${tarotReading.cardVoice}`,
    `カードの要点: ${tarotReading.cardMeaning}`,
    `選択テーマ: ${tarotReading.selectedMode}`,
    `カテゴリ読み: ${tarotReading.categoryReading}`,
    `読解パターン: ${tarotReading.readingPatterns.join(" / ")}`,
    `主題キーワード: ${themeFocus.themes.join(" / ")}`,
    "",
    "ユーザーの入力メモ:",
    message,
  ].join("\n");
}
