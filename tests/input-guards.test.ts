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
    "hello!",
  ];

  for (const sample of shouldBeGreeting) {
    assert.equal(isGreetingOnlyInput(sample), true, `Expected greeting: ${sample}`);
  }

  const shouldNotBeGreeting = [
    "こんにちは、恋愛みて",
    "こんばんは 仕事で悩んでます",
    "はじめまして 占ってください",
    "やあ 今日の運勢は？",
    "みて",
  ];

  for (const sample of shouldNotBeGreeting) {
    assert.equal(isGreetingOnlyInput(sample), false, `Expected non-greeting: ${sample}`);
  }

  const shortThemeIntents = [
    "恋愛みて",
    "仕事みて",
    "金運は？",
    "けっこん運",
    "結婚運",
  ];
  for (const sample of shortThemeIntents) {
    assert.equal(isFortuneRequestInput(sample), true, `Expected short intent: ${sample}`);
  }

  assert.equal(isFortuneRequestInput("最近なんだか不安です"), false);
  assert.equal(isFortuneRequestInput("仕事がうまくいかなくて"), false);

  assert.equal(isDialogueModeInput("最近なんだか不安です"), true);
  assert.equal(isDialogueModeInput("恋愛みて"), false);
  assert.equal(isDialogueModeInput("仕事みて"), false);
}

run();
console.log("input-guards.test.ts: OK");
