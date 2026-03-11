import { containsNgWord } from "./checkNgWord";
import { containsSpamWord } from "./checkSpamWord";
import { containsUrl } from "./checkUrl";

const REPEATED_PATTERN = /(.)\1{6,}/u;
const MAX_LENGTH = 500;

export type ModerationCheckResult =
  | { ok: true }
  | { ok: false; type: "url" | "ng" | "spam" | "repeat" | "length"; message: string };

export function checkModeration(text: string): ModerationCheckResult {
  if (containsUrl(text)) {
    return {
      ok: false,
      type: "url",
      message: "リンクはここには置けないみたいです。別の言葉で書いてみてくださいね。",
    };
  }

  if (containsNgWord(text)) {
    return {
      ok: false,
      type: "ng",
      message: "その言葉は願いの庭には置けないようです。別の表現でそっと書き直してみてください。",
    };
  }

  if (containsSpamWord(text)) {
    return {
      ok: false,
      type: "spam",
      message: "その内容はここには置けないみたいです。別の言葉で書いてみてくださいね。",
    };
  }

  if (REPEATED_PATTERN.test(text)) {
    return {
      ok: false,
      type: "repeat",
      message: "同じ言葉が続いているみたいです。少し整えてみてくださいね。",
    };
  }

  if (Array.from(text).length > MAX_LENGTH) {
    return {
      ok: false,
      type: "length",
      message: "少し長すぎるみたいです。もう少し短くしてみてくださいね。",
    };
  }

  return { ok: true };
}
