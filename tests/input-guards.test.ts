import assert from "node:assert/strict";
import {
  isDialogueModeInput,
  isFortuneRequestInput,
  isGreetingOnlyInput,
} from "../lib/input-guards";

function run() {
  const shouldBeGreeting = [
    "こんにちは",
    "こんにちは！",
    "こんばんは",
    "はじめまして",
    "やあ",
    "やぁ…",
    "hello!",
  ];

  for (const sample of shouldBeGreeting) {
    assert.equal(isGreetingOnlyInput(sample), true, `Expected true: ${sample}`);
  }

  const shouldNotBeGreeting = [
    "こんにちは、恋愛運みて",
    "こんばんは 仕事で悩んでます",
    "はじめまして 占ってください",
    "やあ 明日の運勢は？",
    "占ってください",
  ];

  for (const sample of shouldNotBeGreeting) {
    assert.equal(isGreetingOnlyInput(sample), false, `Expected false: ${sample}`);
  }

  assert.equal(isFortuneRequestInput("彼との相性を占って"), true);
  assert.equal(isFortuneRequestInput("こんにちは、恋愛運みて"), true);
  assert.equal(isFortuneRequestInput("私の仕事運を見てもらえませんか？"), true);
  assert.equal(isFortuneRequestInput("仕事運 占って"), true);
  assert.equal(isFortuneRequestInput("お願いします"), true);
  assert.equal(isFortuneRequestInput("見て"), true);
  assert.equal(isFortuneRequestInput("今気になる人がいます"), false);
  assert.equal(isFortuneRequestInput("仕事がうまくいかなくて"), false);

  assert.equal(isDialogueModeInput("今気になる人がいます"), true);
  assert.equal(isDialogueModeInput("不安です"), true);
  assert.equal(isDialogueModeInput("彼との相性を占って"), false);
}

run();
console.log("input-guards.test.ts: OK");
