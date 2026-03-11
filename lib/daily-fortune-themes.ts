type CardThemeFocus = {
  suit: "cups" | "swords" | "wands" | "pentacles" | "major";
  suitLabel: string;
  focusSummary: string;
  themes: string[];
};

const DEFAULT_THEMES = ["心の動き", "仕事や役割", "人間関係"] as const;

export function resolveCardThemeFocus(cardName?: string): CardThemeFocus {
  const normalized = cardName?.trim() ?? "";

  if (normalized.includes("カップ")) {
    return {
      suit: "cups",
      suitLabel: "カップ",
      focusSummary: "感情、恋愛、人とのつながりを中心に読む日です。",
      themes: ["感情の流れ", "恋愛", "人間関係"],
    };
  }

  if (normalized.includes("ソード")) {
    return {
      suit: "swords",
      suitLabel: "ソード",
      focusSummary: "思考、判断、情報整理を中心に読む日です。",
      themes: ["考えごと", "判断", "情報整理"],
    };
  }

  if (normalized.includes("ワンド")) {
    return {
      suit: "wands",
      suitLabel: "ワンド",
      focusSummary: "行動、挑戦、仕事の流れを中心に読む日です。",
      themes: ["行動", "挑戦", "仕事や役割"],
    };
  }

  if (normalized.includes("ペンタクル")) {
    return {
      suit: "pentacles",
      suitLabel: "ペンタクル",
      focusSummary: "現実、お金、生活の安定を中心に読む日です。",
      themes: ["生活", "お金", "現実面"],
    };
  }

  return {
    suit: "major",
    suitLabel: "メジャーアルカナ",
    focusSummary: "今日はカード全体の象徴を軸に、近い現実へ寄せて読む日です。",
    themes: [...DEFAULT_THEMES],
  };
}

export function extractFocusKeywords(cardName?: string): string[] {
  return resolveCardThemeFocus(cardName).themes;
}
