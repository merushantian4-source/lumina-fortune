import FortuneMonthlyClient from "@/app/fortune-monthly/fortune-monthly-client";
import { getServerProfileBirthdate } from "@/lib/profile/server-birthdate";

type FortuneMonthlyPageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

export default async function FortuneMonthlyPage({ searchParams }: FortuneMonthlyPageProps) {
  const { edit } = await searchParams;
  const isEditMode = edit === "1" || edit === "true";
  const serverBirthdate = await getServerProfileBirthdate();

  return <FortuneMonthlyClient isEditMode={isEditMode} serverBirthdate={serverBirthdate} />;
}
