import { getHolidayLabel, lightCalendar2026 } from "../lucky-days";

export type LightDayBadgeType =
  | "tensha"
  | "ichiryumanbai"
  | "taian"
  | "tora"
  | "mi"
  | "tsuchinotomi"
  | "holiday"
  | "fujouju";

export type LightDayTone = "best" | "good" | "neutral" | "caution";

export type LightDayBadge = {
  type: LightDayBadgeType;
  label: string;
  shortLabel: string;
  priority: number;
  tone: LightDayTone;
};

export type LightDayUi = {
  date: string;
  badges: LightDayBadge[];
  primaryBadge: LightDayBadge | null;
  headline: string;
  softMessage: string;
  actionTip?: string;
  caution?: string;
};

const BADGE_MASTER: Record<LightDayBadgeType, LightDayBadge> = {
  tensha: {
    type: "tensha",
    label: "天赦日",
    shortLabel: "天赦日",
    priority: 100,
    tone: "best",
  },
  ichiryumanbai: {
    type: "ichiryumanbai",
    label: "一粒万倍日",
    shortLabel: "一粒万倍",
    priority: 90,
    tone: "good",
  },
  taian: {
    type: "taian",
    label: "大安",
    shortLabel: "大安",
    priority: 80,
    tone: "good",
  },
  tora: {
    type: "tora",
    label: "寅の日",
    shortLabel: "寅の日",
    priority: 70,
    tone: "good",
  },
  mi: {
    type: "mi",
    label: "巳の日",
    shortLabel: "巳の日",
    priority: 68,
    tone: "good",
  },
  tsuchinotomi: {
    type: "tsuchinotomi",
    label: "己巳の日",
    shortLabel: "己巳",
    priority: 75,
    tone: "best",
  },
  holiday: {
    type: "holiday",
    label: "祝日",
    shortLabel: "祝日",
    priority: 40,
    tone: "neutral",
  },
  fujouju: {
    type: "fujouju",
    label: "不成就日",
    shortLabel: "不成就",
    priority: 10,
    tone: "caution",
  },
};

function sortBadges(badges: LightDayBadge[]) {
  return [...badges].sort((a, b) => b.priority - a.priority);
}

function pickPrimaryBadge(badges: LightDayBadge[]) {
  return sortBadges(badges)[0] ?? null;
}

function makeDay(
  date: string,
  badgeTypes: LightDayBadgeType[],
  headline: string,
  softMessage: string,
  options?: {
    actionTip?: string;
    caution?: string;
  }
): LightDayUi {
  const badges = sortBadges(badgeTypes.map((type) => BADGE_MASTER[type]));
  return {
    date,
    badges,
    primaryBadge: pickPrimaryBadge(badges),
    headline,
    softMessage,
    actionTip: options?.actionTip,
    caution: options?.caution,
  };
}

