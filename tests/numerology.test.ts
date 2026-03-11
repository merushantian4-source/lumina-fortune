import assert from "node:assert/strict";
import { buildMonthlyDailyNumberFortunes, dayEnergyNumberFromDate } from "../lib/fortune/daily-number-fortunes";
import { getMoonPhaseForDateKey } from "../lib/moon-phase";
import { destinyNumberFromBirthdate } from "../lib/numerology";

const SEASONAL_MARKERS = ["春", "初夏", "夏", "秋", "冬", "季節", "風", "光", "若葉", "実り"];
const ADVERB_MARKERS = ["そっと", "静かに", "やわらかく", "ゆるやかに", "軽やかに", "自然に", "穏やかに", "しなやかに", "ふわりと", "じわりと", "ほどよく"];
const ENDING_MARKERS = ["かも", "予感", "気配", "瞬間", "ヒント", "兆し", "きっかけ", "流れ", "そう", "整う"];

function leadingChunk(text: string) {
  return text.slice(0, 8);
}

function findAdverb(text: string) {
  return ADVERB_MARKERS.find((marker) => text.includes(marker)) ?? null;
}

function endingType(text: string) {
  return ENDING_MARKERS.find((marker) => text.endsWith(marker)) ?? text.slice(-4);
}

function run() {
  assert.equal(destinyNumberFromBirthdate("1990-12-25"), 2);
  assert.equal(destinyNumberFromBirthdate("2001-01-01"), 5);
  assert.equal(destinyNumberFromBirthdate("1988-08-08"), 6);
  assert.equal(destinyNumberFromBirthdate("1975-11-30"), 9);
  assert.equal(dayEnergyNumberFromDate("2026-03-11"), 6);
  assert.equal(dayEnergyNumberFromDate("2026-01-01"), 3);

  for (const sample of ["1990-12-25", "2026-01-01", "1964-02-29"]) {
    const value = destinyNumberFromBirthdate(sample);
    assert.ok(value >= 1 && value <= 9, `${sample} => ${value}`);
  }

  const marchFortunes = buildMonthlyDailyNumberFortunes({
    year: 2026,
    month: 3,
    destinyNumber: 4,
  });

  assert.equal(marchFortunes.length, 31);
  assert.equal(marchFortunes[10]?.date, "2026-03-11");
  assert.equal(marchFortunes[10]?.dayNumber, 6);
  assert.equal(marchFortunes[10]?.flowLevel, 2);
  assert.equal(marchFortunes[10]?.title, "安定の慈しみの輪");
  assert.ok((marchFortunes[10]?.headline ?? "").length >= 20);
  assert.ok((marchFortunes[10]?.headline ?? "").length <= 36);
  assert.doesNotMatch(marchFortunes[10]?.headline ?? "", /日$/);
  assert.doesNotMatch(marchFortunes[10]?.headline ?? "", /刻/);
  assert.doesNotMatch(marchFortunes[10]?.headline ?? "", /\d+月\d+/);
  assert.match(marchFortunes[10]?.summary ?? "", /愛情や気遣いがやわらかく巡りやすい流れです。/);
  assert.match(marchFortunes[10]?.action ?? "", /今日の流れをあなたらしく扱えます。/);
  assert.match(marchFortunes[10]?.emotion ?? "", /余白も同じくらい必要です。/);
  assert.deepEqual(marchFortunes[10]?.tags, ["愛情", "循環", "堅実", "信頼"]);

  const yearlyHeadlines = new Set<string>();
  const orderedHeadlines: string[] = [];
  for (let month = 1; month <= 12; month += 1) {
    for (const fortune of buildMonthlyDailyNumberFortunes({
      year: 2026,
      month,
      destinyNumber: 1,
    })) {
      yearlyHeadlines.add(fortune.headline);
      orderedHeadlines.push(fortune.headline);
    }
  }
  assert.equal(yearlyHeadlines.size, 365);

  let seasonalCount = 0;
  let adverbCount = 0;
  let sameLeadingChunkRun = 1;
  for (let index = 0; index < orderedHeadlines.length; index += 1) {
    const current = orderedHeadlines[index]!;
    assert.ok(current.length >= 20 && current.length <= 36, `${index + 1}: ${current} (${current.length})`);
    assert.doesNotMatch(current, /日$/);
    assert.doesNotMatch(current, /刻/, current);
    assert.doesNotMatch(current, /\d+月\d+/, current);
    assert.equal((current.match(/[。！？!?]/g) ?? []).length, 0, current);
    if (SEASONAL_MARKERS.some((marker) => current.includes(marker))) {
      seasonalCount += 1;
    }
    const currentAdverb = findAdverb(current);
    if (currentAdverb) {
      adverbCount += 1;
      assert.doesNotMatch(current, new RegExp(`${currentAdverb}$`), current);
    }

    if (index > 0) {
      const previous = orderedHeadlines[index - 1]!;
      assert.notEqual(current, previous);
      assert.notEqual(endingType(current), endingType(previous), `${previous} -> ${current}`);
      sameLeadingChunkRun = leadingChunk(current) === leadingChunk(previous) ? sameLeadingChunkRun + 1 : 1;
      assert.ok(sameLeadingChunkRun < 3, `${previous} -> ${current}`);
      const previousAdverb = findAdverb(previous);
      if (currentAdverb && previousAdverb) {
        assert.notEqual(currentAdverb, previousAdverb, `${previous} -> ${current}`);
      }
    }
  }
  assert.ok(seasonalCount <= 100, `seasonal count: ${seasonalCount}`);
  assert.ok(adverbCount <= Math.floor(orderedHeadlines.length * 0.3), `adverb count: ${adverbCount}`);

  const allFortunes2026 = Array.from({ length: 12 }, (_, monthIndex) =>
    buildMonthlyDailyNumberFortunes({
      year: 2026,
      month: (monthIndex + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
      destinyNumber: 3,
    })
  ).flat();

  for (const fortune of allFortunes2026) {
    const phase = getMoonPhaseForDateKey(fortune.date).majorPhase;
    if (!phase) continue;
    assert.ok(fortune.headline.length >= 20, `${fortune.date} ${phase} ${fortune.headline}`);
  }

  assert.throws(() => destinyNumberFromBirthdate("1990/12/25"));
  assert.throws(() => destinyNumberFromBirthdate("1990-1-2"));
  assert.throws(() => dayEnergyNumberFromDate("2026/03/11"));
}

run();
console.log("numerology.test.ts: OK");
