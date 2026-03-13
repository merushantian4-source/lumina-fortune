import assert from "node:assert/strict";
import path from "node:path";
import Module from "node:module";

type ChatCompletionPayload = {
  choices: Array<{ message?: { content?: string | null } }>;
};

type ChatRouteJson = {
  text?: string;
  cards?: Array<{ name: string; reversed?: boolean }> | null;
  conversationState?: {
    topic?: string | null;
    phase?: string;
    awaitingConsent?: boolean;
    awaitingTheme?: boolean;
    awaitingFortuneResult?: boolean;
  };
  gate?: {
    title?: string;
    body?: string;
  } | null;
  error?: string;
};

let createCallCount = 0;
let hasUsedLightGuidanceTodayMock = false;
let markLightGuidanceUsedCallCount = 0;

class MockOpenAI {
  chat = {
    completions: {
      create: async () => {
        createCallCount += 1;
        const payload: ChatCompletionPayload = {
          choices: [
            {
              message: {
                content: [
                  "カード名: 太陽",
                  "今日の読み:",
                  "今は明るい流れに乗りやすい時期です。気負いすぎず、一歩ずつ進めば大丈夫です。",
                  "行動のヒント:",
                  "- まずは一つだけ着手する",
                  "- 迷ったら安心できる選択を優先する",
                ].join("\n"),
              },
            },
          ],
        };
        return payload;
      },
    },
  };

  constructor(_config: unknown) {}
}

const moduleAny = Module as unknown as Module & {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};
const originalLoad = moduleAny._load;

moduleAny._load = function patchedLoad(
  request: string,
  parent: NodeModule | null,
  isMain: boolean
) {
  if (request === "openai") {
    return { __esModule: true, default: MockOpenAI };
  }

  if (request === "@/lib/light-guidance-usage") {
    return {
      __esModule: true,
      hasUsedLightGuidanceToday: async () => hasUsedLightGuidanceTodayMock,
      markLightGuidanceUsed: async () => {
        markLightGuidanceUsedCallCount += 1;
      },
    };
  }

  if (request === "@/lib/moderation/rateLimit") {
    return {
      __esModule: true,
      checkModerationPostInterval: async () => ({ ok: true }),
      resolveModerationUserKey: () => "test-user",
    };
  }

  if (request === "@/lib/moderation/validateText") {
    return {
      __esModule: true,
      validateModerationText: () => ({ ok: true }),
    };
  }

  if (request.startsWith("@/")) {
    const mapped = path.join(process.cwd(), request.slice(2));
    return originalLoad.call(this, mapped, parent, isMain);
  }

  return originalLoad.call(this, request, parent, isMain);
};

const { POST } = require("../app/api/chat/route") as {
  POST: (request: Request) => Promise<Response>;
};

const DEFAULT_CARDS = [
  { name: "愚者", reversed: false },
  { name: "女教皇", reversed: false },
  { name: "星", reversed: true },
];

const FORTUNE_DECLARATION = "少しカードを引いてみますね。少しだけお待ちください。";
const MARRIAGE_OFFER = "結婚運を見てみましょうか？";
const HEALTH_OFFER = "どこか気になることがあるんですね。健康の流れを見てみましょうか？";

async function postChat(
  message: string,
  options: {
    history?: Array<{ role: "user" | "assistant"; content: string }>;
    profile?: Record<string, unknown>;
    mode?: string;
    conversationState?: Record<string, unknown>;
  } = {}
): Promise<ChatRouteJson> {
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mode: options.mode ?? "chat",
      message,
      cards: DEFAULT_CARDS,
      history: options.history ?? [],
      profile: options.profile,
      conversationState: options.conversationState,
    }),
  });

  const response = await POST(request);
  return response.json();
}

async function withNodeEnv<T>(value: string, run: () => Promise<T>): Promise<T> {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = value;
  try {
    return await run();
  } finally {
    if (previous === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previous;
    }
  }
}

function assertPendingCleared(response: ChatRouteJson) {
  assert.equal(response.conversationState?.awaitingFortuneResult, false);
  assert.equal(response.conversationState?.awaitingConsent, false);
  assert.equal(response.conversationState?.awaitingTheme, false);
}

