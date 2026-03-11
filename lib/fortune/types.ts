export type FortuneNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type FortuneMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type FortuneTemplate = {
  fortuneNumber: FortuneNumber;
  introTitle: string;
  manualOverride?: boolean;
  luminaMessage?: string;
  introBody: string;
  themeCatch: string;
  firstHalf: string;
  secondHalf: string;
  loveSingle: string;
  lovePartner: string;
  work: string;
  relations: string;
  actions: [string, string, string];
  powerSpots: [string, string, string];
  keywords: [string, string, string];
  blessing: string;
};

export type DailyFlowLevel = 1 | 2 | 3 | 4 | 5;

export type DailyNumberFortune = {
  date: string;
  dayNumber: FortuneNumber;
  flowLevel: DailyFlowLevel;
  title: string;
  headline: string;
  summary: string;
  action: string;
  emotion?: string;
  tags?: string[];
};

export function isFortuneNumber(value: number): value is FortuneNumber {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}

export function isFortuneMonth(value: number): value is FortuneMonth {
  return Number.isInteger(value) && value >= 1 && value <= 12;
}
