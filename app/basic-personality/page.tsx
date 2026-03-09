import BasicPersonalityClient from "@/app/basic-personality/basic-personality-client";
import { getServerProfileBirthdate } from "@/lib/profile/server-birthdate";

export const dynamic = "force-dynamic";

export default async function BasicPersonalityPage() {
  const serverBirthdate = await getServerProfileBirthdate();
  return <BasicPersonalityClient serverBirthdate={serverBirthdate} />;
}
