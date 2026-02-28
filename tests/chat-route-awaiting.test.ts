import assert from "node:assert/strict";
import path from "node:path";
import Module from "node:module";

type ChatCompletionPayload = {
  choices: Array<{ message?: { content?: string | null } }>;
};

let createCallCount = 0;

class MockOpenAI {
  chat = {
    completions: {
      create: async () => {
        createCallCount += 1;
        const payload: ChatCompletionPayload = {
          choices: [
            {
              message: {
                content:
                  "カードの象徴:\n今日は言葉の行き違いが起きやすいかもしれません。返信の温度差に注意してください。\n今日の読み:\n会話の途中でドキッとする瞬間があります。返信前に一呼吸おいてください。\n注意点:\n言い返す前に間を置いてください。\n今日の行動ヒント:\n- 返信前に10秒待つ\n- 伝える内容を1つに絞る\nひと言:\n今日は押さずに整えてください。", 
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

const moduleAny = Module as any;
const originalLoad = moduleAny._load as (
  request: string,
  parent: NodeModule | null,
  isMain: boolean
) => unknown;
moduleAny._load = function patchedLoad(
  request: string,
  parent: NodeModule | null,
  isMain: boolean
) {
  if (request === "openai") {
    return { __esModule: true, default: MockOpenAI };
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

async function callRoute(message: string) {
  const declaration = "少しカードを引いてみますね。少しだけお待ちください。";
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mode: "chat",
      message,
      cards: [
        { name: "恋人", reversed: false },
        { name: "女教皇", reversed: false },
        { name: "節制", reversed: true },
      ],
      history: [
        { role: "user", content: "お願いします" },
        { role: "assistant", content: declaration },
      ],
    }),
  });

  const response = await POST(request);
  return response.json();
}

async function callImmediateFortuneRoute(message: string) {
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mode: "chat",
      message,
      cards: [
        { name: "恋人", reversed: false },
        { name: "女教皇", reversed: false },
        { name: "節制", reversed: true },
      ],
      history: [],
    }),
  });

  const response = await POST(request);
  return response.json();
}

async function callFortuneOfferConfirmationRoute(message: string) {
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mode: "chat",
      message,
      cards: [
        { name: "恋人", reversed: false },
        { name: "女教皇", reversed: false },
        { name: "節制", reversed: true },
      ],
      history: [{ role: "assistant", content: "結婚運を見てみましょうか？" }],
    }),
  });

  const response = await POST(request);
  return response.json();
}

async function callHealthOfferConfirmationRoute(message: string) {
  const request = new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      mode: "chat",
      message,
      cards: [
        { name: "恋人", reversed: false },
        { name: "女教皇", reversed: false },
        { name: "節制", reversed: true },
      ],
      history: [{ role: "assistant", content: "どこか悪いのかなんですね。今の状況を占ってみますか？" }],
    }),
  });

  const response = await POST(request);
  return response.json();
}

async function run() {
  const immediate = await callImmediateFortuneRoute("相手の気持ちを占って");
  assert.match(immediate.text, /引いたカード：/);
  assert.match(immediate.text, /お相手さまのお気持ちを見てみましょう/);
  assert.doesNotMatch(immediate.text, /少しカードを引いてみますね。少しだけお待ちください。/);
  assert.equal(immediate.conversationState.awaitingFortuneResult, false);

  const acceptedOffer = await callFortuneOfferConfirmationRoute("はい");
  assert.match(acceptedOffer.text, /^引いたカード：/);
  assert.doesNotMatch(acceptedOffer.text, /見てみましょうか？/);
  assert.equal(acceptedOffer.cards?.length, 3);
  assert.equal(acceptedOffer.conversationState.awaitingFortuneResult, false);

  const acceptedHealthOffer = await callHealthOfferConfirmationRoute("はい");
  assert.match(acceptedHealthOffer.text, /2\. 体の流れ・エネルギー状態の象徴/);
  assert.equal(acceptedHealthOffer.cards?.length, 3);
  assert.equal(acceptedHealthOffer.conversationState.topic, "health");

  const resultQuestion = await callRoute("結果は？");
  assert.match(resultQuestion.text, /^引いたカード：/);
  assert.doesNotMatch(resultQuestion.text, /少しカードを引いてみますね。少しだけお待ちください。/);
  assert.equal(resultQuestion.conversationState.awaitingFortuneResult, false);

  const stillDrawing = await callRoute("占ってる？");
  assert.match(stillDrawing.text, /^引いたカード：/);
  assert.doesNotMatch(stillDrawing.text, /少しカードを引いてみますね。少しだけお待ちください。/);
  assert.equal(stillDrawing.conversationState.awaitingFortuneResult, false);

  assert.equal(createCallCount, 6);
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
