import type { Metadata } from "next";
import { RecordChapterPage } from "@/components/library/record-chapter-page";

export const metadata: Metadata = {
  title: "起源 | 白の庭の記録 | 光の書庫 | LUMINA",
  description: "白の庭の記録「起源」。ルミナの物語のはじまりを辿るページです。",
};

export default function OriginPage() {
  return <RecordChapterPage slug="origin" />;
}
