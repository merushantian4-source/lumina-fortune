import { NextResponse } from "next/server";
import OpenAI from "openai";
import { pickRandomCards as pickDailyFortuneCards } from "@/lib/fortune-data";
import {
  buildBirthdate2026Prompt,
  buildChatPrompt,
  buildDialoguePrompt,
  buildDailyFortunePrompt,
} from "@/lib/prompt-builder";
import { ensureFortuneOutputFormat } from "@/lib/fortune-output";
import { buildTarotChatPrompt } from "@/lib/prompts/tarotChatPrompt";
import { greetingMessage, greetingResponse } from "@/lib/greeting-message";
import {
  buildFortuneOfferReply,
  getDialogueConversationState,
  type ChatHistoryItem,
} from "@/lib/dialogue-transition";
import { getGuardedChatDecision } from "@/lib/chat-flow-guard";
import {
  classifyIntent,
  isAcknowledgementInput,
  isAffirmativeInput,
} from "@/lib/intent-classifier";
import {
  isDialogueModeInput,
  isGreetingOnlyInput,
} from "@/lib/input-guards";
import { sanitizeChatReply, sanitizeDialogueReply } from "@/lib/pre-fortune-reply";
import { replyStyle } from "@/lib/reply-style";
import { drawTarotSpread, toUiTarotCardData, type DrawnTarotCard } from "@/lib/tarot/deck";
import { ensureTarotChatOutputFormat } from "@/lib/tarot/tarot-chat-output";

type RequestBody = {
  message?: string;
  cards?: { name: string; reversed?: boolean }[];
  mode?: string;
  history?: ChatHistoryItem[];
  conversationState?: {
    phase?: string;
    topic?: string | null;
    awaitingConsent?: boolean;
    awaitingTheme?: boolean;
    questionStreak?: number;
    lastTopic?: string | null;
    offtopicStreak?: number;
    awaitingFortuneResult?: boolean;
  };
};

type TarotChatPhase = "idle" | "intent_confirm" | "reading" | "followup";
type TarotChatTheme =
  | "love"
  | "marriage"
  | "work"
  | "money"
  | "health"
  | "relationship"
  | "future";

type TarotChatConversationState = {
  phase: TarotChatPhase;
  topic: TarotChatTheme | null;
  awaitingConsent: boolean;
  awaitingTheme: boolean;
  questionStreak: number;
  lastTopic: string | null;
  offtopicStreak: number;
  awaitingFortuneResult: boolean;
};

// OpenAI初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LUMINA_SYSTEM_PROMPT = `あなたは白の魔女ルミナです。占い師として常に謙虚で温和にふるまい、ご相談者さまの絶対的な味方でいてください。
語り口は、25〜54歳の女性に届く品格と共感性を重視し、魂に静かに響く丁寧な表現にしてください。
断定表現（必ず・確定・絶対・100%など）は避け、可能性として寄り添って伝えてください。
お相手について言及する場合は、必ず「お相手さま」と呼んでください。
ご相談者さまが迷いや不安を示したときは、「あなたは何も間違っていない」「自分を誇りに思って」という肯定メッセージを自然に含めてください。

タロットは、今の流れ・心の向き・向き合い方を読み解くために使います。医療・生死・子宝の時期・犯罪（犯人探し/浮気の特定）・病気の診断・当てもの（合否/勝敗）など、専門領域や断定が必要な内容は鑑定しないでください。
そのような相談には、理由を静かに伝えたうえで、次の代案を提案してください:
- 合格するための戦略
- 相性の良い方角や環境の整え方
- 心の持ち方や日々の行動の整え方
そして「その視点で見てみましょうか？」と、次の相談へやさしくつないでください。

