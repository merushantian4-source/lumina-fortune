import { promises as fs } from "fs";
import path from "path";
import { validateModerationText } from "@/lib/moderation/validateText";

export type ConsultationLetter = {
  id: string;
  nickname: string | null;
  message: string;
  createdAt: string;
};

const STORE_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(STORE_DIR, "consultation-letters.json");
const MAX_ITEMS = 500;

async function readStore(): Promise<ConsultationLetter[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ConsultationLetter[]) : [];
  } catch {
    return [];
  }
}

async function writeStore(items: ConsultationLetter[]): Promise<void> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(items, null, 2), "utf-8");
}

export async function saveConsultationLetter(payload: {
  nickname?: string;
  message: string;
}): Promise<ConsultationLetter> {
  const message = payload.message.trim();
  if (!message) {
    throw new Error("message is required");
  }

  const moderation = validateModerationText(message, { maxLength: 300 });
  if (!moderation.ok) {
    throw new Error(moderation.error);
  }

  if (Array.from(moderation.normalizedText).length > 300) {
    throw new Error("message is too long");
  }

  const nickname = payload.nickname?.trim();
  const letter: ConsultationLetter = {
    id: `CL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nickname: nickname ? nickname.slice(0, 40) : null,
    message: moderation.normalizedText,
    createdAt: new Date().toISOString(),
  };

  const current = await readStore();
  const next = [letter, ...current].slice(0, MAX_ITEMS);
  await writeStore(next);
  return letter;
}
