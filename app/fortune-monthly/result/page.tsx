import Link from "next/link";
import { redirect } from "next/navigation";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";
import { getValidMonthlyBirthFromCookie } from "@/lib/fortune/monthly-birth-cookie";
import { getFortuneNumberName } from "@/lib/fortune/names";

function ErrorView() {
  return (
    <main className="lumina-page min-h-screen px-6 py-10">
      <div className="lumina-shell mx-auto max-w-2xl rounded-2xl p-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">生年月日の指定が正しくありません</h1>
        <p className="lumina-muted mt-2 text-sm">`YYYY-MM-DD` 形式で入力して、もう一度お試しください。</p>
        <Link href="/fortune-monthly" className="lumina-link mt-4 inline-block text-sm underline-offset-4 hover:underline">
          毎月の運勢フォームへ戻る
        </Link>
      </div>
    </main>
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
    <main className="lumina-page min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="lumina-shell mx-auto max-w-4xl rounded-3xl p-5 sm:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/fortune-monthly" className="lumina-link text-sm underline-offset-4 hover:underline">
            生年月日入力へ戻る
          </Link>
          <Link
            href="/"
            className="btn btn--secondary w-full sm:w-auto"
          >
            トップへ戻る
          </Link>
        </div>

        <header className="lumina-header-panel rounded-2xl p-5">
          <p className="lumina-kicker text-xs font-semibold">NUMEROLOGY MONTHLY</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{fortuneName}の毎月の運勢</h1>
          <p className="lumina-muted mt-2 text-sm">見たい月を選んでください。</p>
        </header>

        <section className="lumina-card mt-8 rounded-2xl p-5">
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
      </div>
    </main>
  );
}
