import { checkModeration } from "./checkModeration";
import { MODERATION_MESSAGES } from "./messages";

export const MODERATION_MAX_LENGTH = 500;

export type ModerationResult =
  | { ok: true; normalizedText: string }
  | { ok: false; error: string; code: "too_long" | "spam" | "repeat" | "ng_word" | "url" };

export function normalizeModerationText(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

export function validateModerationText(
  text: string,
  options?: { maxLength?: number }
): ModerationResult {
  const normalizedText = normalizeModerationText(text);
  const maxLength = options?.maxLength ?? MODERATION_MAX_LENGTH;

  if (Array.from(normalizedText).length > maxLength) {
    return { ok: false, error: MODERATION_MESSAGES.tooLong, code: "too_long" };
  }

  const moderation = checkModeration(normalizedText);
  if (!moderation.ok) {
    if (moderation.type === "url") {
      return { ok: false, error: MODERATION_MESSAGES.url, code: "url" };
    }
    if (moderation.type === "ng") {
      return { ok: false, error: MODERATION_MESSAGES.ngWord, code: "ng_word" };
    }
    if (moderation.type === "spam") {
      return { ok: false, error: MODERATION_MESSAGES.spamWord, code: "spam" };
    }
    if (moderation.type === "repeat") {
      return { ok: false, error: MODERATION_MESSAGES.spam, code: "repeat" };
    }
    return { ok: false, error: MODERATION_MESSAGES.tooLong, code: "too_long" };
  }

  return { ok: true, normalizedText };
}
