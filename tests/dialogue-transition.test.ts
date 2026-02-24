import assert from "node:assert/strict";
import {
  buildFortuneOfferReply,
  getDialogueConversationState,
  type ChatHistoryItem,
} from "../lib/dialogue-transition";
import { getGuardedChatDecision } from "../lib/chat-flow-guard";
import { ensureFortuneOutputFormat } from "../lib/fortune-output";

function run() {
  const flowHistory: ChatHistoryItem[] = [
    { role: "user", content: "最近気になる人がいます" },
    { role: "assistant", content: "そうなんですね。どんな場面で話すことが多いですか？" },
  ];

  const state = getDialogueConversationState(flowHistory, "手をつないでくれました");
  assert.equal(state.hasRelationshipInfo, true);
  assert.equal(state.shouldOfferFortune, true);
  assert.equal(state.triggerReason, "relationship-info");

  const offer = buildFortuneOfferReply(flowHistory, "手をつないでくれました");
  assert.match(offer, /手をつないだことがある/);
  assert.match(offer, /(占ってみますか|占いますか|1枚引きして)/);
  assert.ok(offer.length <= 120, `offer too long: ${offer.length}`);

  const questionRallyHistory: ChatHistoryItem[] = [
    { role: "assistant", content: "そうなんですね。どんな人ですか？" },
    { role: "user", content: "優しい人です" },
    { role: "assistant", content: "どんな時にやさしいと感じますか？" },
    { role: "user", content: "話を聞いてくれます" },
    { role: "assistant", content: "最近の印象的な出来事はありますか？" },
  ];
  const stateByStreak = getDialogueConversationState(questionRallyHistory, "はい");
  assert.equal(stateByStreak.questionStreak, 3);
  assert.equal(stateByStreak.shouldOfferFortune, true);
  assert.equal(stateByStreak.triggerReason, "question-streak");

  const twoQuestionRallyHistory: ChatHistoryItem[] = [
    { role: "assistant", content: "そうなんですね。どんな人ですか？" },
    { role: "user", content: "優しい人です" },
    { role: "assistant", content: "どんな時にやさしいと感じますか？" },
  ];
  const stateByTwoQuestions = getDialogueConversationState(twoQuestionRallyHistory, "うん");
  assert.equal(stateByTwoQuestions.questionStreak, 2);
  assert.equal(stateByTwoQuestions.shouldOfferFortune, true);

  const stateFortuneRequest = getDialogueConversationState(flowHistory, "占って");
  assert.equal(stateFortuneRequest.shouldOfferFortune, false);

  const affirmativeHistory: ChatHistoryItem[] = [
    { role: "assistant", content: "気になるんですね。会話は続きますか？" },
    { role: "user", content: "はい" },
    { role: "assistant", content: "そうなんですね。相手もよく話しかけてくれますか？" },
  ];
  const stateByAffirmative = getDialogueConversationState(affirmativeHistory, "気になります");
  assert.equal(stateByAffirmative.affirmativeStreak, 2);
  assert.equal(stateByAffirmative.shouldOfferFortune, true);
  assert.equal(stateByAffirmative.triggerReason, "affirmative-streak");

  const marriageDecision = getGuardedChatDecision([], "誰と結婚したらいいかわからない");
  assert.equal(marriageDecision.kind, "reply");
  if (marriageDecision.kind === "reply") {
    assert.equal(
      marriageDecision.text,
      "結婚についてのお悩みなんですね。結婚運を見てみましょうか？"
    );
    assert.ok(marriageDecision.text.length <= 120);
  }

  const loveDecision = getGuardedChatDecision([], "最近好きな人ができました");
  assert.equal(loveDecision.kind, "reply");
  if (loveDecision.kind === "reply") {
    assert.doesNotMatch(loveDecision.text, /結婚運/);
    assert.match(loveDecision.text, /恋愛について気になっているんですね/);
    assert.match(loveDecision.text, /(お相手の気持ち|恋愛運)/);
  }

  const offTopicDecision = getGuardedChatDecision(
    [{ role: "user", content: "誰と結婚したらいいかわからない" }],
    "うどん"
  );
  assert.equal(offTopicDecision.kind, "reply");
  if (offTopicDecision.kind === "reply") {
    assert.match(offTopicDecision.text, /^なるほど。/);
    assert.match(offTopicDecision.text, /結婚運を見てみましょうか/);
    assert.doesNotMatch(offTopicDecision.text, /(具|好きな|どんな麺)/);
  }

  const directFortuneDecision = getGuardedChatDecision([], "占って");
  assert.equal(directFortuneDecision.kind, "proceed_to_fortune");
  const formattedFortune = ensureFortuneOutputFormat(
    "結婚については焦らず比較より価値観の整理を優先すると流れを見やすくなります。",
    [{ name: "恋人", reversed: false }]
  );
  assert.match(formattedFortune, /^引いたカード：恋人（正位置）/);

  const unknownProblemDecision = getGuardedChatDecision([], "最近悩んでて");
  assert.equal(unknownProblemDecision.kind, "reply");
  if (unknownProblemDecision.kind === "reply") {
    assert.equal(unknownProblemDecision.text, "そうなんですね。どんなことでお悩みですか？");
    assert.doesNotMatch(unknownProblemDecision.text, /[？?].*[？?]/);
  }

  const simpleOfftopicDecision = getGuardedChatDecision([], "うどん");
  assert.equal(simpleOfftopicDecision.kind, "reply");
  if (simpleOfftopicDecision.kind === "reply") {
    assert.match(simpleOfftopicDecision.text, /占いたいテーマ|占いたい内容/);
  }

  const workTransitionDecision = getGuardedChatDecision(
    [
      { role: "user", content: "最近悩んでて" },
      { role: "assistant", content: "そうなんですね。どんなことでお悩みですか？" },
    ],
    "仕事がうまくいかなくて"
  );
  assert.equal(workTransitionDecision.kind, "reply");
  if (workTransitionDecision.kind === "reply") {
    assert.match(workTransitionDecision.text, /仕事についてお悩みなんですね。仕事運を見てみましょうか？/);
  }

  const repeatedOfftopicDecision = getGuardedChatDecision(
    [
      { role: "assistant", content: "なるほど。相談に戻りましょう。恋愛・仕事など、占いたいテーマはどれですか？" },
    ],
    "生卵"
  );
  assert.equal(repeatedOfftopicDecision.kind, "reply");
  if (repeatedOfftopicDecision.kind === "reply") {
    assert.match(repeatedOfftopicDecision.text, /占いたい内容を一言で教えてください/);
  }
}

run();
console.log("dialogue-transition.test.ts: OK");
