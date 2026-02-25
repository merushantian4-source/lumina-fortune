export type LuckyWallpaper = {
  id: "sage-sunrise" | "lavender-dew" | "chamomile-butterfly";
  file: string;
  title: string;
  image: string;
  effect: string;
  design: string;
  shortDescription: string;
};

export const luckyWallpapers: LuckyWallpaper[] = [
  {
    id: "sage-sunrise",
    file: "/matiuke/IMG_4459.png",
    title: "浄化と希望の「ホワイトセージと朝日の光」",
    image: "朝の柔らかな光が差し込む窓辺に、乾燥させたホワイトセージの束が置かれている光景。",
    effect:
      "負の感情をリセットし、新しい一日を清々しく始めるための「浄化とリフレッシュ」を象徴します。",
    design:
      "全体的に淡い白と、温かみのあるオレンジ色の光を組み合わせて、ルミナらしい優しさを表現します。",
    shortDescription: "朝の光で心を整える、浄化とリフレッシュの一枚。",
  },
  {
    id: "lavender-dew",
    file: "/matiuke/IMG_4460.png",
    title: "調和と安らぎの「ラベンダーと魔法の雫」",
    image: "鮮やかな紫のラベンダーの穂先に、キラキラと輝く朝露（光の雫）が滴っているクローズアップ。",
    effect: "焦りや不安を鎮め、自分らしくいられるための「精神的な安定」をサポートします。",
    design:
      "背景を少しぼかして、光の粒（玉ボケ）を散りばめることで、幻想的な「魔女の庭」のような雰囲気を演出します。",
    shortDescription: "不安をほどき、自分の呼吸を取り戻すための静かな光。",
  },
  {
    id: "chamomile-butterfly",
    file: "/matiuke/IMG_4461.png",
    title: "幸運を呼ぶ「カモミールと黄金の蝶」",
    image:
      "太陽に向かって咲く白いカモミールの花々に、光を反射して黄金色に輝く蝶が舞い降りようとしている瞬間。",
    effect:
      "「逆境に耐える」という花言葉を持つカモミールに、変容の象徴である蝶を添えて、「好転とチャンス」を引き寄せます。",
    design:
      "黄色と白をメインカラーにすることで、金運や対人運の向上も期待させる明るいトーンにします。",
    shortDescription: "好転のタイミングを呼び込みたい時の、明るいお守り壁紙。",
  },
];

export function getLuckyWallpaper(id: string): LuckyWallpaper | null {
  return luckyWallpapers.find((wallpaper) => wallpaper.id === id) ?? null;
}
