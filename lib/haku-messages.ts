export type HakuContext = "daily-fortune" | "wish-garden" | "letter";

const HAKU_MESSAGES: Record<HakuContext, string[]> = {
  "daily-fortune": [
    "白が窓辺で小さく鳴いています。\n今日は少しゆっくり進んでも大丈夫そうです。",
    "白が羽をふるわせています。\n急がない歩幅のほうが、やさしい流れに合いそうです。",
    "白がこちらを見上げています。\nひとつ整えてから動くと、心が静かに落ち着きそうです。",
    "白が小さく羽を休めています。\n今の気持ちを急いで決めなくても、景色はちゃんと開いていきます。",
  ],
  "wish-garden": [
    "白が庭先で羽を鳴らしています。\n置いた願いは、静かな場所でやわらかく育っていきます。",
    "白が花のあいだをくぐっています。\n今日の願いも、やさしい光のほうへ運ばれていきそうです。",
    "白が振り返って鳴いています。\n言葉にした願いは、それだけで少し整い始めています。",
    "白が庭の奥で羽を休めています。\n小さな願いほど、静かな流れにのりやすいのかもしれません。",
  ],
  letter: [
    "白が便りのそばで羽をたたんでいます。\n届けた言葉は、静かに館の中へ受け取られました。",
    "白が小さく鳴いています。\n話した気持ちは、もうひとりで抱えなくてよいのかもしれません。",
    "白が窓辺に留まっています。\n言葉にできたこと自体が、心をほどく小さな光になっています。",
    "白が羽をゆっくり整えています。\n届けた想いのぶんだけ、心にもやわらかな余白が戻ってきそうです。",
  ],
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function pickHakuMessage(context: HakuContext, seed: string): string {
  const messages = HAKU_MESSAGES[context];
  const index = hashSeed(`${context}:${seed}`) % messages.length;
  return messages[index];
}
