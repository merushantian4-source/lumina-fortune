import type { Metadata } from "next";
import { RecordChapterPage } from "@/components/library/record-chapter-page";

export const metadata: Metadata = {
  title: "白（ハク） | 白の庭の記録 | 光の書庫 | LUMINA",
  description: "白の庭の記録「白（ハク）」。小さな案内人の羽音を辿るページです。",
};

export default function HakuPage() {
  return <RecordChapterPage slug="haku" />;
}
