import assert from "node:assert/strict";
import { buildDailyFortunePrompt, buildTarotPrompt } from "../lib/prompt-builder";

function run() {
  const prompt = buildDailyFortunePrompt("2026年2月21日の運勢を占ってください。", [
    { name: "星" },
  ]);

  // Style constraints
  assert.match(prompt, /一人称は必ず「私」を使う/);
  assert.match(prompt, /です\/ます/);
  assert.match(prompt, /「〜わ」は使わない/);
  assert.match(prompt, /1枚引きの結果/);
  assert.match(prompt, /450〜800文字/);
  assert.match(prompt, /第三者として助言/);
  assert.match(prompt, /カードの象徴:/);
  assert.match(prompt, /今日の読み:/);
  assert.match(prompt, /今日の行動ヒント:/);
  assert.match(prompt, /各セクションの前に空行を1つ入れる/);
  assert.match(prompt, /1段落は最大3文まで/);
  assert.match(prompt, /今回出た向きの意味を中心/);
  assert.match(prompt, /具体的な日常の場面/);
  assert.match(prompt, /主語をできるだけ「あなた」に寄せ/);
  assert.match(prompt, /読者に話しかける文体/);
  assert.match(prompt, /ウェイト版カードの絵柄/);
  assert.match(prompt, /逆位置のときは「問いかけ2行 \+ 短い締め1行」/);
  assert.match(prompt, /具体場面 → 感覚 → 行動/);

  const tarotPrompt = buildTarotPrompt("仕事のことで不安です", [{ name: "ソードの5", reversed: true }]);
  assert.match(tarotPrompt, /カードの象徴（2〜3文）/);
  assert.match(tarotPrompt, /今日の行動ヒント（箇条書き2〜3個）/);
  assert.match(tarotPrompt, /450〜800文字/);
  assert.match(tarotPrompt, /今回出た向きの意味を中心/);
  assert.match(tarotPrompt, /具体的な日常の場面/);
  assert.match(tarotPrompt, /主語をできるだけ「あなた」に寄せ/);
  assert.match(tarotPrompt, /問いかけ2行 \+ 短い締め1行/);
  assert.match(tarotPrompt, /体感語/);
}

run();
console.log("prompt-builder.test.ts: OK");
