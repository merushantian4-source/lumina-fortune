"use client";

import { MODERATION_MESSAGES } from "./messages";
import { MODERATION_MAX_LENGTH, validateModerationText } from "./validateText";

const CLIENT_RATE_LIMIT_STORAGE_KEY = "lumina_moderation_last_post_at";
const POST_INTERVAL_MS = 30_000;

type ClientModerationResult =
  | { ok: true; normalizedText: string }
  | { ok: false; error: string };

function normalizeRateLimitKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^\w\-:.@]/g, "_").slice(0, 120) || "guest";
}

function readClientRateLimitStore(): Record<string, number> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(CLIENT_RATE_LIMIT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

function writeClientRateLimitStore(store: Record<string, number>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLIENT_RATE_LIMIT_STORAGE_KEY, JSON.stringify(store));
}

export function runClientModerationCheck(
  text: string,
  userKey: string,
  options?: { maxLength?: number }
): ClientModerationResult {
  const textResult = validateModerationText(text, { maxLength: options?.maxLength ?? MODERATION_MAX_LENGTH });
  if (!textResult.ok) {
    return { ok: false, error: textResult.error };
  }

  const rateKey = normalizeRateLimitKey(userKey);
  const store = readClientRateLimitStore();
  const now = Date.now();
  const lastPostedAt = store[rateKey] ?? 0;

  if (now - lastPostedAt < POST_INTERVAL_MS) {
    return { ok: false, error: MODERATION_MESSAGES.rateLimit };
  }

  store[rateKey] = now;
  writeClientRateLimitStore(store);

  return { ok: true, normalizedText: textResult.normalizedText };
}
