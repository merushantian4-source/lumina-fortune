"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { destinyNumberFromBirthdate } from "@/lib/fortune/fortuneNumber";
import { MONTHLY_BIRTH_COOKIE_MAX_AGE, MONTHLY_BIRTH_COOKIE_NAME } from "@/lib/fortune/monthly-birth-cookie";

export async function saveMonthlyBirthAndRedirect(formData: FormData) {
  const birth = String(formData.get("birth") ?? "").trim();

  try {
    destinyNumberFromBirthdate(birth);
  } catch {
    redirect("/fortune-monthly");
  }

  const cookieStore = await cookies();
  cookieStore.set(MONTHLY_BIRTH_COOKIE_NAME, birth, {
    path: "/",
    maxAge: MONTHLY_BIRTH_COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
  });

  redirect("/fortune-monthly/result");
}
