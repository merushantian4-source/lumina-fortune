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
  return `${card.name}（${card.reversed ? "逆位置" : "正位置"}）`;
}

function formatCards(cards: CardLite[]): string {
  return cards
    .map((card) => `${card.name}（${card.reversed ? "逆位置" : "正位置"}）`)
    .join("\n");
}

export function buildDailyFortunePrompt(
  message: string,
  cards: CardLite[],
  context: DailyFortunePromptContext
): string {
  const nickname = context.nickname?.trim();
  const job = context.job?.trim();
  const greetingRule = nickname
    ? `冒頭のあいさつは必ず「こんにちは、${nickname}さん。」で始めること。`
    : `冒頭のあいさつは必ず「こんにちは、ゲストさん。」で始めること。`;

  return `あなたは魔女ルミナです。やさしく静かな口調で、毎日の占い文を日本語で作成してください。
以下のルールを厳守してください。

【最重要ルール】
- 番号（①②③、1.2.3.）は絶対に出力しない
- 「補足」など余計な追記は絶対にしない
- あいさつは1回だけ。重複させない
- 最後にあいさつを繰り返さない
- 同じ文章を繰り返さない
- 出力全体は700〜1100文字
- 医療・試験合否・生死などの断定をしない
- 不安を煽る語を使わない

【出力構造（順番固定）】
【導入】
あいさつ＋曜日
今日のカード名＋正逆位置
象徴キーワード（3語）＋やさしい説明
前日の流れとの接続（自然に）
今日のテーマ一文（「今日は〜の日です」）

【運勢カテゴリ】
全体運
仕事運（具体的な行動を1つ入れる）
恋愛運（片想い/パートナーどちらにも当てられる）
人間関係運（誤解や集団心理に触れる）
金運（使い方の注意を一言）

【回収】
今日のアクション（1つだけ）
心理メッセージ（安心の言葉）
ルミナからの締め（短く）

【プロフィール反映】
${greetingRule}
- 曜日は必ず「今日は${context.weekdayJa}曜日ですね。」を含めること
- 恋愛ステータスは恋愛運の言い回しにのみ反映し、断定はしない
- 職業がある場合は仕事運の文脈に1回だけ自然に反映する（繰り返さない）
- 職業がない場合は一般的な仕事運のみを書く

【職業情報】
- 職業: ${job && job.length > 0 ? job : "未登録"}

【前日接続】
- 前日の情報: ${formatCard(context.previousCard)}
- 前日情報が無い場合も、自然な一般化で「前日の流れ」を書くこと

【入力】
今日の相談:
${message}

今日のカード:
${formatCards(cards)}

構造どおりの本文のみを返してください。`;
}
