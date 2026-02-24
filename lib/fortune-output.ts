type LiteCard = {
  name: string;
  reversed?: boolean;
};

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

const SECTION_HEADER_RE = /^(カードの象徴|今日の読み|注意点|今日の行動ヒント|ひと言):/;
const MIMETIC_REPLACEMENTS = [
  ["ふわっと", "やわらかく"],
  ["じんわり", "ゆっくり"],
  ["ぽかぽか", "あたたかく"],
  ["ざわざわ", "落ち着かない感じ"],
  ["もやもや", "引っかかり"],
  ["ぎゅっと", "しっかり"],
  ["きらきら", "明るく"],
  ["ビビッと", "直感的に"],
] as const;

function cardLabel(card?: LiteCard): string {
  if (!card) return "不明";
  return `${card.name}（${card.reversed ? "逆位置" : "正位置"}）`;
}

function getOrientationFromText(text: string): "upright" | "reversed" | null {
  const firstLine = normalizeText(text).split("\n")[0] ?? "";
  if (/（正位置）/.test(firstLine)) return "upright";
  if (/（逆位置）/.test(firstLine)) return "reversed";
  return null;
}

function ensureCardLine(text: string, cards: LiteCard[]): string {
  const normalized = normalizeText(text);
  if (/^引いたカード：/m.test(normalized)) return normalized;
  const first = cards[0];
  return `引いたカード：${cardLabel(first)}\n${normalized}`.trim();
}

function ensureNextActionBullet(text: string): string {
  const withoutLegacy = text
    .split("\n")
    .filter((line) => !/^\s*-\s*次の一手:/.test(line))
    .join("\n")
    .trim();
  if (/^\s*-\s+/m.test(withoutLegacy)) return withoutLegacy;
  return `${withoutLegacy}\n- 今日の行動ヒント: 今日はひとつだけ順番を決めてから動いてみてください。`;
}

function trimResultBodyLines(text: string): string {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 18) return lines.join("\n");
  const [first, ...rest] = lines;
  const body = rest.slice(0, 17);
  return [first, ...body].join("\n");
}

function clampFortuneLength(text: string, maxChars = 800): string {
  if (text.length <= maxChars) return text;
  const nextActionIndex = text.indexOf("\n- 次の一手:");
  if (nextActionIndex <= 0) return `${text.slice(0, maxChars - 1).trimEnd()}…`;

  const head = text.slice(0, nextActionIndex).trimEnd();
  const tail = text.slice(nextActionIndex);
  const reserved = tail.length;
  const headMax = Math.max(40, maxChars - reserved - 1);
  const trimmedHead = head.length > headMax ? `${head.slice(0, headMax).trimEnd()}…` : head;
  return `${trimmedHead}${tail}`;
}

function splitSentences(text: string): string[] {
  return (text.match(/[^。！？\n]+[。！？]?|\n/g) ?? []).filter(Boolean);
}

function joinSentences(parts: string[]): string {
  return parts.join("").replace(/\n{3,}/g, "\n\n");
}

function reduceRepeatedYasui(text: string): string {
  let yasuiCount = 0;
  const patterns: Array<[RegExp, string[]]> = [
    [/見えやすい/g, ["見えます", "見えがちです"]],
    [/なりやすい/g, ["なりがちです", "なりやすい傾向があります"]],
    [/しやすい/g, ["しやすくなります", "しやすい傾向があります"]],
    [/出やすい/g, ["出る場面があります", "出やすい傾向があります"]],
  ];

  let out = text;
  for (const [re, replacements] of patterns) {
    let replacementIndex = 0;
    out = out.replace(re, (m) => {
      yasuiCount += 1;
      if (yasuiCount <= 1) return m;
      const rep = replacements[Math.min(replacementIndex, replacements.length - 1)] ?? "傾向があります";
      replacementIndex += 1;
      return rep;
    });
  }

  out = out.replace(/やすい/g, (m) => {
    yasuiCount += 1;
    if (yasuiCount <= 1) return m;
    return "傾向があります";
  });

  return out;
}

function softenRepeatedPhrases(text: string): string {
  const parts = splitSentences(text);
  let prev = "";
  const out = parts.map((part, index) => {
    if (part === "\n") {
      prev = "";
      return part;
    }
    let current = part;
    if (prev.includes("傾向") && current.includes("傾向")) {
      current = current.replace("傾向", "流れ");
    }
    if (prev.includes("かもしれません") && current.includes("かもしれません")) {
      current = current.replace("かもしれません", index % 2 === 0 ? "とも読めます" : "可能性があります");
    }
    if (/です。$/.test(prev) && /です。$/.test(current)) {
      current = current.replace(/です。$/, index % 2 === 0 ? "でしょう。" : "ます。");
    }
    prev = current;
    return current;
  });
  return joinSentences(out);
}

