import { promises as fs } from "fs";
import path from "path";
import { MODERATION_MESSAGES } from "./messages";

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "moderation-rate-limit.json");
const POST_INTERVAL_MS = 30_000;

type RateLimitStore = Record<string, number>;

async function readStore(): Promise<RateLimitStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as RateLimitStore;
  } catch {
    return {};
  }
}

async function writeStore(store: RateLimitStore) {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function normalizeRateLimitKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^\w\-:.@]/g, "_").slice(0, 120) || "guest";
}

export function getClientAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "guest";
  }

  return request.headers.get("x-real-ip")?.trim() || "guest";
}

export function resolveModerationUserKey(request: Request, candidates: Array<string | null | undefined>): string {
  const candidate = candidates.find((value) => typeof value === "string" && value.trim());
  if (candidate) {
    return normalizeRateLimitKey(candidate);
  }

  return normalizeRateLimitKey(getClientAddress(request));
}

export async function checkModerationPostInterval(userKey: string): Promise<
  | { ok: true }
  | { ok: false; error: string; code: "rate_limit" }
> {
  const normalizedKey = normalizeRateLimitKey(userKey);
  const now = Date.now();
  const store = await readStore();
  const lastPostedAt = store[normalizedKey] ?? 0;

  if (now - lastPostedAt < POST_INTERVAL_MS) {
    return { ok: false, error: MODERATION_MESSAGES.rateLimit, code: "rate_limit" };
  }

  store[normalizedKey] = now;
  await writeStore(store);
  return { ok: true };
}
