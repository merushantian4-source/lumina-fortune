/**
 * Structured interpretation frame for romance readings.
 *
 * Local code decides the psychological / relationship structure first;
 * Claude writes the final reading second.
 *
 * This keeps all deterministic logic in local code and prevents Claude
 * from inventing details — it can only articulate what the frame describes.
 */

/* ── Types ── */

export type EmotionalState =
  | "anxious-waiting"      // 不安で待っている
  | "quietly-hoping"       // 静かに期待している
  | "letting-go"           // 手放そうとしている
  | "confused"             // 混乱・迷い
  | "determined"           // 決意している
  | "grieving"             // 悲しみの中にいる
  | "cautiously-open";     // 慎重に心を開こうとしている

export type PartnerState =
  | "still-thinking"       // まだ考えている
  | "moving-on"            // 前に進もうとしている
  | "holding-back"         // 気持ちを抑えている
  | "unaware"              // 気づいていない
  | "remembering-warmly"   // やさしく思い出している
  | "conflicted"           // 葛藤の中にいる
  | "quietly-drawn";       // 静かに惹かれている

export type RelationshipPhase =
  | "dormant"              // 休止・動きがない
  | "thawing"              // 少しずつ溶けはじめている
  | "building"             // 育っている最中
  | "at-crossroads"        // 分岐点にいる
  | "deepening"            // 深まりつつある
  | "shifting"             // 変化の途中
  | "post-separation";     // 別れの後

export type EnergyFlow =
  | "paused"               // 止まっている
  | "slowly-moving"        // ゆっくり動いている
  | "preparing-to-shift"   // 変化の準備段階
  | "accelerating"         // 加速しつつある
  | "ebbing"               // 引いている
  | "circling-back";       // 巡り戻ろうとしている

export type HopeLevel =
  | "gentle-light"         // ほのかな光
  | "steady-glow"          // 安定した灯り
  | "bright-possibility"   // 明るい可能性
  | "fragile-hope"         // 繊細な希望
  | "quiet-acceptance";    // 静かな受容

export type GuidanceTone =
  | "wait-and-heal"        // 待ちながら癒す
  | "small-step-forward"   // 小さな一歩を踏み出す
  | "trust-the-flow"       // 流れを信じる
  | "protect-yourself"     // 自分を守る
  | "express-gently"       // やさしく伝える
  | "let-go-softly"        // やさしく手放す
  | "stay-present";        // 今に集中する

export type InterpretationFrame = {
  userEmotionalState: EmotionalState;
  partnerState: PartnerState;
  relationshipPhase: RelationshipPhase;
  energyFlow: EnergyFlow;
  keyObstacle: string;
  hopeLevel: HopeLevel;
  guidanceTone: GuidanceTone;
  /** One-line emotional core of this reading */
  emotionalCore: string;
};

/* ── Frame builders per feature ── */

type CardInfo = {
  arcana: "major" | "minor";
  suit?: "cups" | "wands" | "swords" | "pentacles";
  reversed: boolean;
};

/** Build frame for 復縁占い */
export function buildFukuenFrame(card: CardInfo, seed: number): InterpretationFrame {
  const reversed = card.reversed;
  const isMajor = card.arcana === "major";
  const suit = card.suit;

  return {
    userEmotionalState: reversed
      ? pick(["grieving", "confused", "letting-go"] as const, seed, 3)
      : pick(["quietly-hoping", "cautiously-open", "anxious-waiting"] as const, seed, 3),

    partnerState: reversed
      ? pick(["conflicted", "moving-on", "holding-back"] as const, seed, 5)
      : isMajor
        ? "remembering-warmly"
        : suit === "cups"
          ? "still-thinking"
          : suit === "wands"
            ? "holding-back"
            : suit === "swords"
              ? "conflicted"
              : "still-thinking",

    relationshipPhase: reversed
      ? "post-separation"
      : isMajor
        ? "at-crossroads"
        : suit === "cups"
          ? "thawing"
          : "dormant",

    energyFlow: reversed
      ? pick(["paused", "ebbing"] as const, seed, 7)
      : isMajor
        ? "circling-back"
        : suit === "cups"
          ? "slowly-moving"
          : suit === "wands"
            ? "preparing-to-shift"
            : "paused",

    keyObstacle: reversed
      ? pick([
          "過去の痛みがまだ癒えていない",
          "お互いの気持ちの整理がついていない",
          "連絡するきっかけが見つからない",
        ], seed, 11)
      : pick([
          "素直になることへの怖さ",
          "タイミングを見極められない不安",
          "変わってしまった関係への戸惑い",
        ], seed, 11),

    hopeLevel: reversed
      ? "fragile-hope"
      : isMajor
        ? "bright-possibility"
        : suit === "cups"
          ? "steady-glow"
          : "gentle-light",

    guidanceTone: reversed
      ? pick(["wait-and-heal", "protect-yourself"] as const, seed, 13)
      : pick(["trust-the-flow", "small-step-forward"] as const, seed, 13),

    emotionalCore: reversed
      ? "まだ気持ちが揺れている中で、心の整理を待つ時期"
      : isMajor
        ? "運命的な縁が静かに再び動き始めようとしている"
        : suit === "cups"
          ? "想いの余韻がまだやさしく残っている"
          : suit === "wands"
            ? "再会のきっかけを心のどこかで探している"
            : "時間が気持ちを静かに整え直している",
  };
}

