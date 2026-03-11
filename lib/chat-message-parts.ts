export type ChatMessagePart =
  | {
      type: "intro";
      text: string;
    }
  | {
      type: "animation";
      animation: "white-bird-delivers-card";
    }
  | {
      type: "card";
      cardName: string;
      orientation: "upright" | "reversed";
    }
  | {
      type: "reading-short";
      text: string;
    }
  | {
      type: "reading-detail";
      text: string;
    };

export function collectTextFromMessageParts(parts: ChatMessagePart[]): string {
  return parts
    .filter(
      (part): part is Extract<ChatMessagePart, { text: string }> =>
        "text" in part && typeof part.text === "string"
    )
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join("\n\n");
}
