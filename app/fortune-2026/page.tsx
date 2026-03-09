import Fortune2026Client from "@/app/fortune-2026/fortune-2026-client";
import { getServerProfileBirthdate } from "@/lib/profile/server-birthdate";

export const dynamic = "force-dynamic";

export default async function Fortune2026Page() {
  const serverBirthdate = await getServerProfileBirthdate();
  return <Fortune2026Client serverBirthdate={serverBirthdate} />;
}
