export type Fortune2026Number = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Fortune2026 = {
  number: Fortune2026Number;
  title: string;
  keywords: string[];
  theme: string;
  work: string;
  love: string;
  money: string;
  action: string;
};

function makePlaceholder(number: Fortune2026Number): Fortune2026 {
  return {
    number,
    title: `運命数${number}の2026年`,
    keywords: ["（ここに）", "（キーワードを）", "（追記）"],
    theme: "（ここに文章を追記）",
    work: "（ここに文章を追記）",
    love: "（ここに文章を追記）",
    money: "（ここに文章を追記）",
    action: "（ここに文章を追記）",
  };
}

export const fortune2026ByNumber: Record<Fortune2026Number, Fortune2026> = {
  1: makePlaceholder(1),
  2: makePlaceholder(2),
  3: makePlaceholder(3),
  4: makePlaceholder(4),
  5: makePlaceholder(5),
  6: makePlaceholder(6),
  7: makePlaceholder(7),
  8: makePlaceholder(8),
  9: makePlaceholder(9),
};

