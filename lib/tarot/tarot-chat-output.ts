import type { DrawnTarotCard } from "@/lib/tarot/deck";

type TarotOutputTheme = "love" | "marriage" | "work" | "money" | "health" | "relationship" | "future" | null;

const REQUIRED_HEADERS = [
  "1. 引いたカード",
  "2. カードの気配",
  "3. 今の状況への読み解き",
  "4. 近い未来の可能性",
  "5. 心を整えるヒント",
  "6. アファメーション",
] as const;

const HEALTH_REQUIRED_HEADERS = [
  "🌿 健康運の鑑定結果",
  "🕊 引いたカード",
  "🌿 今の体と心の状態",
  "🌿 今、整えるとよいこと",
  "🌿 これからの流れ",
  "🌿 今日からできる整え方",
  "🌿 今日のことば",
] as const;

const MIMETIC_WORDS = [
  "ふわっと",
  "じんわり",
  "ぽかぽか",
  "ざわざわ",
  "もやもや",
  "ぎゅっと",
  "きらきら",
  "どきどき",
  "ドキドキ",
] as const;

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

function cardLine(cards: DrawnTarotCard[]): string {
  return cards
    .map((c) => `${c.position}: ${c.card.nameJa}（${c.reversed ? "逆位置" : "正位置"}）`)
    .join(" / ");
}

function healthCardLines(cards: DrawnTarotCard[]): string[] {
  const roleOrder = ["現状", "課題", "助言"] as const;
  return roleOrder.map((role) => {
    const card = cards.find((c) => c.position === role);
    if (!card) return `${role}：-`;
    return `${role}：${card.card.nameJa}（${card.reversed ? "逆位置" : "正位置"}）`;
  });
}

function symbolLines(cards: DrawnTarotCard[]): string {
  return cards
    .map((c) => {
      const core = c.reversed ? c.card.reversedMeaning : c.card.uprightMeaning;
      return `- ${c.position}の${c.card.nameJa}（${c.reversed ? "逆位置" : "正位置"}）: ${c.card.imageDescription} ${core}。`;
    })
    .join("\n");
}

function fallbackTemplate(cards: DrawnTarotCard[]): string {
  return [
    `1. 引いたカード`,
    cardLine(cards),
    ``,
    `2. カードの気配`,
    symbolLines(cards),
    ``,
    `3. 今の状況への読み解き`,
    "カードが映し出すのは、今のあなたが大切なものを丁寧に守ろうとしている姿です。",
    "その真剣さゆえに、知らず知らず力が入りすぎていることもあるかもしれません。",
    "ここで少し立ち止まって、「今の自分が本当に望んでいること」を見つめてみませんか。",
    ``,
    `4. 近い未来の可能性`,
    "- 肩の力を少し抜いたとき、言葉や気持ちが自然と相手に届きやすくなる流れが見えます。",
    "- 安心できる環境や人と過ごす時間が、今後の方向性を静かに整えてくれそうです。",
    ``,
    `5. 心を整えるヒント`,
    "- 「正しくやらなければ」という緊張をひとつ手放してみると、動きやすくなります。",
    "- 感情を整理しようとするより、まずそのまま感じることを許してあげてください。",
    "- 信頼できる場所や人との時間を、意識的に確保してみましょう。",
    ``,
    `6. アファメーション`,
    "私は、今この瞬間を丁寧に生きています。",
    "自分を信じることが、やさしい未来へとつながっています。",
  ].join("\n");
}

function healthFallbackTemplate(cards: DrawnTarotCard[]): string {
  const [currentLine, challengeLine, adviceLine] = healthCardLines(cards);
  return [
    `🌿 健康運の鑑定結果`,
    `🕊 引いたカード`,
    "",
    currentLine,
    challengeLine,
    adviceLine,
    ``,
    `🌿 今の体と心の状態`,
    "カードは、あなたの体が今、正直にサインを出しやすい時期であることを伝えています。",
    "大きく崩れているわけではないけれど、小さな疲れや違和感を「まだ大丈夫」で後回しにしていることはありませんか。",
    "今のあなたの体は、少し立ち止まることを必要としているようです。",
    ``,
    `🌿 今、整えるとよいこと`,
    "「周りに合わせること」より「自分を整えること」を先に置けていますか。",
    "誰かのために動く時間と同じくらい、自分のために使う時間を意識的に確保することが、今は大切です。",
    ``,
    `🌿 これからの流れ`,
    "急いで何かを変える必要はありません。",
    "ただ、「休む時間を予定に組み込む」ことができるかどうかで、これからの体の軽さが変わってきます。",
    "予定をこなし終わってから休むのではなく、休みを先に置く意識が整えの鍵になります。",
    ``,
    `🌿 今日からできる整え方`,
    "・眠る前の15分、画面から離れて部屋を少し暗くする",
    "・吐く息を吸う息より長くする深呼吸を、1日3回",
    "・今日のどこかに「何もしなくてよい5分」を意識して置く",
    ``,
    `🌿 今日のことば`,
    "私は、自分の体の声を大切に聴きます。",
    "休むことは、前へ進む力を育てることです。",
  ].join("\n");
}

function capMimetics(text: string, maxCount = 3): string {
  let count = 0;
  let out = text;
  for (const word of MIMETIC_WORDS) {
    const re = new RegExp(word, "g");
    out = out.replace(re, (m) => {
      count += 1;
      return count <= maxCount ? m : "静かに";
    });
  }
  return out;
}

