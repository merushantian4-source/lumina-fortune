import { PageShell } from "@/components/ui/page-shell";
import { WallpapersClient } from "./WallpapersClient";

export default function MonthlyWallpaperPage() {
  return (
    <PageShell
      maxWidth="content"
      title="Monthly Wallpaper"
      description="Visit for 7 days in the month to unlock this month's wallpaper."
      backHref="/"
      backLabel="Back to Home"
    >
      <WallpapersClient />
    </PageShell>
  );
}
