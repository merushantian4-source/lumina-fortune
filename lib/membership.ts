export type MembershipTier = "free" | "paid";

export const MEMBERSHIP_TIER_STORAGE_KEY = "lumina_membership_tier";
export const CHAT_VISITOR_KEY_STORAGE = "lumina_chat_visitor_key";

export function loadMembershipTier(): MembershipTier {
  if (typeof window === "undefined") return "free";
  return window.localStorage.getItem(MEMBERSHIP_TIER_STORAGE_KEY) === "paid" ? "paid" : "free";
}

export function saveMembershipTier(tier: MembershipTier) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MEMBERSHIP_TIER_STORAGE_KEY, tier);
}

export function getOrCreateChatVisitorKey(): string {
  if (typeof window === "undefined") return "guest";
  const existing = window.localStorage.getItem(CHAT_VISITOR_KEY_STORAGE)?.trim();
  if (existing) return existing;
  const next = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(CHAT_VISITOR_KEY_STORAGE, next);
  return next;
}