同じ悩みでの再相談は拒まず、「今のあなたの波動に合わせた最新のメッセージ」として誠実に鑑定してください。
一度で完結させすぎず、自然な深掘りの余地を残してください。
相談者の恋愛や人間関係の当事者は相談者本人であり、あなたは第三者・伴走者として助言に徹してください。
「私も〜したい」「一緒に〜しよう」「私も興味がある」のような当事者化表現は禁止です。
雑談は雑談として返し、勝手に占いへ変換しないでください。
ユーザーが恋愛と言っていないのに恋愛鑑定を始めてはいけません。
占いは、テーマ確定と許可が取れてから開始してください。
「うん / はい / お願い / OK」などの肯定返答を受けた直後は、質問を増やさずに鑑定へ進んでください。
鑑定は「今日限定」ではなく、今の流れ・近い未来・助言として伝えてください。
ですます調を保ち、同じ語尾の連続を避け、過度な誘導をしないでください。`;

const FORTUNE_DECLARATION_RE = /少しカードを引いてみますね。少しだけお待ちください。/;
const FORTUNE_OFFER_CONFIRM_RE =
  /(見てみましょうか|見てみますか|見ますか|占ってみましょうか|占ってみますか|占いますか|引いてみましょうか|引いてみますか|引きますか)[？?]?\s*$/;

function isAwaitingFortuneResultFromHistory(history: ChatHistoryItem[]): boolean {
  const lastAssistant = [...history].reverse().find((h) => h.role === "assistant");
  if (!lastAssistant) return false;
  if (!FORTUNE_DECLARATION_RE.test(lastAssistant.content)) return false;

  const lastAssistantIndex = history.lastIndexOf(lastAssistant);
  const hasAssistantAfter = history.slice(lastAssistantIndex + 1).some((h) => h.role === "assistant");
  return !hasAssistantAfter;
}

function buildImmediateFortuneLeadIn(message: string): string | null {
  if (/(相手|お相手).*(気持ち)/.test(message) || /(気持ち).*(占って|見て|みて)/.test(message)) {
    return "そうなんですね。お相手さまのお気持ちを見てみましょう。";
  }
  return null;
}

function getLastAssistantMessage(history: ChatHistoryItem[]): string | null {
  return [...history].reverse().find((h) => h.role === "assistant")?.content ?? null;
}

function buildFortuneRequestFromOfferConfirmation(assistantMessage: string | null): string | null {
  if (!assistantMessage) return null;
  const text = assistantMessage.trim();
  const isGenericFortuneOffer =
    FORTUNE_OFFER_CONFIRM_RE.test(text) ||
    /タロットで[^。！？\n]*(見ますか|占いますか|引きますか|見てみましょうか|見てみますか|占ってみましょうか|占ってみますか|引いてみましょうか|引いてみますか)[？?]?\s*$/i.test(
      text
    );
  if (!isGenericFortuneOffer) return null;

  if (/結婚運/.test(text)) return "結婚運を占って";
  if (/(恋愛運|お相手の気持ち)/.test(text)) return "恋愛運を占って";
  if (/(健康運|健康|体調|頭痛|痛い|不調|どこか悪い|病気)/.test(text)) return "健康運を占って";
  if (/仕事運/.test(text)) return "仕事運を占って";
  if (/金運/.test(text)) return "金運を占って";
  return "占って";
}

const TAROT_INTENT_RE = /(占って|占い|見て|みて|鑑定|タロット|リーディング)/i;
const LOVE_THEME_RE = /(恋愛|相手の気持ち|片思い|復縁|彼氏|彼女|相性)/;
const MARRIAGE_THEME_RE = /(結婚|婚活|入籍|プロポーズ)/;
const WORK_THEME_RE = /(仕事|転職|職場|学業|勉強|受験|進路|就活)/;
const MONEY_THEME_RE = /(金運|お金|収入|貯金|家計|投資)/;
const HEALTH_THEME_RE = new RegExp(
  [
    "健康", "体調", "病気", "不調", "メンタル", "眠れない", "睡眠", "疲れ", "健康運", "心身", "コンディション",
    "肝臓", "腎臓", "心臓", "胃", "肺",
    "頭痛", "めまい", "血圧", "血糖", "自律神経", "ストレス",
    "痛い", "だるい", "違和感",
  ].join("|")
);
const RELATIONSHIP_THEME_RE = /(人間関係|対人関係|家族関係|友人関係|友達関係|上司との関係|同僚との関係)/;
const FUTURE_THEME_RE = /(未来|今後|この先|将来)/;
const SMALLTALK_FOOD_RE =
  /(好きな食べ物|何食べた|うどん|ラーメン|そば|パスタ|カレー|寿司|焼肉|ごはん|ご飯)/;
const MEDICAL_DIAGNOSIS_RE =
  /(腎臓|病気|病名|がん|癌|診断|治療|治りますか|治る|医者|医師|うつ|鬱|発達障害|障害|妊娠|不妊|余命)/;
const LIFE_DEATH_RE = /(死ぬ|死亡|生きる|寿命|生死|いつ死|亡くなる|助かる|死期)/;
const EXAM_PASS_FAIL_RE = /(試験|受験|面接|資格試験|国家試験).*(合格|不合格|受かる|落ちる)|((合格|不合格|受かる|落ちる).*(試験|受験|面接|資格))/;
const WIN_LOSE_PREDICTION_RE = /(勝敗|勝つ|負ける|どっちが勝つ|優勝|当選|落選|的中|当たる|当たり|外れる)/;
const LEGAL_PRO_RE = /(法律|訴訟|裁判|弁護士|違法|合法|慰謝料|相続|契約|法的|投資判断|投資すべき|株を買うべき|診断書|医師の判断|専門家の判断)/;
const FERTILITY_TIMING_RE = /(子宝|妊娠の時期|いつ妊娠|授かる時期|妊活.*時期)/;
const CRIME_IDENTIFICATION_RE = /(犯人|誰が犯人|浮気.*(特定|断定|誰)|不倫.*(特定|断定|誰)|犯人探し)/;
const RESTRICTED_TAROT_FIXED_REPLY = `◯◯のことが気になっているのですね。
体のことは、少しの違和感でも不安になりますよね。

