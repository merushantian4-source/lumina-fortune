export type SpecialOccasionCard = {
  id: string;
  title: string;
  message: string;
};

export type SpecialOccasionEvent = {
  key: string;
  badge: string;
  title: string;
  message: string;
  priority: number;
  card?: SpecialOccasionCard | null;
};

const BIRTHDAY_BLESSING_MESSAGE =
  "お誕生日おめでとうございます。今日はあなたの魂がこの世界に光を灯した特別な日。新しい一年がやさしい導きに包まれますように。";

const BIRTHDAY_BLESSING_CARDS: SpecialOccasionCard[] = [
  {
    id: "light-door",
    title: "光の扉",
    message:
      "新しい一年の始まりに、あなたの前には静かに新しい扉が開いています。焦らず、心がやわらぐ方へ進んでみてください。",
  },
  {
    id: "moon-blessing",
    title: "月の祝福",
    message:
      "あなたの歩みは、見えないところでもきちんと守られています。この一年は、やさしい流れを信じることで導きが整っていきます。",
  },
  {
    id: "soul-flame",
    title: "魂の灯火",
    message:
      "あなたの中にある小さな願いは、これから少しずつ形になっていきます。今年は、本当に大切にしたいものが明るく見えてくるでしょう。",
  },
  {
    id: "white-feather",
    title: "白い羽のしるし",
    message:
      "空からのささやきが祝福になる一年です。偶然に見える出来事の中に、白が置いた優しい意味を感じてみてください。",
  },
  {
    id: "star-path",
    title: "星の導き",
    message:
      "あなたに必要な出会いや出来事は、静かなタイミングで届いていきます。今年は迷いよりも、惹かれる感覚を大事にすると運が動きます。",
  },
  {
    id: "silent-flower",
    title: "静寂の花",
    message:
      "静かな時間の中でこそ、あなたの魅力は深く花開いていきます。この一年は、無理をしない美しさがあなたを守ってくれるでしょう。",
  },
  {
    id: "wish-seed",
    title: "願いの種",
    message:
      "まだ言葉になっていない想いも、もうあなたの心の中で育ちはじめています。今年は小さな希望を、やさしく信じて育ててみてください。",
  },
  {
    id: "dawn-prayer",
    title: "夜明けの祈り",
    message:
      "新しい朝の気配が、これからのあなたを静かに照らしていきます。この一年は、焦らず整えるほど運が味方になってくれます。",
  },
];

const SPECIAL_SEASONAL_EVENTS = [
  {
    key: "new-year",
    startMonthDay: "01-01",
    endMonthDay: "01-03",
    badge: "新しい年の祝福",
    title: "新年のやさしい光",
    message:
      "年の始まりに届く言葉が、あなたの心を静かに整えてくれます。この数日は、やさしい決意と穏やかな願いを大切に過ごしてみてください。",
    priority: 20,
  },
  {
    key: "christmas",
    startMonthDay: "12-24",
    endMonthDay: "12-25",
    badge: "聖夜の祝福",
    title: "クリスマスの灯り",
    message:
      "やわらかな灯りが心をあたためる特別な日です。大切な想いと静かな祈りが、あなたのこれからにやさしい奇跡を運んでくれるでしょう。",
    priority: 30,
  },
] as const;

function getJstDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? "0");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "0");
  const day = Number(parts.find((part) => part.type === "day")?.value ?? "0");

  return { year, month, day };
}

function getJstDateKey(date = new Date()) {
  const { year, month, day } = getJstDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getJstMonthDayKey(date = new Date()) {
  const { month, day } = getJstDateParts(date);
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getBirthMonthDayKey(birthDate?: string | null) {
  if (!birthDate) return null;
  const match = birthDate.trim().match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return `${match[1]}-${match[2]}`;
}

function getBirthdayBlessingCard(birthDate: string) {
  const birthMonthDay = getBirthMonthDayKey(birthDate);
  if (!birthMonthDay || birthMonthDay !== getJstMonthDayKey()) return null;

  const seedSource = `${birthDate}-${getJstDateKey()}`;
  let hash = 0;
  for (let index = 0; index < seedSource.length; index += 1) {
    hash = (hash * 31 + seedSource.charCodeAt(index)) >>> 0;
  }

  return BIRTHDAY_BLESSING_CARDS[hash % BIRTHDAY_BLESSING_CARDS.length];
}

function isMonthDayInRange(monthDay: string, startMonthDay: string, endMonthDay: string) {
  return monthDay >= startMonthDay && monthDay <= endMonthDay;
}

export function getSpecialOccasionEvent(birthDate?: string | null): SpecialOccasionEvent | null {
  const todayMonthDay = getJstMonthDayKey();

  const birthdayMonthDay = getBirthMonthDayKey(birthDate);
  const birthdayEvent =
    birthDate && birthdayMonthDay === todayMonthDay
      ? ({
          key: "birthday",
          badge: "🎂 今日はあなたの特別な日",
          title: "お誕生日おめでとうございます",
          message: BIRTHDAY_BLESSING_MESSAGE,
          priority: 100,
          card: getBirthdayBlessingCard(birthDate),
        } satisfies SpecialOccasionEvent)
      : null;

  const seasonalEvents = SPECIAL_SEASONAL_EVENTS.filter((event) =>
    isMonthDayInRange(todayMonthDay, event.startMonthDay, event.endMonthDay)
  );

  return [birthdayEvent, ...seasonalEvents]
    .filter((event): event is SpecialOccasionEvent => event !== null)
    .sort((left, right) => right.priority - left.priority)[0] ?? null;
}