export const lightCalendarUiMarch2026: Record<string, LightDayUi> = {
  "2026-03-04": makeDay(
    "2026-03-04",
    ["ichiryumanbai"],
    "小さな一歩が実りにつながる日",
    "今日は蒔いた種がふくらみやすい流れです。大きく動くよりも、未来につながる小さな着手を大切にすると光が育っていきます。",
    {
      actionTip: "申込み、口座づくり、勉強開始、発信の初投稿に向く日。",
    }
  ),
  "2026-03-05": makeDay(
    "2026-03-05",
    ["tensha", "ichiryumanbai", "taian", "tora"],
    "今月いちばん強く追い風を感じやすい日",
    "天赦日を中心に、一粒万倍日・大安・寅の日が重なる華やかな開運日です。新しい願いを言葉にしたり、前向きな決断をするのにぴったりです。",
    {
      actionTip: "新しい挑戦、買い物、告知、申し込み、使い始めにおすすめ。",
    }
  ),
  "2026-03-07": makeDay(
    "2026-03-07",
    ["fujouju"],
    "無理に進めず整えることを優先したい日",
    "今日は結果を急がず、流れを見直すほうが穏やかです。大切な決断より、準備や確認、手入れに光が宿ります。",
    {
      caution: "契約や勝負ごとは慎重に。見直しや保留の判断も吉です。",
    }
  ),
  "2026-03-08": makeDay(
    "2026-03-08",
    ["mi"],
    "金運や美意識を整えるのに向く日",
    "巳の日は、金運や弁財天にまつわる行動と相性がよいとされる日です。感謝をもってお金や持ち物を整えると流れが軽やかになります。",
    {
      actionTip: "財布の整理、不要な出費の見直し、神社参拝などに。",
    }
  ),
  "2026-03-11": makeDay(
    "2026-03-11",
    ["taian"],
    "安心感のある穏やかな吉日",
    "大安らしく、全体にやわらかく整いやすい日です。派手さよりも、安心して進めたい予定と相性がよさそうです。",
    {
      actionTip: "予約、相談、顔合わせ、提出ごとに。",
    }
  ),
  "2026-03-12": makeDay(
    "2026-03-12",
    ["ichiryumanbai"],
    "未来への種まきに向く日",
    "一粒万倍日の光がやさしく流れる日です。ほんの少しの行動でも、後から意味を持って育ちやすいでしょう。"
  ),
  "2026-03-17": makeDay(
    "2026-03-17",
    ["ichiryumanbai", "taian", "tora"],
    "行動力と安定感のバランスがよい日",
    "一粒万倍日・大安・寅の日が重なる、動きやすさのある吉日です。勢いだけでなく安心感もあるので、前に進めたい予定に向いています。",
    {
      actionTip: "告知開始、購入、仕事のスタート、願掛けに。",
    }
  ),
  "2026-03-20": makeDay(
    "2026-03-20",
    ["mi", "holiday", "fujouju"],
    "整える意識を持つと運を活かしやすい日",
    "巳の日のめぐりはありますが、不成就日も重なるため、勢いで大勝負に出るより、祈りや浄化、見直しに寄せるほうが穏やかです。",
    {
      actionTip: "お金まわりの整理、参拝、持ち物の浄化に。",
      caution: "新規契約や一発勝負は慎重に。春分の日で節目感も強い日です。",
    }
  ),
  "2026-03-22": makeDay(
    "2026-03-22",
    ["taian"],
    "肩の力を抜いて進めたい安定日",
    "大安のやわらかな追い風がある日です。大きな野望より、安心して続けられる選択をすると流れが整います。"
  ),
  "2026-03-24": makeDay(
    "2026-03-24",
    ["ichiryumanbai"],
    "少しの積み重ねが未来を育てる日",
    "一粒万倍日の力で、今日始める小さなことが後の実りにつながりやすい日です。完璧より着手を大切に。"
  ),
  "2026-03-28": makeDay(
    "2026-03-28",
    ["taian", "fujouju"],
    "吉意はあるけれど慎重さも忘れたくない日",
    "大安の安心感はありますが、不成就日も重なるため、勢いだけで大事を決めるより、条件確認を丁寧にしたい日です。",
    {
      caution: "決断するなら、あと一度だけ確認を。",
    }
  ),
  "2026-03-29": makeDay(
    "2026-03-29",
    ["ichiryumanbai", "tora"],
    "軽やかに動き出すほど運が育つ日",
    "一粒万倍日と寅の日が重なる、前進の力を感じやすい日です。新しい行動や前向きな出費に明るさがあります。",
    {
      actionTip: "使い始め、学び、旅の計画、発信スタートに。",
    }
  ),
};

function hasDate(dates: readonly string[], date: string): boolean {
  return dates.includes(date);
}

function getBadgeTypesForDate(date: string): LightDayBadgeType[] {
  const badgeTypes: LightDayBadgeType[] = [];

  if (hasDate(lightCalendar2026.luckyDays.tenshaNichi, date)) badgeTypes.push("tensha");
  if (hasDate(lightCalendar2026.luckyDays.ichiryumanbai, date)) badgeTypes.push("ichiryumanbai");
  if (hasDate(lightCalendar2026.luckyDays.taian, date)) badgeTypes.push("taian");
  if (hasDate(lightCalendar2026.luckyDays.tsuchinotomiNoHi, date)) badgeTypes.push("tsuchinotomi");
  if (hasDate(lightCalendar2026.luckyDays.toraNoHi, date)) badgeTypes.push("tora");
  if (hasDate(lightCalendar2026.luckyDays.miNoHi, date)) badgeTypes.push("mi");
  if (getHolidayLabel(date)) badgeTypes.push("holiday");
  if (hasDate(lightCalendar2026.luckyDays.fujoujuNichi, date)) badgeTypes.push("fujouju");

  return badgeTypes;
}

function buildGenericHeadline(primaryBadge: LightDayBadge | null, badges: LightDayBadge[]): string {
  if (!primaryBadge) return "穏やかに過ごしたい日";

  const hasCaution = badges.some((badge) => badge.type === "fujouju");

  if (primaryBadge.type === "tensha") return "特別感のある強い開運日";
  if (primaryBadge.type === "ichiryumanbai") return "小さな行動が実りにつながりやすい日";
  if (primaryBadge.type === "taian" && hasCaution) return "吉意はありつつ慎重さも持ちたい日";
  if (primaryBadge.type === "taian") return "安心して進めやすい安定日";
  if (primaryBadge.type === "tsuchinotomi") return "金運とご縁を丁寧に育てたい日";
  if (primaryBadge.type === "tora") return "軽やかな前進と巡りを意識したい日";
  if (primaryBadge.type === "mi") return "金運や感性を整えるのに向く日";
  if (primaryBadge.type === "holiday") return "余白を活かして整えたい日";
  return "無理せず慎重に整えたい日";
}

