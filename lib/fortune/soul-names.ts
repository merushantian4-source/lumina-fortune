import type { FortuneNumber } from "@/lib/fortune/types";

export const SOUL_NAME_BY_NUMBER: Record<FortuneNumber, string> = {
  1: "始まりの灯火",
  2: "月影の調律者",
  3: "祝福の歌い手",
  4: "大地の守り手",
  5: "風を渡る旅人",
  6: "愛を育てる灯",
  7: "静寂の賢者",
  8: "現実を築く王",
  9: "包容の祈り手",
};

export function getSoulNameByNumber(number: FortuneNumber): string {
  return SOUL_NAME_BY_NUMBER[number];
}
