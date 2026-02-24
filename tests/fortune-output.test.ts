import assert from "node:assert/strict";
import { ensureFortuneOutputFormat } from "../lib/fortune-output";

function run() {
  const formatted = ensureFortuneOutputFormat(
    "今日は仕事の流れに少し整理が必要そうです。優先順位を先に決めると動きやすくなります。",
    [{ name: "世界", reversed: false }]
  );

  assert.match(formatted, /^引いたカード：世界（正位置）/);
  assert.match(formatted, /^\s*-\s+/m);
  assert.doesNotMatch(formatted, /次の一手:/);

  const alreadyFormatted = ensureFortuneOutputFormat(
    "引いたカード：隠者（逆位置）\n今日は抱え込みやすい流れです。相談先を1つ決めると整理しやすくなります。\n- 次の一手: 朝のうちに相談したい内容を3行でメモしてください。",
    [{ name: "隠者", reversed: true }]
  );
  assert.match(alreadyFormatted, /^引いたカード：隠者（逆位置）/);
  assert.equal((alreadyFormatted.match(/次の一手:/g) ?? []).length, 0);
  assert.match(alreadyFormatted, /^\s*-\s+/m);

  const structuredLong = ensureFortuneOutputFormat(
    [
      "引いたカード：ソードの5（逆位置）",
      "カードの象徴:",
      "ソードの5は、言葉や主張のぶつかり合い、勝ち負けへのこだわり、気まずさの残るやり取りを象徴しやすいカードです。逆位置では、その緊張が少しほどけはじめ、意地を張り続けるよりも関係修復や距離の取り方を見直す流れを示すことがあります。",
      "今日の読み:",
      "今日は、白黒を急いで決めるよりも、言い方やタイミングを整えることで空気が変わる場面がありそうです。仕事や人間関係では、相手の反応をそのまま敵意と決めつけず、疲れや余裕のなさが出ている可能性も含めて見ると読み違いが減るかもしれません。自分の中でも「正しさを通したい気持ち」と「穏やかに進めたい気持ち」が揺れやすいため、先に着地点を小さく決めると消耗を抑えやすいでしょう。",
      "注意点:",
      "謝るか反論するかをその場で決めきれない時は、短く保留にしてから言葉を選び直すほうが流れを整えやすいです。無理に結論を急がないことも有効です。",
      "今日の行動ヒント:",
      "- 返答前に10秒だけ間を置き、言葉を一段やわらかくする",
      "- 争点を1つに絞って話す",
      "- 今日は勝ち負けより後味の良さを優先する",
      "ひと言:",
      "ほどく方向に意識を向けるほど、今日の空気は静かに整っていきやすいでしょう。",
    ].join("\n"),
    [{ name: "ソードの5", reversed: true }]
  );
  assert.ok(structuredLong.length >= 450, `too short: ${structuredLong.length}`);
  assert.match(structuredLong, /カードの象徴:/);
  assert.match(structuredLong, /今日の行動ヒント:/);
  assert.match(structuredLong, /^\s*-\s+/m);

  const yasuiHeavy = ensureFortuneOutputFormat(
    [
      "引いたカード：星（正位置）",
      "カードの象徴:",
      "このカードは希望が見えやすい局面と、気持ちが整いやすい流れを示しやすいカードです。",
      "今日の読み:",
      "人と話すと本音が出やすいので、予定を詰めすぎると疲れやすいかもしれません。小さな確認を入れると進めやすいです。",
      "今日の行動ヒント:",
      "- 深呼吸する",
      "- 優先順位を1つ決める",
      "ひと言:",
      "落ち着いて進めると良い流れに乗りやすい日です。",
    ].join("\n"),
    [{ name: "星", reversed: false }]
  );
  assert.ok((yasuiHeavy.match(/やすい/g) ?? []).length <= 1, yasuiHeavy);

  const academicTone = ensureFortuneOutputFormat(
    [
      "引いたカード：節制（正位置）",
      "カードの象徴:",
      "バランスを取ることが大切です。調整の傾向があります。",
      "今日の読み:",
      "相手の反応を見ながら進める必要です。慎重に進める可能性があります。",
      "今日の行動ヒント:",
      "- 先に予定を1つ減らす",
      "- 会話の速度を落とす",
      "ひと言:",
      "自分を大切にすることが大切です。",
    ].join("\n"),
    [{ name: "節制", reversed: false }]
  );
  assert.doesNotMatch(academicTone, /ことが大切です/);
  assert.doesNotMatch(academicTone, /傾向があります/);
  assert.doesNotMatch(academicTone, /可能性があります/);

  const abstractClosing = ensureFortuneOutputFormat(
    [
      "引いたカード：月（正位置）",
      "カードの象徴:",
      "月は曖昧さを映します。",
      "今日の読み:",
      "結論を急がないほうが良い日です。",
      "今日の行動ヒント:",
      "- 返事を少し遅らせる",
      "- 事実確認を1つ増やす",
      "ひと言:",
      "慎重さが大切です。",
    ].join("\n"),
    [{ name: "月", reversed: false }]
  );
  const lastNonBulletLine = abstractClosing
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("- "))
    .slice(-1)[0];
  assert.ok(lastNonBulletLine, abstractClosing);
  assert.doesNotMatch(lastNonBulletLine, /(大切|重要|傾向|可能性|必要)(です|があります)?。?$/);

  const readability = ensureFortuneOutputFormat(
    [
      "引いたカード：星（正位置）",
      "カードの象徴:",
      "星は希望を示します。静かな回復も示します。先を照らす光も表します。焦りをゆるめる合図でもあります。",
      "今日の読み:",
      "午前は少し重くても、午後にかけて気持ちがほどけます。人と話すと整理が進みます。言葉にすると自分の本音が見えます。予定を詰めすぎると疲れます。",
      "注意点:",
      "良い流れを急いで結論に変えないでください。",
      "今日の行動ヒント:",
      "- 予定を1つ減らす",
      "- 10分だけ外の空気を吸う",
      "ひと言:",
      "今日は静かなほうを選んでください。",
    ].join("\n"),
    [{ name: "星", reversed: false }]
  );
  assert.match(readability, /引いたカード：[^\n]+\n\nカードの象徴:/);
  assert.match(readability, /注意点:\n[^\n]+\n\n今日の行動ヒント:/);
  assert.match(readability, /今日の行動ヒント:\n\n- /);
  assert.match(readability, /カードの象徴:\n[^\n]+\n[^\n]+/);

  const mimeticControlled = ensureFortuneOutputFormat(
    [
      "引いたカード：恋人（正位置）",
      "カードの象徴:",
      "きらきらした印象が出るカードです。",
      "今日の読み:",
      "朝はもやもやしても、会話の中でじんわりほどけます。気持ちを言葉にすると流れが見えます。",
      "注意点:",
      "ざわざわした気持ちのまま返事を急がないでください。",
      "今日の行動ヒント:",
      "- ビビッと決めない",
      "- ふわっと濁さず一言で伝える",
      "ひと言:",
      "ぽかぽかした時間を選んでください。",
    ].join("\n"),
    [{ name: "恋人", reversed: false }]
  );

  const lines = mimeticControlled.split("\n");
  const readingStart = lines.findIndex((l) => l.trim() === "今日の読み:");
  const warningStart = lines.findIndex((l) => l.trim() === "注意点:");
  const readingBody = lines.slice(readingStart + 1, warningStart).join("\n");
  const outsideReading = lines
    .filter((_, idx) => idx <= readingStart || idx >= warningStart)
    .join("\n");
  const mimeticPattern = /(ふわっと|じんわり|ぽかぽか|ざわざわ|もやもや|ぎゅっと|きらきら|ビビッと)/g;

  assert.ok((readingBody.match(mimeticPattern) ?? []).length <= 1, mimeticControlled);
  assert.equal((outsideReading.match(mimeticPattern) ?? []).length, 0, mimeticControlled);

  const uprightNoReverseGeneral = ensureFortuneOutputFormat(
    [
      "引いたカード：世界（正位置）",
      "カードの象徴:",
      "正位置では達成を示します。逆位置では停滞を示すことがあります。今回は区切りの場面です。",
      "今日の読み:",
      "一区切りつけやすい日です。",
      "今日の行動ヒント:",
      "- 仕上げを1つ終える",
      "ひと言:",
      "今日は区切りをつけてください。",
    ].join("\n"),
    [{ name: "世界", reversed: false }]
  );
  assert.doesNotMatch(uprightNoReverseGeneral, /逆位置では/);

  const reversedNoUprightGeneral = ensureFortuneOutputFormat(
    [
      "引いたカード：月（逆位置）",
      "カードの象徴:",
      "逆位置では霧が晴れる流れです。正位置では不安が広がる場面もあります。今回は確認を重ねると整います。",
      "今日の読み:",
      "急がず進めるとよいでしょう。",
      "今日の行動ヒント:",
      "- 事実確認を1つ増やす",
      "ひと言:",
      "今日は静かな手順を選んでください。",
    ].join("\n"),
    [{ name: "月", reversed: true }]
  );
  assert.doesNotMatch(reversedNoUprightGeneral, /正位置では/);
  assert.match(reversedNoUprightGeneral, /(？|\?|ませんか)/);

  const concreteExampleAdded = ensureFortuneOutputFormat(
    [
      "引いたカード：隠者（正位置）",
      "カードの象徴:",
      "静かに考える時間を示すカードです。",
      "今日の読み:",
      "気持ちを整えると見通しが出ます。焦らず進めると落ち着きます。",
      "注意点:",
      "考え込みすぎないでください。",
      "今日の行動ヒント:",
      "- 休む時間を取る",
      "ひと言:",
      "今日は静かなほうを選んでください。",
    ].join("\n"),
    [{ name: "隠者", reversed: false }]
  );
  const todayReadingBlock = concreteExampleAdded
    .split("\n")
    .slice(
      concreteExampleAdded.split("\n").findIndex((l) => l.trim() === "今日の読み:") + 1,
      concreteExampleAdded.split("\n").findIndex((l) => l.trim() === "注意点:")
    )
    .join("\n");
  assert.match(
    todayReadingBlock,
    /(たとえば|例えば|場面|返事|会話|連絡|予定|職場|学校|メッセージ|電話|一言|1つ|ひとつ)/
  );
  assert.doesNotMatch(concreteExampleAdded, /次の一手:/);

  const secondPersonInserted = ensureFortuneOutputFormat(
    [
      "引いたカード：戦車（正位置）",
      "カードの象徴:",
      "前進のカードです。",
      "今日の読み:",
      "予定が重なっても順番を決めると進みます。朝の連絡は短くまとめると流れが整います。",
      "注意点:",
      "急ぎすぎないでください。",
      "今日の行動ヒント:",
      "- 先に順番を決める",
      "ひと言:",
      "今日は一歩ずつ進めてください。",
    ].join("\n"),
    [{ name: "戦車", reversed: false }]
  );
  const secondTodayLines = secondPersonInserted.split("\n");
  const secondTodayStart = secondTodayLines.findIndex((l) => l.trim() === "今日の読み:");
  const secondWarningStart = secondTodayLines.findIndex((l) => l.trim() === "注意点:");
  const secondToday = secondTodayLines.slice(secondTodayStart + 1, secondWarningStart).join("\n");
  assert.match(secondToday, /今のあなたは、気持ちを整えながら進む場面にいます。/);

  const secondPersonAlreadyPresent = ensureFortuneOutputFormat(
    [
      "引いたカード：力（正位置）",
      "カードの象徴:",
      "落ち着いた強さのカードです。",
      "今日の読み:",
      "あなたは今日は焦らず進めるとまとまります。会話の前に一呼吸入れると流れが整います。",
      "注意点:",
      "無理に抱え込まないでください。",
      "今日の行動ヒント:",
      "- 返事の前に深呼吸する",
      "ひと言:",
      "今日は静かな言葉を選んでください。",
    ].join("\n"),
    [{ name: "力", reversed: false }]
  );
  const alreadyTodayLines = secondPersonAlreadyPresent.split("\n");
  const alreadyTodayStart = alreadyTodayLines.findIndex((l) => l.trim() === "今日の読み:");
  const alreadyWarningStart = alreadyTodayLines.findIndex((l) => l.trim() === "注意点:");
  const alreadyToday = alreadyTodayLines.slice(alreadyTodayStart + 1, alreadyWarningStart).join("\n");
  assert.equal(
    (alreadyToday.match(/今のあなたは、気持ちを整えながら進む場面にいます。/g) ?? []).length,
    0
  );

  const dokittoAdded = ensureFortuneOutputFormat(
    [
      "引いたカード：女教皇（正位置）",
      "カードの象徴:",
      "静かな観察を示すカードです。",
      "今日の読み:",
      "今のあなたは、気持ちを整えながら進む場面にいます。返信前に一度読み返すと、言葉の温度が整います。",
      "注意点:",
      "結論を急がないでください。",
      "今日の行動ヒント:",
      "- 返信前に一度読み返す",
      "ひと言:",
      "今日は静かな言葉を選んでください。",
    ].join("\n"),
    [{ name: "女教皇", reversed: false }]
  );
  const dokittoLines = dokittoAdded.split("\n");
  const dokittoTodayStart = dokittoLines.findIndex((l) => l.trim() === "今日の読み:");
  const dokittoWarningStart = dokittoLines.findIndex((l) => l.trim() === "注意点:");
  const dokittoToday = dokittoLines.slice(dokittoTodayStart + 1, dokittoWarningStart).join("\n");
  assert.match(dokittoToday, /ドキッ/);
  assert.match(dokittoAdded, /^\s*-\s+/m);

  const kamoshiLimited = ensureFortuneOutputFormat(
    [
      "引いたカード：月（正位置）",
      "カードの象徴:",
      "曖昧さが出るかもしれません。心の揺れが見えるかもしれません。",
      "今日の読み:",
      "今のあなたは状況を見直す場面にいるかもしれません。返事を急ぐとかみ合わないかもしれません。確認を増やすと整います。",
      "注意点:",
      "思い込みで決めるとかすれるかもしれません。声の強さで押すと空気が固まるかもしれません。",
      "今日の行動ヒント:",
      "- 返事の前に確認を1つ増やす",
      "- 今夜は予定を詰めすぎない",
      "ひと言:",
      "今日は静かな順番を選んでください。",
    ].join("\n"),
    [{ name: "月", reversed: false }]
  );
  for (const section of ["カードの象徴:", "今日の読み:", "注意点:"] as const) {
    const linesK = kamoshiLimited.split("\n");
    const start = linesK.findIndex((l) => l.trim() === section);
    const next = linesK.findIndex((l, idx) => idx > start && /^(カードの象徴|今日の読み|注意点|今日の行動ヒント|ひと言):/.test(l.trim()));
    const end = next === -1 ? linesK.length : next;
    const block = linesK.slice(start + 1, end).join("\n");
    assert.ok((block.match(/かもしれません/g) ?? []).length <= 1, `${section}\n${block}`);
  }
}

run();
console.log("fortune-output.test.ts: OK");