function naturalizeFortuneDiction(text: string): string {
  let out = text;

  const directReplacements: Array<[RegExp, string]> = [
    [/ことが大切です/g, "ようにしてみてください"],
    [/大切です。/g, "今日はそこを優先してください。"],
    [/重要です。/g, "先に押さえておきましょう。"],
    [/傾向があります/g, "流れがあります"],
    [/可能性があります/g, "場面があります"],
    [/必要です。/g, "今は外せません。"],
    [/必要かもしれません。/g, "先に整えると進みます。"],
    [/大要/g, "ポイント"],
  ];
  for (const [pattern, replacement] of directReplacements) {
    out = out.replace(pattern, replacement);
  }

  // Abstract endings -> action/scene-oriented endings.
  out = out.replace(/(自分を[^。]{0,20})を大切にするようにしてみてください/g, "$1を後回しにしないでください");
  out = out.replace(/(今日は[^。]{0,20})が流れがあります。/g, "$1が前に出ています。");
  out = out.replace(/([^。]{0,30})流れがあります。/g, "$1空気が出ています。");
  out = out.replace(/([^。]{0,30})場面があります。/g, "$1場面もありそうです。");

  // Avoid abstract last sentence endings when possible.
  const lines = out.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i] || /^- /.test(lines[i]) || /^(カードの象徴|今日の読み|注意点|今日の行動ヒント|ひと言):/.test(lines[i])) {
      continue;
    }
    lines[i] = lines[i]
      .replace(/です。$/, "でしょう。")
      .replace(/流れがあります。$/, "流れが見えます。")
      .replace(/場面があります。$/, "場面がありそうです。");
  }

  return lines.join("\n");
}

function splitParagraphIntoMaxThreeSentences(line: string): string[] {
  if (!line.trim()) return [line];
  if (SECTION_HEADER_RE.test(line.trim()) || /^\s*-\s+/.test(line)) return [line];

  const sentences = line.match(/[^。！？]+[。！？]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
  if (sentences.length <= 3) return [line.trim()];

  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    chunks.push(sentences.slice(i, i + 3).join(""));
  }
  return chunks;
}

function formatFortuneReadability(text: string): string {
  const rawLines = normalizeText(text).split("\n").map((line) => line.trim());
  const expanded: string[] = [];

  for (const line of rawLines) {
    if (!line) {
      expanded.push("");
      continue;
    }
    expanded.push(...splitParagraphIntoMaxThreeSentences(line));
  }

  const out: string[] = [];
  for (let i = 0; i < expanded.length; i++) {
    const line = expanded[i];
    if (!line) {
      if (out[out.length - 1] !== "") out.push("");
      continue;
    }

    const isSection = SECTION_HEADER_RE.test(line);
    const isBullet = /^\s*-\s+/.test(line);
    const prev = out[out.length - 1];

    if ((isSection || isBullet) && prev !== "" && prev !== undefined) {
      out.push("");
    }

    out.push(line);
  }

  // Ensure exactly one blank line between sections / blocks, trim excess blanks.
  const compact: string[] = [];
  for (const line of out) {
    if (line === "" && compact[compact.length - 1] === "") continue;
    compact.push(line);
  }

  return compact.join("\n").trim();
}

