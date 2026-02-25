import FortuneResult from "@/components/fortune-result";
import { getFortune2026Template } from "@/lib/fortune2026-templates";

const BIRTHDATE_KEY = "fortune2026_birthdate";
const DESTINY_KEY = "fortune2026_destinyNumber";

type Props = {
  fortuneNumber: number;
};

export default function Fortune2026Result({ fortuneNumber }: Props) {
  const data = getFortune2026Template(fortuneNumber);

  if (!data) {
    return null;
  }

  const resultTitleName = data.introTitle.replace(/のあなたへ。$/, "");

  return (
    <FortuneResult
      template={data}
      variantLabel="NUMEROLOGY 2026"
      pageTitle={`${resultTitleName}の2026年鑑定結果`}
      resetHref="/fortune-2026"
      storageKeysToClear={[BIRTHDATE_KEY, DESTINY_KEY]}
    />
  );
}
