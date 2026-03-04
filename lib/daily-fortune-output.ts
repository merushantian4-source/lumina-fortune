type LiteCard = {
  name: string;
  reversed?: boolean;
};

type DailyFortuneOutputContext = {
  nickname?: string;
  job?: string;
  loveStatus?: "single" | "married" | "complicated" | "unrequited" | string;
  weekdayJa: string;
  previousCard?: {
    name: string;
    reversed?: boolean;
  } | null;
};

const MIN_CHARS = 700;
const MAX_CHARS = 1100;

function cardText(card?: LiteCard | null): string {
  if (!card) return "カード情報なし";
  return `${card.name}（${card.reversed ? "逆位置" : "正位置"}）`;
}

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

function removeForbidden(text: string): string {
  return text
    .replace(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬]/g, "")
    .replace(/^\s*\d+[.)．]\s*/gm, "")
    .replace(/^補足[:：]?.*$/gm, "")
    .replace(/^再説明[:：]?.*$/gm, "")
    .replace(/こんにちは[、。].*こんにちは[、。]/g, "こんにちは。");
}

function uniqueSentences(text: string): string {
  const parts = text
    .split(/(?<=[。！？])/)
    .map((v) => v.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const key = part.replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(part);
  }
  return out.join("");
}

function clamp(text: string): string {
  if (text.length <= MAX_CHARS) return text;
  return `${text.slice(0, MAX_CHARS - 1).trimEnd()}…`;
}

function greeting(context: DailyFortuneOutputContext): string {
  const name = context.nickname?.trim();
  return name ? `こんにちは、${name}さん。` : "こんにちは、ゲストさん。";
}

function loveTone(loveStatus?: string): string {
  if (loveStatus === "married") {
    return "すでに大切な関係を育てている方にも、心を寄せる途中の方にも";
  }
  if (loveStatus === "complicated") {
    return "言葉にしづらい関係の中にいる方にも、これから関係を育てたい方にも";
  }
  if (loveStatus === "unrequited") {
    return "想いを胸に抱く方にも、安心できる関係を深めたい方にも";
  }
  return "ひとりの時間を大切にしている方にも、誰かと歩んでいる方にも";
}

function buildStructuredFallback(cards: LiteCard[], context: DailyFortuneOutputContext): string {
  const main = cards[0];
  const job = context.job?.trim();
  const workLead = job ? `${job}としての流れでは、` : "";
  const prev = context.previousCard
    ? `昨日の「${cardText(context.previousCard)}」から続く流れとして、今日は足元を整えるほど前向きな巡りが生まれます。`
    : "昨日の流れは、気持ちと現実のバランスを探っていた時間だったのかもしれません。今日はその揺らぎを静かに整えられる日です。";

  const body = [
    "【導入】",
    `${greeting(context)}今日は${context.weekdayJa}曜日ですね。`,
    `今日のカードは「${cardText(main)}」です。`,
    "象徴キーワードは「調律」「余白」「信頼」です。がんばり続けるより、整える姿勢が運をひらくことをこのカードは教えてくれています。",
    prev,
    "今日は、整えてから進む日です。",
    "",
    "【運勢カテゴリ】",
    "全体運",
    "外へ強く押し出すより、内側のリズムを整えるほど一日の流れが安定します。静かな選択が、結果的に大きな追い風になります。",
    "仕事運",
    `${workLead}仕事では優先順位をひとつに絞ることが鍵です。朝の最初の30分だけ最重要タスクに集中して、勢いではなく確かさで進めてみてください。`,
    "恋愛運",
    `${loveTone(context.loveStatus)}、相手の反応を急がず、温度を合わせる言葉を選ぶほど関係は自然に深まります。結論を急がない姿勢が、安心と魅力を同時に育てます。`,
    "人間関係運",
    "人の多い場では、空気に引っ張られて小さな誤解が生まれやすい日です。すぐに決めつけず、確認の一言を添えるだけで協力の流れに戻せます。",
    "金運",
    "金運は堅実さが味方です。使う前に「今すぐ必要か」をひと呼吸だけ確かめると、後悔のない選択になります。",
    "",
    "【回収】",
    "今日のアクション",
    "机の上を3分だけ整えてから、最初の作業に入ってください。",
    "心理メッセージ",
    "あなたは大丈夫です。整えるために立ち止まる時間は、前に進む力を静かに育てています。",
    "ルミナからの締め",
    "今日もあなたの歩みが、やわらかな光に守られますように。",
  ].join("\n");

  return body;
}

export function ensureFortuneOutputFormat(
  text: string,
  cards: LiteCard[],
  context: DailyFortuneOutputContext
): string {
  const cleaned = uniqueSentences(removeForbidden(normalize(text)));
  const fallback = buildStructuredFallback(cards, context);

  // Always enforce the strict structure and sequence.
  let output = fallback;

  // If model output contains useful non-duplicated phrasing, only borrow very short flavor
  // without adding extra sections or breaking the structure.
  if (cleaned.length > 0) {
    const firstSentence = cleaned.split(/(?<=[。！？])/).map((v) => v.trim()).find(Boolean);
    if (firstSentence && firstSentence.length <= 52) {
      output = output.replace(
        "今日は、整えてから進む日です。",
        `今日は、整えてから進む日です。${firstSentence}`
      );
    }
  }

  output = output.replace(/\n{3,}/g, "\n\n");

  // No greeting repetition at end.
  output = output.replace(/(こんにちは[、。].*)$/gm, "");

  // Enforce length window without adding "補足" or extra section.
  if (output.length < MIN_CHARS) {
    output = output.replace(
      "心理メッセージ\nあなたは大丈夫です。整えるために立ち止まる時間は、前に進む力を静かに育てています。",
      "心理メッセージ\nあなたは大丈夫です。整えるために立ち止まる時間は、前に進む力を静かに育てています。焦らなくても、あなたの歩幅には意味があります。今日の選択は、明日の安心につながっていきます。"
    );
  }

  return clamp(output);
}
