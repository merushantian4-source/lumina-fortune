import Link from "next/link";
import { redirect } from "next/navigation";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";
import { getValidMonthlyBirthFromCookie } from "@/lib/fortune/monthly-birth-cookie";
import { getFortuneNumberName } from "@/lib/fortune/names";
import { PageShell } from "@/components/ui/page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { LuminaLinkButton } from "@/components/ui/button";

function ErrorView() {
  return (
    <PageShell maxWidth="narrow" title="生年月日の指定が正しくありません" backHref="/" backLabel="トップへ戻る">
      <GlassCard>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">生年月日の指定が正しくありません</h1>
        <p className="lumina-muted mt-2 text-sm">`YYYY-MM-DD` 形式で入力して、もう一度お試しください。</p>
        <Link href="/fortune-monthly" className="lumina-link mt-4 inline-block text-sm underline-offset-4 hover:underline">
          毎月の運勢フォームへ戻る
        </Link>
      </GlassCard>
    </PageShell>
  );
}

export default async function FortuneMonthlyResultIndexPage() {
  const birth = await getValidMonthlyBirthFromCookie();
  if (!birth) {
    redirect("/fortune-monthly");
  }

  const fortuneNumber = destinyNumberFromBirthdate(birth);
  const fortuneName = getFortuneNumberName(fortuneNumber);
  if (!fortuneName) {
    redirect("/fortune-monthly");
  }

  return (
    <PageShell
      maxWidth="content"
      title={`${fortuneName}の毎月の運勢`}
      description="見たい月を選んでください。"
      backHref="/fortune-monthly?edit=1"
      backLabel="生年月日入力へ戻る"
      headerRight={<LuminaLinkButton href="/" tone="secondary">トップへ戻る</LuminaLinkButton>}
    >
      <GlassCard>
        <section className="lumina-card rounded-2xl p-5">
          <h2 className="text-base font-semibold tracking-wide text-slate-800">📅 月を選ぶ</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }, (_, index) => {
              const month = index + 1;
              return (
                <Link
                  key={month}
                  href={`/fortune-monthly/result/${month}`}
                  className="lumina-pill-link rounded-xl px-4 py-3 text-sm font-medium transition"
                >
                  {month}月の運勢
                </Link>
              );
            })}
          </div>
        </section>
      </GlassCard>
    </PageShell>
  );
}
