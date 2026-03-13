import { isFortuneNumber, type FortuneNumber } from "@/lib/fortune/types";

export const fortuneNumberNames: Record<FortuneNumber, string> = {
  1: "\u306f\u3058\u307e\u308a\u306e\u706f\u706b",
  2: "\u6708\u5f71\u306e\u8abf\u5f8b\u8005",
  3: "\u661f\u8a9e\u308a\u306e\u6b4c\u3044\u624b",
  4: "\u5927\u5730\u306e\u5b88\u308a\u624b",
  5: "\u98a8\u6e21\u308a\u306e\u65c5\u4eba",
  6: "\u611b\u306e\u706f\u3092\u5b88\u308b\u4eba",
  7: "\u9759\u5bc2\u306e\u89b3\u6e2c\u8005",
  8: "\u5149\u51a0\u306e\u5b9f\u73fe\u8005",
  9: "\u7948\u308a\u306e\u7d99\u304e\u624b",
};

export function getFortuneNumberName(number: number): string | null {
  return isFortuneNumber(number) ? fortuneNumberNames[number] : null;
}
