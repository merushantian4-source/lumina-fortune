/**
 * Monthly fortune content rewrite script.
 *
 * Generates improved monthly fortune text for all 108 patterns (12 months × 9 numbers)
 * using Claude, then outputs to a new TS data file for review.
 *
 * Usage:
 *   npx tsx scripts/generate-monthly-content.ts
 *   npx tsx scripts/generate-monthly-content.ts --month 3          # single month
 *   npx tsx scripts/generate-monthly-content.ts --month 3 --num 5  # single pattern
 *   npx tsx scripts/generate-monthly-content.ts --dry-run           # preview prompt only
 *
 * Output:
 *   lib/fortune/monthly-rewritten-overrides.ts
 *
 * The output file is NOT auto-connected to production.
 * To activate, import it in monthly-templates.ts and merge into monthlyOverrides.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

// ── Types ──

type FortuneNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type FortuneMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type TemplateFields = {
  introTitle: string;
  introBody: string;
  themeCatch: string;
  firstHalf: string;
  secondHalf: string;
  loveSingle: string;
  lovePartner: string;
  work: string;
  relations: string;
  actions: [string, string, string];
  powerSpots: [string, string, string];
  keywords: [string, string, string];
  blessing: string;
};

// ── Reference data ──

const NUMBER_NAMES: Record<FortuneNumber, string> = {
  1: "はじまりの灯火",
  2: "月影の調律者",
  3: "星語りの歌い手",
  4: "大地の守り手",
  5: "風渡りの旅人",
  6: "愛の灯を守る人",
  7: "静寂の観測者",
  8: "光冠の実現者",
  9: "祈りの継ぎ手",
};

const NUMBER_CORES: Record<FortuneNumber, string> = {
  1: "決める力と先頭に立つ推進力",
  2: "空気を読み、相手に合わせる調整力",
  3: "言葉と感性で人を明るくする表現力",
  4: "丁寧に積み上げ、形にする持続力",
  5: "変化を楽しみ、流れを読む行動力",
  6: "人をあたため、育てる包容力",
  7: "深く考え、本質を見抜く洞察力",
  8: "目標に向かい、現実を動かす実行力",
  9: "全体を見渡し、手放しながら整える力",
};

const MONTH_THEMES: Record<FortuneMonth, { season: string; focus: string }> = {
  1: { season: "年始", focus: "準備と宣言" },
  2: { season: "冬の深まり", focus: "調整と見直し" },
  3: { season: "春の入口", focus: "再始動" },
  4: { season: "新生活", focus: "習慣化" },
  5: { season: "伸びる季節", focus: "挑戦" },
  6: { season: "前半の節目", focus: "関係性の整理" },
  7: { season: "夏の集中期", focus: "内省と深掘り" },
  8: { season: "実りの手前", focus: "成果化" },
  9: { season: "転換の気配", focus: "手放しと再編" },
  10: { season: "収穫期", focus: "評価と定着" },
  11: { season: "整えの月", focus: "回復と最終調整" },
  12: { season: "年末", focus: "完了と感謝" },
};

// ── High-quality reference examples (from priority overrides) ──

const STYLE_REFERENCE = `
=== 高品質な参考例（運命数8「光冠の実現者」の1月） ===

introTitle: "現実を動かす力を、静かに整える1月"
introBody: "1月は、今年の目標を現実の形へ落とし込んでいくための土台づくりの月です。気持ちが前に出やすい時期ですが、勢いだけで進むより、条件や順番を整えた方が結果は安定します。\\n\\n大きく見せるより、確かな一歩を選ぶこと。今月はその落ち着きが、あとから大きな強さになります。"
themeCatch: "強く進む前に、続く形へ整える"
firstHalf: "前半は、目標や予定を具体化する場面が増えやすい時期です。やるべきことは見えているのに、全部を一度に動かしたくなるかもしれません。\\n\\n- 前半の鍵：優先順位を先に決める\\n- 意識したい姿勢：今すぐ必要なことだけを選ぶ\\n- 行動：今年前半の目標を3つ以内に絞る"
secondHalf: "後半は、前半に整えた基準がそのまま判断力になります。周囲から頼られる場面でも、無理に全部を引き受けず、進め方を示すだけで十分です。\\n\\n- 伸びる行動：条件整理、役割分担、期限の確認\\n- 注意点：焦りから言い方が強くなること\\n- 月末の整え方：続けることとやめることを分ける"
loveSingle: "出会いは、仕事や学び、目標意識の近い人との会話の中で育ちやすい1月です。肩書きや見え方だけでなく、話したあとの落ち着きを大切にしてみてください。\\n\\n- 出会いやすい場面：勉強会、仕事関係、紹介\\n- 行動のヒント：自分の考えを短くまっすぐ伝える\\n- 注意点：条件だけで結論を急がない"
lovePartner: "関係を安定させるには、今年の過ごし方を少し現実的に話しておくのが有効です。理想だけでなく、時間やお金の使い方にも触れると安心感が深まります。\\n\\n- 会話テーマ：今年の優先順位、生活の整え方\\n- すれ違い回避：指摘より相談の形で話す\\n- 愛情表現：頼もしさを行動で見せる"
work: "仕事・学業では、成果を急ぐより仕組みを整えるほど伸びやすい1月です。段取り、基準、判断軸を先に固めておくと、その後の動きがかなり楽になります。\\n\\n- 伸ばしたい点：計画性と実行管理\\n- 追い風の時期：中旬以降\\n- 行動：判断基準を言葉にして共有する"
relations: "人間関係では、頼られやすい分だけ背負い込みすぎに注意したい月です。力を出す場面を選ぶことで、関係も自分も守りやすくなります。\\n\\n- 距離感のコツ：責任の範囲を先に決める\\n- 伝え方：結論を急がず、目的を添える\\n- 注意点：正しさだけで押し切らない"
actions: ["今年前半の目標を紙に書いて見える場所へ置く", "予定を詰める前に、休む日を先に決める", "よく使う道具を1つ整えて手入れする"]
powerSpots: ["見晴らしのよい場所", "静かなワークスペース", "朝の空気がきれいな散歩道"]
keywords: ["基盤", "判断", "継続"]
blessing: "あなたの強さは、勢いだけではなく、現実を動かす手つきの確かさにもあります。\\n今月は急がず整えるほど、春からの流れがぐっと安定していきます。"

=== 参考例2（運命数2「月影の調律者」の2月） ===

introTitle: "やさしさの置き場所を整える2月"
introBody: "2月は、人に合わせる力が自然と働きやすい一方で、自分の疲れには気づきにくい月です。相手を思う気持ちは大切ですが、それだけで予定を埋めてしまうと、心の余白が先に減ってしまいます。\\n\\n今月は、やさしさに少しだけ順番をつけること。それだけで毎日の過ごしやすさが変わってきます。"
themeCatch: "やさしさに境界線を添えて、心を守る"
blessing: "無理をしなくても、あなたのやさしさは届いています。\\n今月は、自分を後回しにしない選び方が、そのまま関係の安心感につながります。"
`;

// ── Prompt builder ──

function buildPrompt(month: FortuneMonth, num: FortuneNumber): string {
  const name = NUMBER_NAMES[num];
  const core = NUMBER_CORES[num];
  const theme = MONTH_THEMES[month];

  return `あなたは白の魔女ルミナの声で、月運占いのテキストを書きます。

対象：運命数${num}「${name}」の${month}月の月運
運命数の本質：${core}
${month}月のテーマ：${theme.season}、${theme.focus}

以下の参考例と同じ品質・構造・トーンで、${month}月×運命数${num}のオリジナル月運テキストを生成してください。

${STYLE_REFERENCE}

【重要なルール】
1. 参考例の文体・トーン・構造を踏襲すること（やさしく、具体的で、押しつけがましくない）
2. 参考例の内容をコピーしない。この運命数と月にオリジナルな内容を書くこと
3. introBodyは2段落（\\n\\nで区切る）
4. firstHalf / secondHalf は冒頭の説明文＋箇条書き3項目（- 記号で始まる）
5. loveSingle / lovePartner / work / relations も冒頭の説明文＋箇条書き3項目
6. 箇条書きの見出しは参考例に揃える（「前半の鍵」「意識したい姿勢」「行動」「伸びる行動」「注意点」等）
7. actionsは具体的な日常行動3つ
8. powerSpotsは場所3つ
9. keywordsは漢字1〜2文字のキーワード3つ
10. blessingは2行（\\nで区切る）。あたたかく、でも短く。
11. introTitleは「〜${month}月」で終わる短い詩的なタイトル
12. themeCatchは1文の短いフレーズ
13. テンプレート的な穴埋め感を出さない。「○月は△△の空気が流れやすく」のような機械的表現は禁止
14. 25〜54歳の女性に届く品格と共感性を重視する
15. 断定しすぎない。可能性として寄り添って伝える

出力は以下のJSON形式のみ。説明文やコードブロック記法は不要：
{
  "introTitle": "...",
  "introBody": "...",
  "themeCatch": "...",
  "firstHalf": "...",
  "secondHalf": "...",
  "loveSingle": "...",
  "lovePartner": "...",
  "work": "...",
  "relations": "...",
  "actions": ["...", "...", "..."],
  "powerSpots": ["...", "...", "..."],
  "keywords": ["...", "...", "..."],
  "blessing": "..."
}`;
}

// ── Claude API caller ──

async function generateOne(
  client: Anthropic,
  month: FortuneMonth,
  num: FortuneNumber,
): Promise<TemplateFields> {
  const prompt = buildPrompt(month, num);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`No JSON found in response for month=${month} num=${num}`);
  }

  const parsed = JSON.parse(jsonMatch[0]) as TemplateFields;

  // Validate required fields
  const required: (keyof TemplateFields)[] = [
    "introTitle", "introBody", "themeCatch", "firstHalf", "secondHalf",
    "loveSingle", "lovePartner", "work", "relations",
    "actions", "powerSpots", "keywords", "blessing",
  ];
  for (const key of required) {
    if (!parsed[key]) {
      throw new Error(`Missing field "${key}" for month=${month} num=${num}`);
    }
  }
  if (!Array.isArray(parsed.actions) || parsed.actions.length !== 3) {
    throw new Error(`actions must be array of 3 for month=${month} num=${num}`);
  }
  if (!Array.isArray(parsed.powerSpots) || parsed.powerSpots.length !== 3) {
    throw new Error(`powerSpots must be array of 3 for month=${month} num=${num}`);
  }
  if (!Array.isArray(parsed.keywords) || parsed.keywords.length !== 3) {
    throw new Error(`keywords must be array of 3 for month=${month} num=${num}`);
  }

  return parsed;
}

// ── Output builder ──

function escapeTS(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function buildOutputTS(
  results: Map<string, TemplateFields>,
): string {
  const lines: string[] = [];
  lines.push('import type { FortuneMonth, FortuneNumber, FortuneTemplate } from "@/lib/fortune/types";');
  lines.push('import { DEFAULT_MONTHLY_LUMINA_MESSAGE } from "@/lib/fortune/monthly-lumina-message";');
  lines.push("");
  lines.push("/**");
  lines.push(` * Auto-generated monthly fortune content rewrite.`);
  lines.push(` * Generated at: ${new Date().toISOString()}`);
  lines.push(` *`);
  lines.push(` * To activate: import this in monthly-templates.ts and merge into monthlyOverrides.`);
  lines.push(` * To rollback: remove the import and revert to the original overrides.`);
  lines.push(" */");
  lines.push("");
  lines.push("type MonthlyMap = Partial<Record<FortuneNumber, FortuneTemplate>>;");
  lines.push("");
  lines.push("export const rewrittenMonthlyOverrides: Partial<Record<FortuneMonth, MonthlyMap>> = {");

  // Group by month
  const byMonth = new Map<number, Map<number, TemplateFields>>();
  for (const [key, fields] of results) {
    const [m, n] = key.split("-").map(Number);
    if (!byMonth.has(m)) byMonth.set(m, new Map());
    byMonth.get(m)!.set(n, fields);
  }

  const sortedMonths = [...byMonth.keys()].sort((a, b) => a - b);
  for (const month of sortedMonths) {
    lines.push(`  ${month}: {`);
    const nums = byMonth.get(month)!;
    const sortedNums = [...nums.keys()].sort((a, b) => a - b);
    for (const num of sortedNums) {
      const f = nums.get(num)!;
      lines.push(`    ${num}: {`);
      lines.push(`      fortuneNumber: ${num} as FortuneNumber,`);
      lines.push(`      introTitle: "${escapeTS(f.introTitle)}",`);
      lines.push(`      manualOverride: true,`);
      lines.push(`      luminaMessage: DEFAULT_MONTHLY_LUMINA_MESSAGE,`);
      lines.push(`      introBody: "${escapeTS(f.introBody)}",`);
      lines.push(`      themeCatch: "${escapeTS(f.themeCatch)}",`);
      lines.push(`      firstHalf: "${escapeTS(f.firstHalf)}",`);
      lines.push(`      secondHalf: "${escapeTS(f.secondHalf)}",`);
      lines.push(`      loveSingle: "${escapeTS(f.loveSingle)}",`);
      lines.push(`      lovePartner: "${escapeTS(f.lovePartner)}",`);
      lines.push(`      work: "${escapeTS(f.work)}",`);
      lines.push(`      relations: "${escapeTS(f.relations)}",`);
      lines.push(`      actions: [`);
      for (const a of f.actions) {
        lines.push(`        "${escapeTS(a)}",`);
      }
      lines.push(`      ],`);
      lines.push(`      powerSpots: [`);
      for (const p of f.powerSpots) {
        lines.push(`        "${escapeTS(p)}",`);
      }
      lines.push(`      ],`);
      lines.push(`      keywords: [`);
      for (const k of f.keywords) {
        lines.push(`        "${escapeTS(k)}",`);
      }
      lines.push(`      ],`);
      lines.push(`      blessing: "${escapeTS(f.blessing)}",`);
      lines.push(`    },`);
    }
    lines.push(`  },`);
  }

  lines.push("};");
  lines.push("");
  return lines.join("\n");
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2);
  const forceUnlock = args.includes("--force");
  const dryRun = args.includes("--dry-run");

  // ── ロック: 全108パターン生成済み。再生成を防止 ──
  if (!forceUnlock && !dryRun) {
    console.error("ERROR: Monthly fortune content is LOCKED (all 108 patterns generated and deployed).");
    console.error("To force regeneration, run with --force flag.");
    process.exit(1);
  }
  const monthIdx = args.indexOf("--month");
  const numIdx = args.indexOf("--num");
  const targetMonth = monthIdx >= 0 ? Number(args[monthIdx + 1]) : null;
  const targetNum = numIdx >= 0 ? Number(args[numIdx + 1]) : null;

  if (dryRun) {
    const m = (targetMonth ?? 1) as FortuneMonth;
    const n = (targetNum ?? 7) as FortuneNumber;
    console.log("=== DRY RUN: Prompt preview ===\n");
    console.log(buildPrompt(m, n));
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is required.");
    console.error("Set it in .env.local or export it before running.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  const results = new Map<string, TemplateFields>();

  // Build the list of (month, num) pairs to generate
  const pairs: [FortuneMonth, FortuneNumber][] = [];
  const months: FortuneMonth[] = targetMonth
    ? [targetMonth as FortuneMonth]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const nums: FortuneNumber[] = targetNum
    ? [targetNum as FortuneNumber]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (const m of months) {
    for (const n of nums) {
      pairs.push([m, n]);
    }
  }

  console.log(`Generating ${pairs.length} monthly fortune pattern(s)...\n`);

  // Load existing progress if available
  const progressPath = path.join(__dirname, ".monthly-gen-progress.json");
  let existingProgress: Record<string, TemplateFields> = {};
  try {
    existingProgress = JSON.parse(fs.readFileSync(progressPath, "utf-8"));
    console.log(`Loaded ${Object.keys(existingProgress).length} existing results from progress file.\n`);
  } catch {
    // No progress file yet
  }

  // Restore existing progress
  for (const [key, val] of Object.entries(existingProgress)) {
    const [m, n] = key.split("-").map(Number);
    if (months.includes(m as FortuneMonth) && nums.includes(n as FortuneNumber)) {
      results.set(key, val);
    }
  }

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const [m, n] of pairs) {
    const key = `${m}-${n}`;

    if (results.has(key)) {
      skipped++;
      continue;
    }

    const label = `${m}月 × ${NUMBER_NAMES[n]}(${n})`;
    process.stdout.write(`  [${generated + skipped + errors + 1}/${pairs.length}] ${label}...`);

    try {
      const fields = await generateOne(client, m, n);
      results.set(key, fields);
      generated++;

      // Save progress after each successful generation
      const progressData: Record<string, TemplateFields> = { ...existingProgress };
      for (const [k, v] of results) progressData[k] = v;
      fs.writeFileSync(progressPath, JSON.stringify(progressData, null, 2), "utf-8");

      console.log(" OK");

      // Rate limit: wait 1s between requests
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      errors++;
      console.log(` ERROR: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} skipped (from progress), ${errors} errors.`);

  if (results.size === 0) {
    console.log("No results to write.");
    return;
  }

  // Write output file with ALL progress (not just current filtered results)
  const allResults = new Map<string, TemplateFields>();
  for (const [k, v] of Object.entries(existingProgress)) allResults.set(k, v);
  for (const [k, v] of results) allResults.set(k, v);

  const outputPath = path.resolve(__dirname, "../lib/fortune/monthly-rewritten-overrides.ts");
  const output = buildOutputTS(allResults);
  fs.writeFileSync(outputPath, output, "utf-8");
  console.log(`\nOutput written to: ${outputPath}`);
  console.log(`Patterns in file: ${allResults.size}`);
  console.log("\nTo activate, add this import in monthly-templates.ts:");
  console.log('  import { rewrittenMonthlyOverrides } from "./monthly-rewritten-overrides";');
  console.log("  Then merge into monthlyOverrides.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