function assertFortuneResponse(response: ChatRouteJson, expectedTopic?: string) {
  assert.ok(response.text);
  assert.ok(response.text!.trim().length > 0);
  assert.ok(Array.isArray(response.cards));
  assert.ok((response.cards?.length ?? 0) > 0);
  assert.equal(response.error, undefined);
  assertPendingCleared(response);
  if (expectedTopic) {
    assert.equal(response.conversationState?.topic, expectedTopic);
  }
}

async function assertOfferConfirmationStartsFortune(message: string) {
  const response = await postChat(message, {
    history: [{ role: "assistant", content: MARRIAGE_OFFER }],
  });
  assertFortuneResponse(response, "marriage");
  assert.equal(response.gate, undefined);
}

async function assertShortThemeIntentStartsFortune(message: string, topic: string) {
  const response = await postChat(message);
  assertFortuneResponse(response, topic);
  assert.equal(response.gate, undefined);
}

async function run() {
  const immediate = await postChat("恋愛を占って");
  assertFortuneResponse(immediate, "love");
  assert.match(immediate.text!, /^引いたカード[:：]/);
  assert.match(immediate.text!, /(お相手|恋愛)/);
  assert.doesNotMatch(immediate.text!, /少しだけお待ちください/);

  for (const message of ["はい", "お願いします", "おねがい", "みて"]) {
    await assertOfferConfirmationStartsFortune(message);
  }

  const acceptedHealthOffer = await postChat("はい", {
    history: [{ role: "assistant", content: HEALTH_OFFER }],
  });
  assertFortuneResponse(acceptedHealthOffer, "health");
  assert.match(acceptedHealthOffer.text!, /2\..*(体|心).*エネルギー/);

  const resultQuestion = await postChat("結果は？", {
    history: [
      { role: "user", content: "お願いします" },
      { role: "assistant", content: FORTUNE_DECLARATION },
    ],
  });
  assertFortuneResponse(resultQuestion);
  assert.match(resultQuestion.text!, /^引いたカード[:：]/);
  assert.doesNotMatch(resultQuestion.text!, /少しだけお待ちください/);

  const stillDrawing = await postChat("みて？", {
    history: [
      { role: "user", content: "お願いします" },
      { role: "assistant", content: FORTUNE_DECLARATION },
    ],
  });
  assertFortuneResponse(stillDrawing);

  await assertShortThemeIntentStartsFortune("恋愛みて", "love");
  await assertShortThemeIntentStartsFortune("仕事みて", "work");

  const shortMarriageNeedsConfirm = await postChat("けっこん運");
  assert.ok(shortMarriageNeedsConfirm.text);
  assert.equal(shortMarriageNeedsConfirm.cards, null);
  assert.equal(shortMarriageNeedsConfirm.conversationState?.phase, "intent_confirm");
  assert.equal(shortMarriageNeedsConfirm.conversationState?.topic, "marriage");
  assert.equal(shortMarriageNeedsConfirm.conversationState?.awaitingConsent, true);

  const shortMoneyNeedsConfirm = await postChat("金運は？");
  assert.ok(shortMoneyNeedsConfirm.text);
  assert.equal(shortMoneyNeedsConfirm.cards, null);
  assert.equal(shortMoneyNeedsConfirm.conversationState?.phase, "intent_confirm");
  assert.equal(shortMoneyNeedsConfirm.conversationState?.topic, "money");
  assert.equal(shortMoneyNeedsConfirm.conversationState?.awaitingConsent, true);

  const switchedTheme = await postChat("仕事みて", {
    conversationState: {
      phase: "intent_confirm",
      topic: "love",
      awaitingTheme: true,
      awaitingConsent: false,
      awaitingFortuneResult: false,
      lightGuidanceCount: 0,
    },
  });
  assertFortuneResponse(switchedTheme, "work");
  assert.equal(switchedTheme.conversationState?.phase, "followup");

  const confirmationMisfire = await postChat("うどん", {
    conversationState: {
      phase: "intent_confirm",
      topic: "marriage",
      awaitingTheme: false,
      awaitingConsent: true,
      awaitingFortuneResult: false,
      lightGuidanceCount: 0,
    },
  });
  assert.ok(confirmationMisfire.text);
  assert.equal(confirmationMisfire.cards, null);
  assert.equal(confirmationMisfire.conversationState?.phase, "idle");
  assertPendingCleared(confirmationMisfire);

  const yesWithoutDirectOffer = await postChat("はい", {
    conversationState: {
      phase: "intent_confirm",
      topic: null,
      awaitingTheme: true,
      awaitingConsent: false,
      awaitingFortuneResult: false,
      lightGuidanceCount: 0,
    },
  });
  assert.ok(yesWithoutDirectOffer.text);
  assert.equal(yesWithoutDirectOffer.cards, null);
  assert.equal(yesWithoutDirectOffer.conversationState?.phase, "intent_confirm");
  assert.equal(yesWithoutDirectOffer.conversationState?.awaitingTheme, true);
  assert.equal(yesWithoutDirectOffer.conversationState?.awaitingConsent, false);

  const completionReset = await postChat("はい", {
    conversationState: {
      phase: "intent_confirm",
      topic: "love",
      awaitingTheme: false,
      awaitingConsent: true,
      awaitingFortuneResult: false,
      lightGuidanceCount: 0,
    },
  });
  assertFortuneResponse(completionReset, "love");
  assert.equal(completionReset.conversationState?.phase, "followup");

  const greeting = await postChat("こんにちは");
  assert.ok(greeting.text);
  assert.ok(greeting.text!.trim().length > 0);

  const restricted = await postChat("病気かどうか診断して");
  assert.ok(restricted.text);
  assert.ok(restricted.text!.trim().length > 0);
  assert.equal(restricted.cards, null);
  assert.equal(restricted.conversationState?.phase, "intent_confirm");
  assert.equal(restricted.conversationState?.topic, "health");

  const dailyFortune = await postChat("今日の運勢", {
    mode: "daily-fortune",
    conversationState: {
      phase: "intent_confirm",
      topic: "love",
      awaitingTheme: true,
      awaitingConsent: true,
      awaitingFortuneResult: true,
      lightGuidanceCount: 3,
    },
  });
  assert.ok(dailyFortune.text);
  assert.ok(dailyFortune.text!.trim().length > 0);
  assert.ok(Array.isArray(dailyFortune.cards));
  assert.equal(dailyFortune.cards?.length, 1);

  const reunion = await postChat("復縁できますか？");
  assertFortuneResponse(reunion, "love");
  assert.match(reunion.text!, /復縁の可能性を静かに見ていきますね。/);

  const marriage = await postChat("結婚できますか？");
  assertFortuneResponse(marriage, "marriage");
  assert.match(marriage.text!, /結婚の流れについて見ていきましょう。/);

  hasUsedLightGuidanceTodayMock = false;
  markLightGuidanceUsedCallCount = 0;
  const productionFortune = await withNodeEnv("production", () =>
    postChat("恋愛みて", {
      profile: { nickname: "prod-fresh-user", membershipTier: "free", userKey: "prod-fresh-user" },
    })
  );
  assertFortuneResponse(productionFortune, "love");
  assert.equal(productionFortune.gate, undefined);
  assert.equal(markLightGuidanceUsedCallCount, 1);

  hasUsedLightGuidanceTodayMock = true;
  const productionGate = await withNodeEnv("production", () =>
    postChat("恋愛みて", {
      profile: { nickname: "prod-used-user", membershipTier: "free", userKey: "prod-used-user" },
    })
  );
  assert.ok(productionGate.text);
  assert.ok(productionGate.text!.trim().length > 0);
  assert.equal(productionGate.error, undefined);
  assert.equal(productionGate.cards, null);
  assert.ok(productionGate.gate);
  assert.equal(productionGate.conversationState?.phase, "followup");
  assert.equal(productionGate.conversationState?.awaitingFortuneResult, false);

  assert.equal(createCallCount, 16);
}

run()
  .then(() => {
    moduleAny._load = originalLoad;
    console.log("chat-route-awaiting.test.ts: OK");
  })
  .catch((error) => {
    moduleAny._load = originalLoad;
    console.error(error);
    process.exit(1);
  });
