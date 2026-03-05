import type { Metadata } from "next";
import { RecordChapterPage } from "@/components/library/record-chapter-page";

export const metadata: Metadata = {
  title: "ルミナについて | 白の庭の記録 | 光の書庫 | LUMINA",
  description: "白の庭の記録「ルミナについて」。ルミナの物語と輪郭を読むページです。",
};

export default function LuminaPage() {
  return <RecordChapterPage slug="lumina" />;
}
