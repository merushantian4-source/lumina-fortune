"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { fortune2026ByNumber, type Fortune2026Number } from "@/lib/fortune2026Text";

const BIRTHDATE_KEY = "fortune2026_birthdate";
const DESTINY_KEY = "fortune2026_destinyNumber";

type Props = {
  n: Fortune2026Number;
};

export default function Fortune2026Result({ n }: Props) {
  const router = useRouter();
  const data = fortune2026ByNumber[n];

  const handleReset = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(BIRTHDATE_KEY);
      localStorage.removeItem(DESTINY_KEY);
    }
    router.push("/fortune-2026");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 px-6 py-10 text-amber-950">
      <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-white/85 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link href="/" className="text-sm text-amber-700 underline-offset-4 hover:underline">
            トップへ戻る
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-amber-300 bg-white px-4 py-2 text-sm text-amber-900 transition hover:bg-amber-50"
          >
            別の生年月日で占い直す
          </button>
        </div>

        <h1 className="text-2xl font-bold">{data.title}</h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {data.keywords.map((keyword) => (
            <span
              key={`${data.number}-${keyword}`}
              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800"
            >
              {keyword}
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-5">
          <ResultSection title="テーマ" text={data.theme} />
          <ResultSection title="仕事" text={data.work} />
          <ResultSection title="恋愛" text={data.love} />
          <ResultSection title="金運" text={data.money} />
          <ResultSection title="開運アクション" text={data.action} />
        </div>
      </div>
    </main>
  );
}

function ResultSection({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-xl border border-amber-100 bg-white/70 p-4">
      <h2 className="text-base font-semibold text-amber-900">{title}</h2>
      <p className="mt-2 whitespace-pre-wrap leading-relaxed text-amber-950/90">{text}</p>
    </section>
  );
}

