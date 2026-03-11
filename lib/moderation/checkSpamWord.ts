import { SPAM_WORDS } from "./ngWords";

export function containsSpamWord(text: string): boolean {
  const normalized = text.toLowerCase();
  return SPAM_WORDS.some((word) => normalized.includes(word));
}
