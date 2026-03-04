import type { Metadata } from "next";
import { RecordChapterPage } from "@/components/library/record-chapter-page";

export const metadata: Metadata = {
  title: "白の館 | 白の庭の記録 | 光の書庫 | LUMINA",
  description: "白の庭の記録「白の館」。ルミナが暮らす館と住人の記録です。",
};

export default function MansionPage() {
  return <RecordChapterPage slug="mansion" />;
}
