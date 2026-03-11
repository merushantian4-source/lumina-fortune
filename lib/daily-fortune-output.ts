import { resolveCardThemeFocus } from "@/lib/daily-fortune-themes";
import { resolveDailyTarotReading } from "@/lib/daily-tarot-reading";
import { resolveJobSurfaceLabel, sanitizeJobSurface } from "@/lib/job-surface";
import type { TarotReadingCategory } from "@/lib/tarot/card-voices";

type LiteCard = {
  name: string;
  reversed?: boolean;
};

type DailyFortuneOutputContext = {
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

const INTRO_LABEL = "冒頭導入";
const CARD_MEANING_LABEL = "カードの意味";
const OVERALL_FLOW_LABEL = "今日の流れ";
const WORK_FLOW_LABEL = "仕事・学び";
const LOVE_FLOW_LABEL = "恋愛・人間関係";
const ADVICE_LABEL = "アドバイス";
const MONEY_LABEL = "金運";
const TODAY_HITOKOTO_LABEL = "今日のひとこと";
const WHITE_HITOKOTO_LABEL = "白のひとこと";

const ALL_LABELS = [
  INTRO_LABEL,
  CARD_MEANING_LABEL,
  OVERALL_FLOW_LABEL,
  WORK_FLOW_LABEL,
  LOVE_FLOW_LABEL,
  ADVICE_LABEL,
  MONEY_LABEL,
  TODAY_HITOKOTO_LABEL,
  WHITE_HITOKOTO_LABEL,
];

export type DailyFortuneSections = {
  intro: string;
  cardMeaning: string;
  overallFlow: string;
  work: string;
  love: string;
  advice: string;
  money: string;
  todayHitokoto: string;
  whiteHitokoto: string;
};

const BLOCKED_PHRASES = [
  "このカードは",
  "意味します",
  "今日の中心です",
  "手触りです",
  "流れが出やすい日",
  "気配が表れやすい",
  "兆し",
];

const SOFT_BLOCKED_WORDS = ["静かに", "整える", "やわらかな光", "しやすい", "でしょう"];

function normalize(text: string): string {
  return normalizeHierophantName(text.replace(/\r\n/g, "\n").trim());
}

/**
 * 「教皇」→「法王」に統一する（「女教皇」はそのまま）
 */
function normalizeHierophantName(text: string): string {
  return text.replace(/(?<!女)教皇/g, "法王");
}

function ensureEnding(text: string): string {
  return /[。！]$/.test(text) ? text : `${text}。`;
}

function splitParagraphs(text: string): string[] {
  return normalize(text)
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[。！？])/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeForCompare(text: string): string {
  return text.replace(/[ \n\r\t「」『』、。！？]/g, "");
}

function buildTodayBridge(mainCard: LiteCard, previousCard?: LiteCard | null): string {
  if (!previousCard) return "";

  const todayFocus = resolveCardThemeFocus(mainCard.name);
  const previousFocus = resolveCardThemeFocus(previousCard.name);

  if (todayFocus.suit === "pentacles") {
    return "今日は昨日の気づきを、現実の形に整えていく場面がありそうです。";
  }
  if (todayFocus.suit === "cups") {
    return "今日は昨日から動いていた気持ちを、やさしく受け止め直す流れになりそうです。";
  }
  if (todayFocus.suit === "swords") {
    return "今日は昨日の中でぼんやりしていたことを、少しはっきり見極める場面がありそうです。";
  }
  if (todayFocus.suit === "wands") {
    return "今日は昨日まで胸の内にあったものを、軽く動かしてみる流れになりそうです。";
  }

  if (mainCard.name.includes("世界")) {
    return mainCard.reversed
      ? "今日は昨日見えてきたことを、無理なく仕上げ直していく場面がありそうです。"
      : "今日は昨日までの積み重ねが、ひとつの形にまとまりやすいでしょう。";
  }
  if (mainCard.name.includes("女教皇")) {
    return "今日は昨日からの気配を、静かな確信として受け取りやすいでしょう。";
  }
  if (mainCard.name.includes("法王")) {
    return "今日は昨日までの迷いを、落ち着いた形に整えていく流れがありそうです。";
  }
  if (mainCard.name.includes("太陽")) {
    return "今日は昨日の空気がほどけて、少し素直に前を向きやすくなりそうです。";
  }
  if (mainCard.name.includes("月")) {
    return "今日は昨日から揺れていた気持ちを、急がず見守ることが大切になりそうです。";
  }

  if (previousFocus.suit === todayFocus.suit) {
    return "今日は昨日から続いている感覚を、もう一段深く確かめる日になりそうです。";
  }

  return mainCard.reversed
    ? "今日は昨日の流れの中で見えてきたことを、急がず整え直す場面がありそうです。"
    : "今日は昨日の流れの先で、気持ちや出来事が少し形になって見えてきそうです。";
}

function isRepetitiveLeadSentence(sentence: string): boolean {
  return (
    sentence.includes("今日のカードは") ||
    sentence.includes("示されています") ||
    sentence.includes("流れを受けて")
  );
}

/**
 * 冒頭導入テンプレートを生成する
 */
function buildIntroText(
  cards: LiteCard[],
  context: DailyFortuneOutputContext,
): string {
  const mainCard = cards[0];
  if (!mainCard) return "";

  const userName = context.nickname?.trim() || "あなた";
  const weekday = context.weekdayJa || "今日";
  const todayCardName = normalizeHierophantName(mainCard.name);
  const orientation = mainCard.reversed ? "逆位置" : "正位置";
  const previousCard = context.previousCard;

  const base = `こんにちは、${userName}さん。今日は${weekday}ですね。今日のカードは「${todayCardName}」（${orientation}）です。`;
  if (previousCard) {
    const prevName = normalizeHierophantName(previousCard.name);
    return `${base} 昨日の「${prevName}」から続く流れの中で、${buildTodayBridge(mainCard, previousCard)}`;
  }

  return base;
}

function isLabelParagraph(text: string): boolean {
  return (
    text.startsWith(TODAY_HITOKOTO_LABEL) ||
    text.startsWith(WHITE_HITOKOTO_LABEL) ||
    text === TODAY_HITOKOTO_LABEL ||
    text === WHITE_HITOKOTO_LABEL
  );
}

function hasBlockedPhrase(text: string): boolean {
  return BLOCKED_PHRASES.some((phrase) => text.includes(phrase));
}

function countOccurrences(text: string, word: string): number {
  return (text.match(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
}

function overusesSoftBlockedWords(text: string): boolean {
  return SOFT_BLOCKED_WORDS.some((word) => countOccurrences(text, word) >= 2);
}

function pickCandidateParagraphs(text: string): string[] {
  const paragraphs = splitParagraphs(text)
    .filter((paragraph) => !isLabelParagraph(paragraph))
    .filter((paragraph) => !paragraph.includes("今日のカードは"))
    .filter((paragraph) => !paragraph.includes("示されています"))
    .filter((paragraph) => !paragraph.includes("流れを受けて"))
    .filter((paragraph) => !hasBlockedPhrase(paragraph))
    .filter((paragraph) => !overusesSoftBlockedWords(paragraph));

  const picked: string[] = [];
  for (const paragraph of paragraphs) {
    const normalizedParagraph = normalizeForCompare(paragraph);
    if (!normalizedParagraph) continue;
    if (
      picked.some((existing) => {
        const normalizedExisting = normalizeForCompare(existing);
        return (
          normalizedExisting === normalizedParagraph ||
          normalizedExisting.includes(normalizedParagraph) ||
          normalizedParagraph.includes(normalizedExisting)
        );
      })
    ) {
      continue;
    }
    picked.push(paragraph);
  }

  return picked;
}

function firstTwoSentences(text: string): string {
  return splitSentences(text).slice(0, 2).join("");
}

function displayName(nickname?: string): string {
  const trimmed = nickname?.trim();
  return trimmed ? `${trimmed}さん` : "あなた";
}

function orientationText(card: LiteCard): string {
  return card.reversed ? "逆位置" : "正位置";
}

function previousCardText(card?: LiteCard | null): string {
  if (!card) return "";
  return `${card.name}の${orientationText(card)}`;
}

function cardTemperature(card: LiteCard): "calm" | "bright" | "sharp" | "soft" | "grounded" {
  const focus = resolveCardThemeFocus(card.name);

  if (card.name.includes("隠者") || card.name.includes("月")) return "calm";
  if (card.name.includes("太陽")) return "bright";
  if (card.name.includes("力")) return "soft";
  if (card.name.includes("ナイト") && card.name.includes("ソード")) return "sharp";

  switch (focus.suit) {
    case "swords":
      return "sharp";
    case "wands":
      return "bright";
    case "cups":
      return "soft";
    case "pentacles":
      return "grounded";
    default:
      return "calm";
  }
}

function fallbackOverallFlow(card: LiteCard, context: DailyFortuneOutputContext): string {
  const reading = resolveDailyTarotReading(
    card,
    "",
    context.selectedCardMode,
    context.readingCategory ?? "general"
  );

  if (card.name.includes("節制")) {
    return card.reversed
      ? "今日は、バランスが崩れやすく、やりすぎたり抑えすぎたりしやすい空気があります。極端に振れそうになったら、少し手を止めて「ちょうどいい」を探し直すと落ち着きやすくなります。"
      : "今日は、がんばりすぎや考えすぎを静かにほどいていける日です。全部を一気に整えようとしなくても、少し配分を見直すだけで空気がやわらぎやすいでしょう。極端に振れず、ちょうどいい地点を探る意識が助けになります。";
  }

  if (card.name.includes("皇帝")) {
    return card.reversed
      ? "今日は、自分の思い通りに進めようとするほど空回りしやすい日です。ルールや正しさを手放すのではなく、少し力を抜いて柔軟に構えると流れが戻ってきます。"
      : "今日は、土台を整えながら進むほど安心感が生まれやすい日です。勢いよりも、順序と責任感が流れを安定させてくれるでしょう。";
  }

  if (card.name.includes("隠者")) {
    return card.reversed
      ? "今日は、考え込みすぎて動けなくなりやすい空気があります。完璧な答えを待つより、小さくてもいいので一歩動いてみると気持ちがほぐれていきます。"
      : "今日は、ひとりで落ち着いて考える時間を持つと、次にどう動くかが見えやすくなります。まわりに合わせて急ぐより、自分の中の答えを確かめることに意味がある一日です。";
  }

  if (card.name.includes("太陽")) {
    return card.reversed
      ? "今日は、明るく振る舞おうとするほど疲れが出やすい空気があります。見栄を張らず、素直な気持ちで過ごすほうが自然体でいられそうです。"
      : "今日は、気持ちを明るく外へ出していくほど、物事が前に進みやすくなります。遠慮しすぎず、うれしいことや思ったことを素直に表すと、空気が軽くなっていきます。";
  }

  if (card.name.includes("月")) {
    return "今日は、気持ちが揺れたり、はっきりしないことが気になりやすい日です。無理に答えを決めず、見えにくさごと受け止めることで、かえって大事な感覚を見失わずにすみます。";
  }

  if (card.name.includes("力")) {
    return "今日は、強く押し切るよりも、感情をうまく受け止めることが流れを助けてくれそうです。やさしく踏ん張る姿勢が、思っている以上に大きな支えになります。";
  }

  if (card.name.includes("塔")) {
    return card.reversed
      ? "今日は、崩れかけていたものが静かに落ち着きを取り戻していくような日です。無理に立て直そうとせず、自然に形が変わるのを受け入れるほうがスムーズです。"
      : "今日は、予想外のことが起きやすい空気があります。驚いても慌てず、「何が残ったか」を見つめることで、次に進む道が見えてきます。";
  }

  if (card.name.includes("星")) {
    return "今日は、静かな希望や回復の気配がある日です。焦って成果を出そうとするよりも、自分の中にある「良くなりたい」という気持ちを信じて過ごすと、やわらかな見通しが開けていきます。";
  }

  if (card.name.includes("愚者")) {
    return card.reversed
      ? "今日は、気持ちが落ち着かず、あちこちに意識が散りやすい空気があります。飛び出したくなっても、一度足元を確かめてから動くと安定しやすくなります。"
      : "今日は、軽やかに動ける空気が流れています。先のことを考えすぎず、目の前のおもしろさに素直に乗ってみると、思いがけない展開が開けていきそうです。";
  }

  if (card.name.includes("魔術師")) {
    return card.reversed
      ? "今日は、やる気はあるのに空回りしやすい日です。言葉と行動がずれやすいので、動く前に「何から始めるか」を一つだけ決めると流れが戻りやすくなります。"
      : "今日は、手元にあるものを使って動き出すのに向いている日です。新しく何かを揃えるより、今あるもので始めてみると、想像以上にスムーズに進みそうです。";
  }

  if (card.name.includes("女教皇")) {
    return card.reversed
      ? "今日は、考えすぎて身動きが取りにくくなりやすい空気があります。情報を集めすぎず、自分の中の「なんとなく」を信じてみると楽になりそうです。"
      : "今日は、直感や内なる声が冴えやすい日です。まわりの意見に流されるより、静かに感じ取ったものを大切にするほうが、確かな方向へ進めそうです。";
  }

  if (card.name.includes("女帝")) {
    return card.reversed
      ? "今日は、受け取りすぎたり甘やかしすぎたりして、満たされ方が不安定になりやすい空気です。心地よさの中にも「ちょうどいい」を探す意識が助けになります。"
      : "今日は、ゆったりとした豊かさを感じやすい日です。焦って成果を求めるより、目の前の心地よさを素直に受け取ることで、気持ちも流れもやわらかく広がっていきます。";
  }

  if (card.name.includes("法王")) {
    return card.reversed
      ? "今日は、常識やルールが窮屈に感じやすい日です。形だけ合わせようとせず、自分にとって本当に必要なものを見極める意識が楽にしてくれます。"
      : "今日は、信頼できるやり方や慣れた手順に沿って動くほうが安心感があります。迷ったら、経験のある人の言葉に耳を傾けてみると気持ちが落ち着きそうです。";
  }

  if (card.name.includes("恋人")) {
    return card.reversed
      ? "今日は、気持ちのずれや選びきれなさが出やすい空気です。迷いがあるときは無理に答えを出さず、自分が本当に大切にしたいものを静かに確かめてみてください。"
      : "今日は、共鳴や心のつながりを感じやすい日です。自分の気持ちに正直に向き合うことで、人との距離感が自然と心地よいところに落ち着いていきます。";
  }

  if (card.name.includes("戦車")) {
    return card.reversed
      ? "今日は、前に進もうとするほど空回りしやすい空気があります。急ぎすぎていると感じたら、方向を確かめ直すことで勢いが戻ってきます。"
      : "今日は、意志を持って進むほど道が開けやすい日です。迷いがあっても、まず動き出してみることで見えてくるものがあります。";
  }

  if (card.name.includes("運命の輪")) {
    return card.reversed
      ? "今日は、タイミングが噛み合いにくく、流れに乗りづらさを感じやすい日です。うまくいかないときは無理に押さず、次の波を待つ姿勢が助けになります。"
      : "今日は、流れが動き出しやすい日です。変化の兆しがあったら怖がらずに受け入れてみると、思った以上に良い方向へ転がっていきそうです。";
  }

  if (card.name.includes("正義")) {
    return card.reversed
      ? "今日は、判断が偏りやすく、釣り合いが取りにくい空気があります。一方からだけ見て決めず、少し引いて全体を眺めてみると落ち着きが戻ってきます。"
      : "今日は、公平さや筋の通った判断が流れを安定させてくれる日です。感情に引っ張られそうなときほど、事実をもとに考えるほうがスムーズです。";
  }

  if (card.name.includes("吊るされた男") || card.name.includes("吊された男")) {
    return card.reversed
      ? "今日は、動けない状態が長引きやすく、待つことの意味を見失いがちです。少しでも動ける余地があるなら、小さく試してみると気持ちがほぐれます。"
      : "今日は、あえて立ち止まることに意味がある日です。すぐに答えを出そうとせず、視点を変えて眺め直してみると、見えなかった道が浮かんできます。";
  }

  if (card.name.includes("死神")) {
    return card.reversed
      ? "今日は、手放すべきものに気づいていても、なかなか終えられない空気があります。変化を止めようとせず、少しずつでも区切りをつけていくと楽になります。"
      : "今日は、何かが終わり、次へ切り替わっていく気配がある日です。終わることを怖がらず受け入れることで、新しい流れが自然に始まっていきます。";
  }

  if (card.name.includes("悪魔")) {
    return card.reversed
      ? "今日は、しがらみがほどけ始める気配がありますが、まだ少し引っ張られやすさが残っています。完全に抜け出せなくても、意識が変わり始めていること自体が前進です。"
      : "今日は、気になるものに引き寄せられやすい空気があります。心地よさの中に依存が混じっていないか、少し立ち止まって確かめてみると判断がぶれにくくなります。";
  }

  if (card.name.includes("審判")) {
    return card.reversed
      ? "今日は、大事な呼びかけに気づきにくく、決めきれない感覚が出やすい日です。完璧なタイミングを待たず、今の自分にできる一歩を選んでみてください。"
      : "今日は、過去の経験や眠っていた想いが再び動き出しやすい日です。心の奥から湧いてくるものに素直に応じると、新しい始まりにつながっていきます。";
  }

  if (card.name.includes("世界")) {
    return card.reversed
      ? "今日は、あと一歩のところでまとまりきらない感覚が出やすい日です。完璧を目指しすぎず、「ここまでできた」を認めることで次への力が湧いてきます。"
      : "今日は、物事が一つの形にまとまりやすい日です。これまで積み重ねてきたことが実を結ぶ気配があるので、安心してそのまま進んでください。";
  }

  const focus = resolveCardThemeFocus(card.name);
  switch (focus.suit) {
    case "swords":
      return "今日は思考がクリアになりやすい反面、考えすぎると疲れも出やすい日です。頭がまとまったら、あまり引っ張らずに次へ進むほうがテンポよく過ごせます。";
    case "wands":
      return "今日はやってみたい気持ちや勢いが出やすい日です。その熱をうまく使いつつ、ひとつずつ着地させていくと空回りせずに進めます。";
    case "cups":
      return "今日は心の動きが敏感になりやすい一日です。うれしさも迷いも否定せず、その時々の感覚を受け止めながら過ごすと、穏やかな流れが続きます。";
    case "pentacles":
      return "今日は派手な変化より、目の前のことをきちんと進めるほうが合っています。小さなことを一つ片づけるだけでも、安心感がしっかり戻ってきます。";
    default:
      return firstTwoSentences(reading.cardVoice) || "今日は、内側で起きる気づきに意味がある日です。焦って形にしなくても、今の実感を大事にすることで次の一歩が見えやすくなります。";
  }
}

function fallbackTodayParagraph(card: LiteCard): string {
  const focus = resolveCardThemeFocus(card.name);

  if (card.name.includes("隠者")) {
    return "すぐに答えを出さなくても大丈夫です。表に向かって動くより、気持ちや考えをひとつずつ見直すほうが、かえって迷いが減っていきます。";
  }

  if (card.name.includes("太陽")) {
    return "今日は、考え込みすぎるより、まず声に出してみることが合っています。明るさや素直さが人に伝わりやすく、うれしい反応も返ってきやすい日です。";
  }

  if (card.name.includes("月")) {
    return "気分に波が出ても、それだけで間違いとは限りません。今日は見えていない部分がある前提で、急いで結論を決めないことが大切です。";
  }

  if (card.name.includes("力")) {
    return "感情が動く場面でも、強く言い返したり無理に抑え込んだりしなくて大丈夫です。落ち着いて受け止めることで、相手との距離も自分の気持ちも扱いやすくなります。";
  }

  if (card.name.includes("ナイト") && card.name.includes("ソード")) {
    return "頭の回転が速くなるぶん、言葉も結論も先に出やすい日です。早さは武器ですが、相手を置いていかないひと言を添えると、ぐっと動きやすくなります。";
  }

  switch (focus.suit) {
    case "swords":
      return "今日は判断の速さが出やすいぶん、言葉も強くなりがちです。考えがまとまったら、そのまま押し切る前に一度だけ相手の受け取り方を確かめてみてください。";
    case "wands":
      return "今日はやってみたい気持ちが前に出やすい日です。勢いはそのまま活かしつつ、ひとつずつ着地させる意識を持つと空回りしにくくなります。";
    case "cups":
      return "今日は心の動きが表に出やすい一日です。うれしさも迷いも否定せず、その時々の気持ちを丁寧に扱うと、人とのやり取りも自然になっていきます。";
    case "pentacles":
      return "今日は大きな変化より、目の前のことをきちんと進めるほうが合っています。手をつけたことをひとつ終えるだけでも、安心感がしっかり戻ってきます。";
    default:
      return "今日は派手な出来事よりも、内側で起きる気づきに意味がある日です。焦って形にしなくても、今の実感を大事にすることで次の一歩が見えやすくなります。";
  }
}

function fallbackWorkParagraph(card: LiteCard, context: DailyFortuneOutputContext): string {
  const jobLabel = resolveJobSurfaceLabel(context.job);
  const focus = resolveCardThemeFocus(card.name);

  if (card.name.includes("節制")) {
    return card.reversed
      ? `${jobLabel}では、手を広げすぎて集中が散りやすい日です。あれもこれもと抱え込まず、今日やるべきことを絞り直すと効率が戻ってきます。`
      : `${jobLabel}では、予定を詰め込みすぎないほうが集中が戻りやすそうです。タスクの配分をゆるやかに整理すると、無理なく進められる感覚を取り戻せるでしょう。`;
  }

  if (card.name.includes("皇帝")) {
    return card.reversed
      ? `${jobLabel}では、自分のやり方にこだわりすぎると空気が詰まりやすい日です。まわりの意見を一度聞いてみるだけで、進め方に余裕が出てきます。`
      : `${jobLabel}では、段取りを先に決めてから動くとスムーズです。責任ある判断が求められる場面でも、落ち着いて対応すれば信頼につながります。`;
  }

  if (card.name.includes("隠者")) {
    return `${jobLabel}では、後回しにしていた作業をひとつ見直すと小さな手応えが返ってきます。まわりに合わせて急ぐより、自分のペースで丁寧に進めるほうが結果につながりやすい日です。`;
  }

  if (card.name.includes("太陽")) {
    return `${jobLabel}では、自分から声をかけたり提案したりすると空気が良くなりそうです。積極的に動くことで、チームの流れも前向きになっていきます。`;
  }

  if (card.name.includes("月")) {
    return `${jobLabel}では、情報を急いでまとめるより、確認を一つ多く入れるほうが安心です。曖昧なまま進めず、不明点を先に潰しておくとミスを防ぎやすくなります。`;
  }

  if (card.name.includes("力")) {
    return `${jobLabel}では、思い通りに進まない場面でも、落ち着いて向き合う姿勢が信頼につながります。粘り強く取り組むことで、じわじわと成果が見えてくるでしょう。`;
  }

  if (card.name.includes("塔")) {
    return `${jobLabel}では、予定通りにいかない場面が出やすい日です。慌てずに状況を確認してから動き直すと、立て直しがスムーズになります。`;
  }

  if (card.name.includes("星")) {
    return `${jobLabel}では、長期的な目標を少し見直すのに良い日です。目の前の作業に追われるより、ゴールを確かめてから取り組むと集中しやすくなります。`;
  }

  if (card.name.includes("愚者")) {
    return card.reversed
      ? `${jobLabel}では、あれこれ手を出して散らかりやすい日です。やりたいことを一つに絞ってから動くと、集中が戻りやすくなります。`
      : `${jobLabel}では、新しいやり方や発想を試してみるのに良い日です。型にはまらず、軽い気持ちで取りかかると意外な手応えが返ってきそうです。`;
  }

  if (card.name.includes("魔術師")) {
    return card.reversed
      ? `${jobLabel}では、やる気が空回りしやすい日です。計画を口にするだけで終わらないよう、まず一つだけ具体的に手を動かしてみてください。`
      : `${jobLabel}では、手持ちのスキルや道具を活かして動くとスムーズです。新しく用意するより、今あるもので始めてみるほうが早く形になりそうです。`;
  }

  if (card.name.includes("女教皇")) {
    return card.reversed
      ? `${jobLabel}では、情報を読みすぎて判断が遅れやすい日です。調べる時間に区切りをつけて、ある程度のところで動き出すほうが進みやすくなります。`
      : `${jobLabel}では、データや根拠を丁寧に確認してから動くほうが確かです。直感も冴えやすいので、違和感を覚えたら見直してみると精度が上がります。`;
  }

  if (card.name.includes("女帝")) {
    return card.reversed
      ? `${jobLabel}では、つい引き受けすぎたり甘い見積もりになりやすい日です。キャパシティを確認してから返事をすると、無理が出にくくなります。`
      : `${jobLabel}では、余裕を持った進め方が良い結果につながりやすい日です。ゆとりあるスケジュールで取り組むと、質も満足度も高まります。`;
  }

  if (card.name.includes("法王")) {
    return card.reversed
      ? `${jobLabel}では、既存のやり方が合わないと感じやすい日です。形だけ従うより、目的に立ち返って必要な手順を見直すほうが効率的です。`
      : `${jobLabel}では、マニュアルや前例を参考にしながら進めると安心です。自己流で突っ走るより、信頼できる手順に沿うほうがミスを防ぎやすくなります。`;
  }

  if (card.name.includes("恋人")) {
    return card.reversed
      ? `${jobLabel}では、チーム内で意見がすれ違いやすい日です。自分の考えだけで進めず、相手の意図を一度確かめてみると噛み合いやすくなります。`
      : `${jobLabel}では、まわりとの連携が取りやすい日です。協力を頼んだり意見を交わしたりすると、ひとりで進めるよりスムーズに仕上がりそうです。`;
  }

  if (card.name.includes("戦車")) {
    return card.reversed
      ? `${jobLabel}では、急ぎすぎてミスが出やすい日です。勢いに任せず、要所で確認を入れるとスピードと正確さを両立しやすくなります。`
      : `${jobLabel}では、目標を決めて一気に進めるのが合っています。迷っている時間を減らし、まず着手してしまうほうが成果につながりやすい日です。`;
  }

  if (card.name.includes("運命の輪")) {
    return card.reversed
      ? `${jobLabel}では、タイミングが合いにくく空振りしやすい日です。無理に押し進めず、状況を見ながら次のチャンスを待つほうが得策です。`
      : `${jobLabel}では、流れに変化が出やすい日です。新しい話や依頼が舞い込んだら、柔軟に乗ってみると展開が広がりそうです。`;
  }

  if (card.name.includes("正義")) {
    return card.reversed
      ? `${jobLabel}では、判断にバイアスがかかりやすい日です。思い込みで進める前に、数字や事実をもう一度確認すると軌道修正がしやすくなります。`
      : `${jobLabel}では、公正な判断が求められる場面で力を発揮しやすい日です。根拠を揃えてから結論を出すと、まわりの納得感も得られやすくなります。`;
  }

  if (card.name.includes("吊るされた男") || card.name.includes("吊された男")) {
    return card.reversed
      ? `${jobLabel}では、保留にしている案件が気になって集中しづらい日です。動かせるものが一つでもあれば、小さく進めてみると気持ちが軽くなります。`
      : `${jobLabel}では、すぐに成果を求めず、あえて待つ姿勢が有効です。急いで出すより、一度寝かせてから取りかかるほうが仕上がりが良くなりそうです。`;
  }

  if (card.name.includes("死神")) {
    return card.reversed
      ? `${jobLabel}では、終わらせるべきタスクをずるずる引きずりやすい日です。区切りをつけるべきものを一つ選んで片づけると、気持ちに余白が生まれます。`
      : `${jobLabel}では、古いやり方やルーティンを見直すのに向いている日です。思い切って手放すことで、新しい進め方が見えてきそうです。`;
  }

  if (card.name.includes("悪魔")) {
    return card.reversed
      ? `${jobLabel}では、惰性で続けていた習慣に違和感を覚えやすい日です。まだ完全には切り替えられなくても、気づいていること自体が前進です。`
      : `${jobLabel}では、目先の楽さに流されやすい日です。「とりあえず」で済ませたくなる場面でも、もう一手間かけると仕上がりが変わります。`;
  }

  if (card.name.includes("審判")) {
    return card.reversed
      ? `${jobLabel}では、決断のタイミングを逃しやすい日です。完璧な条件を待つより、今ある材料で一つ判断を出してみるほうが前に進めます。`
      : `${jobLabel}では、過去に手をつけかけたまま止まっていたことを再開するのに良い日です。当時とは違う目線で取り組むと、新しい発見がありそうです。`;
  }

  if (card.name.includes("世界")) {
    return card.reversed
      ? `${jobLabel}では、あと少しで仕上がるのに詰めが甘くなりやすい日です。最後のチェックを丁寧にするだけで、完成度がぐっと上がります。`
      : `${jobLabel}では、一つのプロジェクトや目標がまとまりやすい日です。仕上げの段階にあるものは、今日中に形にしてしまうと達成感が得られそうです。`;
  }

  switch (focus.suit) {
    case "swords":
      return `${jobLabel}では、判断や連絡を先送りにしないことが助けになります。考えがまとまったら、早めにアウトプットして次の作業に進むとテンポよく片づきます。`;
    case "wands":
      return `${jobLabel}では、新しくやってみたいことにひとつ手を伸ばすのが良さそうです。アイデアを温めるだけでなく、小さくても着手してみると手応えが返ってきます。`;
    case "cups":
      return `${jobLabel}では、効率だけを追うより、気持ちよく続けられるペースを選ぶほうが結果的に進みやすいです。集中が切れたら少し休んで切り替えるのも有効です。`;
    case "pentacles":
      return `${jobLabel}では、予定や手順をひとつ整えるだけでも安心感が増していきます。地道な作業を丁寧に済ませることで、着実に前へ進めます。`;
    default:
      return `${jobLabel}では、今日はひとつの作業にしぼって向き合うのが良さそうです。あれもこれも抱えず、目の前のタスクから順に片づけてみてください。`;
  }
}

function fallbackLoveParagraph(card: LiteCard, context: DailyFortuneOutputContext): string {
  const focus = resolveCardThemeFocus(card.name);

  if (card.name.includes("節制")) {
    return card.reversed
      ? "恋愛や人間関係では、相手に求めすぎたり、逆に遠慮しすぎたりしやすい日です。「ちょうどいい距離」がどこか、少し意識してみると気持ちが楽になります。"
      : "恋愛や人間関係では、答えを急がず、相手のペースにも目を向けるほうが穏やかに進みやすい日です。言いすぎるよりも、やわらかく受け取って返すことで距離感が整いやすくなります。";
  }

  if (card.name.includes("皇帝")) {
    return card.reversed
      ? "恋愛や人間関係では、自分の考えを押し通そうとすると空気が固くなりやすい日です。相手の意見を先に聞く姿勢を見せるだけで、関係がやわらぎます。"
      : "恋愛や人間関係では、頼りがいのある態度が好印象になりやすい日です。ただし、相手をコントロールしようとせず、安心感を与える方向で接するのがポイントです。";
  }

  if (card.name.includes("隠者")) {
    return "恋愛や人間関係では、無理に距離を詰めようとせず、ひとりの時間を大切にするほうが気持ちが整います。相手のことも、少し離れて見つめ直すと新しい発見がありそうです。";
  }

  if (card.name.includes("太陽")) {
    return "恋愛や人間関係では、素直な気持ちを伝えると空気があたたかくなりやすい日です。うれしいことがあったら、そのまま言葉にしてみると相手にも笑顔が広がります。";
  }

  if (card.name.includes("月")) {
    return "恋愛や人間関係では、相手の本音が見えにくく感じやすい日です。勝手に想像を膨らませず、分からないことは率直に聞いてみるほうが不安を減らせます。";
  }

  if (card.name.includes("力")) {
    return "恋愛や人間関係では、感情が動く場面でもやさしく受け止める姿勢が助けになります。強く言い返すより、一度飲み込んでからやわらかく返すほうが信頼が深まりそうです。";
  }

  if (card.name.includes("塔")) {
    return "恋愛や人間関係では、思い込みや受け取り方のずれに気づきやすい日です。言葉を急いで結論にせず、ひと呼吸おいて受け止めるほど空気がやわらぎやすいでしょう。";
  }

  if (card.name.includes("星")) {
    return "恋愛や人間関係では、焦らず待つ姿勢が良い流れを呼びやすい日です。相手を信じてゆるやかに見守ることで、自然と距離が縮まっていきそうです。";
  }

  if (card.name.includes("愚者")) {
    return card.reversed
      ? "恋愛や人間関係では、気持ちが定まらず、相手を振り回してしまいやすい日です。楽しさだけで動かず、相手の立場も少し想像してみると距離感が安定します。"
      : "恋愛や人間関係では、気負わずフラットに接するほうがうまくいきやすい日です。構えすぎるより、自然体の会話から関係が広がっていきそうです。";
  }

  if (card.name.includes("魔術師")) {
    return card.reversed
      ? "恋愛や人間関係では、言葉と気持ちがずれやすい日です。伝えたいことがあるなら、回りくどくせず、シンプルに伝えたほうが誤解が減ります。"
      : "恋愛や人間関係では、自分からきっかけをつくるのが吉です。メッセージを送る、声をかけるなど、小さなアクションが関係を動かしてくれそうです。";
  }

  if (card.name.includes("女教皇")) {
    return card.reversed
      ? "恋愛や人間関係では、相手の言葉の裏を読みすぎて疲れやすい日です。考えすぎるより、聞きたいことは素直に聞いてみるほうが気持ちが楽になります。"
      : "恋愛や人間関係では、言葉にならない空気や沈黙に大切なものが隠れている日です。相手の様子をそっと感じ取ることで、深いところでつながりやすくなります。";
  }

  if (card.name.includes("女帝")) {
    return card.reversed
      ? "恋愛や人間関係では、甘やかしすぎたり尽くしすぎたりしやすい日です。自分の心地よさも大切にすることで、対等な関係が保ちやすくなります。"
      : "恋愛や人間関係では、おおらかな気持ちで接すると空気があたたまりやすい日です。相手を受け入れる余裕が、信頼をやわらかく育ててくれます。";
  }

  if (card.name.includes("法王")) {
    return card.reversed
      ? "恋愛や人間関係では、「こうあるべき」という考えが窮屈さにつながりやすい日です。相手にも自分にも、少しだけ自由を許すと関係が楽になります。"
      : "恋愛や人間関係では、誠実さや礼儀が好印象につながりやすい日です。気持ちを丁寧に伝えることで、相手との信頼が深まりそうです。";
  }

  if (card.name.includes("恋人")) {
    return card.reversed
      ? "恋愛や人間関係では、気持ちのすれ違いや迷いが出やすい日です。選びきれないときは焦らず、自分の本音をもう一度確かめてから動くと後悔しにくくなります。"
      : "恋愛や人間関係では、心が通じ合いやすい日です。相手と過ごす時間を大切にすると、ふだん言えないことも自然と言葉になりやすくなります。";
  }

  if (card.name.includes("戦車")) {
    return card.reversed
      ? "恋愛や人間関係では、自分のペースを押しすぎて相手がついてこられなくなりやすい日です。少し速度を落として、相手の反応を確かめてみてください。"
      : "恋愛や人間関係では、自分から積極的に動くことで道が開けやすい日です。気持ちがあるなら伝えてみる、会いたいなら誘ってみる。その一歩が関係を前に進めます。";
  }

  if (card.name.includes("運命の輪")) {
    return card.reversed
      ? "恋愛や人間関係では、タイミングがずれやすく、気持ちが噛み合いにくい日です。うまくいかなくても焦らず、次の機会を信じて待つほうが結果的に良い方向へ向かいます。"
      : "恋愛や人間関係では、思いがけない出会いや変化が起きやすい日です。流れに身を任せてみると、新しいつながりが生まれるかもしれません。";
  }

  if (card.name.includes("正義")) {
    return card.reversed
      ? "恋愛や人間関係では、相手への見方が偏りやすい日です。自分の物差しだけで判断せず、相手にも事情があることを思い出すと、関係がやわらぎます。"
      : "恋愛や人間関係では、正直に向き合う姿勢が信頼を深めてくれる日です。ごまかさず、対等なやり取りを意識すると、相手にも安心感が伝わります。";
  }

  if (card.name.includes("吊るされた男") || card.name.includes("吊された男")) {
    return card.reversed
      ? "恋愛や人間関係では、待ち続けることに疲れを感じやすい日です。相手の反応を待つだけでなく、自分の気持ちを一つ伝えてみると空気が動き出します。"
      : "恋愛や人間関係では、急いで答えを求めないほうがうまくいく日です。今は動かず見守ることで、相手の本音や関係の本質が見えてきそうです。";
  }

  if (card.name.includes("死神")) {
    return card.reversed
      ? "恋愛や人間関係では、終わりにすべきだと分かっていても手放せない気持ちが出やすい日です。無理に断ち切らなくても、少しずつ距離をとることから始めてみてください。"
      : "恋愛や人間関係では、古い関係やパターンに区切りがつきやすい日です。終わりは怖くても、その先に新しい出会いや形が待っていることを信じてみてください。";
  }

  if (card.name.includes("悪魔")) {
    return card.reversed
      ? "恋愛や人間関係では、執着がほどけ始めている気配がありますが、まだ完全には離れきれない日です。無理せず、自分のペースで距離を見直してみてください。"
      : "恋愛や人間関係では、強く惹かれるものに引っ張られやすい日です。心地よさの中に依存が混じっていないか、少しだけ冷静に見つめてみると判断がぶれにくくなります。";
  }

  if (card.name.includes("審判")) {
    return card.reversed
      ? "恋愛や人間関係では、大事な気持ちに気づきにくく、決断を先送りしやすい日です。相手の声にも自分の声にも、もう少し耳を澄ませてみてください。"
      : "恋愛や人間関係では、過去の関係や気持ちが再び動き出しやすい日です。懐かしい相手との再会や、忘れかけていた想いがよみがえるかもしれません。";
  }

  if (card.name.includes("世界")) {
    return card.reversed
      ? "恋愛や人間関係では、あと一歩で気持ちがまとまりきらない感覚が出やすい日です。完璧を求めすぎず、今の関係を「ここまで来た」と認めてあげると楽になります。"
      : "恋愛や人間関係では、安心感や満足感を得やすい日です。今ある関係に感謝の気持ちを伝えると、さらに深いつながりを感じられそうです。";
  }

  switch (focus.suit) {
    case "swords":
      return "恋愛や人間関係では、言葉の選び方が鍵になる日です。正論を伝えるときも、相手がどう受け取るかまで意識すると、やり取りがやわらかくなります。";
    case "wands":
      return "恋愛や人間関係では、自分から声をかけたり誘ったりすると良い反応が返ってきやすい日です。気持ちの勢いをそのまま素直に伝えてみてください。";
    case "cups":
      return "恋愛や人間関係では、気持ちの交流が深まりやすい日です。相手の話をじっくり聞くことで、思いがけない本音に触れられるかもしれません。";
    case "pentacles":
      return "恋愛や人間関係では、特別なことをするより、日常の小さな気遣いが喜ばれやすい日です。さりげない配慮が、相手との信頼を深めてくれます。";
    default:
      return "恋愛や人間関係では、相手の気持ちを決めつけずにやり取りすることが助けになります。やわらかい言葉選びが、今日の関係を穏やかにする鍵になりそうです。";
  }
}

function fallbackAction(card: LiteCard): string {
  if (card.name.includes("隠者")) {
    return "今日は、気になっていることをメモに少し書き出してみてください。頭の中だけで考えるより、次の一歩が見えやすくなるはずです。";
  }
  if (card.name.includes("太陽")) {
    return "今日は、うれしいと思ったことを一つだけ言葉にして伝えてみてください。小さなひと言でも、気持ちの明るさがまわりに広がっていきます。";
  }
  if (card.name.includes("月")) {
    return "今日は、迷っていることの結論を急がず、確認したい点を一つだけ書き出してみてください。不安をそのまま広げるより、気持ちが落ち着きやすくなります。";
  }
  if (card.name.includes("力")) {
    return "今日は、気持ちが動いた場面で深呼吸をひとつ入れてみてください。それだけで、反応ではなく選んだ言葉で動きやすくなります。";
  }
  if (card.name.includes("ナイト") && card.name.includes("ソード")) {
    return "今日は、止めていた連絡や判断を一つだけ前へ進めてみてください。動き出すことで、考えすぎていた部分が自然とほどけていきます。";
  }
  return "今日は、気になっていることを一つだけ行動に移してみてください。小さく動くだけでも、気持ちが前を向きやすくなります。";
}

function fallbackClosing(card: LiteCard, context: DailyFortuneOutputContext): string {
  const temperature = cardTemperature(card);
  const previous = previousCardText(context.previousCard);

  if (card.name.includes("隠者")) {
    return "あなたは大丈夫です。すぐに答えが出ない時間も、ちゃんと意味のある時間です。今日も自分の歩幅を大切に過ごしてください。";
  }

  if (card.name.includes("太陽")) {
    return "あなたの明るさは、思っている以上にまわりを温めています。気負いすぎず、今日の良さをそのまま受け取ってください。";
  }

  if (card.name.includes("月")) {
    return "見えにくさがある日でも、あなたの感覚はちゃんと役に立っています。無理に急がず、今日は安心できるほうを選んでください。";
  }

  if (card.name.includes("力")) {
    return "がんばり方は、強く押すことだけではありません。今日のあなたの落ち着きとやさしさは、ちゃんと力になっています。";
  }

  if (card.name.includes("ナイト") && card.name.includes("ソード")) {
    return "前へ進もうとする気持ちは、今日の大きな追い風です。急ぎすぎずに向き先を確かめれば、その勢いはしっかり力になります。";
  }

  if (temperature === "bright") {
    return "今日の前向きな気持ちは、ちゃんと意味のあるものです。大きく構えすぎず、できることから軽やかに進めてみてください。";
  }
  if (temperature === "sharp") {
    return previous
      ? `昨日の${previous}から気持ちが切り替わる場面もありそうです。急がなくて大丈夫なので、考えたことを自分の言葉で確かめながら進んでください。`
      : "考えがはっきりする日ほど、言葉を選ぶ余白が助けになります。落ち着いて進めれば、今日の判断はきちんと力になります。";
  }
  if (temperature === "grounded") {
    return "今日積み重ねたことは、あとからしっかり支えになっていきます。目立たなくても、あなたの一歩には十分な意味があります。";
  }
  return "今日の気づきは、すぐ形にならなくても大丈夫です。あなたの中でつかんだ感覚を、そのまま大切にしてください。";
}

function fallbackTodayHitokoto(card: LiteCard, context: DailyFortuneOutputContext): string {
  const reading = resolveDailyTarotReading(
    card,
    "",
    context.selectedCardMode,
    context.readingCategory ?? "general"
  );

  if (card.name.includes("隠者")) {
    return "焦らず見つめる時間が、今日の答えにつながります。";
  }
  if (card.name.includes("太陽")) {
    return "素直なひと言が、今日の空気を明るくします。";
  }
  if (card.name.includes("月")) {
    return "見えにくい日は、急がないことがいちばんの味方です。";
  }
  if (card.name.includes("力")) {
    return "やさしく踏ん張ることが、今日の強さになります。";
  }
  if (card.name.includes("愚者")) {
    return card.reversed
      ? "落ち着かないときほど、足元を見れば大丈夫。"
      : "考えるより先に、軽く一歩出てみる日。";
  }
  if (card.name.includes("魔術師")) {
    return card.reversed
      ? "空回りしたら、やることを一つに絞ってみて。"
      : "今あるもので始める。それが今日のコツ。";
  }
  if (card.name.includes("女教皇")) {
    return card.reversed
      ? "考えすぎの合図が来たら、いったん手を止めて。"
      : "直感がささやいたら、今日はそれを信じてみて。";
  }
  if (card.name.includes("女帝")) {
    return card.reversed
      ? "与えすぎに気づいたら、自分にも一つご褒美を。"
      : "心地よさを素直に受け取ることが、今日の豊かさ。";
  }
  if (card.name.includes("法王")) {
    return card.reversed
      ? "合わないルールは、そっと手放してもいい日。"
      : "迷ったら、信頼できる人のひと言に頼ってみて。";
  }
  if (card.name.includes("恋人")) {
    return card.reversed
      ? "迷うときは、自分の本音を先に確かめてみて。"
      : "素直な気持ちが、今日のつながりをあたためます。";
  }
  if (card.name.includes("戦車")) {
    return card.reversed
      ? "急ぎすぎたら、方向を確かめ直すだけでいい。"
      : "迷いを振り切って進む一歩が、今日を動かします。";
  }
  if (card.name.includes("運命の輪")) {
    return card.reversed
      ? "噛み合わない日は、次の波を静かに待つとき。"
      : "流れが変わる兆し。乗ってみると景色が変わります。";
  }
  if (card.name.includes("正義")) {
    return card.reversed
      ? "偏りに気づいたら、もう片方の目で見てみて。"
      : "事実をもとに決める。それが今日のいちばんの味方。";
  }
  if (card.name.includes("吊るされた男") || card.name.includes("吊された男")) {
    return card.reversed
      ? "待ち疲れたら、小さく一つだけ動かしてみて。"
      : "今日は止まることに意味がある。焦らなくて大丈夫。";
  }
  if (card.name.includes("死神")) {
    return card.reversed
      ? "手放せないものに気づくだけでも、前進です。"
      : "終わらせることが、次の扉を開く鍵になる日。";
  }
  if (card.name.includes("悪魔")) {
    return card.reversed
      ? "少しずつほどけている。その感覚を信じて大丈夫。"
      : "つい手が伸びるものに、今日は5分だけ間を置いて。";
  }
  if (card.name.includes("審判")) {
    return card.reversed
      ? "決めきれないなら、期限だけ先に決めてみて。"
      : "心の奥の声に応じると、再スタートが切れる日。";
  }
  if (card.name.includes("世界")) {
    return card.reversed
      ? "あと一歩。最後のひと手間が仕上がりを変えます。"
      : "ここまで来た自分を、今日は認めてあげてください。";
  }
  if (card.name.includes("ナイト") && card.name.includes("ソード")) {
    return "決めて動くことで、今日の迷いはほどけていきます。";
  }

  return `${reading.selectedMode}を意識すると、今日の過ごし方がぶれにくくなります。`;
}

function fallbackWhiteHitokoto(card: LiteCard): string {
  if (card.name.includes("隠者")) {
    return "白がこちらを見上げています。\n今日はひとりの時間を少し大切にすると、気持ちが落ち着きそうです。";
  }
  if (card.name.includes("太陽")) {
    return "白がうれしそうにしっぽを揺らしています。\n今日は笑顔になれることを一つ増やすと、心が軽くなりそうです。";
  }
  if (card.name.includes("月")) {
    return "白がそっとそばに座っています。\n今日は安心できるものを近くに置いて過ごすと、気持ちがゆるみそうです。";
  }
  if (card.name.includes("力")) {
    return "白がじっとこちらを見ています。\n今日は強く押すより、落ち着いて向き合うほうがうまくいきそうです。";
  }
  if (card.name.includes("愚者")) {
    return card.reversed
      ? "白がそわそわと歩き回っています。\n今日は気が散りやすいので、一つに集中すると落ち着きそうです。"
      : "白が窓のほうへぴょんと跳ねました。\n今日は気になるほうへ軽く動いてみると、楽しい発見がありそうです。";
  }
  if (card.name.includes("魔術師")) {
    return card.reversed
      ? "白がおもちゃの前で首をかしげています。\n今日はあれこれ考えず、一つだけ選んで遊ぶのが良さそうです。"
      : "白が目の前のものにそっと前足を伸ばしました。\n今日は手元にあるものから始めてみると、うまく回りそうです。";
  }
  if (card.name.includes("女教皇")) {
    return card.reversed
      ? "白が暗い隅でじっと固まっています。\n今日は考えすぎず、少し外の空気を吸うと気分が変わりそうです。"
      : "白が静かに目を閉じて耳を澄ませています。\n今日は直感を信じて動くと、うまくいきやすそうです。";
  }
  if (card.name.includes("女帝")) {
    return card.reversed
      ? "白がおやつをもらいすぎて眠そうにしています。\n今日は「ちょうどいい」を意識すると心地よく過ごせそうです。"
      : "白が日だまりで気持ちよさそうに伸びています。\n今日はゆったりした時間を楽しむと、気持ちがほぐれそうです。";
  }
  if (card.name.includes("法王")) {
    return card.reversed
      ? "白がいつもの場所を避けて、違う場所に座っています。\n今日は自分に合うやり方を探してみると楽になりそうです。"
      : "白がいつもの定位置でくつろいでいます。\n今日は慣れたやり方を信じて進むと、安心して過ごせそうです。";
  }
  if (card.name.includes("恋人")) {
    return card.reversed
      ? "白が二つのおもちゃの間で行ったり来たりしています。\n今日は迷ったら自分の気持ちを先に確かめてみてください。"
      : "白がそっと寄り添って甘えています。\n今日はつながりを大切にすると、あたたかい時間が過ごせそうです。";
  }
  if (card.name.includes("戦車")) {
    return card.reversed
      ? "白が走り出しては止まり、また走り出しています。\n今日は方向を確かめてから進むと、気持ちが安定しそうです。"
      : "白がまっすぐ前を見てしっぽをピンと立てています。\n今日は迷わず進んでみると、道が開けていきそうです。";
  }
  if (card.name.includes("運命の輪")) {
    return card.reversed
      ? "白がタイミング悪くおもちゃを取り損ねました。\n今日は無理に追わず、次のチャンスを待つのが良さそうです。"
      : "白がくるりと回って楽しそうにしています。\n今日は流れに乗ってみると、思いがけない良いことがありそうです。";
  }
  if (card.name.includes("正義")) {
    return card.reversed
      ? "白が首をかしげて何かを見比べています。\n今日は片方だけ見ず、両方確かめてから決めると安心です。"
      : "白がまっすぐな姿勢で座っています。\n今日はフェアな気持ちで判断すると、すっきり過ごせそうです。";
  }
  if (card.name.includes("吊るされた男") || card.name.includes("吊された男")) {
    return card.reversed
      ? "白がずっと同じ場所で待ちくたびれたようです。\n今日は少しだけ場所を変えてみると、気分が晴れそうです。"
      : "白がひっくり返って不思議そうにこちらを見ています。\n今日はいつもと違う角度で物事を見ると、発見がありそうです。";
  }
  if (card.name.includes("死神")) {
    return card.reversed
      ? "白が古いおもちゃをくわえたまま離しません。\n今日は一つだけ手放してみると、気持ちが軽くなりそうです。"
      : "白が使い古したおもちゃをそっと置いて離れました。\n今日は何かを終わらせることで、新しい始まりが近づきそうです。";
  }
  if (card.name.includes("悪魔")) {
    return card.reversed
      ? "白がいつものクセをやめようとして、でもまた繰り返しています。\n今日は少しずつでいい。気づいていることが大事です。"
      : "白がお気に入りの場所から離れられずにいます。\n今日は「つい続けてしまうこと」に少し間を置いてみてください。";
  }
  if (card.name.includes("審判")) {
    return card.reversed
      ? "白が呼ばれているのに気づかず眠っています。\n今日は心の声にもう少し耳を傾けてみると良さそうです。"
      : "白がふと顔を上げて、何かに気づいたようです。\n今日は心の奥から湧く気持ちに素直になると、新しい一歩が踏み出せそうです。";
  }
  if (card.name.includes("世界")) {
    return card.reversed
      ? "白があと一歩でお気に入りの場所にたどり着けずにいます。\n今日は最後のひと頑張りを丁寧にすると、満足感が変わりそうです。"
      : "白が満足そうにまるくなっています。\n今日はここまでの自分を「よくやった」と認めてあげてください。";
  }
  if (card.name.includes("ナイト") && card.name.includes("ソード")) {
    return "白が前を向いて耳を立てています。\n今日は迷い続けるより、一つ決めて進むと気持ちがすっきりしそうです。";
  }

  const focus = resolveCardThemeFocus(card.name);
  switch (focus.suit) {
    case "cups":
      return "白がこちらを見上げています。\n今日は気持ちを置き去りにしないほうが、穏やかに過ごせそうです。";
    case "swords":
      return "白が耳をぴんと立てています。\n今日は言葉を急がず選ぶと、やり取りが楽になりそうです。";
    case "wands":
      return "白が小さく弾むように歩いています。\n今日は思いついたことを一つやってみると、気分が前向きになりそうです。";
    case "pentacles":
      return "白が足元にちょこんと座っています。\n今日は身近なことをひとつ済ませると、安心して過ごせそうです。";
    default:
      return "白がそっと寄り添っています。\n今日は今の自分に必要なことを一つだけ大切にすると良さそうです。";
  }
}

function cleanCandidateParagraph(paragraph: string): string | null {
  const sentences = splitSentences(paragraph)
    .filter((sentence) => !isRepetitiveLeadSentence(sentence))
    .filter((sentence) => !hasBlockedPhrase(sentence));

  if (sentences.length === 0) return null;

  const unique: string[] = [];
  for (const sentence of sentences) {
    const normalizedSentence = normalizeForCompare(sentence);
    if (!normalizedSentence) continue;
    if (
      unique.some((existing) => {
        const normalizedExisting = normalizeForCompare(existing);
        return (
          normalizedExisting === normalizedSentence ||
          normalizedExisting.includes(normalizedSentence) ||
          normalizedSentence.includes(normalizedExisting)
        );
      })
    ) {
      continue;
    }
    unique.push(ensureEnding(sentence));
  }

  const joined = unique.slice(0, 2).join("");
  if (!joined || overusesSoftBlockedWords(joined)) return null;
  return joined;
}

function fallbackCardMeaning(card: LiteCard, context: DailyFortuneOutputContext): string {
  const reading = resolveDailyTarotReading(
    card,
    "",
    context.selectedCardMode,
    context.readingCategory ?? "general"
  );
  const orientation = card.reversed ? "逆位置" : "正位置";

  if (card.name.includes("節制")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、バランスが崩れやすく、行き過ぎや偏りが出やすい状態を示しています。無理に合わせようとせず、一度立ち止まって配分を見直すことが助けになります。`
      : `「${card.name}」の${orientation}は、行き過ぎたものをならしながら、ちょうどいい形へ整えていくカードです。急ぐより、無理のない配分に戻すことが今日の流れを助けてくれます。`;
  }

  if (card.name.includes("皇帝")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、責任やルールが重く感じられやすい日を示しています。完璧を求めすぎず、柔軟さを意識すると楽になります。`
      : `「${card.name}」の${orientation}は、安定と責任感が力になる日を示しています。土台を整えながら進むことで、安心感と成果が得られやすくなります。`;
  }

  if (card.name.includes("隠者")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、考えすぎて動けなくなりやすい気配を示しています。完璧な答えを求めすぎず、小さく動いてみることが助けになります。`
      : `「${card.name}」の${orientation}は、静かに自分と向き合う時間に意味がある日を示しています。外に合わせるより、内側の声を確かめることで次の一歩が見えてきます。`;
  }

  if (card.name.includes("太陽")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、明るさの裏にある不安や空回りに気づきやすい日を示しています。無理に元気を出そうとせず、素直な気持ちを大切にするとよいでしょう。`
      : `「${card.name}」の${orientation}は、明るさと前向きさが自然に広がる日を示しています。素直に気持ちを表すことで、まわりとの空気も良くなっていきます。`;
  }

  if (card.name.includes("月")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、不安や迷いが薄れ始め、少しずつ見通しが立ってくる日を示しています。完全にクリアでなくても、前に進んで大丈夫です。`
      : `「${card.name}」の${orientation}は、見えにくさや曖昧さが漂いやすい日を示しています。不安に振り回されず、はっきりしない部分をそのまま抱えて過ごすのが今日のコツです。`;
  }

  if (card.name.includes("力")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、感情のコントロールが難しく、つい衝動的になりやすい日を示しています。無理に押さえ込まず、気持ちを認めた上でやさしく扱うのがポイントです。`
      : `「${card.name}」の${orientation}は、やさしさと粘り強さが力になるカードです。強く押し切るのではなく、落ち着いて受け止める姿勢が状況を動かしてくれます。`;
  }

  if (card.name.includes("塔")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、大きな崩壊は免れるものの、見て見ぬふりをしていた問題が浮上しやすい日を示しています。小さいうちに向き合うほうが、あとが楽になります。`
      : `「${card.name}」の${orientation}は、思いがけない変化や衝撃が起きやすいカードです。驚いても、それは必要な立て直しの始まり。壊れた先に新しい形が見えてきます。`;
  }

  if (card.name.includes("星")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、希望が見えにくく、やる気が出にくい日を示しています。無理にポジティブを装わず、今の自分を受け入れることから回復が始まります。`
      : `「${card.name}」の${orientation}は、静かな希望と回復を示すカードです。大きな成果を焦るより、やわらかな見通しを信じて過ごすことで気持ちが楽になっていきます。`;
  }

  if (card.name.includes("愚者")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、軽やかさが落ち着かなさや散りやすさに変わりやすい状態を示しています。飛び出しすぎず、足元を確かめる意識が助けになります。`
      : `「${card.name}」の${orientation}は、まだ何も決まっていない自由さと可能性を示すカードです。先を心配しすぎず、今この瞬間の直感に従って一歩を踏み出すことに意味があります。`;
  }

  if (card.name.includes("魔術師")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、始動力が空回りしやすく、言葉と行動にずれが出やすい状態を示しています。やることを一つに絞ると力が噛み合いやすくなります。`
      : `「${card.name}」の${orientation}は、手元にある力や資源を使って新しいことを始められるカードです。準備は十分にあるので、あとは動き出すだけです。`;
  }

  if (card.name.includes("女教皇")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、洞察が考えすぎに転じやすく、閉じこもりがちな状態を示しています。読みすぎを手放し、感じたままを信じてみると楽になります。`
      : `「${card.name}」の${orientation}は、静かな直感と内なる知恵を示すカードです。外からの情報より、自分の内側から湧いてくる感覚を大切にすることで正しい方向が見えてきます。`;
  }

  if (card.name.includes("女帝")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、豊かさが甘やかしすぎや不安定な満たされ方に変わりやすい状態を示しています。受け取りすぎず、自分の中の「足りている」を確かめてみてください。`
      : `「${card.name}」の${orientation}は、豊かさと包容力を示すカードです。物質的にも感情的にもゆとりが生まれやすく、自然体で過ごすことが良い流れを引き寄せます。`;
  }

  if (card.name.includes("法王")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、常識やルールが窮屈さや押しつけに感じられやすい状態を示しています。形だけに合わせるより、自分に合ったやり方を探すほうが前に進めます。`
      : `「${card.name}」の${orientation}は、伝統や信頼できる教えが支えになるカードです。実績のあるやり方に沿うことで、安定感と安心感を得られやすくなります。`;
  }

  if (card.name.includes("恋人")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、共鳴が気持ちのずれや選びきれなさに変わりやすい状態を示しています。迷いがあるときは、自分の本音にもう一度向き合ってみてください。`
      : `「${card.name}」の${orientation}は、心の共鳴と大切な選択を示すカードです。自分の気持ちに正直に向き合うことで、本当に大切なものが見えてきます。`;
  }

  if (card.name.includes("戦車")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、前進する力が空回りしやすく、方向が乱れやすい状態を示しています。急ぎすぎず、進む先を確かめ直すと勢いが噛み合ってきます。`
      : `「${card.name}」の${orientation}は、意志の力で前に進むカードです。目標を定めてまっすぐ向かうことで、障害を乗り越えていけることを示しています。`;
  }

  if (card.name.includes("運命の輪")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、タイミングのずれや流れの噛み合わなさが出やすい状態を示しています。思い通りにいかなくても、巡りが変わるのを待つ姿勢が大切です。`
      : `「${card.name}」の${orientation}は、運命の巡りと転機を示すカードです。今起きている変化には意味があり、流れに乗ることで新しいステージが開けていきます。`;
  }

  if (card.name.includes("正義")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、公平さが偏りや判断ミスに変わりやすい状態を示しています。釣り合いが取れていないと感じたら、もう一方の視点から見直してみてください。`
      : `「${card.name}」の${orientation}は、公平さと正しい判断を示すカードです。事実に基づいて冷静に考えることで、バランスの取れた結論にたどり着けます。`;
  }

  if (card.name.includes("吊るされた男") || card.name.includes("吊された男")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、保留が長引き、動けなさの中で意味を見失いやすい状態を示しています。待つことに疲れたら、小さくてもいいので一つ動いてみてください。`
      : `「${card.name}」の${orientation}は、あえて立ち止まり、視点を変えることに意味があるカードです。すぐに動けなくても、この時間が新しい気づきにつながっています。`;
  }

  if (card.name.includes("死神")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、切り替えるべきものを手放せず、変化を止めてしまいやすい状態を示しています。終えることを恐れず、少しずつでも区切りをつけていくことが前進になります。`
      : `「${card.name}」の${orientation}は、終わりと再生を示すカードです。何かが終わることは新しい始まりの合図であり、手放すことで次の扉が開きます。`;
  }

  if (card.name.includes("悪魔")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、執着がほどけ始めている状態を示していますが、まだ引っ張られる力も残っています。完全に抜け出せなくても、気づいていること自体が解放への一歩です。`
      : `「${card.name}」の${orientation}は、強い執着や誘惑が影響しやすいカードです。心地よさの裏にある依存に気づくことで、自分の意志で選び直す力が戻ってきます。`;
  }

  if (card.name.includes("審判")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、再始動の呼びかけに気づきにくく、決めきれない状態を示しています。内側の声にもう少し耳を澄ませてみると、動くべきタイミングが見えてきます。`
      : `「${card.name}」の${orientation}は、再生と再始動を示すカードです。過去の経験が新しい形でよみがえり、もう一度やり直す力が湧いてくることを表しています。`;
  }

  if (card.name.includes("世界")) {
    return card.reversed
      ? `「${card.name}」の${orientation}は、完成にあと一歩届かず、まとまりきらない状態を示しています。締めの甘さを感じたら、最後のひと手間を丁寧にかけてみてください。`
      : `「${card.name}」の${orientation}は、完成と達成を示すカードです。一つのサイクルが満たされようとしていて、これまでの積み重ねが実を結ぶ時期に来ています。`;
  }

  const cardVoice = firstTwoSentences(reading.cardVoice);
  if (cardVoice) {
    return `「${card.name}」の${orientation}。${cardVoice}`;
  }

  return `「${card.name}」の${orientation}が出ています。このカードの持つ性質が、今日の流れに静かに影響しています。`;
}

function fallbackAdvice(card: LiteCard): string {
  if (card.name.includes("節制")) {
    return card.reversed
      ? "やりすぎていること、抱えすぎていることを一つだけ手放してみてください。引き算が今日のバランスを戻してくれます。"
      : "予定や気持ちを詰め込みすぎていないか、一度だけ見直してみてください。ひとつ減らす、少し遅らせる、それだけでも流れがやさしく整っていきます。";
  }
  if (card.name.includes("皇帝")) {
    return card.reversed
      ? "「こうすべき」を一度手放して、別のやり方がないか考えてみてください。柔軟さが今日の突破口になります。"
      : "朝のうちに、今日やることを3つだけはっきり決めておくと動きやすくなります。迷ったら、先に土台づくりになるほうから手をつけてください。";
  }
  if (card.name.includes("隠者")) {
    return "気になっていることをメモに少し書き出してみてください。頭の中だけで考えるより、次の一歩が見えやすくなります。";
  }
  if (card.name.includes("太陽")) {
    return "うれしいと思ったことを一つだけ言葉にして伝えてみてください。小さなひと言でも、気持ちの明るさがまわりに広がっていきます。";
  }
  if (card.name.includes("月")) {
    return "不安に感じていることを、紙に一つだけ書き出してみてください。頭の中にあるうちは大きく見えますが、文字にすると落ち着きやすくなります。";
  }
  if (card.name.includes("力")) {
    return "気持ちが動いた場面で深呼吸をひとつ入れてみてください。それだけで、反応ではなく選んだ言葉で動きやすくなります。";
  }
  if (card.name.includes("塔")) {
    return "予定が崩れても、すぐに立て直そうとせず、まず状況を確認してください。慌てないことが一番の対処法です。";
  }
  if (card.name.includes("星")) {
    return "今日は「こうなったらいいな」を一つだけ具体的に思い描いてみてください。小さな希望を言葉にすることが、回復の第一歩になります。";
  }

  if (card.name.includes("愚者")) {
    return card.reversed
      ? "気持ちが散らかっていると感じたら、今日やることを紙に一つだけ書いてみてください。それだけで意識が定まり、落ち着きが戻ります。"
      : "今日は、気になったことに深く考えすぎずまず触れてみてください。軽く動くことで、思いがけない収穫が見つかりそうです。";
  }

  if (card.name.includes("魔術師")) {
    return card.reversed
      ? "頭の中で計画を回し続けるより、一つだけ手を動かして形にしてみてください。小さなアウトプットが空回りを止めてくれます。"
      : "今日は、やりたいことの「最初の一手」だけ決めて動いてみてください。始めてしまえば、あとは自然と進みやすくなります。";
  }

  if (card.name.includes("女教皇")) {
    return card.reversed
      ? "調べすぎ・考えすぎに気づいたら、一度スマホや画面から離れてみてください。情報を遮断するだけで頭がすっきりします。"
      : "今日は、気になることがあっても結論を急がず、しばらく心に留めておいてみてください。時間が経つと、自然と答えの形が見えてきます。";
  }

  if (card.name.includes("女帝")) {
    return card.reversed
      ? "人のために動きすぎていないか、一度確かめてみてください。今日は自分のための時間を30分だけでも確保すると、気持ちが整います。"
      : "今日は、自分を喜ばせることを一つだけ許してあげてください。好きな飲み物、好きな音楽、小さな心地よさが一日をやわらかくしてくれます。";
  }

  if (card.name.includes("法王")) {
    return card.reversed
      ? "「こうしなきゃ」と感じるルールを一つだけ疑ってみてください。本当に必要かどうか見直すだけで、気持ちに余裕が戻ります。"
      : "迷ったら、経験のある人や信頼できる人に一言相談してみてください。自分だけで抱えるより、視界がぐっと開けます。";
  }

  if (card.name.includes("恋人")) {
    return card.reversed
      ? "選べないと感じたら、まず「自分はどうしたいか」を紙に書いてみてください。他人の正解ではなく、自分の本音を確かめることが先です。"
      : "今日は、大切な人に「ありがとう」を一つ伝えてみてください。小さな言葉が、つながりの温度を上げてくれます。";
  }

  if (card.name.includes("戦車")) {
    return card.reversed
      ? "焦りを感じたら、一度立ち止まって「今どこに向かっているか」を確認してみてください。方向さえ合っていれば、スピードはあとからついてきます。"
      : "今日は迷ったら「とりあえず動く」を選んでみてください。考えすぎる前に一歩踏み出すと、道が見えてきます。";
  }

  if (card.name.includes("運命の輪")) {
    return card.reversed
      ? "タイミングが合わないと感じても、自分を責めないでください。流れが変わるまで、今できることを淡々と続けるのが最善です。"
      : "今日は、いつもと少し違う選択をしてみてください。通る道を変える、頼む相手を変えるなど、小さな変化が良い巡りを呼びそうです。";
  }

  if (card.name.includes("正義")) {
    return card.reversed
      ? "判断に迷ったら、感情を一度脇に置いて、事実だけを紙に並べてみてください。偏りに気づくだけで、正しい方向が見えてきます。"
      : "今日は、後回しにしている「決めるべきこと」を一つ片づけてみてください。公平な目で見て結論を出すと、気持ちがすっきりします。";
  }

  if (card.name.includes("吊るされた男") || card.name.includes("吊された男")) {
    return card.reversed
      ? "待ち疲れを感じたら、「動けるものはないか」を一つだけ探してみてください。全部は無理でも、一つ動かすと気持ちが軽くなります。"
      : "今日は、急いで結論を出さず、あえて「保留」を選んでみてください。待つことで見えてくるものが、あとで大きな助けになります。";
  }

  if (card.name.includes("死神")) {
    return card.reversed
      ? "手放せないと感じているものを一つだけ思い浮かべて、「これがなくなったらどうなるか」を想像してみてください。意外と大丈夫だと気づけるかもしれません。"
      : "今日は、もう使っていないものや習慣を一つ手放してみてください。小さな「終わらせる」が、次の始まりへのスペースをつくってくれます。";
  }

  if (card.name.includes("悪魔")) {
    return card.reversed
      ? "惰性で続けていることを一つだけ見直してみてください。完全にやめなくても、「本当に必要か」と問いかけるだけで意識が変わります。"
      : "今日は、「つい手が伸びてしまうもの」に一度だけ間を置いてみてください。5分待つだけでも、衝動に振り回されにくくなります。";
  }

  if (card.name.includes("審判")) {
    return card.reversed
      ? "決断を先延ばしにしているものがあれば、今日中に「いつまでに決めるか」だけ決めてみてください。期限を置くだけで動きやすくなります。"
      : "今日は、昔やりかけて止まっていたことを一つ思い出してみてください。今の自分なら、違うアプローチで再開できるかもしれません。";
  }

  if (card.name.includes("世界")) {
    return card.reversed
      ? "仕上がりに納得できないときは、「あと一箇所だけ直す」と決めてみてください。全体を見直すより、ピンポイントの修正が完成度を上げてくれます。"
      : "今日は、最近がんばってきたことを振り返って、自分に「お疲れさま」を言ってあげてください。達成を認めることが、次への原動力になります。";
  }

  const focus = resolveCardThemeFocus(card.name);
  switch (focus.suit) {
    case "swords":
      return "返事や判断を出す前に、一度だけ文面を読み返してみてください。ほんの少しの見直しが、やり取りをスムーズにしてくれます。";
    case "wands":
      return "やりたいことを一つだけ選んで、今日中に小さく着手してみてください。動き出すことで、考えすぎていた部分がほどけていきます。";
    case "cups":
      return "気持ちを短く言葉にしてみてください。「ありがとう」や「助かった」のひと言が、今日の気持ちをやわらかくしてくれます。";
    case "pentacles":
      return "後回しにしていた小さな用事をひとつ片づけてみてください。それだけで、気持ちに余裕が戻ってきます。";
    default:
      return "気になっていることを一つだけ行動に移してみてください。小さく動くだけでも、気持ちが前を向きやすくなります。";
  }
}

function shouldShowMoney(card: LiteCard): boolean {
  const focus = resolveCardThemeFocus(card.name);
  if (focus.suit === "pentacles") return true;
  if (card.name.includes("皇帝") || card.name.includes("女帝")) return true;
  if (card.name.includes("節制")) return true;
  if (card.name.includes("運命の輪") || card.name.includes("世界")) return true;
  if (card.name.includes("塔")) return true;
  if (card.name.includes("死神")) return true;
  if (card.name.includes("正義")) return true;
  if (card.name.includes("吊るされた男") || card.name.includes("吊された男")) return true;
  const moneyThemes = focus.themes.some((t) =>
    ["現実", "安定", "豊かさ", "管理", "蓄積", "物質"].some((k) => t.includes(k))
  );
  return moneyThemes;
}

function fallbackMoney(card: LiteCard): string {
  const focus = resolveCardThemeFocus(card.name);

  if (card.name.includes("節制")) {
    return card.reversed
      ? "出費のバランスが崩れやすい日です。「本当に必要か」を一つずつ確かめてから支払うと、あとで後悔しにくくなります。"
      : "必要なものを落ち着いて選ぶのに向く日です。勢いの買い物より、使い道を見ながら整えるほうが満足しやすいでしょう。";
  }

  if (card.name.includes("皇帝")) {
    return card.reversed
      ? "出費の管理が甘くなりやすい日です。予定外の支出は一度立ち止まって考えてみてください。"
      : "大きく使うより、必要なものを堅実に選ぶほうが満足度につながりそうです。今日は管理や見直しに向く流れです。";
  }

  if (card.name.includes("塔")) {
    return "予定外の出費が起きやすい流れです。衝動的な判断は避けて、一晩置いてから決めるのが安心です。";
  }

  if (card.name.includes("運命の輪")) {
    return "お金の流れに変化が出やすい日です。良い変化も悪い変化もあり得るので、大きな判断は慎重に。";
  }

  if (card.name.includes("死神")) {
    return card.reversed
      ? "終わらせるべき出費や契約をずるずる引きずりやすい日です。不要なサブスクや自動引き落としがないか、一度チェックしてみてください。"
      : "お金の使い方に区切りがつきやすい日です。不要な出費を一つ手放すことで、新しい流れに回せる余裕が生まれそうです。";
  }

  if (card.name.includes("正義")) {
    return card.reversed
      ? "出費と収入のバランスが偏りやすい日です。「使いすぎていないか」を一度だけ振り返ってみると、調整がしやすくなります。"
      : "公平な目で家計を見直すのに向いている日です。必要なものに適切な金額を使うことで、納得感のあるお金の流れが生まれます。";
  }

  if (card.name.includes("吊るされた男") || card.name.includes("吊された男")) {
    return card.reversed
      ? "お金を動かせない状態が気になりやすい日です。焦って無理に使うより、動かせるタイミングが来るまで静かに待つほうが安心です。"
      : "今日は大きな買い物や投資を控え、いったん保留にするのが吉です。待つことで、より良い条件や選択肢が見えてきそうです。";
  }

  switch (focus.suit) {
    case "pentacles":
      return card.reversed
        ? "お金まわりで見落としが出やすい日です。レシートや明細を一度確認しておくと安心です。"
        : "堅実な判断が金運を支えてくれる日です。必要なものにしっかりお金を使うことで、納得感のある一日になります。";
    default:
      return "今日は金運に大きな動きはなさそうです。日常の出費を丁寧に扱うことで、安心感が保てます。";
  }
}

const LABEL_ESCAPED = ALL_LABELS.map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

const LABEL_LINE_PATTERN = new RegExp(
  `『(?:${LABEL_ESCAPED})』\\n?`,
  "g"
);

const BARE_LABEL_LINE_PATTERN = new RegExp(
  `^(?:${LABEL_ESCAPED})\\n`,
  "gm"
);

function stripInlineLabels(text: string): string {
  return text
    .replace(LABEL_LINE_PATTERN, "")
    .replace(BARE_LABEL_LINE_PATTERN, "")
    .trim();
}

function buildStructuredFortune(text: string, cards: LiteCard[], context: DailyFortuneOutputContext): string {
  const main = cards[0] ?? { name: "世界", reversed: false };
  const candidates = pickCandidateParagraphs(text)
    .map(cleanCandidateParagraph)
    .filter(Boolean)
    .map((c) => stripInlineLabels(c!))
    .filter(Boolean) as string[];

  const intro = buildIntroText(cards, context);
  const cardMeaning = fallbackCardMeaning(main, context);
  const overallFlow = candidates[0] ?? fallbackOverallFlow(main, context);
  const dailyLife = candidates[1] ?? fallbackWorkParagraph(main, context);
  const love = candidates[2] ?? fallbackLoveParagraph(main, context);
  const advice = fallbackAdvice(main);
  const money = shouldShowMoney(main) ? fallbackMoney(main) : "";
  const todayHitokoto = fallbackTodayHitokoto(main, context);
  const whiteHitokoto = fallbackWhiteHitokoto(main);

  const sections = [
    `${INTRO_LABEL}\n${intro}`,
    `${CARD_MEANING_LABEL}\n${cardMeaning}`,
    `${OVERALL_FLOW_LABEL}\n${overallFlow}`,
    `${WORK_FLOW_LABEL}\n${dailyLife}`,
    `${LOVE_FLOW_LABEL}\n${love}`,
    `${ADVICE_LABEL}\n${advice}`,
  ];

  if (money) {
    sections.push(`${MONEY_LABEL}\n${money}`);
  }

  sections.push(`${TODAY_HITOKOTO_LABEL}\n${todayHitokoto}`);
  sections.push(`${WHITE_HITOKOTO_LABEL}\n${whiteHitokoto}`);

  return sections.join("\n\n");
}

type DailyFortuneJson = {
  summary?: string;
  intro?: string;
  cardMeaning?: string;
  overallFlow?: string;
  workStudy?: string;
  loveRelationships?: string;
  advice?: string;
  money?: string | null;
  todayHint?: string;
  whiteHint?: string;
};

function tryParseFortuneJson(text: string): DailyFortuneJson | null {
  const trimmed = text.trim();
  // JSONブロック（```json ... ``` でラップされている場合も対処）
  const jsonMatch =
    trimmed.match(/```json\s*([\s\S]*?)```/) ??
    trimmed.match(/^(\{[\s\S]*\})$/) ??
    trimmed.match(/(\{[\s\S]*\})\s*$/);
  const jsonStr = jsonMatch?.[1]?.trim() ?? trimmed;
  if (!jsonStr.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(jsonStr) as DailyFortuneJson;
    if (typeof parsed !== "object" || parsed === null) return null;
    // 最低限 overallFlow か cardMeaning があればJSON出力と判断
    if (!parsed.overallFlow && !parsed.cardMeaning) return null;
    return parsed;
  } catch {
    // JSONが途中で切れている場合など、部分的に取り出す試み
    try {
      const braceStart = jsonStr.indexOf("{");
      if (braceStart < 0) return null;
      let depth = 0;
      let end = -1;
      for (let i = braceStart; i < jsonStr.length; i++) {
        if (jsonStr[i] === "{") depth++;
        else if (jsonStr[i] === "}") {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
      if (end < 0) return null;
      const extracted = jsonStr.slice(braceStart, end + 1);
      const parsed = JSON.parse(extracted) as DailyFortuneJson;
      if (typeof parsed !== "object" || parsed === null) return null;
      if (!parsed.overallFlow && !parsed.cardMeaning) return null;
      return parsed;
    } catch {
      return null;
    }
  }
}

function buildFromJson(
  json: DailyFortuneJson,
  cards: LiteCard[],
  context: DailyFortuneOutputContext
): string {
  const main = cards[0] ?? { name: "世界", reversed: false };

  const intro = buildIntroText(cards, context);
  const cardMeaning = json.cardMeaning?.trim() || fallbackCardMeaning(main, context);
  const overallFlow = json.overallFlow?.trim() || fallbackOverallFlow(main, context);
  const work = json.workStudy?.trim() || fallbackWorkParagraph(main, context);
  const love = json.loveRelationships?.trim() || fallbackLoveParagraph(main, context);
  const advice = json.advice?.trim() || fallbackAdvice(main);
  const money = json.money?.trim() || (shouldShowMoney(main) ? fallbackMoney(main) : "");
  const todayHitokoto = json.todayHint?.trim() || fallbackTodayHitokoto(main, context);
  const whiteHitokoto = json.whiteHint?.trim() || fallbackWhiteHitokoto(main);

  const sections = [
    `${INTRO_LABEL}\n${intro}`,
    `${CARD_MEANING_LABEL}\n${cardMeaning}`,
    `${OVERALL_FLOW_LABEL}\n${overallFlow}`,
    `${WORK_FLOW_LABEL}\n${work}`,
    `${LOVE_FLOW_LABEL}\n${love}`,
    `${ADVICE_LABEL}\n${advice}`,
  ];

  if (money) {
    sections.push(`${MONEY_LABEL}\n${money}`);
  }

  sections.push(`${TODAY_HITOKOTO_LABEL}\n${todayHitokoto}`);
  sections.push(`${WHITE_HITOKOTO_LABEL}\n${whiteHitokoto}`);

  return sections.join("\n\n");
}

export function ensureFortuneOutputFormat(
  text: string,
  cards: LiteCard[],
  context: DailyFortuneOutputContext
): string {
  const normalized = sanitizeJobSurface(normalize(text), context.job);
  const mainCard = cards[0];
  const legacyHeading = mainCard
    ? `引いたカード：${mainCard.name}（${mainCard.reversed ? "逆位置" : "正位置"}）`
    : "引いたカード：";

  // JSON出力を優先的に試す
  const json = tryParseFortuneJson(normalized);
  if (json) {
    return `${legacyHeading}\n\n${buildFromJson(json, cards, context)}`;
  }

  // JSONパース失敗時はテキストベースのフォールバック
  return `${legacyHeading}\n\n${buildStructuredFortune(normalized, cards, context)}`;
}

function extractSection(text: string, label: string, nextLabels: string[]): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedNext = nextLabels.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern =
    escapedNext.length > 0
      ? new RegExp(`${escapedLabel}\\n([\\s\\S]*?)(?=\\n(?:${escapedNext.join("|")})\\n|$)`)
      : new RegExp(`${escapedLabel}\\n([\\s\\S]*)$`);
  const match = text.match(pattern);
  return stripInlineLabels(match?.[1]?.trim() ?? "");
}

function labelsAfter(label: string): string[] {
  const idx = ALL_LABELS.indexOf(label);
  return idx >= 0 ? ALL_LABELS.slice(idx + 1) : [];
}

export function parseDailyFortuneSections(text: string): DailyFortuneSections {
  const normalized = normalize(text);
  return {
    intro: extractSection(normalized, INTRO_LABEL, labelsAfter(INTRO_LABEL)),
    cardMeaning: extractSection(normalized, CARD_MEANING_LABEL, labelsAfter(CARD_MEANING_LABEL)),
    overallFlow: extractSection(normalized, OVERALL_FLOW_LABEL, labelsAfter(OVERALL_FLOW_LABEL)),
    work: extractSection(normalized, WORK_FLOW_LABEL, labelsAfter(WORK_FLOW_LABEL)),
    love: extractSection(normalized, LOVE_FLOW_LABEL, labelsAfter(LOVE_FLOW_LABEL)),
    advice: extractSection(normalized, ADVICE_LABEL, labelsAfter(ADVICE_LABEL)),
    money: extractSection(normalized, MONEY_LABEL, labelsAfter(MONEY_LABEL)),
    todayHitokoto: extractSection(normalized, TODAY_HITOKOTO_LABEL, labelsAfter(TODAY_HITOKOTO_LABEL)),
    whiteHitokoto: extractSection(normalized, WHITE_HITOKOTO_LABEL, []),
  };
}
