import { notFound, redirect } from "next/navigation";
import FortuneResult from "@/components/fortune-result";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";
import { getValidMonthlyBirthFromCookie } from "@/lib/fortune/monthly-birth-cookie";
import { getFortuneMonthlyTemplate, isFortuneMonth } from "@/lib/fortune/monthly-templates";
import { getFortuneNumberName } from "@/lib/fortune/names";

type PageProps = {
  params: Promise<{
    month: string;
  }>;
};

export default async function FortuneMonthlyResultPage({ params }: PageProps) {
  const { month } = await params;
  const parsedMonth = Number(month);

  if (!isFortuneMonth(parsedMonth)) {
    notFound();
  }

  const birth = await getValidMonthlyBirthFromCookie();
  if (!birth) {
    redirect("/fortune-monthly");
  }

  let fortuneNumber: number;
  try {
    fortuneNumber = destinyNumberFromBirthdate(birth);
  } catch {
    redirect("/fortune-monthly");
  }

  const template = getFortuneMonthlyTemplate(parsedMonth, fortuneNumber);
  const fortuneName = getFortuneNumberName(fortuneNumber);

  if (!template || !fortuneName) {
    notFound();
  }

  return (
    <FortuneResult
      template={template}
      variantLabel="NUMEROLOGY MONTHLY"
      pageTitle={`${fortuneName}の${parsedMonth}月の運勢`}
      topLinkHref="/"
      topLinkLabel="Topに戻る"
      resetHref="/fortune-monthly?edit=1"
      halfYearSectionTitle={`⏳ ${parsedMonth}月前半・後半`}
      firstHalfTitle={`${parsedMonth}月前半`}
      secondHalfTitle={`${parsedMonth}月後半`}
      bottomLinkHref="/fortune-monthly/result"
      bottomLinkLabel="月一覧に戻る"
    />
  );
}
