import { tarotCards, type TarotCardEntry } from "@/src/data/tarotCards";

export type RandomTarotResult = {
  card: TarotCardEntry;
  isReversed: boolean;
};

export function getRandomTarotCard(random = Math.random): RandomTarotResult {
  const index = Math.floor(random() * tarotCards.length);
  return {
    card: tarotCards[index] ?? tarotCards[0],
    isReversed: random() >= 0.5,
  };
}
