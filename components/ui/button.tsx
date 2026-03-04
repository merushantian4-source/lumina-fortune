import * as React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import Link from "next/link";

type ButtonTone = "primary" | "secondary";

type BaseProps = {
  children: ReactNode;
  tone?: ButtonTone;
  className?: string;
};

type LuminaButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  };
type LuminaLinkButtonProps = BaseProps & {
  href: string;
};

function getToneClass(tone: ButtonTone) {
  return tone === "primary" ? "lumina-btn lumina-btn-primary" : "lumina-btn lumina-btn-secondary";
}

export const LuminaButton = React.forwardRef<HTMLButtonElement, LuminaButtonProps>(
  ({ children, tone = "primary", className = "", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp ref={ref} {...props} className={`${getToneClass(tone)} ${className}`.trim()}>
        {children}
      </Comp>
    );
  },
);

LuminaButton.displayName = "LuminaButton";

export function LuminaLinkButton({ href, children, tone = "secondary", className = "" }: LuminaLinkButtonProps) {
  return (
    <Link href={href} className={`${getToneClass(tone)} ${className}`.trim()}>
      {children}
    </Link>
  );
}
