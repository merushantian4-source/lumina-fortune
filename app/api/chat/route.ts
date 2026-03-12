import { NextResponse } from "next/server";
import OpenAI from "openai";
import { isLuminaDevMode, luminaDevLog, luminaDevWarn } from "@/lib/config/lumina-dev";
import { pickRandomCards as pickDailyFortuneCards } from "@/lib/fortune-data";
import {
  buildBirthdate2026Prompt,
  buildChatPrompt,
  buildDialoguePrompt,
} from "@/lib/prompt-builder";
import { buildDailyFortunePrompt } from "@/lib/daily-fortune-prompt";
import { ensureFortuneOutputFormat } from "@/lib/daily-fortune-output";
import { getPreviousDailyCard, saveDailyCardForDate } from "@/lib/daily-fortune-history";
import {
  buildLightGuidanceOneCardPrompt,
  buildLightGuidanceOneCardSystemPrompt,
  detectLightGuidanceLoveSubtheme,
  type LightGuidanceLoveSubtheme,
  type LightGuidanceTheme,
} from "@/lib/fortune/light-guidance-one-card";
import { selectCardMode } from "@/lib/tarot/card-voices";
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
import {
  ensureLightGuidanceOneCardOutput,
  type LightGuidanceOneCardSections,
} from "@/lib/tarot/light-guidance-one-card-output";
import { checkModerationPostInterval, resolveModerationUserKey } from "@/lib/moderation/rateLimit";
import { validateModerationText } from "@/lib/moderation/validateText";
import { PRESET_FORTUNE_QUESTIONS } from "@/lib/preset-fortune-questions";
import { hasUsedLightGuidanceToday, markLightGuidanceUsed } from "@/lib/light-guidance-usage";
import type { ChatMessagePart } from "@/lib/chat-message-parts";

type RequestBody = {
  message?: string;
  cards?: { name: string; reversed?: boolean }[];
  mode?: string;
  profile?: {
    nickname?: string;
    birthdate?: string;
    job?: string;
    loveStatus?: "single" | "married" | "complicated" | "unrequited" | string;
    membershipTier?: "free" | "paid" | string;
    userKey?: string;
  };
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
    lightGuidanceCount?: number;
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
  lightGuidanceCount: number;
};

type ChatRouteResponse = {
  text?: string;
  cards?: { name: string; reversed?: boolean }[] | null;
  messageParts?: ChatMessagePart[];
  conversationState?: TarotChatConversationState | Record<string, unknown>;
  gate?: ReturnType<typeof buildLightGuidanceGatePayload>;
  meta?: Record<string, unknown>;
};

// OpenAI初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getJstNowParts(base = new Date()) {
  const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const weekdayFormatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    weekday: "long",
  });
  const parts = dateFormatter.formatToParts(base);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  const weekdayJa = weekdayFormatter.format(base) || "日曜日";
  return { dateKey: `${year}-${month}-${day}`, weekdayJa };
}

function resolveDailyFortuneUserKey(profile: RequestBody["profile"]): string {
  const nickname = profile?.nickname?.trim();
  if (!nickname) return "guest";
  return `nickname:${nickname.toLowerCase()}`;
}

function resolveLightGuidanceUserKey(profile: RequestBody["profile"]): string {
  const explicit = profile?.userKey?.trim();
  if (explicit) return explicit;
  const nickname = profile?.nickname?.trim();
  const birthdate = profile?.birthdate?.trim();
  if (nickname || birthdate) {
    return `profile:${nickname ?? "guest"}:${birthdate ?? "unknown"}`;
  }
  return "guest";
}

function isPaidMember(profile: RequestBody["profile"]): boolean {
  return profile?.membershipTier === "paid";
}

