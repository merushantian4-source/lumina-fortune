import { NG_WORDS } from "./ngWords";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isAsciiWord(value: string): boolean {
  return /^[a-z0-9]+$/i.test(value);
}

export function containsNgWord(text: string): boolean {
  const normalized = text.toLowerCase();

  return NG_WORDS.some((word) => {
    const escaped = escapeRegExp(word.toLowerCase());
    const pattern = isAsciiWord(word)
      ? `(^|[^a-z0-9])${escaped}($|[^a-z0-9])`
      : `(^|\\s|[。、！？,.!?「」（）()\\[\\]【】『』\\n\\r])${escaped}($|\\s|[。、！？,.!?「」（）()\\[\\]【】『』\\n\\r])`;

    return new RegExp(pattern, "i").test(normalized);
  });
}
