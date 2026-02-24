"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { destinyNumberFromBirthdate } from "@/lib/numerology";

const BIRTHDATE_KEY = "fortune2026_birthdate";
const DESTINY_KEY = "fortune2026_destinyNumber";

function isValidDestinyNumber(value: string | null): value is `${1|2|3|4|5|6|7|8|9}` {
  return value !== null && /^[1-9]$/.test(value);
}

export default function Fortune2026Page() {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [checkingStorage, setCheckingStorage] = useState(true);

  useEffect(() => {
    const savedDestiny = localStorage.getItem(DESTINY_KEY);
    if (isValidDestinyNumber(savedDestiny)) {
      router.replace(`/fortune-2026/result/${savedDestiny}`);
      return;
    }

    const savedBirthdate = localStorage.getItem(BIRTHDATE_KEY);
    if (savedBirthdate) {
      setBirthDate(savedBirthdate);
    }
    setCheckingStorage(false);
  }, [router]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!birthDate) {
      setError("生年月日を入力してください。");
      return;
    }

    try {
      const destinyNumber = destinyNumberFromBirthdate(birthDate);
      localStorage.setItem(BIRTHDATE_KEY, birthDate);
      localStorage.setItem(DESTINY_KEY, String(destinyNumber));
      router.push(`/fortune-2026/result/${destinyNumber}`);
    } catch {
      setError("正しい生年月日を入力してください。");
    }
  };

  if (checkingStorage) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 px-6 py-10 text-amber-950">
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-white/80 p-6 shadow-sm backdrop-blur">
          <p className="text-sm text-amber-900/80">読み込み中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 px-6 py-10 text-amber-950">
      <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="mb-4">
          <Link href="/" className="text-sm text-amber-700 underline-offset-4 hover:underline">
            トップへ戻る
          </Link>
        </div>

        <h1 className="text-2xl font-bold">生年月日で占う2026年の運勢</h1>
        <p className="mt-2 text-sm text-amber-900/80">
          生年月日から運命数を計算し、2026年の運勢を表示します。
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            生年月日
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-4 py-2 outline-none ring-amber-500 transition focus:ring-2"
              required
            />
          </label>

          <button
            type="submit"
            className="rounded-full bg-amber-600 px-8 py-3 font-medium text-white shadow-lg transition hover:bg-amber-700"
          >
            2026年の運勢を占う
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>
    </main>
  );
}

