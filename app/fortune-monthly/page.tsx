import Link from "next/link";
import { redirect } from "next/navigation";
import { saveMonthlyBirthAndRedirect } from "@/app/fortune-monthly/actions";
import { getValidMonthlyBirthFromCookie } from "@/lib/fortune/monthly-birth-cookie";

export default async function FortuneMonthlyPage() {
  const savedBirth = await getValidMonthlyBirthFromCookie();
  if (savedBirth) {
    redirect("/fortune-monthly/result");
  }

  return (
    <main className="lumina-page min-h-screen px-6 py-10">
      <div className="lumina-shell mx-auto max-w-2xl rounded-2xl p-6">
        <div className="mb-4">
          <Link href="/" className="lumina-link text-sm underline-offset-4 hover:underline">
            トップへ戻る
          </Link>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">生年月日で占う毎月の運勢</h1>
        <p className="lumina-muted mt-2 text-sm">生年月日から運命数を計算し、月ごとの運勢を表示します。</p>

        <form action={saveMonthlyBirthAndRedirect} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            生年月日
            <input
              type="date"
              name="birth"
              className="lumina-input mt-2 w-full rounded-lg px-4 py-2 transition"
              required
            />
          </label>

          <button type="submit" className="btn btn--primary">
            鑑定する
          </button>
        </form>
      </div>
    </main>
  );
}
