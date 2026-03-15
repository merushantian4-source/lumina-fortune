/**
 * Client-side hook to enhance a template-based reading with Claude.
 *
 * While Claude is generating, reading returns null (show loading UI).
 * On success, returns Claude-enhanced reading.
 * On error, falls back to template reading.
 */
"use client";

import { useEffect, useState } from "react";
import type { RomanceFeature, InterpretationFrameInput } from "./lumina-prompts";

type UseClaudeReadingOptions<T> = {
  feature: RomanceFeature;
  templateReading: T | null;
  context?: string;
  interpretationFrame?: InterpretationFrameInput | null;
};

type UseClaudeReadingResult<T> = {
  /** The reading to display (null while Claude is working) */
  reading: T | null;
  /** True while waiting for Claude */
  isEnhancing: boolean;
};

export function useClaudeReading<T extends Record<string, unknown>>(
  options: UseClaudeReadingOptions<T>,
): UseClaudeReadingResult<T> {
  const { feature, templateReading, context, interpretationFrame } = options;
  const [result, setResult] = useState<T | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Reset when template changes (new question submitted)
  useEffect(() => {
    setResult(null);
  }, [templateReading]);

  useEffect(() => {
    if (!templateReading) return;

    let cancelled = false;
    setIsEnhancing(true);
    setResult(null);

    (async () => {
      try {
        const payload: Record<string, unknown> = {
          feature,
          templateReading,
          context,
        };

        if (interpretationFrame) {
          payload.interpretationFrame = interpretationFrame;
        }

        const response = await fetch("/api/romance-reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = (await response.json()) as { ok: boolean; reading?: T };

        if (!cancelled && data.ok && data.reading) {
          setResult(data.reading);
        } else if (!cancelled) {
          // API returned ok but no reading — fall back to template
          setResult(templateReading);
        }
      } catch (error) {
        // Claude failed — fall back to template
        console.warn("[useClaudeReading] enhancement failed, using template:", error);
        if (!cancelled) setResult(templateReading);
      } finally {
        if (!cancelled) setIsEnhancing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [feature, templateReading, context, interpretationFrame]);

  return {
    reading: result,
    isEnhancing,
  };
}