function softenEndingRuns(text: string): string {
  const sentences = text.match(/[^。！？\n]+[。！？]?|\n/g) ?? [];
  let prevEnding = "";
  let run = 0;
  return sentences
    .map((part) => {
      if (part === "\n") {
        prevEnding = "";
        run = 0;
        return part;
      }
      const ending =
        /ます。$/.test(part) ? "ます" : /です。$/.test(part) ? "です" : /でしょう。$/.test(part) ? "でしょう" : "";
      if (!ending) {
        prevEnding = "";
        run = 0;
        return part;
      }
      if (ending === prevEnding) {
        run += 1;
      } else {
        prevEnding = ending;
        run = 1;
      }
      if (run < 3) return part;
      if (ending === "です") return part.replace(/です。$/, "でしょう。");
      if (ending === "ます") return part.replace(/ます。$/, "ますね。");
      if (ending === "でしょう") return part.replace(/でしょう。$/, "ます。");
      return part;
    })
    .join("");
}

function ensureQuestion(text: string, theme: TarotOutputTheme = null): string {
  if (theme === "health") return text;
  if (/[？?]/.test(text)) return text;
  const lines = text.split("\n");
  const idx = lines.findIndex((line) => /^3\.\s/.test(line.trim()));
  if (idx >= 0) {
    lines.splice(idx + 1, 0, "ここで、あなたが本当に守りたいものは何でしょうか？");
    return lines.join("\n");
  }
  return `${text}\n\nここで、あなたが本当に守りたいものは何でしょうか？`;
}

function ensureAffirmation(text: string, theme: TarotOutputTheme = null): string {
  if (theme === "health") {
    if (!text.includes("🌿 今日のことば")) {
      return `${text}\n\n🌿 今日のことば\n私は、自分の体の声をやさしく受け取ります。`;
    }
    const lines = text.split("\n");
    const idx = lines.findIndex((line) => line.trim() === "🌿 今日のことば");
    const next = idx >= 0 ? lines.slice(idx + 1).find((line) => line.trim()) : null;
    if (next) return text;
    lines.push("私は、自分の体の声をやさしく受け取ります。");
    return lines.join("\n");
  }
  const lines = text.split("\n");
  const idx = lines.findIndex((line) => /^6\.\sアファメーション/.test(line.trim()));
  if (idx < 0) return `${text}\n\n6. アファメーション\n私は落ち着いて、自分に合う選択を重ねていけます。`;
  const next = lines.slice(idx + 1).find((line) => line.trim());
  if (next) return text;
  lines.push("私は落ち着いて、自分に合う選択を重ねていけます。");
  return lines.join("\n");
}

function applyLuminaVoiceRules(text: string): string {
  return text
    .replace(/カードの象徴/g, "カードの気配")
    .replace(/心を整えるアドバイス/g, "心を整えるヒント")
    .replace(/LINEで[^。]*。/g, "軽い一言がきっかけになります。")
    .replace(/今週[^。]*(イベント|参加)[^。]*。/g, "安心できる場に身を置いてみてください。");
}

function ensureCalmClosing(text: string, theme: TarotOutputTheme = null): string {
  if (theme === "health") return text;
  const closingLines = [
    "あなたは、もう十分に整っています。",
    "焦らなくて大丈夫です。",
    "光は静かに近づいています。",
  ];
  if (closingLines.every((line) => text.includes(line))) return text;
  return `${text}\n${closingLines.join("\n")}`;
}

function normalizeLegacyDailyLabels(text: string): string {
  return text
    .replace(/^引いたカード：/m, "1. 引いたカード\n")
    .replace(/^カードの象徴:/m, "2. カードの気配")
    .replace(/^カードの気配:/m, "2. カードの気配")
    .replace(/^今日の読み:/m, "3. 今の状況への読み解き")
    .replace(/^注意点:/m, "4. 近い未来の可能性")
    .replace(/^今日の行動ヒント:/m, "5. 心を整えるヒント")
    .replace(/^心を整えるアドバイス:/m, "5. 心を整えるヒント")
    .replace(/^ひと言:/m, "6. アファメーション");
}

function hasAllHeaders(text: string): boolean {
  return REQUIRED_HEADERS.every((header) => text.includes(header));
}

function hasAllHealthHeaders(text: string): boolean {
  return HEALTH_REQUIRED_HEADERS.every((header) => text.includes(header));
}

export function ensureTarotChatOutputFormat(
  rawText: string,
  cards: DrawnTarotCard[],
  theme: TarotOutputTheme = null
): string {
  let text = normalizeLegacyDailyLabels(normalize(rawText));

  if (theme === "health") {
    if (!hasAllHealthHeaders(text)) {
      text = healthFallbackTemplate(cards);
    }
  } else if (!hasAllHeaders(text)) {
    text = fallbackTemplate(cards);
  }

  if (theme !== "health") {
    if (!/1\. 引いたカード[\s\S]*?(現状|課題|助言):/.test(text)) {
      text = text.replace(/1\. 引いたカード\s*\n(?:.*\n)?/, `1. 引いたカード\n${cardLine(cards)}\n`);
    }

    if (!/2\. カードの気配[\s\S]*?(描|人物|絵|姿|気配|伝え)/.test(text)) {
      text = text.replace(/2\. カードの気配[\s\S]*?(?=\n3\. 今の状況への読み解き)/, `2. カードの気配\n${symbolLines(cards)}\n`);
    }
  }

  text = ensureQuestion(text, theme);
  text = ensureAffirmation(text, theme);
  text = applyLuminaVoiceRules(text);
  text = capMimetics(text);
  text = softenEndingRuns(text);

  return text.replace(/\n{3,}/g, "\n\n").trim();
}
