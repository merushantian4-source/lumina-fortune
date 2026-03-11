import MonthlyResultIndexClient from "@/app/fortune-monthly/result/monthly-result-index-client";
import { getValidMonthlyBirthFromCookie } from "@/lib/fortune/monthly-birth-cookie";

export const dynamic = "force-dynamic";

export default async function FortuneMonthlyResultIndexPage() {
  const birth = await getValidMonthlyBirthFromCookie().catch(() => null);
  return <MonthlyResultIndexClient initialBirthdate={birth} />;
}