function buildLegacyLightGuidanceGatePayload() {
  return {
    title: "もっと知りたい方へ",
    body:
      "今日の1枚はここまでです\nまた明日、あたらしい導きを受け取れます。\nもっと知りたい方は、続きをご案内できます。",
    links: [
      {
        label: "有料会員登録をする",
        href: "/membership",
        description: "有料会員さまは何度でもカードを引けます",
      },
      {
        label: "個人鑑定を依頼する",
        href: "/consultation",
        description: "もっと深く、あなたの流れを丁寧に読み解きます",
      },
    ],
  };
}

function buildLightGuidanceGatePayload() {
  return {
    title: "今日の1枚はここまでです",
    body:
      "また明日、あたらしい導きを受け取れます。\nもっと知りたい方は、続きをご案内できます。",
    links: [
      {
        label: "有料会員登録をする",
        href: "/membership",
        description: "有料会員さまは何度でもカードを引けます",
      },
      {
        label: "個人鑑定を依頼する",
        href: "/consultation",
        description: "もっと深く、あなたの流れを丁寧に読み解きます",
      },
    ],
  };
}

void buildLegacyLightGuidanceGatePayload;
const LIGHT_GUIDANCE_SESSION_LIMIT = 10;

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

function getLastAssistantMessage(history: ChatHistoryItem[]): string | null {
  return [...history].reverse().find((h) => h.role === "assistant")?.content ?? null;
}

function buildFortuneMessageParts(
  sections: LightGuidanceOneCardSections,
  firstCard:
    | {
        name: string;
        reversed?: boolean;
      }
    | null
): ChatMessagePart[] {
  return [
    { type: "intro", text: sections.intro },
    { type: "animation", animation: "white-bird-delivers-card" },
    ...(firstCard
      ? [
          {
            type: "card" as const,
            cardName: firstCard.name,
            orientation: firstCard.reversed ? ("reversed" as const) : ("upright" as const),
          },
        ]
      : []),
    { type: "reading-short", text: sections.readingShort },
    { type: "reading-detail", text: sections.readingDetail },
  ];
}

function buildLegacyFortuneHeading(
  card:
    | {
        name: string;
        reversed?: boolean;
      }
    | null
): string {
  if (!card) return "引いたカード：";
  return `引いたカード：${card.name}（${card.reversed ? "逆位置" : "正位置"}）`;
}

function buildFortuneLeadLine(theme: TarotChatTheme | null): string | null {
  if (theme === "love") return "お相手さまのお気持ちを見てみましょう。";
  if (theme === "marriage") return "結婚運を見てみましょう。";
  if (theme === "work") return "お仕事の流れを見てみましょう。";
  if (theme === "money") return "金運を見てみましょう。";
  if (theme === "health") {
    return "今の心と体の流れを見てみましょう。\n\n2. 体の流れ・エネルギー状態の象徴";
  }
  if (theme === "relationship") return "人間関係の流れを見てみましょう。";
  if (theme === "future") return "これからの流れを見てみましょう。";
  return null;
}

function ensureResponseText(response: ChatRouteResponse): ChatRouteResponse {
  if (response.text?.trim()) return response;

  const fallbackFromParts =
    response.messageParts?.flatMap((part) => ("text" in part ? [part.text] : [])).find((text) => text?.trim()) ??
    "";
  if (fallbackFromParts.trim()) {
    return {
      ...response,
      text: fallbackFromParts,
    };
  }

  return {
    ...response,
    text: "ありがとうございます。続けて鑑定を進めますね。",
  };
}

function jsonChatResponse(response: ChatRouteResponse) {
  return NextResponse.json(ensureResponseText(response));
}