function buildGenericSoftMessage(
  date: string,
  primaryBadge: LightDayBadge | null,
  badges: LightDayBadge[]
): string {
  const hasCaution = badges.some((badge) => badge.type === "fujouju");
  const holiday = getHolidayLabel(date);

  if (!primaryBadge) {
    return "大きな吉日ではないぶん、気持ちや予定を整えながら軽やかに過ごしたい日です。";
  }
  if (primaryBadge.type === "tensha") {
    return "天赦日の追い風がある日です。新しい決断や区切りをつけたいことに、やさしい後押しが入りやすいでしょう。";
  }
  if (primaryBadge.type === "ichiryumanbai") {
    return "一粒万倍日の流れがあり、小さな着手が後から実りにつながりやすい日です。完璧さより始めることを大切に。";
  }
  if (primaryBadge.type === "taian") {
    return hasCaution
      ? "大安の安心感はありますが、急ぎすぎるより条件確認を丁寧にしたい日です。"
      : "全体がやわらかく整いやすく、安心して進めたい予定と相性がよい日です。";
  }
  if (primaryBadge.type === "tsuchinotomi") {
    return "己巳の日らしく、金運や豊かさにまつわる願いを丁寧に扱うことで流れが整いやすい日です。";
  }
  if (primaryBadge.type === "tora") {
    return "寅の日は前向きなお金の巡りや行動力と相性がよい日です。価値ある使い方を意識すると流れが軽くなります。";
  }
  if (primaryBadge.type === "mi") {
    return hasCaution
      ? "巳の日の良さはありますが、勢いで決めきるより浄化や見直しに寄せると穏やかです。"
      : "巳の日のやわらかな流れがあり、お金や持ち物、感性を整えるのに向く日です。";
  }
  if (primaryBadge.type === "holiday") {
    return `${holiday ?? "祝日"}です。予定を詰め込みすぎず、休息や見直しに少し時間を使うと整いやすいでしょう。`;
  }
  return "今日は結果を急がず、準備や確認を優先するほうが流れに合いやすい日です。";
}

function buildGenericActionTip(primaryBadge: LightDayBadge | null): string | undefined {
  if (!primaryBadge) return undefined;
  if (primaryBadge.type === "tensha") return "新しい挑戦、申し込み、使い始めに。";
  if (primaryBadge.type === "ichiryumanbai") return "申込み、勉強開始、発信の初投稿に。";
  if (primaryBadge.type === "taian") return "予約、相談、提出ごとに。";
  if (primaryBadge.type === "tsuchinotomi" || primaryBadge.type === "mi") {
    return "財布の整理、参拝、持ち物の見直しに。";
  }
  if (primaryBadge.type === "tora") return "買い物、使い始め、前向きな投資の検討に。";
  return undefined;
}

function buildGenericCaution(badges: LightDayBadge[]): string | undefined {
  return badges.some((badge) => badge.type === "fujouju")
    ? "大きな決断は急がず、最終確認を丁寧に。"
    : undefined;
}

function buildGenericDay(date: string): LightDayUi | null {
  const badgeTypes = getBadgeTypesForDate(date);
  if (badgeTypes.length === 0) return null;

  const badges = sortBadges(badgeTypes.map((type) => BADGE_MASTER[type]));
  const primaryBadge = pickPrimaryBadge(badges);

  return {
    date,
    badges,
    primaryBadge,
    headline: buildGenericHeadline(primaryBadge, badges),
    softMessage: buildGenericSoftMessage(date, primaryBadge, badges),
    actionTip: buildGenericActionTip(primaryBadge),
    caution: buildGenericCaution(badges),
  };
}

export function getLightCalendarUi(date: string): LightDayUi | null {
  return lightCalendarUiMarch2026[date] ?? buildGenericDay(date);
}

export function getCalendarCellBadges(date: string) {
  return getLightCalendarUi(date)?.badges.slice(0, 2) ?? [];
}

export function getCalendarModalData(date: string) {
  return getLightCalendarUi(date);
}

export function getCellAccent(date: string): "normal" | "gold" | "warm" | "muted" {
  const primary = getLightCalendarUi(date)?.primaryBadge;

  if (!primary) return "normal";
  if (primary.tone === "best") return "gold";
  if (primary.tone === "good") return "warm";
  if (primary.tone === "caution") return "muted";
  return "normal";
}

export function getLegacyLabels(date: string): string[] {
  return getLightCalendarUi(date)?.badges.map((badge) => badge.label) ?? [];
}
