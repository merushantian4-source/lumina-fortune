"use client";

import { useState } from "react";

type TableOfContentsProps = {
  headings: { id: string; text: string }[];
};

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (headings.length === 0) return null;

  return (
    <nav className="rounded-2xl border border-[#e1d5bf]/50 bg-[linear-gradient(160deg,rgba(253,248,238,0.92),rgba(255,252,246,0.88))] shadow-[0_10px_24px_-18px_rgba(82,69,53,0.14)]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 sm:px-6"
      >
        <span className="flex items-center gap-2.5">
          <span className="text-[11px] text-[#c9a96e]">✦</span>
          <span className="text-[0.82rem] font-bold tracking-[0.15em] text-[#7f725f]">
            この記事の内容
          </span>
        </span>
        <span
          className="text-[12px] text-[#a09484] transition"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          ▼
        </span>
      </button>
      {isOpen ? (
        <ol className="border-t border-[#e5daca]/40 px-5 pb-5 pt-3 sm:px-6">
          {headings.map((heading, i) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(heading.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="flex items-baseline gap-3 rounded-lg px-2 py-2 text-[0.85rem] leading-[1.7] text-[#5a5147] transition hover:bg-[#f5eddf]/60 hover:text-[#2e2a26]"
              >
                <span className="shrink-0 text-[0.75rem] font-semibold text-[#b5a48e]">
                  {i + 1}
                </span>
                <span>{heading.text}</span>
              </a>
            </li>
          ))}
        </ol>
      ) : null}
    </nav>
  );
}