void buildThemeAcceptanceLine;

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
const LOVE_THEME_RE = /(恋愛|恋愛運|相手の気持ち|片思い|復縁|彼氏|彼女|相性)/;
const MARRIAGE_THEME_RE = /(結婚|婚|プロポーズ|将来|家庭|夫婦|結婚運|けっこん運|婚活|入籍)/;
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
const MARRIAGE_THEME_FORBIDDEN_OUTPUT_RE = /(復縁|やり直し|再び戻る)/;
const LEGACY_STYLE_RE =
  /(少々お待ちください|カードを展開する音をイメージしてください|このまま掘り下げを進めることもできます|あなたに寄り添いながら)/;

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
    lightGuidanceCount: 0,
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
    lightGuidanceCount:
      typeof raw.lightGuidanceCount === "number"
        ? Math.max(0, Math.min(raw.lightGuidanceCount, LIGHT_GUIDANCE_SESSION_LIMIT))
        : 0,
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

function resolveLightGuidancePromptContext(
  message: string,
  topic: TarotChatTheme | null
): {
  theme: LightGuidanceTheme;
  loveSubtheme: LightGuidanceLoveSubtheme;
} {
  const theme = (topic as LightGuidanceTheme) ?? null;
  return {
    theme,
    loveSubtheme: detectLightGuidanceLoveSubtheme(message, theme),
  };
}

function isTarotIntentInput(input: string): boolean {
  return TAROT_INTENT_RE.test(input);
}

function normalizePresetQuestion(text: string): string {
  return text
    .trim()
    .normalize("NFKC")
    .replace(/[？?]+$/g, "")
    .replace(/[！!]+$/g, "")
    .replace(/[。．｡]+$/g, "")
    .replace(/\s+/g, "");
}

function matchPresetFortuneQuestion(input: string): {
  question: string;
  theme: TarotChatTheme;
} | null {
  const normalizedInput = normalizePresetQuestion(input);
  return (
    PRESET_FORTUNE_QUESTIONS.find(
      (preset) => normalizePresetQuestion(preset.question) === normalizedInput
    ) ?? null
  );
}

function isSmalltalkLikeInput(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (isTarotIntentInput(trimmed)) return false;
  if (detectTarotTheme(trimmed)) return false;
  if (/悩み|相談|不安|つらい|しんどい|モヤモヤ|もやもや/.test(trimmed)) return false;
  return SMALLTALK_FOOD_RE.test(trimmed);
}

const LUMINA_IDENTITY_REPLY = `私は白の魔女ルミナという存在です。
占い師として、心の声や流れを読み解くお手伝いをさせていただいています。

何かお悩みや気になることがあれば、ぜひお聞かせください。
あなたの心に寄り添うことができれば幸いです。`;

function isLuminaIdentityQuestion(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  return [
    /あなたは誰(ですか)?/,
    /あなたは何(ですか)?/,
    /AIですか/,
    /あなたはAIですか/,
    /ルミナとは/,
    /あなたについて/,
    /ここは何/,
    /どんなことができる/,
  ].some((pattern) => pattern.test(trimmed));
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
  // 「教皇」→「法王」統一（「女教皇」はそのまま）
  out = out.replace(/(?<!女)教皇/g, "法王");
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
  if (theme === "love") return "恋のことですね。1枚引きで今の流れを見てみましょうか？";
  if (theme === "marriage") return "結婚のことですね。1枚引きで今の流れを見てみましょうか？";
  if (theme === "work") return "お仕事のことですね。1枚引きで今の流れを見てみましょうか？";
  if (theme === "money") return "お金のことですね。1枚引きで今の流れを見てみましょうか？";
  if (theme === "health") return "心や体のことですね。1枚引きで今の流れを見てみましょうか？";
  if (theme === "relationship") return "人間関係が気になっているのですね。1枚引きで今の流れを見てみましょうか？";
  return "これからの流れが気になっているのですね。1枚引きで今の流れを見てみましょうか？";
}

function buildThemeRequestedReply(): string {
  return `ありがとうございます。まずはテーマを1つ選んでください。${buildThemeChoicePrompt()}`;
}