/** Build frame for あの人の気持ち占い */
export function buildKareNoKimochiFrame(card: CardInfo, seed: number, hasRealisticContext: boolean): InterpretationFrame {
  const reversed = card.reversed;
  const isMajor = card.arcana === "major";
  const suit = card.suit;

  if (hasRealisticContext) {
    return {
      userEmotionalState: "anxious-waiting",
      partnerState: "moving-on",
      relationshipPhase: "post-separation",
      energyFlow: "ebbing",
      keyObstacle: "現実的な距離や状況が気持ちの間にある",
      hopeLevel: "quiet-acceptance",
      guidanceTone: "let-go-softly",
      emotionalCore: "想いは本物だが、相手の今の日常を尊重する時期",
    };
  }

  return {
    userEmotionalState: reversed
      ? pick(["anxious-waiting", "confused"] as const, seed, 3)
      : pick(["quietly-hoping", "cautiously-open"] as const, seed, 3),

    partnerState: reversed
      ? pick(["holding-back", "conflicted", "unaware"] as const, seed, 5)
      : isMajor
        ? "quietly-drawn"
        : suit === "cups"
          ? "quietly-drawn"
          : suit === "wands"
            ? "still-thinking"
            : suit === "swords"
              ? "holding-back"
              : "still-thinking",

    relationshipPhase: reversed
      ? pick(["dormant", "shifting"] as const, seed, 7)
      : isMajor
        ? "deepening"
        : suit === "cups"
          ? "building"
          : suit === "wands"
            ? "thawing"
            : "at-crossroads",

    energyFlow: reversed
      ? pick(["paused", "preparing-to-shift"] as const, seed, 9)
      : isMajor
        ? "accelerating"
        : suit === "cups"
          ? "slowly-moving"
          : "preparing-to-shift",

    keyObstacle: reversed
      ? pick([
          "相手が自分の気持ちに蓋をしている",
          "状況が気持ちを表に出すことを許していない",
          "お互いの距離感がまだ定まっていない",
        ], seed, 11)
      : pick([
          "言葉にするタイミングを探している",
          "近づきたい気持ちと慎重さの間で揺れている",
          "日常の忙しさが気持ちを後回しにさせている",
        ], seed, 11),

    hopeLevel: reversed
      ? "fragile-hope"
      : isMajor
        ? "bright-possibility"
        : suit === "cups"
          ? "steady-glow"
          : "gentle-light",

    guidanceTone: reversed
      ? pick(["wait-and-heal", "stay-present"] as const, seed, 13)
      : pick(["trust-the-flow", "express-gently"] as const, seed, 13),

    emotionalCore: reversed
      ? "あの人の中にも想いはあるが、まだ動ける段階にない"
      : isMajor
        ? "あの人の心はあなたに確かに向いている"
        : suit === "cups"
          ? "あの人はやさしい感情をあなたに抱いている"
          : suit === "wands"
            ? "あの人はあなたのことが気になり始めている"
            : "あの人は自分の気持ちを静かに見つめている",
  };
}

