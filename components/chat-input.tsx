import { useCallback, useState } from "react";
import { motion } from "framer-motion";

const QUESTION_EXAMPLES = [
  "彼は私のことをどう思っていますか？",
  "この恋のゆくえを占って",
  "復縁できますか？",
  "転職はうまくいきますか？",
  "今の運気はどうなっていますか？",
  "いつ頃運気の流れが変わりますか？",
] as const;

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const trimmed = value.trim();
      if (trimmed && !disabled) {
        onSend(trimmed);
        setValue("");
      }
    },
    [value, disabled, onSend]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-[#e1d5bf]/72 bg-[linear-gradient(160deg,rgba(255,252,246,0.86),rgba(248,242,231,0.8))] px-4 py-3 [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))] [padding-left:calc(1rem+env(safe-area-inset-left))] [padding-right:calc(1rem+env(safe-area-inset-right))] backdrop-blur-sm"
    >
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm leading-relaxed text-[#6f6556]">
          気になることをひとつ送ってください。ルミナがカードで静かに読み解きます。
        </p>

        <div className="mb-3">
          <section className="rounded-2xl border border-[#e5d8c1]/72 bg-white/45 p-3">
            <p className="text-xs font-medium tracking-[0.12em] text-[#8a7a64]">
              こんなことをカードに聞けます
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUESTION_EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setValue(example)}
                  className="rounded-full border border-[#dbcdb6]/78 bg-[#fcf7ee] px-3 py-1.5 text-left text-xs text-[#5d5449] transition hover:bg-[#f8f1e4]"
                >
                  {`・${example}`}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="例：彼は私のことをどう思っていますか？"
            disabled={disabled}
            className="lumina-input min-w-0 flex-1 rounded-full px-4 py-3 text-[#2e2a26] placeholder:text-[#9a8f7e] focus:outline-none"
          />
          <motion.button
            type="submit"
            disabled={disabled || !value.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="lumina-btn lumina-btn-primary !w-auto shrink-0 px-4 py-3 sm:px-6 disabled:opacity-50"
          >
            送信
          </motion.button>
        </div>
      </div>
    </form>
  );
}
