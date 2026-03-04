import type { Metadata } from "next";
import { RecordChapterPage } from "@/components/library/record-chapter-page";

export const metadata: Metadata = {
  title: "ルミナ人物設定 | 白の庭の記録 | 光の書庫 | LUMINA",
  description: "白の庭の記録「ルミナ人物設定」。ルミナの物語と輪郭を読むページです。",
};

export default function LuminaPage() {
  return <RecordChapterPage slug="lumina" />;
}