けれど——

生死にかかわることや、病気の有無や、具体的な状態を断定することは、
わたしが触れられる領域ではないのです。

それは医療の専門家が向き合う、大切な現実の領域。

わたしができるのは、
“いまのあなたの流れ”を読み解くこと。

健康の運気や、
体との向き合い方についてなら、
タロットを通して静かにお伝えできます。

その視点で、見てみましょうか。`;
const HEALTH_THEME_FORBIDDEN_OUTPUT_RE =
  /(LINE|返信|彼氏|彼女|復縁|相手の気持ち|片思い|プロポーズ)/;

function defaultTarotChatConversationState(): TarotChatConversationState {
  return {
    phase: "idle",
    topic: null,
    awaitingConsent: false,
    awaitingTheme: false,
    questionStreak: 0,
    lastTopic: null,
    offtopicStreak: 0,
    awaitingFortuneResult: false,
  };
}

function normalizeTarotChatConversationState(
  raw: RequestBody["conversationState"]
): TarotChatConversationState {
  const base = defaultTarotChatConversationState();
  if (!raw || typeof raw !== "object") return base;
  const phase =
    raw.phase === "idle" ||
    raw.phase === "intent_confirm" ||
    raw.phase === "reading" ||
    raw.phase === "followup"
      ? raw.phase
      : base.phase;
  const topic =
    raw.topic === "love" ||
    raw.topic === "marriage" ||
    raw.topic === "work" ||
    raw.topic === "money" ||
    raw.topic === "health" ||
    raw.topic === "relationship" ||
    raw.topic === "future"
      ? raw.topic
      : null;
  return {
    phase,
    topic,
    awaitingConsent: Boolean(raw.awaitingConsent),
    awaitingTheme: Boolean(raw.awaitingTheme),
    questionStreak:
      typeof raw.questionStreak === "number" ? Math.max(0, Math.min(raw.questionStreak, 2)) : 0,
    lastTopic: typeof raw.lastTopic === "string" ? raw.lastTopic : null,
    offtopicStreak:
      typeof raw.offtopicStreak === "number" ? Math.max(0, Math.min(raw.offtopicStreak, 3)) : 0,
    awaitingFortuneResult: Boolean(raw.awaitingFortuneResult),
  };
}

function detectTarotTheme(input: string): TarotChatTheme | null {
  // ① 健康は最優先
  if (HEALTH_THEME_RE.test(input)) return "health";

  if (MARRIAGE_THEME_RE.test(input)) return "marriage";
  if (LOVE_THEME_RE.test(input)) return "love";
  if (WORK_THEME_RE.test(input)) return "work";
  if (MONEY_THEME_RE.test(input)) return "money";
  if (RELATIONSHIP_THEME_RE.test(input)) return "relationship";
  if (FUTURE_THEME_RE.test(input)) return "future";

  return null;
}

function isTarotIntentInput(input: string): boolean {
  return TAROT_INTENT_RE.test(input);
}

function isSmalltalkLikeInput(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (isTarotIntentInput(trimmed)) return false;
  if (detectTarotTheme(trimmed)) return false;
  if (/悩み|相談|不安|つらい|しんどい|モヤモヤ|もやもや/.test(trimmed)) return false;
  return SMALLTALK_FOOD_RE.test(trimmed);
}

type RestrictedTarotTopic =
  | "medical"
  | "life_death"
  | "exam"
  | "legal"
  | "fertility"
  | "crime";

function detectRestrictedTarotTopic(input: string): RestrictedTarotTopic | null {
  if (MEDICAL_DIAGNOSIS_RE.test(input)) return "medical";
  if (LIFE_DEATH_RE.test(input)) return "life_death";
  if (EXAM_PASS_FAIL_RE.test(input) || WIN_LOSE_PREDICTION_RE.test(input)) return "exam";
  if (LEGAL_PRO_RE.test(input)) return "legal";
  if (FERTILITY_TIMING_RE.test(input)) return "fertility";
  if (CRIME_IDENTIFICATION_RE.test(input)) return "crime";
  return null;
}

function buildRestrictedTarotReply(kind: RestrictedTarotTopic): string {
  if (kind === "fertility") {
    return `そのことが気になっているのですね。
