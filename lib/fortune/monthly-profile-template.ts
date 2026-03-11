import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";
import { DEFAULT_MONTHLY_LUMINA_MESSAGE } from "@/lib/fortune/monthly-lumina-message";
import { getFortuneMonthlyTemplate, hasManualMonthlyTemplate } from "@/lib/fortune/monthly-templates";
import type { FortuneTemplate } from "@/lib/fortune/types";
import type { StoredProfile } from "@/lib/profile/profile-store";

type MonthlyProfileContext = Pick<StoredProfile, "nickname" | "job" | "loveStatus"> & {
  birthdate: string;
};

function trimOrEmpty(value?: string) {
  return value?.trim() ?? "";
}

function buildIntroAddon(profile: MonthlyProfileContext): string {
  const nickname = trimOrEmpty(profile.nickname);
  return nickname ? `${nickname}さんの今月の流れを、あなたに合わせてお届けしています。` : "今月の流れを、あなたに合わせてお届けしています。";
}

function buildWorkAddon(profile: MonthlyProfileContext): string {
  const job = trimOrEmpty(profile.job);
  if (!job) {
    return "仕事や学びでは、頼まれごとに反応する前に『今月の主軸かどうか』を一度見直すと、疲れより手応えが残りやすくなります。";
  }

  return `${job}では、成果だけでなく進め方の心地よさも基準に入れると、今月は無理なく評価につながります。`;
}

function buildLoveAddon(profile: MonthlyProfileContext): string {
  switch (profile.loveStatus) {
    case "married":
      return "パートナーがいる今月は、正しさより生活リズムの共有を優先すると、小さなすれ違いを先回りして減らせます。";
    case "complicated":
      return "揺れやすい関係ほど、相手の反応を読むより自分の基準を短い言葉で先に示すほうが流れを整えやすい月です。";
    case "unrequited":
      return "片思いの今月は、気持ちを抱え込むより接点の温度を落ち着いて観察すると、動くべき日が見えやすくなります。";
    default:
      return "恋愛では、結論を急ぐより心地よく会話できる距離感を育てるほど、今月のご縁は安定しやすくなります。";
  }
}

function buildRelationsAddon(profile: MonthlyProfileContext): string {
  const nickname = trimOrEmpty(profile.nickname);
  return nickname
    ? `${nickname}さん自身のペースを先に言葉にしておくと、周囲に合わせすぎて消耗する流れを避けやすくなります。`
    : "自分のペースを先に言葉にしておくと、周囲に合わせすぎて消耗する流れを避けやすくなります。";
}

export function buildMonthlyTemplateForProfile(
  month: number,
  birthdate: string,
  profile?: StoredProfile | null
): FortuneTemplate | null {
  const fortuneNumber = destinyNumberFromBirthdate(birthdate);
  const isEdited = hasManualMonthlyTemplate(month, fortuneNumber);
  const base = getFortuneMonthlyTemplate(month, fortuneNumber);

  if (!base) return null;

  const normalizedBase: FortuneTemplate = {
    ...base,
    luminaMessage: base.luminaMessage ?? DEFAULT_MONTHLY_LUMINA_MESSAGE,
  };

  if (isEdited || base.manualOverride) return normalizedBase;

  const context: MonthlyProfileContext = {
    birthdate,
    nickname: profile?.nickname,
    job: profile?.job,
    loveStatus: profile?.loveStatus,
  };

  return {
    ...normalizedBase,
    introBody: `${buildIntroAddon(context)}\n\n${base.introBody}`,
    work: `${base.work}\n\n${buildWorkAddon(context)}`,
    loveSingle: `${base.loveSingle}\n\n${buildLoveAddon(context)}`,
    lovePartner: `${base.lovePartner}\n\n${buildLoveAddon(context)}`,
    relations: `${base.relations}\n\n${buildRelationsAddon(context)}`,
  };
}