/** Build frame for 片思い占い */
export function buildKataomoiFrame(card: CardInfo, seed: number): InterpretationFrame {
  const reversed = card.reversed;
  const isMajor = card.arcana === "major";
  const suit = card.suit;

  return {
    userEmotionalState: reversed
      ? pick(["anxious-waiting", "confused", "determined"] as const, seed, 3)
      : pick(["quietly-hoping", "cautiously-open"] as const, seed, 3),

    partnerState: reversed
      ? pick(["unaware", "holding-back"] as const, seed, 5)
      : isMajor
        ? "quietly-drawn"
        : suit === "cups"
          ? "quietly-drawn"
          : suit === "wands"
            ? "still-thinking"
            : "unaware",

    relationshipPhase: reversed
      ? pick(["dormant", "at-crossroads"] as const, seed, 7)
      : isMajor
        ? "shifting"
        : suit === "cups"
          ? "building"
          : suit === "wands"
            ? "thawing"
            : "dormant",

    energyFlow: reversed
      ? "paused"
      : isMajor
        ? "accelerating"
        : suit === "cups"
          ? "slowly-moving"
          : suit === "wands"
            ? "preparing-to-shift"
            : "slowly-moving",

    keyObstacle: reversed
      ? pick([
          "相手に自分の気持ちが届いているか不安",
          "行動を起こすタイミングが見つからない",
          "期待して傷つくことへの恐れ",
        ], seed, 11)
      : pick([
          "まだ距離があるため、気持ちを伝えきれない",
          "自分の気持ちに自信が持てない",
          "相手の反応が読めない不安",
        ], seed, 11),

    hopeLevel: reversed
      ? "fragile-hope"
      : isMajor
        ? "bright-possibility"
        : suit === "cups"
          ? "steady-glow"
          : "gentle-light",

    guidanceTone: reversed
      ? pick(["stay-present", "protect-yourself"] as const, seed, 13)
      : pick(["small-step-forward", "express-gently", "trust-the-flow"] as const, seed, 13),

    emotionalCore: reversed
      ? "恋はまだ動き出す前の静けさの中にある"
      : isMajor
        ? "この恋は運命的な力で動き始めようとしている"
        : suit === "cups"
          ? "あの人の心にあなたの存在がやさしく届き始めている"
          : suit === "wands"
            ? "恋のエネルギーが少しずつ熱を帯びてきている"
            : "今は種まきの時期——焦らず育てる段階",
  };
}

/** Build frame for 相性占い */
export function buildCompatibilityFrame(
  myNumber: number,
  partnerNumber: number,
): InterpretationFrame {
  const same = myNumber === partnerNumber;
  const complementary = myNumber + partnerNumber === 10;
  const close = Math.abs(myNumber - partnerNumber) <= 2;

  return {
    userEmotionalState: "cautiously-open",

    partnerState: same
      ? "quietly-drawn"
      : complementary
        ? "still-thinking"
        : "still-thinking",

    relationshipPhase: same
      ? "deepening"
      : complementary
        ? "building"
        : close
          ? "thawing"
          : "at-crossroads",

    energyFlow: same
      ? "slowly-moving"
      : complementary
        ? "accelerating"
        : close
          ? "slowly-moving"
          : "preparing-to-shift",

    keyObstacle: same
      ? "似ているからこそ、すれ違いに気づきにくい"
      : complementary
        ? "役割分担が偏ると、片方に負担が集中する"
        : close
          ? "近い感性だからこそ、余裕がないとき視野が狭くなる"
          : "大切にするもの優先順位の違い",

    hopeLevel: complementary
      ? "bright-possibility"
      : same
        ? "steady-glow"
        : "gentle-light",

    guidanceTone: same
      ? "express-gently"
      : complementary
        ? "trust-the-flow"
        : close
          ? "stay-present"
          : "small-step-forward",

    emotionalCore: same
      ? "共鳴する魂同士——言葉にすることでさらに深まる"
      : complementary
        ? "補い合う力がある——違いを恐れないほど光が増す"
        : close
          ? "寄り添いやすい波長——丁寧さが安らぎを育てる"
          : "異なるリズムが新しい景色を見せてくれる",
  };
}

/** Build frame for 婚期占い */
export function buildMarriageTimingFrame(
  destinyNumber: number,
  personalYears: number[],
): InterpretationFrame {
  const hasMainYear = personalYears.includes(6);
  const hasPracticalYear = personalYears.includes(8);
  const hasGrowthYear = personalYears.includes(2);

  return {
    userEmotionalState: hasMainYear
      ? "cautiously-open"
      : "quietly-hoping",

    partnerState: "still-thinking",

    relationshipPhase: hasMainYear
      ? "deepening"
      : hasPracticalYear
        ? "building"
        : hasGrowthYear
          ? "thawing"
          : "dormant",

    energyFlow: hasMainYear
      ? "accelerating"
      : hasPracticalYear
        ? "preparing-to-shift"
        : "slowly-moving",

    keyObstacle: hasMainYear
      ? "心の準備が追いつかないかもしれない"
      : hasPracticalYear
        ? "理想と現実のバランスを取る必要がある"
        : "ご縁が育つまでの時間を受け入れること",

    hopeLevel: hasMainYear
      ? "bright-possibility"
      : hasPracticalYear
        ? "steady-glow"
        : "gentle-light",

    guidanceTone: hasMainYear
      ? "trust-the-flow"
      : hasPracticalYear
        ? "small-step-forward"
        : "stay-present",

    emotionalCore: hasMainYear
      ? "愛が形になりやすいエネルギーの窓が近づいている"
      : hasPracticalYear
        ? "未来設計が現実と重なり始めるフェーズ"
        : hasGrowthYear
          ? "ご縁を静かに育てる土壌づくりの時期"
          : "心の中で結婚への想いを整理する準備段階",
  };
}

/* ── Helper ── */

function pick<T>(items: readonly T[], seed: number, offset: number): T {
  return items[(seed + offset) % items.length]!;
}