ご不安なお気持ち、とても自然なことです。

子宝の時期を断定することは、占いで言い切れない領域です。
ただ、授かりやすい心身の整え方や、日々の流れの読み解きなら丁寧にお手伝いできます。

たとえば、
- 心身の負荷を減らす生活リズム
- 相性の良い方角や過ごし方
- 焦りを和らげる心の整え方

その視点で、見てみましょうか。`;
  }
  if (kind === "crime") {
    return `そのことが気になっているのですね。
胸が落ち着かないお気持ち、よく伝わってきます。

犯人探しや浮気の特定を断定することは、占いで扱えない領域です。
ただ、あなたが自分を守るための行動戦略や、心の整え方を一緒に読み解くことはできます。

たとえば、
- 状況整理のための確認ポイント
- 距離感と境界線の整え方
- 気持ちを守るための行動の優先順位

その視点で、見てみましょうか。`;
  }
  if (kind === "exam") {
    return `そのことが気になっているのですね。
結果が気になる時期は、心が揺れやすいですよね。

合否や勝敗の断定は占いで言い切れません。
ただ、結果に近づくための戦略や、当日までの整え方なら読み解けます。

たとえば、
- 合格・勝利に向けた行動の優先順位
- 集中力が高まりやすい時間帯や環境
- 本番で力を出し切るための心の持ち方

