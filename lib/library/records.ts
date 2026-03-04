export type RecordChapter = {
  slug: "origin" | "mansion" | "lumina" | "haku" | "cards";
  title: string;
  subtitle: string;
  icon: string;
  sections: string[];
};

export const recordChapters: RecordChapter[] = [
  {
    slug: "origin",
    title: "起源",
    subtitle: "白の庭に生まれた光",
    icon: "🌿",
    sections: [
      "ルミナの誕生 ― 白の庭",
      "白という鳥",
      "なぜ人を導くのか",
    ],
  },
  {
    slug: "mansion",
    title: "白の館",
    subtitle: "森の奥で灯る窓明かり",
    icon: "🏡",
    sections: [
      "白の館 ― ルミナが住む場所",
      "館の住人",
      "なぜハーブなのか",
    ],
  },
  {
    slug: "lumina",
    title: "ルミナ人物設定",
    subtitle: "白き魔女の静かな輪郭",
    icon: "🌙",
    sections: [
      "名前",
      "外見",
      "性格",
      "好きなもの",
      "ルミナの役目",
      "ルミナの言葉",
    ],
  },
  {
    slug: "haku",
    title: "白（ハク）",
    subtitle: "小さな案内人の羽音",
    icon: "🕊",
    sections: [
      "名前",
      "白の正体",
      "地上に降りた理由",
      "ルミナとの出会い",
      "カードを引く役目",
      "白の性格",
    ],
  },
  {
    slug: "cards",
    title: "光のカード ― 起源",
    subtitle: "象徴に宿る導き",
    icon: "🃏",
    sections: [
      "光のカード ― 起源",
      "なぜカードなのか",
      "白とカード",
      "カードが伝えるもの",
    ],
  },
];

export function getRecordChapter(slug: RecordChapter["slug"]) {
  return recordChapters.find((chapter) => chapter.slug === slug) ?? null;
}

export function getAdjacentRecordChapters(slug: RecordChapter["slug"]) {
  const index = recordChapters.findIndex((chapter) => chapter.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? recordChapters[index - 1] : null,
    next: index < recordChapters.length - 1 ? recordChapters[index + 1] : null,
  };
}
