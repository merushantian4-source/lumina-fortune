import { GlassCard } from "@/components/ui/glass-card";

type HakuWhisperCardProps = {
  message: string;
  className?: string;
};

export function HakuWhisperCard({ message, className = "" }: HakuWhisperCardProps) {
  return (
    <GlassCard className={`border border-[#e1d5bf]/75 bg-[linear-gradient(160deg,rgba(255,252,246,0.9),rgba(248,242,231,0.84))] ${className}`.trim()}>
      <p className="text-xs tracking-[0.14em] text-[#8a7a64]">HAKU</p>
      <h3 className="mt-1 text-base font-medium text-[#2e2a26]">白のひとこと</h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#544c42]">{message}</p>
    </GlassCard>
  );
}
