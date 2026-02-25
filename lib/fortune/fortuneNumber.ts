import { isFortuneNumber, type FortuneNumber } from "@/lib/fortune/types";

export function destinyNumberFromBirthdate(dateString: string): FortuneNumber {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error("Invalid birthdate format");
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Invalid birthdate");
  }

  const digits = dateString.replace(/\D/g, "");
  let sum = digits.split("").reduce((total, digit) => total + Number(digit), 0);

  while (sum >= 10) {
    sum = String(sum)
      .split("")
      .reduce((total, digit) => total + Number(digit), 0);
  }

  if (!isFortuneNumber(sum)) {
    throw new Error("Destiny number out of range");
  }

  return sum;
}
