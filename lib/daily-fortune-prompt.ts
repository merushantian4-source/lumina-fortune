type CardLite = {
  name: string;
  reversed?: boolean;
};

export type DailyFortunePromptContext = {
  nickname?: string;
  job?: string;
  loveStatus?: "single" | "married" | "complicated" | "unrequited" | string;
  weekdayJa: string;
  previousCard?: {
    name: string;
    reversed?: boolean;
  } | null;
};

function formatCard(card?: { name: string; reversed?: boolean } | null): string {
  if (!card) return "前日のカード情報はありません";
  return `${card.name}の${card.reversed ? "逆位置" : "正位置"}`;
}

function formatCards(cards: CardLite[]): string {
  return cards.map((card) => `${card.name}の${card.reversed ? "逆位置" : "正位置"}`).join("、");
}

function resolveDisplayName(nickname?: string): string {
  const trimmed = nickname?.trim();
  return trimmed ? `${trimmed}さん` : "ゲストさん";
}

function resolveLoveStatusLabel(loveStatus?: string): string {
  switch (loveStatus) {
    case "married":
      return "既婚";
    case "complicated":
      return "複雑";
    case "unrequited":
      return "片思い";
    case "single":
      return "独身";
    default:
      return "未設定";
  }
}

export function buildDailyFortunePrompt(
  message: string,
  cards: CardLite[],
  context: DailyFortunePromptContext
): string {
  const displayName = resolveDisplayName(context.nickname);
  const job = context.job?.trim() || "未登録";
  const previousCardText = formatCard(context.previousCard);
  const todayCards = formatCards(cards);

  return [
    "あなたは「白の館 LUMINA」のタロット占い師です。",
    "ユーザーに向けて「今日の占い」を日本語で作成してください。",
    "この文章は占いサイトのメインコンテンツとして表示されます。",
    "",
    "以下のルールを必ず守ってください。",
    "",
    "文章構成",
    "1. 最初は必ず「こんにちは、{name}。」から始めること。",
    `ここでの name は「${displayName}」です。`,
    `続けて「今日は${context.weekdayJa}ですね。」のように曜日を自然に入れること。`,
    `そのあと、今日のカード ${todayCards} を必ず明記すること。`,
    "カードの象徴キーワードを2〜4個、自然な文章の中で伝えること。",
    `前日のカードは「${previousCardText}」です。前日の流れから今日へどう続くかを自然に触れること。`,
    "今日のテーマを一文で自然に示すこと。",
    "",
    "その後は、次の内容を見出しなしで自然な文章として続けてください。",
    "全体運、仕事運、恋愛運、人間関係運を必ず含めてください。",
    "金運は必要な場合のみ自然に加えてください。",
    "それぞれ抽象的すぎず、今日どう過ごすとよいかが伝わる内容にしてください。",
    "少なくとも1つは具体的な行動の提案を含めてください。",
    "",
    "最後は必ず次の3つで締めてください。",
    "今日の小さなアクションを1つだけ入れる。",
    "安心できる心理メッセージを入れる。",
    "やさしい祈りのような締めの一文で終える。",
    "",
    "文章ルール",
    "見出しは禁止です。",
    "【導入】【運勢カテゴリ】【回収】のようなラベルも一切書かないでください。",
    "600〜900文字程度で書いてください。",
    "段落は読みやすく改行し、1段落は3〜4行以内にしてください。",
    "改行しすぎず、PCで見たときに縦長になりすぎないようにしてください。",
    "やさしく静かな語り口にしてください。",
    "説教調にしないでください。",
    "「〜してください」を多用しないでください。",
    "断定しすぎず、やわらかい言い回しにしてください。",
    "カード名は必ず入れてください。",
    "占いとして自然な流れを保ってください。",
    "",
    "ユーザー情報",
    `表示名: ${displayName}`,
    `職業: ${job}`,
    `恋愛状況: ${resolveLoveStatusLabel(context.loveStatus)}`,
    "",
    "前提情報",
    `前日のカード: ${previousCardText}`,
    "前日のカード情報がない場合は、昨日から続く流れをやわらかく一般化して表現してください。",
    "",
    "ユーザーが求めている内容",
    message,
    "",
    "今日のカード",
    todayCards,
    "",
    "本文だけを出力してください。",
  ].join("\n");
}
