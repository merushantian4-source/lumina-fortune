import { PageShell } from "@/components/ui/page-shell";
import { WallpapersClient } from "./WallpapersClient";

export default function MonthlyWallpaperPage() {
  return (
    <PageShell
      maxWidth="content"
      title="今月の待ち受け"
      description="今月の来訪日数が7日になると、限定待ち受けを受け取れます。"
      backHref="/"
      backLabel="トップへ戻る"
    >
      <WallpapersClient />
    </PageShell>
  );
}