function removeOppositeOrientationGeneralization(text: string): string {
  const orientation = getOrientationFromText(text);
  if (!orientation) return text;

  const lines = text.split("\n");
  const out = lines
    .map((line) => {
      if (!line.trim() || SECTION_HEADER_RE.test(line.trim()) || /^\s*-\s+/.test(line)) {
        return line;
      }

      let current = line;
      if (orientation === "upright") {
        current = current
          .replace(/逆位置では[^。！？]*[。！？]?/g, "")
          .replace(/正位置では/g, "今回は");
      } else {
        current = current
          .replace(/正位置では[^。！？]*[。！？]?/g, "")
          .replace(/逆位置では/g, "今回は");
      }

      current = current.replace(/\s+/g, " ").trim();
      return current;
    })
    .filter((line, idx, arr) => {
      if (line.trim()) return true;
      const prev = arr[idx - 1]?.trim() ?? "";
      const next = arr[idx + 1]?.trim() ?? "";
      return !!prev && !!next;
    });

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function ensureReversedSymbolQuestions(text: string): string {
  const orientation = getOrientationFromText(text);
  if (orientation !== "reversed") return text;

  const lines = text.split("\n");
  const symbolIndex = lines.findIndex((line) => line.trim() === "カードの象徴:");
  if (symbolIndex < 0) return text;

  let endIndex = lines.length;
  for (let i = symbolIndex + 1; i < lines.length; i++) {
    if (SECTION_HEADER_RE.test(lines[i].trim())) {
      endIndex = i;
      break;
    }
  }

  const symbolBlock = lines.slice(symbolIndex + 1, endIndex).join("\n");
  if (/[？?]|ませんか/.test(symbolBlock)) return text;

  const insertLines = [
    "今回は逆位置。",
    "受け止めすぎていませんか？",
    "甘やかしすぎていませんか？",
    "「優しさ」と「都合のよさ」は違う、とカードは伝えています。",
  ];
  lines.splice(symbolIndex + 1, 0, ...insertLines);
  return lines.join("\n");
}

function replaceMimeticWords(
  text: string,
  mode: "disallow" | "allow_one_if_unused",
  state: { usedInTodayReading: boolean }
): string {
  let out = text;
  for (const [word, replacement] of MIMETIC_REPLACEMENTS) {
    const re = new RegExp(word, "g");
    out = out.replace(re, (m) => {
      if (mode === "allow_one_if_unused" && !state.usedInTodayReading) {
        state.usedInTodayReading = true;
        return m;
      }
      return replacement;
    });
  }
  return out;
}

function enforceMimeticWordPolicy(text: string): string {
  const lines = text.split("\n");
  let currentSection = "";
  const state = { usedInTodayReading: false };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(SECTION_HEADER_RE);
    if (headerMatch) {
      currentSection = headerMatch[1] ?? "";
      continue;
    }
    if (!line.trim() || /^- /.test(line)) {
      // Bullets are not allowed to use mimetic words.
      lines[i] = replaceMimeticWords(line, "disallow", state);
      continue;
    }
    lines[i] = replaceMimeticWords(
      line,
      currentSection === "今日の読み" ? "allow_one_if_unused" : "disallow",
      state
    );
  }
  return lines.join("\n");
}

function ensureConcreteExampleInTodayReading(text: string): string {
  const lines = text.split("\n");
  const todayIndex = lines.findIndex((line) => line.trim() === "今日の読み:");
  if (todayIndex < 0) return text;

  let endIndex = lines.length;
  for (let i = todayIndex + 1; i < lines.length; i++) {
    if (SECTION_HEADER_RE.test(lines[i].trim())) {
      endIndex = i;
      break;
    }
  }

  const bodyLines = lines.slice(todayIndex + 1, endIndex).filter((line) => line.trim() && !/^\s*-\s+/.test(line));
  const bodyText = bodyLines.join("\n");
  const hasConcreteSignal =
    /(たとえば|例えば|朝|昼|夜|返信|会話|連絡|予定|職場|学校|電車|買い物|打ち合わせ|席|メッセージ|電話|5分|10分|一言|1つ|ひとつ)/.test(
      bodyText
    );

  if (hasConcreteSignal) return text;

  const insertLine =
    "たとえば、返事を急ぐ場面では一度止まって言葉を短く整えると、空気がこじれにくくなります。";

  const insertAt = endIndex;
  const before = lines.slice(0, insertAt);
  const after = lines.slice(insertAt);
  if (before[before.length - 1]?.trim()) before.push(insertLine);
  else before.splice(before.length - 1, 0, insertLine);
  return [...before, ...after].join("\n");
}

function ensureSecondPersonInTodayReading(text: string): string {
  const lines = text.split("\n");
  const todayIndex = lines.findIndex((line) => line.trim() === "今日の読み:");
  if (todayIndex < 0) return text;

  let endIndex = lines.length;
  for (let i = todayIndex + 1; i < lines.length; i++) {
    if (SECTION_HEADER_RE.test(lines[i].trim())) {
      endIndex = i;
      break;
    }
  }

  const bodyLineIndexes = lines
    .map((line, idx) => ({ line, idx }))
    .filter(
      ({ line, idx }) =>
        idx > todayIndex && idx < endIndex && line.trim() && !/^\s*-\s+/.test(line) && !SECTION_HEADER_RE.test(line.trim())
    )
    .map(({ idx }) => idx);

  if (bodyLineIndexes.length === 0) return text;

  const bodyText = bodyLineIndexes.map((idx) => lines[idx]).join("\n");
  if (/(あなた|今のあなた|ご自身|自分)/.test(bodyText)) {
    return text;
  }

  const supportLine = "今のあなたは、気持ちを整えながら進む場面にいます。";
  const firstBodyIndex = bodyLineIndexes[0];
  lines.splice(firstBodyIndex, 0, supportLine);
  return lines.join("\n");
}