function buildThemeAcceptanceLine(theme: TarotChatTheme | null): string | null {
  if (theme === "love") return "恋のことですね。";
  if (theme === "marriage") return "結婚のことですね。";
  if (theme === "work") return "お仕事の流れが気になっているのですね。";
  if (theme === "money") return "お金のことですね。";
  if (theme === "health") return "心や体のことですね。";
  if (theme === "relationship") return "人間関係が気になっているのですね。";
  if (theme === "future") return "これからの流れが気になっているのですね。";
  return null;
}

function isDirectFortuneStartInput(input: string, theme: TarotChatTheme | null): boolean {
  if (!theme) return false;
  const normalized = input.trim().replace(/\s+/g, "").replace(/[?？!！]+$/g, "");
  if (!normalized) return false;

  switch (theme) {
    case "love":
      return /^(恋愛|恋|恋愛運)(は)?$/.test(normalized);
    case "marriage":
      return /^(結婚|結婚運|けっこん運)(は)?$/.test(normalized);
    case "work":
      return /^(仕事|仕事運|学業)(は)?$/.test(normalized);
    case "money":
      return /^(お金|金運)(は)?$/.test(normalized);
    case "health":
      return /^(健康|健康運|体調)(は)?$/.test(normalized);
    case "relationship":
      return /^(人間関係|対人関係)$/.test(normalized);
    case "future":
      return /^(未来|今後)$/.test(normalized);
    default:
      return false;
  }
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
    const { message, cards: existingCards, mode = "chat", profile } = body;
    const history = Array.isArray(body.history) ? body.history : [];
    const rawUserKey = profile?.userKey ?? profile?.nickname ?? "";
    const moderationSource = typeof message === "string" ? message.trim() : "";
    if (
      moderationSource &&
      !moderationSource.startsWith("__") &&
      process.env.NODE_ENV === "production"
    ) {
      const moderation = validateModerationText(moderationSource, { maxLength: 500 });
      if (!moderation.ok) {
        return NextResponse.json({ error: moderation.error }, { status: 400 });
      }

    }
    const incomingConversationState = normalizeTarotChatConversationState(body.conversationState);
    const trimmedMessage = message?.trim() || "こんにちは";
    const normalizedInput = normalizePresetQuestion(trimmedMessage);
    const matchedPresetQuestion = matchPresetFortuneQuestion(trimmedMessage);
    const lastAssistantMessage = getLastAssistantMessage(history);
    const offerBasedFortuneMessage = buildFortuneRequestFromOfferConfirmation(lastAssistantMessage);
    const acceptedFortuneOffer =
      mode === "chat" && !!offerBasedFortuneMessage && isAffirmativeInput(trimmedMessage);
    let fortunePromptMessage = acceptedFortuneOffer
      ? offerBasedFortuneMessage
      : trimmedMessage;
    const detectedTheme = matchedPresetQuestion?.theme ?? detectTarotTheme(trimmedMessage);
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
    let shouldPrependThemeAcceptance = false;
    void shouldPrependThemeAcceptance;
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
    let resolvedMode = mode;
    if (acceptedFortuneOffer) {
      resolvedMode = "fortune";
    }
    if (mode === "chat" && matchedPresetQuestion) {
      resolvedMode = "fortune";
      fortunePromptMessage = toFortunePromptMessage(matchedPresetQuestion.theme, trimmedMessage);
    }
    const guardedDecision =
      resolvedMode === "chat" ? getGuardedChatDecision(history, trimmedMessage) : null;

    if (guardedDecision?.kind === "proceed_to_fortune") {
      resolvedMode = "fortune";
    }
    if (awaitingFortuneResult) {
      resolvedMode = "fortune";
    }

    luminaDevLog("[lumina] normalized input:", normalizedInput);
    luminaDevLog("[lumina] preset matched:", matchedPresetQuestion?.question ?? null);
    luminaDevLog("[lumina] detectedTheme:", detectedTheme);
    luminaDevLog("[lumina] route:", resolvedMode);

    if (mode === "chat" && trimmedMessage === "__welcome__") {
      return jsonChatResponse({
        text: greetingMessage,
        cards: null,
        conversationState: defaultTarotChatConversationState(),
      });
    }

    if (mode === "chat" && isGreetingOnlyInput(trimmedMessage)) {
      return jsonChatResponse({
        text: greetingResponse,
        cards: null,
        conversationState: {
          ...defaultTarotChatConversationState(),
          topic: nextConversationState.topic,
          lastTopic: nextConversationState.lastTopic,
        },
      });
    }

    if (mode === "chat" && isLuminaIdentityQuestion(trimmedMessage)) {
      return jsonChatResponse({
        text: LUMINA_IDENTITY_REPLY,
        cards: null,
        conversationState: defaultTarotChatConversationState(),
      });
    }

    if (mode === "chat") {
      const restrictedTopic = detectRestrictedTarotTopic(trimmedMessage);
      if (restrictedTopic) {
        return jsonChatResponse({
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

      if (
        resolvedMode === "chat" &&
        detectedTheme &&
        trimmedMessage.trim().length <= 120
      ) {
        resolvedMode = "fortune";
        fortunePromptMessage = toFortunePromptMessage(activeTheme, trimmedMessage);
        nextConversationState = {
          ...nextConversationState,
          phase: "reading",
          topic: activeTheme,
          lastTopic: activeTheme,
          awaitingConsent: false,
          awaitingTheme: false,
        };
      }

      if (resolvedMode === "chat" && isDirectFortuneStartInput(trimmedMessage, activeTheme)) {
        resolvedMode = "fortune";
        fortunePromptMessage = toFortunePromptMessage(activeTheme, trimmedMessage);
        nextConversationState = {
          ...nextConversationState,
          phase: "reading",
          topic: activeTheme,
          lastTopic: activeTheme,
          awaitingConsent: false,
          awaitingTheme: false,
        };
        shouldPrependThemeAcceptance = true;
      }

      if (nextConversationState.phase === "followup" && affirmativeInput) {
        return jsonChatResponse({
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
          return jsonChatResponse({
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
          return jsonChatResponse({
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
          return jsonChatResponse({
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
        return jsonChatResponse({
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
        return jsonChatResponse({
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
        return jsonChatResponse({
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
          return jsonChatResponse({
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

    console.log("[lumina] resolvedMode:", resolvedMode);
    console.log("[lumina] rate limit:", resolvedMode === "fortune" ? "skipped" : "applied");

    const nextLightGuidanceCount =
      resolvedMode === "fortune"
        ? Math.min((nextConversationState.lightGuidanceCount ?? 0) + 1, LIGHT_GUIDANCE_SESSION_LIMIT)
        : nextConversationState.lightGuidanceCount ?? 0;

    if (resolvedMode === "fortune" && (nextConversationState.lightGuidanceCount ?? 0) >= LIGHT_GUIDANCE_SESSION_LIMIT) {
      return jsonChatResponse({
        text: "このセッションでの光の導きはここまでです。少し間をあけて、また新しい流れで受け取りましょう。",
        cards: null,
        conversationState: {
          ...nextConversationState,
          phase: "followup",
          awaitingConsent: false,
          awaitingTheme: false,
          awaitingFortuneResult: false,
          lightGuidanceCount: LIGHT_GUIDANCE_SESSION_LIMIT,
        },
      });
    }

    if (resolvedMode !== "fortune") {
      const rateLimit = await checkModerationPostInterval(
        resolveModerationUserKey(request, [rawUserKey])
      );
      if (!rateLimit.ok) {
        return NextResponse.json({ error: rateLimit.error }, { status: 400 });
      }
    }

    if (resolvedMode === "chat" && guardedDecision?.kind === "reply") {
      return jsonChatResponse({
        text: guardedDecision.text,
        cards: null,
        conversationState: guardedDecision.conversationState,
      });
    }
    if (resolvedMode === "chat") {
      const conversationState = getDialogueConversationState(history, trimmedMessage);
      if (conversationState.shouldOfferFortune) {
        return jsonChatResponse({
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

    if (
      false &&
      resolvedMode === "fortune" &&
      !isPaidMember(profile) &&
      !awaitingFortuneResult &&
      process.env.NODE_ENV === "production"
    ) {
      if (isLuminaDevMode) {
        luminaDevLog("[lumina] dev mode enabled");
        luminaDevLog("[lumina] fortune limit disabled (dev mode)");
      } else {
        const lightGuidanceUserKey = resolveLightGuidanceUserKey(profile);
        const lightGuidanceDateKey = getJstNowParts().dateKey;
        const alreadyUsedToday = await hasUsedLightGuidanceToday(lightGuidanceUserKey, lightGuidanceDateKey);

        if (alreadyUsedToday) {
          return jsonChatResponse({
            text: "今日の1枚はここまでです",
            gate: buildLightGuidanceGatePayload(),
            cards: null,
            conversationState: {
              ...nextConversationState,
              phase: "followup",
              awaitingConsent: false,
              awaitingTheme: false,
              questionStreak: 0,
              offtopicStreak: 0,
              awaitingFortuneResult: false,
            },
          });
        }
      }
    }

    let prompt = "";
    let cards = existingCards;
    let tarotSpread: DrawnTarotCard[] | null = null;
    let lightGuidanceCard: DrawnTarotCard | null = null;
    let lightGuidanceSections: LightGuidanceOneCardSections | null = null;
    let lightGuidanceTheme: LightGuidanceTheme = null;
    let lightGuidanceLoveSubtheme: LightGuidanceLoveSubtheme = null;
    let usedDialogueMode = false;
    let selectedDailyCardMode: string | undefined;
    const { dateKey: dailyDateKey, weekdayJa } = getJstNowParts();
    const dailyFortuneUserKey = resolveDailyFortuneUserKey(profile);
    const previousDailyCard =
      resolvedMode === "daily-fortune"
        ? await getPreviousDailyCard(dailyFortuneUserKey, dailyDateKey)
        : null;

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
        selectedDailyCardMode = selectCardMode(cards?.[0], `${dailyDateKey}:${cards?.[0]?.name}:${cards?.[0]?.reversed ? "r" : "u"}`);
        prompt = buildDailyFortunePrompt(fortunePromptMessage, cards, {
          nickname: profile?.nickname,
          job: profile?.job,
          loveStatus: profile?.loveStatus,
          weekdayJa,
          selectedCardMode: selectedDailyCardMode,
          readingCategory: "general",
          previousCard: previousDailyCard
            ? {
                name: previousDailyCard.cardName,
                reversed: previousDailyCard.reversed,
              }
            : null,
        });
      } else {
        tarotSpread = drawTarotSpread(Math.random, ["現状"]);
        lightGuidanceCard = tarotSpread[0] ?? null;
        cards = tarotSpread.map(toUiTarotCardData);
        if (!lightGuidanceCard) {
          throw new Error("Failed to draw one-card tarot reading");
        }
        luminaDevLog("[lumina] route:", "new-route");
        luminaDevLog("[lumina] drawn cards:", cards);
        luminaDevLog("[lumina] drawn card count:", cards?.length ?? 0);
        ({ theme: lightGuidanceTheme, loveSubtheme: lightGuidanceLoveSubtheme } =
          resolveLightGuidancePromptContext(fortunePromptMessage, nextConversationState.topic));
        prompt = buildLightGuidanceOneCardPrompt(
          fortunePromptMessage,
          lightGuidanceCard,
          lightGuidanceTheme,
          lightGuidanceLoveSubtheme
        );
        luminaDevLog("[lumina] final prompt:", prompt);
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
        : resolvedMode === "fortune"
          ? [
              { role: "system" as const, content: buildLightGuidanceOneCardSystemPrompt() },
              { role: "user" as const, content: prompt },
            ]
          : [
              { role: "system" as const, content: LUMINA_SYSTEM_PROMPT },
              ...recentHistoryMessages,
              { role: "user" as const, content: prompt },
            ];

    let completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: completionMessages,
      ...(resolvedMode === "daily-fortune" || resolvedMode === "fortune"
        ? { response_format: { type: "json_object" as const } }
        : {}),
    });

    let rawText = completion.choices[0].message?.content || "";
    if (resolvedMode === "fortune") {
      luminaDevLog("[lumina] raw model response:", rawText);
    }
    if (resolvedMode === "daily-fortune") {
      console.log("[daily-fortune] rawText length:", rawText.length, "starts:", rawText.slice(0, 80));
    }
    const isHealthThemeFortune =
      resolvedMode === "fortune" && nextConversationState.topic === "health";

    if (isHealthThemeFortune && HEALTH_THEME_FORBIDDEN_OUTPUT_RE.test(rawText)) {
      const safeTarotSpread = tarotSpread ?? drawTarotSpread(Math.random, ["現状"]);
      tarotSpread = safeTarotSpread;
      lightGuidanceCard = safeTarotSpread[0] ?? null;
      if (!lightGuidanceCard) {
        throw new Error("Failed to redraw one-card health reading");
      }
      const rewrittenHealthPrompt = buildLightGuidanceOneCardPrompt(
        `${fortunePromptMessage}\n\n追加指示: healthテーマであり恋愛文脈が混入しているので禁止事項を厳守して書き直してください。`,
        lightGuidanceCard,
        "health"
      );
      const rewriteMessages = [
        { role: "system" as const, content: buildLightGuidanceOneCardSystemPrompt() },
        { role: "user" as const, content: rewrittenHealthPrompt },
      ];
      luminaDevWarn("[lumina] health rewrite route triggered");
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: rewriteMessages,
        response_format: { type: "json_object" as const },
      });
      rawText = completion.choices[0].message?.content || "";
      luminaDevLog("[lumina] raw model response after rewrite:", rawText);
    }

    const isMarriageThemeFortune =
      resolvedMode === "fortune" && lightGuidanceLoveSubtheme === "marriage";

    if (isMarriageThemeFortune && MARRIAGE_THEME_FORBIDDEN_OUTPUT_RE.test(rawText)) {
      const safeTarotSpread = tarotSpread ?? drawTarotSpread(Math.random, ["現状"]);
      tarotSpread = safeTarotSpread;
      lightGuidanceCard = safeTarotSpread[0] ?? null;
      if (!lightGuidanceCard) {
        throw new Error("Failed to redraw one-card marriage reading");
      }
      const rewrittenMarriagePrompt = buildLightGuidanceOneCardPrompt(
        `${fortunePromptMessage}\n\n追加指示: marriageテーマです。復縁・やり直し・再び戻るという表現は禁止し、結婚の可能性、現実性、二人の価値観、タイミングに集中して書き直してください。`,
        lightGuidanceCard,
        lightGuidanceTheme,
        "marriage"
      );
      const rewriteMessages = [
        { role: "system" as const, content: buildLightGuidanceOneCardSystemPrompt() },
        { role: "user" as const, content: rewrittenMarriagePrompt },
      ];
      luminaDevWarn("[lumina] marriage rewrite route triggered");
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: rewriteMessages,
        response_format: { type: "json_object" as const },
      });
      rawText = completion.choices[0].message?.content || "";
      luminaDevLog("[lumina] raw model response after marriage rewrite:", rawText);
    }

    const formattedText =
      resolvedMode === "chat"
        ? usedDialogueMode
          ? sanitizeDialogueReply(trimmedMessage, rawText)
          : sanitizeChatReply(trimmedMessage, rawText)
        : resolvedMode === "fortune"
          ? (() => {
              lightGuidanceSections = ensureLightGuidanceOneCardOutput(
                rawText,
                lightGuidanceCard ?? tarotSpread?.[0] ?? drawTarotSpread(Math.random, ["現状"])[0]!,
                lightGuidanceTheme,
                fortunePromptMessage,
                lightGuidanceLoveSubtheme
              );
              luminaDevLog("[lumina] final route sections:", lightGuidanceSections);
              const leadLine = buildFortuneLeadLine(nextConversationState.topic);
              return [buildLegacyFortuneHeading(cards?.[0] ?? null), leadLine, lightGuidanceSections.text]
                .filter(Boolean)
                .join("\n\n");
            })()
        : resolvedMode === "daily-fortune"
          ? ensureFortuneOutputFormat(rawText, cards ?? [], {
              nickname: profile?.nickname,
              job: profile?.job,
              loveStatus: profile?.loveStatus,
              weekdayJa,
              selectedCardMode: selectedDailyCardMode,
              readingCategory: "general",
              previousCard: previousDailyCard
                ? {
                    name: previousDailyCard.cardName,
                    reversed: previousDailyCard.reversed,
                  }
                : null,
            })
          : rawText;
    const enforcedText =
      resolvedMode === "daily-fortune"
        ? enforceFortuneClosing(formattedText)
        : formattedText;
    const text = enforcedText;

    if (resolvedMode === "daily-fortune" && cards?.[0]) {
      try {
        await saveDailyCardForDate(dailyFortuneUserKey, {
          dateKey: dailyDateKey,
          cardName: cards[0].name,
          reversed: Boolean(cards[0].reversed),
        });
      } catch {
        // Do not block response on persistence failure.
      }
    }

    if (false && resolvedMode === "fortune" && !isPaidMember(profile) && !isLuminaDevMode) {
      try {
        await markLightGuidanceUsed(resolveLightGuidanceUserKey(profile), dailyDateKey);
      } catch {
        // Do not block response on persistence failure.
      }
    }

    const responsePayload = {
      text,
      messageParts:
        resolvedMode === "fortune"
          ? buildFortuneMessageParts(
              lightGuidanceSections ??
                ensureLightGuidanceOneCardOutput(
                  rawText,
                  lightGuidanceCard ?? tarotSpread?.[0] ?? drawTarotSpread(Math.random, ["現状"])[0]!,
                  lightGuidanceTheme,
                  fortunePromptMessage,
                  lightGuidanceLoveSubtheme
                ),
              cards?.[0] ?? null
            )
          : undefined,
      cards:
        resolvedMode === "fortune"
          ? (existingCards?.length ? existingCards : cards)
          : resolvedMode === "daily-fortune"
            ? cards
            : null,
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
              lightGuidanceCount: nextConversationState.lightGuidanceCount ?? 0,
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
                lightGuidanceCount: nextConversationState.lightGuidanceCount ?? 0,
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
                  lightGuidanceCount: nextLightGuidanceCount,
                }
              : undefined,
      meta:
        awaitingFortuneResult && awaitingFollowupIntent
          ? { awaitingFollowupIntent, devMode: isLuminaDevMode }
          : isLuminaDevMode
            ? { devMode: true }
            : undefined,
    };

    if (resolvedMode === "fortune") {
      const payloadText = [
        responsePayload.text,
        ...(responsePayload.messageParts?.flatMap((part) => ("text" in part ? [part.text] : [])) ?? []),
      ]
        .filter(Boolean)
        .join("\n");
      if (LEGACY_STYLE_RE.test(payloadText)) {
        luminaDevWarn("[lumina] legacy style text detected", responsePayload);
      }
      luminaDevLog("[lumina] response payload:", {
        text: responsePayload.text,
        messageParts: responsePayload.messageParts,
        cards: responsePayload.cards,
      });
    }

    return jsonChatResponse(responsePayload);
  } catch (error: unknown) {
    console.error("OpenAIエラー:", error);
    return NextResponse.json(
      { error: "ルミナさんとの通信に失敗しました。" },
      { status: 500 }
    );
  }
}
