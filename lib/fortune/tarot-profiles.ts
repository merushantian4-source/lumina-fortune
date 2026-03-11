import type { DrawnTarotCard } from "@/lib/tarot/deck";

export type TarotCategory = "general" | "love" | "work" | "money" | "relation" | "health";

export type TarotCardProfile = {
  voice: string;
  modes: string[];
  general?: string[];
  love: string[];
  work: string[];
  money: string[];
  relation: string[];
  health?: string[];
};

function defineProfile(profile: TarotCardProfile): TarotCardProfile {
  return profile;
}

export const tarotProfiles: Record<string, TarotCardProfile> = {
  pentacle_6_upright: defineProfile({
    voice: "与えることと受け取ることの釣り合いが、今の流れを整えていきます。",
    modes: ["支え合い", "関係の循環", "偏りの見直し"],
    general: ["今の流れの偏り", "受け取ることの大切さ", "無理のない循環"],
    love: ["気持ちのバランス", "尽くしすぎていないか", "一方通行の見直し"],
    work: ["助け合い", "役割分担", "評価のバランス"],
    money: ["収支の循環", "出入りの見直し", "貸し借りの感覚"],
    relation: ["支える側と支えられる側の偏り", "遠慮しすぎない受け取り方", "関係の温度差"],
    health: ["頑張りすぎと休息のバランス", "回復の受け取り方", "無理の見直し"],
  }),
  cup_5_reversed: defineProfile({
    voice: "失ったものだけでなく、まだ残っているあたたかさにも目を向けられそうです。",
    modes: ["立ち直りの入口", "気持ちの整理", "関係修復の余地", "後悔からの回復"],
    general: ["立ち直りのきっかけ", "残っている希望", "気持ちのほぐれ"],
    love: ["傷ついた気持ちの回復", "関係を見直す余白", "まだつながる余地"],
    work: ["気持ちを引きずりすぎないこと", "流れの立て直し", "失敗からの回復"],
    money: ["落ち込みの整理", "失った感覚を引きずりすぎないこと", "少しずつ整える流れ"],
    relation: ["行き違いの修復", "わだかまりの整理", "距離を戻しすぎない回復"],
    health: ["心の疲れの回復", "落ち込みからの立ち直り", "やさしく戻す感覚"],
  }),
  sword_7_upright: defineProfile({
    voice: "正面から進むだけでなく、今は立ち回り方を選ぶ知恵が助けになりそうです。",
    modes: ["回り道の知恵", "本音を隠しやすい", "立ち回りが必要", "見せ方を選ぶタイミング"],
    general: ["考えすぎやすさ", "引き際の見極め", "静かな判断"],
    love: ["本音を出しきれない距離感", "駆け引きの空気", "言葉選びの慎重さ"],
    work: ["情報整理", "立ち回りの工夫", "余計な衝突を避ける判断"],
    money: ["使い方の慎重さ", "見えない出費", "計画の立て直し"],
    relation: ["言葉の裏読み", "少し距離を取る知恵", "関係の中での立ち位置"],
    health: ["神経の張り", "考えすぎによる疲れ", "ひと息入れる判断"],
  }),
  major_star_upright: defineProfile({
    voice: "急がなくても大丈夫です。やわらかな希望は、静かに先を照らしています。",
    modes: ["希望の回復", "静かな安心", "流れの先にある光"],
    general: ["希望の持ち直し", "焦らなくていい流れ", "心がやわらぐ時間"],
    love: ["関係にやさしい光が戻ること", "信じ直す気持ち", "急がない安心"],
    work: ["先を明るく見ること", "力を抜いた継続", "無理をしない前進"],
    money: ["不安を落ち着かせること", "長い目で整えること", "安心感の回復"],
    relation: ["関係にやわらかさが戻ること", "信頼の回復", "穏やかなつながり"],
    health: ["回復への希望", "気持ちがゆるむこと", "静かな整い"],
  }),
  major_moon_reversed: defineProfile({
    voice: "ぼんやりしていた不安が、少しずつ輪郭を失っていきそうです。",
    modes: ["迷いのほどけ", "思い込みの整理", "気持ちの霧が晴れる"],
    general: ["曖昧さの解消", "思い込みの見直し", "少しずつ見えてくる流れ"],
    love: ["不安の正体が見えてくること", "誤解をほどく流れ", "気持ちを静かに確かめること"],
    work: ["判断の迷いが薄れること", "見通しの回復", "落ち着いた整理"],
    money: ["曖昧なお金の感覚を整えること", "見えにくかった出入りの確認", "不安の整理"],
    relation: ["思い違いの修正", "距離感の見直し", "相手を見誤らないこと"],
    health: ["気持ちの霧を抜くこと", "不安に飲まれすぎないこと", "落ち着きを戻すこと"],
  }),
};

export function toTarotProfileKey(card: DrawnTarotCard): string {
  const orientation = card.reversed ? "reversed" : "upright";
  if (card.card.arcana === "major") {
    const majorSlug = card.card.code.replace(/^major-\d+-/, "").replace(/-/g, "_");
    return `major_${majorSlug}_${orientation}`;
  }

  const suitMap = {
    cups: "cup",
    swords: "sword",
    wands: "wand",
    pentacles: "pentacle",
  } as const;

  const rankMap = {
    ace: "ace",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
    ten: "10",
    page: "page",
    knight: "knight",
    queen: "queen",
    king: "king",
  } as const;

  return `${suitMap[card.card.suit!]}_${rankMap[card.card.rank!]}_${orientation}`;
}

function buildFallbackProfile(card: DrawnTarotCard): TarotCardProfile {
  const meaning = card.reversed ? card.card.reversedMeaning : card.card.uprightMeaning;
  const keywords = card.card.symbolKeywords.filter(Boolean);
  const base = keywords[0] ?? meaning;
  const support = keywords[1] ?? "今の流れ";

  return {
    voice: `${card.card.nameJa}は、${meaning}を静かに語りかけてくるカードです。`,
    modes: [base, support, "少しずつ整う流れ"],
    general: [meaning, "今日の流れ", "今の気持ち"],
    love: [meaning, "恋愛の流れ", "気持ちの距離感"],
    work: [meaning, "仕事の流れ", "進め方の見直し"],
    money: [meaning, "お金の流れ", "現実面の整え方"],
    relation: [meaning, "人との距離感", "言葉のやり取り"],
    health: [meaning, "心と体の整え方", "無理をしすぎないこと"],
  };
}

export function getTarotProfile(card: DrawnTarotCard): TarotCardProfile {
  const key = toTarotProfileKey(card);
  return tarotProfiles[key] ?? buildFallbackProfile(card);
}

export function pickTarotMode(profile: TarotCardProfile, seed: string): string {
  if (profile.modes.length === 0) return "静かな変化";

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  return profile.modes[hash % profile.modes.length] ?? profile.modes[0];
}

export function getCategoryReadings(profile: TarotCardProfile, category: TarotCategory): string[] {
  switch (category) {
    case "love":
      return profile.love;
    case "work":
      return profile.work;
    case "money":
      return profile.money;
    case "relation":
      return profile.relation;
    case "health":
      return profile.health ?? profile.general ?? [];
    case "general":
    default:
      return profile.general ?? [profile.voice];
  }
}

export type TarotReadingCategory = TarotCategory;
export const tarotCardProfiles = tarotProfiles;
export const resolveTarotCardProfile = getTarotProfile;