その視点で、見てみましょうか。`;
  }
  return RESTRICTED_TAROT_FIXED_REPLY.replace("◯◯", "そのこと");
}

function enforceFortuneClosing(text: string): string {
  let out = text.trim();
  out = out.replace(/お相手様/g, "お相手さま");
  if (/お相手(?!さま)/.test(out)) {
    out = out.replace(/お相手(?!さま)/g, "お相手さま");
  }
  if (!/魂の決意/.test(out)) {
    out = `${out}\n\nご相談者さまの魂の決意を、今日ここでひとつ選んでみてください。`;
  }
  if (!/また迷ったときは、いつでも頼ってくださいね。/.test(out)) {
    out = `${out}\nまた迷ったときは、いつでも頼ってくださいね。`;
  }
  return out;
}

function themeLabel(theme: TarotChatTheme): string {
  if (theme === "love") return "恋愛";
  if (theme === "marriage") return "結婚";
  if (theme === "work") return "仕事";
  if (theme === "money") return "お金";
  if (theme === "health") return "健康";
  if (theme === "relationship") return "人間関係";
  return "未来";
}

function buildThemeChoicePrompt(): string {
  return "占いをご希望でしたら、テーマを教えてください。恋愛 / 仕事 / 人間関係 / 未来 / 健康（必要なら結婚・お金でも大丈夫です）。";
}

function buildSmalltalkReply(input: string): string {
  if (/うどん/.test(input)) {
    return `うどん、いいですね。気分に合う一杯ってほっとしますよね。\n${buildThemeChoicePrompt()}`;
  }
  if (/好きな食べ物/.test(input)) {
    return `好きな食べ物の話、いいですね。つい盛り上がる話題です。\n${buildThemeChoicePrompt()}`;
  }
  return `そうなんですね。ありがとうございます。\n${buildThemeChoicePrompt()}`;
}

function buildIntentConfirmReply(theme: TarotChatTheme): string {
  return `${themeLabel(theme)}ですね。3枚引き（現状 / 課題 / 助言）で占ってみましょうか？`;
}

function buildThemeRequestedReply(): string {
  return `ありがとうございます。まずはテーマを1つ選んでください。${buildThemeChoicePrompt()}`;
}

function buildFollowupPrompt(topic: TarotChatTheme | null): string {
  const topicText = topic ? `${themeLabel(topic)}` : "そのテーマ";
  return `${topicText}について、どこを深掘りしたいですか？（現状 / 相手の気持ち / 近い未来 / 行動のコツ など）`;
}

function toFortunePromptMessage(theme: TarotChatTheme | null, userMessage: string): string {
  if (theme === "love") return userMessage.includes("恋愛") ? userMessage : `恋愛について占ってください。相談内容: ${userMessage}`;
  if (theme === "marriage") return userMessage.includes("結婚") ? userMessage : `結婚について占ってください。相談内容: ${userMessage}`;
  if (theme === "work") return userMessage.includes("仕事") ? userMessage : `仕事について占ってください。相談内容: ${userMessage}`;
  if (theme === "money") return userMessage.includes("金") || userMessage.includes("お金") ? userMessage : `お金について占ってください。相談内容: ${userMessage}`;
  if (theme === "health") return `健康運として占ってください（診断はしない）。相談内容: ${userMessage}`;
  if (theme === "relationship") return userMessage.includes("人間関係") ? userMessage : `人間関係について占ってください。相談内容: ${userMessage}`;
  if (theme === "future") return userMessage.includes("未来") || userMessage.includes("今後") ? userMessage : `近い未来について占ってください。相談内容: ${userMessage}`;
  return userMessage;
}

function hasAllHealthHeaders(text: string): boolean {
  return [
    "1. 引いたカード",
    "2. 体の流れ・エネルギー状態の象徴",
    "3. 今の心身バランスの読み解き",
    "4. 近い未来の体調傾向（断定禁止）",
    "5. 今日からできる整え方（具体的だが医療的でない）",
    "6. アファメーション（体と調和する言葉）",
  ].every((header) => text.includes(header));
}

function normalizeTarotReadingOutputHeadings(text: string): string {
  let normalized = text
    .replace(/^1\. 引いたカード（3枚）$/m, "1. 引いたカード")
    .replace(/^2\. カードの象徴$/m, "2. カードの気配")
    .replace(/^3\. 読み解き（相談内容に合わせて）$/m, "3. 今の状況への読み解き")
    .replace(/^4\. 近い未来の可能性（2〜3個）$/m, "4. 近い未来の可能性")
    .replace(/^5\. 今日からできる一歩$/m, "5. 心を整えるヒント")
    .replace(/^5\. 心を整えるアドバイス$/m, "5. 心を整えるヒント")
    .replace(/^6\. アファメーション（1行）$/m, "6. アファメーション");
  if (!/^引いたカード：/m.test(normalized)) {
    normalized = normalized.replace(/^1\. 引いたカード\n([^\n]+)/, "引いたカード：$1\n\n1. 引いたカード\n$1");
  }
  return normalized;
}

function inferThemeFromOfferMessage(assistantMessage: string | null): TarotChatTheme | null {
  if (!assistantMessage) return null;
  if (/結婚運/.test(assistantMessage)) return "marriage";
  if (/恋愛運|お相手の気持ち/.test(assistantMessage)) return "love";
  if (/(健康運|健康|体調|頭痛|痛い|不調|どこか悪い|病気)/.test(assistantMessage)) return "health";
  if (/仕事運/.test(assistantMessage)) return "work";
  if (/金運/.test(assistantMessage)) return "money";
  return null;
}

function toRecentHistoryMessages(history: ChatHistoryItem[]) {
  return history
    .filter((item): item is ChatHistoryItem => !!item && (item.role === "user" || item.role === "assistant"))
    .filter((item) => typeof item.content === "string" && item.content.trim().length > 0)
    .slice(-20)
    .map((item) => ({
      role: item.role as "user" | "assistant",
      content: item.content,
    }));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { message, cards: existingCards, mode = "chat" } = body;
    const history = Array.isArray(body.history) ? body.history : [];
    const incomingConversationState = normalizeTarotChatConversationState(body.conversationState);
    const trimmedMessage = message?.trim() || "こんにちは";
    const lastAssistantMessage = getLastAssistantMessage(history);
    const offerBasedFortuneMessage = buildFortuneRequestFromOfferConfirmation(lastAssistantMessage);
    const acceptedFortuneOffer =
      mode === "chat" && !!offerBasedFortuneMessage && isAffirmativeInput(trimmedMessage);
    let fortunePromptMessage = acceptedFortuneOffer
      ? offerBasedFortuneMessage
      : trimmedMessage;
    const detectedTheme = detectTarotTheme(trimmedMessage);
    const explicitTarotIntent = isTarotIntentInput(trimmedMessage);
    const affirmativeInput = isAffirmativeInput(trimmedMessage);
    const stateTopic =
      detectedTheme ??
      incomingConversationState.topic ??
      inferThemeFromOfferMessage(lastAssistantMessage);
    let nextConversationState: TarotChatConversationState = {
      ...incomingConversationState,
      topic: stateTopic,
      lastTopic: stateTopic ?? incomingConversationState.lastTopic ?? null,
    };
    if (detectedTheme === "health") {
      nextConversationState = {
        ...nextConversationState,
        phase: "idle",
        awaitingConsent: false,
        awaitingTheme: false,
        questionStreak: 0,
        offtopicStreak: 0,
        topic: "health",
        lastTopic: "health",
      };
    }
    const awaitingFortuneResult = isAwaitingFortuneResultFromHistory(history);
    const awaitingFollowupIntent = awaitingFortuneResult
      ? classifyIntent(trimmedMessage)
      : null;
    const shouldAddAwaitingBridge =
      awaitingFortuneResult && !isAcknowledgementInput(trimmedMessage);
    let resolvedMode = mode;
    if (acceptedFortuneOffer) {
      resolvedMode = "fortune";
    }
    const guardedDecision =
      resolvedMode === "chat" ? getGuardedChatDecision(history, trimmedMessage) : null;

    if (guardedDecision?.kind === "proceed_to_fortune") {
      resolvedMode = "fortune";
    }
    if (awaitingFortuneResult) {
      resolvedMode = "fortune";
    }

    if (mode === "chat" && trimmedMessage === "__welcome__") {
      return NextResponse.json({
        text: greetingMessage,
        cards: null,
        conversationState: defaultTarotChatConversationState(),
      });
    }

    if (mode === "chat" && isGreetingOnlyInput(trimmedMessage)) {
      return NextResponse.json({
        text: greetingResponse,
        cards: null,
        conversationState: {
          ...defaultTarotChatConversationState(),
          topic: nextConversationState.topic,
          lastTopic: nextConversationState.lastTopic,
        },
      });
    }

    if (mode === "chat") {
      const restrictedTopic = detectRestrictedTarotTopic(trimmedMessage);
      if (restrictedTopic) {
        return NextResponse.json({
          text: buildRestrictedTarotReply(restrictedTopic),
          cards: null,
          conversationState: {
            ...nextConversationState,
            phase: "intent_confirm",
            topic: "health",
            lastTopic: "health",
            awaitingTheme: false,
            awaitingConsent: true,
            awaitingFortuneResult: false,
          },
        });
      }
    }

    if (mode === "chat" && !awaitingFortuneResult) {
      const offeredByAssistant =
        nextConversationState.awaitingConsent || !!offerBasedFortuneMessage;
      const activeTheme = detectedTheme ?? nextConversationState.topic;

      if (nextConversationState.phase === "followup" && affirmativeInput) {
        return NextResponse.json({
          text: buildFollowupPrompt(activeTheme),
          cards: null,
          conversationState: {
            ...nextConversationState,
            phase: "followup",
            topic: activeTheme,
            lastTopic: activeTheme ?? nextConversationState.lastTopic,
            awaitingConsent: false,
            awaitingTheme: false,
          },
        });
      }

      if (nextConversationState.phase === "intent_confirm" && nextConversationState.awaitingTheme) {
        if (!activeTheme) {
          return NextResponse.json({
            text: buildThemeChoicePrompt(),
            cards: null,
            conversationState: nextConversationState,
          });
        }
        if (affirmativeInput || explicitTarotIntent) {
          resolvedMode = "fortune";
          fortunePromptMessage = toFortunePromptMessage(activeTheme, trimmedMessage);
          nextConversationState = {
            ...nextConversationState,
            phase: "reading",
            topic: activeTheme,
            lastTopic: activeTheme,
            awaitingTheme: false,
            awaitingConsent: false,
          };
        } else {
          return NextResponse.json({
            text: buildIntentConfirmReply(activeTheme),
            cards: null,
            conversationState: {
              ...nextConversationState,
              phase: "intent_confirm",
              topic: activeTheme,
              lastTopic: activeTheme,
              awaitingTheme: false,
              awaitingConsent: true,
            },
          });
        }
      }

      if (
        nextConversationState.phase === "intent_confirm" &&
        nextConversationState.awaitingConsent &&
        affirmativeInput
      ) {
        const confirmTheme = activeTheme ?? inferThemeFromOfferMessage(lastAssistantMessage);
        if (!confirmTheme) {
          return NextResponse.json({
            text: buildThemeRequestedReply(),
            cards: null,
            conversationState: {
              ...nextConversationState,
              phase: "intent_confirm",
              awaitingTheme: true,
              awaitingConsent: false,
            },
          });
        }
        resolvedMode = "fortune";
        fortunePromptMessage = toFortunePromptMessage(confirmTheme, trimmedMessage);
        nextConversationState = {
          ...nextConversationState,
          phase: "reading",
          topic: confirmTheme,
          lastTopic: confirmTheme,
          awaitingConsent: false,
          awaitingTheme: false,
        };
      }

      if (resolvedMode === "chat" && isSmalltalkLikeInput(trimmedMessage)) {
        return NextResponse.json({
          text: buildSmalltalkReply(trimmedMessage),
          cards: null,
          conversationState: {
            ...nextConversationState,
            phase: "idle",
            awaitingConsent: false,
            awaitingTheme: false,
            offtopicStreak: Math.min((nextConversationState.offtopicStreak ?? 0) + 1, 3),
          },
        });
      }

      if (resolvedMode === "chat" && explicitTarotIntent && !activeTheme) {
        return NextResponse.json({
          text: buildThemeChoicePrompt(),
          cards: null,
          conversationState: {
            ...nextConversationState,
            phase: "intent_confirm",
            awaitingTheme: true,
            awaitingConsent: false,
          },
        });
      }

      if (resolvedMode === "chat" && explicitTarotIntent && activeTheme) {
        return NextResponse.json({
          text: buildIntentConfirmReply(activeTheme),
          cards: null,
          conversationState: {
            ...nextConversationState,
            phase: "intent_confirm",
            topic: activeTheme,
            lastTopic: activeTheme,
            awaitingTheme: false,
            awaitingConsent: true,
          },
        });
      }

      if (resolvedMode === "chat" && offeredByAssistant && affirmativeInput) {
        const confirmTheme = activeTheme ?? inferThemeFromOfferMessage(lastAssistantMessage);
        if (!confirmTheme) {
          return NextResponse.json({
            text: buildThemeChoicePrompt(),
            cards: null,
            conversationState: {
              ...nextConversationState,
              phase: "intent_confirm",
              awaitingTheme: true,
              awaitingConsent: false,
            },
          });
        }
        resolvedMode = "fortune";
        fortunePromptMessage = toFortunePromptMessage(confirmTheme, trimmedMessage);
        nextConversationState = {
          ...nextConversationState,
          phase: "reading",
          topic: confirmTheme,
          lastTopic: confirmTheme,
          awaitingTheme: false,
          awaitingConsent: false,
        };
      }

      if (
        resolvedMode === "chat" &&
        nextConversationState.phase === "followup" &&
        !isAcknowledgementInput(trimmedMessage) &&
        !isSmalltalkLikeInput(trimmedMessage)
      ) {
        const followupTheme = activeTheme ?? nextConversationState.topic;
        if (followupTheme) {
          resolvedMode = "fortune";
          fortunePromptMessage = toFortunePromptMessage(followupTheme, trimmedMessage);
          nextConversationState = {
            ...nextConversationState,
            phase: "reading",
            topic: followupTheme,
            lastTopic: followupTheme,
            awaitingConsent: false,
            awaitingTheme: false,
          };
        }
      }
    }

    if (resolvedMode === "chat" && guardedDecision?.kind === "reply") {
      return NextResponse.json({
        text: guardedDecision.text,
        cards: null,
        conversationState: guardedDecision.conversationState,
      });
    }
    if (resolvedMode === "chat") {
      const conversationState = getDialogueConversationState(history, trimmedMessage);
      if (conversationState.shouldOfferFortune) {
        return NextResponse.json({
          text: buildFortuneOfferReply(history, trimmedMessage),
          cards: null,
          conversationState: {
            questionStreak: Math.min(conversationState.questionStreak + 1, 2),
            lastTopic: guardedDecision?.conversationState.lastTopic ?? null,
            offtopicStreak: 0,
            awaitingFortuneResult: false,
          },
        });
      }
    }

    let prompt = "";
    let cards = existingCards;
    let tarotSpread: DrawnTarotCard[] | null = null;
    let usedDialogueMode = false;

    if (resolvedMode === "chat") {
      if (
        isDialogueModeInput(
          trimmedMessage,
          replyStyle.dialogue.maxInputCharsForAutoDialogue
        )
      ) {
        prompt = buildDialoguePrompt(trimmedMessage);
        usedDialogueMode = true;
      } else {
        prompt = buildChatPrompt(trimmedMessage);
      }
    } else if (resolvedMode === "birthdate-2026") {
      prompt = buildBirthdate2026Prompt(trimmedMessage);
    } else {
      // タロット占いモード
      if (resolvedMode === "daily-fortune") {
        if (!cards || cards.length !== 1) {
          cards = pickDailyFortuneCards(1);
        }
        prompt = buildDailyFortunePrompt(fortunePromptMessage, cards);
      } else {
        tarotSpread = drawTarotSpread();
        cards = tarotSpread.map(toUiTarotCardData);
        prompt = buildTarotChatPrompt(fortunePromptMessage, tarotSpread, nextConversationState.topic);
      }
    }

    // OpenAI呼び出し
    const recentHistoryMessages = toRecentHistoryMessages(history);
    const completionMessages =
      resolvedMode === "chat"
        ? [
            { role: "system" as const, content: LUMINA_SYSTEM_PROMPT },
            ...recentHistoryMessages,
            { role: "user" as const, content: trimmedMessage },
          ]
        : [
            { role: "system" as const, content: LUMINA_SYSTEM_PROMPT },
            ...recentHistoryMessages,
            { role: "user" as const, content: prompt },
          ];

    let completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: completionMessages,
    });

    let rawText = completion.choices[0].message?.content || "";
    const isHealthThemeFortune =
      resolvedMode === "fortune" && nextConversationState.topic === "health";

    if (
      isHealthThemeFortune &&
      (HEALTH_THEME_FORBIDDEN_OUTPUT_RE.test(rawText) || !hasAllHealthHeaders(rawText))
    ) {
      const safeTarotSpread = tarotSpread ?? drawTarotSpread();
      tarotSpread = safeTarotSpread;
      const rewrittenHealthPrompt = buildTarotChatPrompt(
        `${fortunePromptMessage}\n\n追加指示: healthテーマであり恋愛文脈が混入しているので禁止事項を厳守して書き直してください。`,
        safeTarotSpread,
        "health"
      );
      const rewriteMessages = [
        { role: "system" as const, content: LUMINA_SYSTEM_PROMPT },
        ...recentHistoryMessages,
        { role: "user" as const, content: rewrittenHealthPrompt },
      ];
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: rewriteMessages,
      });
      rawText = completion.choices[0].message?.content || "";
    }

      const formattedText =
        resolvedMode === "chat"
          ? usedDialogueMode
            ? sanitizeDialogueReply(trimmedMessage, rawText)
            : sanitizeChatReply(trimmedMessage, rawText)
        : resolvedMode === "fortune"
          ? normalizeTarotReadingOutputHeadings(
              ensureTarotChatOutputFormat(rawText, tarotSpread ?? drawTarotSpread(), nextConversationState.topic)
            )
        : resolvedMode === "daily-fortune"
          ? ensureFortuneOutputFormat(rawText, cards ?? [])
          : rawText;
    const enforcedText =
      resolvedMode === "fortune" || resolvedMode === "daily-fortune"
        ? enforceFortuneClosing(formattedText)
        : formattedText;
    const immediateFortuneLeadIn =
      resolvedMode === "fortune" && mode === "chat" && !awaitingFortuneResult
        ? buildImmediateFortuneLeadIn(trimmedMessage)
        : null;
    const text =
      resolvedMode === "fortune" && awaitingFortuneResult && shouldAddAwaitingBridge
        ? `ありがとうございます。では、カードから見えたことをお伝えしますね。\n${enforcedText}`
        : immediateFortuneLeadIn
          ? `${immediateFortuneLeadIn}\n${enforcedText}`
          : enforcedText;

    return NextResponse.json({
      text,
      cards: resolvedMode === "fortune" || resolvedMode === "daily-fortune" ? cards : null,
      conversationState:
        awaitingFortuneResult
          ? {
              ...nextConversationState,
              phase: "followup",
              awaitingConsent: false,
              awaitingTheme: false,
              questionStreak: 0,
              offtopicStreak: 0,
              awaitingFortuneResult: false,
            }
          : resolvedMode === "chat"
            ? {
                ...nextConversationState,
                phase:
                  nextConversationState.phase === "reading"
                    ? "followup"
                    : nextConversationState.phase,
                questionStreak: usedDialogueMode
                  ? Math.min((guardedDecision?.conversationState.questionStreak ?? 0) + 1, 2)
                  : nextConversationState.questionStreak,
                lastTopic:
                  (nextConversationState.lastTopic as string | null) ??
                  guardedDecision?.conversationState.lastTopic ??
                  null,
                offtopicStreak: guardedDecision?.conversationState.offtopicStreak ?? 0,
                awaitingFortuneResult: false,
              }
            : resolvedMode === "fortune"
              ? {
                  ...nextConversationState,
                  phase: "followup",
                  awaitingConsent: false,
                  awaitingTheme: false,
                  questionStreak: 0,
                  offtopicStreak: 0,
                  awaitingFortuneResult: false,
                }
              : undefined,
      meta:
        awaitingFortuneResult && awaitingFollowupIntent
          ? { awaitingFollowupIntent }
          : undefined,
    });
  } catch (error: unknown) {
    console.error("OpenAIエラー:", error);
    return NextResponse.json(
      { error: "ルミナさんとの通信に失敗しました。" },
      { status: 500 }
    );
  }
}
