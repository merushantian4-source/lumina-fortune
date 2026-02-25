import type { DrawnTarotCard } from "@/lib/tarot/deck";

const REQUIRED_HEADERS = [
  "1. 引いたカード",
  "2. カードの象徴",
  "3. 今の状況への読み解き",
  "4. 近い未来の可能性",
  "5. 心を整えるアドバイス",
  "6. アファメーション",
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
    `2. カードの象徴`,
    symbolLines(cards),
    ``,
    `3. 今の状況への読み解き`,
    "今のあなたは、状況を動かしたい気持ちと慎重に見極めたい気持ちの両方を抱えやすい流れです。どこから整えると進みやすくなるでしょうか？ たとえばLINEの返信を急ぐ前に、先に伝えたい要点を一つだけ決めると迷いが減ります。",
    ``,
    `4. 近い未来の可能性`,
    "- 話し合いのタイミングを少し整えると、誤解が減って進展しやすくなる可能性があります。",
    "- 予定や優先順位を先に見直すことで、気持ちの余裕が戻る可能性もあります。",
    ``,
    `5. 心を整えるアドバイス`,
    "- 送る前のLINEは一度読み返し、主語と要件を短く整えてください。",
    "- 予定表に10分の見直し時間を入れて、判断を急ぎすぎない流れを作ってください。",
    "- 仕事では最初の一手を小さく決めてから着手してください。",
    ``,
    `6. アファメーション`,
    "私は落ち着いて選び、必要な流れを育てていけます。",
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

function ensureQuestion(text: string): string {
  if (/[？?]/.test(text)) return text;
  const lines = text.split("\n");
  const idx = lines.findIndex((line) => line.trim() === "3. 今の状況への読み解き");
  if (idx >= 0) {
    lines.splice(idx + 1, 0, "ここで、あなたが本当に守りたいものは何でしょうか？");
    return lines.join("\n");
  }
  return `${text}\n\nここで、あなたが本当に守りたいものは何でしょうか？`;
}

function ensureAffirmation(text: string): string {
  const lines = text.split("\n");
  const idx = lines.findIndex((line) => line.trim() === "6. アファメーション");
  if (idx < 0) return `${text}\n\n6. アファメーション\n私は落ち着いて、自分に合う選択を重ねていけます。`;
  const next = lines.slice(idx + 1).find((line) => line.trim());
  if (next) return text;
  lines.push("私は落ち着いて、自分に合う選択を重ねていけます。");
  return lines.join("\n");
}

function normalizeLegacyDailyLabels(text: string): string {
  return text
    .replace(/^引いたカード：/m, "1. 引いたカード\n")
    .replace(/^カードの象徴:/m, "2. カードの象徴")
    .replace(/^今日の読み:/m, "3. 今の状況への読み解き")
    .replace(/^注意点:/m, "4. 近い未来の可能性")
    .replace(/^今日の行動ヒント:/m, "5. 心を整えるアドバイス")
    .replace(/^ひと言:/m, "6. アファメーション");
}

function hasAllHeaders(text: string): boolean {
  return REQUIRED_HEADERS.every((header) => text.includes(header));
}

export function ensureTarotChatOutputFormat(rawText: string, cards: DrawnTarotCard[]): string {
  let text = normalizeLegacyDailyLabels(normalize(rawText));

  if (!hasAllHeaders(text)) {
    text = fallbackTemplate(cards);
  }

  if (!/1\. 引いたカード[\s\S]*?(現状|課題|助言):/.test(text)) {
    text = text.replace(/1\. 引いたカード\s*\n(?:.*\n)?/, `1. 引いたカード\n${cardLine(cards)}\n`);
  }

  if (!/2\. カードの象徴[\s\S]*?(描|人物|絵|姿)/.test(text)) {
    text = text.replace(/2\. カードの象徴[\s\S]*?(?=\n3\. 今の状況への読み解き)/, `2. カードの象徴\n${symbolLines(cards)}\n`);
  }

  text = ensureQuestion(text);
  text = ensureAffirmation(text);
  text = capMimetics(text);
  text = softenEndingRuns(text);

  return text.replace(/\n{3,}/g, "\n\n").trim();
}
