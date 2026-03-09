import { Suspense } from "react";
import { getOrCreateDailyWhisper } from "@/lib/generateDailyWhisper";
import { getServerProfileBirthdate } from "@/lib/profile/server-birthdate";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const dailyWhisper = await getOrCreateDailyWhisper();
  const serverBirthdate = await getServerProfileBirthdate();

  return (
    <Suspense fallback={null}>
      <HomeClient initialDailyWhisper={dailyWhisper.message} serverBirthdate={serverBirthdate} />
    </Suspense>
  );
}
