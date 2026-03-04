import type { Metadata } from "next";
import { RecordChapterPage } from "@/components/library/record-chapter-page";

export const metadata: Metadata = {
  title: "光のカード ― 起源 | 白の庭の記録 | 光の書庫 | LUMINA",
  description: "白の庭の記録「光のカード ― 起源」。ルミナの物語とカードのはじまりを綴るページです。",
};

export default function CardsPage() {
  return <RecordChapterPage slug="cards" />;
}
