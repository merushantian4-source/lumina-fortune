import {
  resolveCardVoiceProfile,
  resolveCategoryReading,
  type TarotReadingCategory,
} from "@/lib/tarot/card-voices";
import { findTarotCardByJaName } from "@/src/data/tarotCards";

type ReadingContext = {
  cardMeaning: string;
  cardVoice: string;
  cardModes: string[];
  selectedMode: string;
  selectedCategory: TarotReadingCategory;
  categoryReading: string;
  readingPatterns: string[];
};

const MAJOR_READING_PATTERNS: Record<string, string[]> = {
  愚者: ["新しい一歩", "勢いと軽やかさ", "準備しすぎないこと"],
  魔術師: ["手持ちのものを活かす", "言葉や工夫の使い方", "動き出すきっかけ"],
  女教皇: ["静かな観察", "すぐに答えを出さないこと", "気づいている違和感"],
  女帝: ["心地よさを育てる", "受け取り上手になること", "無理のない豊かさ"],
  皇帝: ["段取りを決める", "土台を固める", "責任の持ち方"],
  法王: ["基本に戻る", "信頼できる助言", "型を整えること"],
  恋人: ["心が向く方を選ぶ", "対話の温度", "迷いの整理"],
  戦車: ["勢いの使い方", "進む方向を絞る", "止まらず動くこと"],
  力: ["やわらかな粘り強さ", "感情を落ち着ける", "無理に押し切らないこと"],
  隠者: ["一人で整える時間", "考えの整理", "静かな見直し"],
  運命の輪: ["流れの切り替わり", "偶然への乗り方", "変化への身の置き方"],
  正義: ["感情と事実を分ける", "バランスを見ること", "判断の整え方"],
  吊るされた男: ["見方を変える", "あえて待つこと", "急がない意味"],
  死神: ["切り替え", "手放し", "次へ移る準備"],
  節制: ["配分の調整", "無理のない整え方", "ちょうどよい加減"],
  悪魔: ["執着や惰性への気づき", "癖の見直し", "離れ方の工夫"],
  塔: ["想定外への対応", "崩れた後の立て直し", "気づきの受け止め方"],
  星: ["希望の持ち直し", "回復の気配", "先を信じる感覚"],
  月: ["曖昧さとの付き合い方", "不安の扱い方", "確認を重ねること"],
  太陽: ["素直な表現", "明るさの広がり", "気持ちよく進むこと"],
  審判: ["再評価", "やり直しのきっかけ", "過去の経験の活かし方"],
  世界: ["仕上げ", "ひと区切り", "完了の手応え"],
};

const SUIT_PATTERNS: Record<string, string[]> = {
  カップ: ["感情の揺れ方", "距離感の調整", "言葉にしきれない気持ち"],
  ソード: ["考えすぎ", "判断の整え直し", "言葉や情報の扱い方"],
  ワンド: ["動き出すきっかけ", "挑戦の温度", "勢いの向け先"],
  ペンタクル: ["足元の現実", "お金や暮らしの整え", "積み重ねの確かさ"],
};

const RANK_PATTERNS: Array<{ token: string; patterns: string[] }> = [
  { token: "エース", patterns: ["始まりの兆し", "最初の一歩", "流れの立ち上がり"] },
  { token: "2", patterns: ["バランスの取り方", "相手との温度差", "二つの間での調整"] },
  { token: "3", patterns: ["広がり方", "協力や共有", "人との混ざり方"] },
  { token: "4", patterns: ["守り方", "土台の安定", "落ち着ける場所"] },
  { token: "5", patterns: ["揺れの立て直し", "対立や乱れの扱い方", "引き際の見極め"] },
  { token: "6", patterns: ["流れの回復", "やり取りのなめらかさ", "少し前へ進むこと"] },
  { token: "7", patterns: ["見極め", "作戦の調整", "簡単に決めないこと"] },
  { token: "8", patterns: ["継続", "手を止めないこと", "勢いの保ち方"] },
  { token: "9", patterns: ["踏ん張りどころ", "仕上げ前の調整", "守りながら進むこと"] },
  { token: "10", patterns: ["区切り", "抱えすぎの整理", "次段階への移り方"] },
  { token: "ペイジ", patterns: ["学び", "知らせの受け取り方", "素直さ"] },
  { token: "ナイト", patterns: ["勢い", "進み方の速さ", "熱量の使い方"] },
  { token: "クイーン", patterns: ["落ち着いた対応", "受け止め方", "感情の成熟"] },
  { token: "キング", patterns: ["全体を見る視点", "責任の持ち方", "整えて導くこと"] },
];

function resolveMinorPatterns(cardName: string): string[] {
  const suitEntry = Object.entries(SUIT_PATTERNS).find(([suit]) => cardName.includes(suit));
  const rankEntry = RANK_PATTERNS.find(({ token }) => cardName.includes(token));
  const merged = [...(rankEntry?.patterns ?? []), ...(suitEntry?.[1] ?? [])];
  return merged.slice(0, 3);
}

export function resolveDailyTarotReading(
  card?: { name?: string | null; reversed?: boolean },
  seed = "",
  selectedMode?: string,
  category: TarotReadingCategory = "general"
): ReadingContext {
  const name = card?.name?.trim() ?? "";
  const normalized = name.replace(/のカード/g, "").trim();
  const cardMeta = findTarotCardByJaName(normalized);
  const cardMeaning =
    cardMeta?.meaningJa ??
    (normalized ? `${normalized}は、今日の流れを読み解く手がかりを持つカードです。` : "今日の流れを読み解く手がかりが出ています。");
  const voiceProfile = resolveCardVoiceProfile(card, seed);
  const resolvedSelectedMode = selectedMode ?? voiceProfile.selectedMode;

  const majorPatterns = MAJOR_READING_PATTERNS[normalized];
  if (majorPatterns) {
    return {
      cardMeaning,
      cardVoice: voiceProfile.cardVoice,
      cardModes: voiceProfile.cardModes,
      selectedMode: resolvedSelectedMode,
      selectedCategory: category,
      categoryReading: resolveCategoryReading(card, category),
      readingPatterns: majorPatterns,
    };
  }

  const minorPatterns = resolveMinorPatterns(normalized);
  return {
    cardMeaning,
    cardVoice: voiceProfile.cardVoice,
    cardModes: voiceProfile.cardModes,
    selectedMode: resolvedSelectedMode,
    selectedCategory: category,
    categoryReading: resolveCategoryReading(card, category),
    readingPatterns: minorPatterns.length > 0 ? minorPatterns : ["今の流れの見直し", "気持ちの整理", "足元の整え方"],
  };
}