function ensureDokittoPsychologicalLine(text: string): string {
  const lines = text.split("\n");
  const todayIndex = lines.findIndex((line) => line.trim() === "今日の読み:");
  if (todayIndex < 0) return text;

  let endIndex = lines.length;
  for (let i = todayIndex + 1; i < lines.length; i++) {
    if (SECTION_HEADER_RE.test(lines[i].trim())) {
      endIndex = i;
      break;
    }
  }

  const bodyIndexes = lines
    .map((line, idx) => ({ line, idx }))
    .filter(
      ({ line, idx }) =>
        idx > todayIndex && idx < endIndex && line.trim() && !/^\s*-\s+/.test(line) && !SECTION_HEADER_RE.test(line.trim())
    )
    .map(({ idx }) => idx);
  if (bodyIndexes.length === 0) return text;

  const bodyText = bodyIndexes.map((idx) => lines[idx]).join("\n");
  if (/ドキッ/.test(bodyText)) return text;

  const insertLine =
    "ふとした一言にドキッとする場面があっても、そこで返事を急がないほうが流れは整います。";
  const insertAt = Math.min(bodyIndexes[0] + 1, endIndex);
  lines.splice(insertAt, 0, insertLine);
  return lines.join("\n");
}

function limitKamoshiremasenPerSection(text: string): string {
  const lines = text.split("\n");
  let currentSection = "";
  let countInSection = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const header = line.match(SECTION_HEADER_RE);
    if (header) {
      currentSection = header[1] ?? "";
      countInSection = 0;
      continue;
    }
    if (!line.trim()) continue;

    lines[i] = line.replace(/かもしれません/g, () => {
      countInSection += 1;
      if (countInSection <= 1) return "かもしれません";

      if (currentSection === "今日の読み") {
        return "場面もありそうです";
      }
      if (currentSection === "注意点") {
        return "と出ることがあります";
      }
      if (currentSection === "カードの象徴") {
        return "とも読めます";
      }
      return "と見えます";
    });
  }

  return lines.join("\n");
}

function normalizeFinalClosingLine(text: string): string {
  const lines = text.split("\n");
  const hitoKotoIndex = lines.findIndex((line) => /^ひと言:/.test(line.trim()));
  if (hitoKotoIndex < 0) return text;

  const lineIndex =
    hitoKotoIndex + 1 < lines.length && lines[hitoKotoIndex + 1].trim()
      ? hitoKotoIndex + 1
      : hitoKotoIndex;
  let line = lines[lineIndex] ?? "";

  const body = line.replace(/^ひと言:\s*/, "").trim();
  if (!body) return text;

  const abstractEndingRe = /(大切|重要|傾向|可能性|必要)(です|があります)?。?$/;
  if (!abstractEndingRe.test(body)) return text;

  let replaced = body
    .replace(/ことが大切です。?$/, "今日は自分を後回しにしないでください。")
    .replace(/大切です。?$/, "今日はそこを優先してください。")
    .replace(/重要です。?$/, "先に押さえてから進みましょう。")
    .replace(/傾向があります。?$/, "その空気が出ています。")
    .replace(/可能性があります。?$/, "そう出る場面もありそうです。")
    .replace(/必要です。?$/, "今はそこを選んでください。");

  if (replaced === body) {
    replaced = "今日は静かなほうを選んでください。";
  }

  lines[lineIndex] =
    lineIndex === hitoKotoIndex && /^ひと言:/.test(line)
      ? `ひと言: ${replaced}`
      : replaced;

  return lines.join("\n");
}

function polishFortuneTone(text: string): string {
  return normalizeFinalClosingLine(
    removeOppositeOrientationGeneralization(
      ensureReversedSymbolQuestions(
        enforceMimeticWordPolicy(
          ensureSecondPersonInTodayReading(
            ensureDokittoPsychologicalLine(
              ensureConcreteExampleInTodayReading(
                limitKamoshiremasenPerSection(
                  naturalizeFortuneDiction(softenRepeatedPhrases(reduceRepeatedYasui(text)))
                )
              )
            )
          )
        )
      )
    )
  );
}

export function ensureFortuneOutputFormat(text: string, cards: LiteCard[]): string {
  const withCardLine = ensureCardLine(text, cards);
  const compact = trimResultBodyLines(withCardLine);
  const polished = polishFortuneTone(ensureNextActionBullet(compact));
  const readable = formatFortuneReadability(polished);
  return clampFortuneLength(readable);
}
