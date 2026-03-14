import Link from "next/link";
import type { ReactNode } from "react";
import { LuminaLinkButton } from "@/components/ui/button";

type PageShellProps = {
  children: ReactNode;
  maxWidth?: "narrow" | "content" | "wide";
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  headerRight?: ReactNode;
  headerClassName?: string;
  headerBackground?: ReactNode;
  className?: string;
  showBottomHomeButton?: boolean;
  bottomButtonHref?: string;
  bottomButtonLabel?: string;
};

const widthClassMap: Record<NonNullable<PageShellProps["maxWidth"]>, string> = {
  narrow: "max-w-2xl",
  content: "max-w-4xl",
  wide: "max-w-5xl",
};

export function PageShell({
  children,
  maxWidth = "content",
  title,
  description,
  backHref,
  backLabel,
  headerRight,
  headerClassName = "",
  headerBackground,
  className = "",
  showBottomHomeButton = true,
  bottomButtonHref = "/",
  bottomButtonLabel = "トップへ戻る",
}: PageShellProps) {
  const widthClass = widthClassMap[maxWidth];

  return (
    <main className={`lumina-page min-h-screen px-4 py-8 sm:px-6 sm:py-10 ${className}`.trim()}>
      <div className={`mx-auto ${widthClass}`}>
        {(backHref || title || description || headerRight) && (
          <header
            className={`relative mb-6 overflow-hidden rounded-2xl border border-[#e1d5bf]/72 bg-[linear-gradient(160deg,rgba(255,252,246,0.84),rgba(248,242,231,0.78))] p-5 shadow-[0_10px_22px_-20px_rgba(82,69,53,0.2)] ${headerClassName}`.trim()}
          >
            {headerBackground ? <div className="pointer-events-none absolute inset-0 -z-10">{headerBackground}</div> : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {backHref && backLabel ? (
                <Link href={backHref} className="lumina-link text-sm underline-offset-4 hover:underline">
                  {backLabel}
                </Link>
              ) : (
                <span />
              )}
              {headerRight}
            </div>
            {title ? <h1 className="mt-2 text-2xl font-medium tracking-tight text-[#2e2a26] sm:text-3xl">{title}</h1> : null}
            {description ? <p className="mt-2 text-sm leading-relaxed text-[#544c42]">{description}</p> : null}
          </header>
        )}
        {children}
        {showBottomHomeButton ? (
          <div className="mt-6 pb-1 text-center">
            <LuminaLinkButton href={bottomButtonHref} tone="secondary" className="px-6">
              {bottomButtonLabel}
            </LuminaLinkButton>
          </div>
        ) : null}
      </div>
    </main>
  );
}
