import { Suspense } from "react";
import { getOrCreateDailyWhisper } from "@/lib/generateDailyWhisper";
import { getServerProfileBirthdate } from "@/lib/profile/server-birthdate";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

const FALLBACK_DAILY_WHISPER = {
  message:
    "今日は、急いで答えを出すよりも、心の水面を静かに整えることが似合いそうです。\n小さな違和感に気づけたなら、それだけで流れはやわらかく変わっていきます。",
};

export default async function Page() {
  const dailyWhisper = await getOrCreateDailyWhisper().catch(() => FALLBACK_DAILY_WHISPER);
  const serverBirthdate = await getServerProfileBirthdate().catch(() => null);

  return (
    <Suspense fallback={null}>
      <HomeClient initialDailyWhisper={dailyWhisper?.message ?? FALLBACK_DAILY_WHISPER.message} serverBirthdate={serverBirthdate ?? null} />
    </Suspense>
  );
}
