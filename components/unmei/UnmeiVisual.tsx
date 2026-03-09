import Image from "next/image";

type UnmeiVisualVariant = "hero" | "inline" | "tile";

type Props = {
  number: number;
  variant: UnmeiVisualVariant;
  title?: string;
  subtitle?: string;
  priority?: boolean;
};

const variantStyles: Record<
  UnmeiVisualVariant,
  {
    frame: string;
    imageOpacity: string;
    veil: string;
    textWrap: string;
    title: string;
    subtitle: string;
  }
> = {
  hero: {
    frame:
      "relative overflow-hidden rounded-2xl border border-[#ddd0b8]/75 bg-white/70 px-5 py-5 shadow-sm min-h-[140px] sm:min-h-[170px] sm:px-6 sm:py-6",
    imageOpacity: "opacity-[0.26]",
    veil: "bg-gradient-to-b from-white/80 via-white/60 to-white/85",
    textWrap: "relative z-10 flex h-full flex-col justify-end text-center sm:text-left",
    title: "text-xl font-medium text-[#2e2a26] sm:text-2xl",
    subtitle: "mt-1 text-sm leading-relaxed text-[#544c42] sm:text-base",
  },
  inline: {
    frame:
      "relative overflow-hidden rounded-2xl border border-[#ddd0b8]/72 bg-white/72 px-4 py-4 shadow-sm min-h-[92px] sm:min-h-[108px] sm:px-5",
    imageOpacity: "opacity-[0.2]",
    veil: "bg-gradient-to-b from-white/88 via-white/76 to-white/90",
    textWrap: "relative z-10 flex h-full flex-col justify-end",
    title: "text-base font-medium text-[#2e2a26] sm:text-lg",
    subtitle: "mt-1 text-xs leading-relaxed text-[#5a5044] sm:text-sm",
  },
  tile: {
    frame:
      "relative h-[74px] w-[92px] shrink-0 overflow-hidden rounded-xl border border-[#ddd0b8]/72 bg-white/72 shadow-sm sm:h-[88px] sm:w-[104px]",
    imageOpacity: "opacity-[0.24]",
    veil: "bg-gradient-to-b from-white/82 via-white/70 to-white/84",
    textWrap: "hidden",
    title: "",
    subtitle: "",
  },
};

export default function UnmeiVisual({ number, variant, title, subtitle, priority = false }: Props) {
  if (!Number.isInteger(number) || number < 1 || number > 9) {
    return null;
  }

  const styles = variantStyles[variant];
  const alt = title ?? `運命数${number}のキービジュアル`;

  return (
    <div className={styles.frame}>
      <div className={`pointer-events-none absolute inset-0 ${styles.imageOpacity}`}>
        <Image
          src={`/gazou/unmei/unmei${number}.png`}
          alt={alt}
          fill
          sizes={variant === "tile" ? "104px" : "100vw"}
          className={variant === "tile" ? "object-cover blur-0" : "object-cover blur-[1px]"}
          priority={priority}
        />
      </div>
      <div className={`pointer-events-none absolute inset-0 ${styles.veil}`} />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#e1d5bf]/70" />

      {title || subtitle ? (
        <div className={styles.textWrap}>
          {title ? <p className={styles.title}>{title}</p> : null}
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
