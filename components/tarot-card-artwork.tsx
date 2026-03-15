"use client";

import Image from "next/image";
import { useState } from "react";

export const CARD_BACK_IMAGE_PATH = "/cards/back.jpg";

type TarotCardArtworkProps = {
  imagePath: string;
  alt: string;
  isReversed?: boolean;
  className?: string;
  sizes?: string;
};

function Placeholder({
  alt,
  className,
  backOnly = false,
  isReversed = false,
}: {
  alt: string;
  className?: string;
  backOnly?: boolean;
  isReversed?: boolean;
}) {
  return (
    <span
      className={className}
      role="img"
      aria-label={alt}
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "0.75rem",
        border: "1px dashed rgba(180, 83, 9, 0.28)",
        background: backOnly
          ? "radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.18), transparent 58%), linear-gradient(160deg, rgba(31, 41, 55, 0.92), rgba(17, 24, 39, 0.96))"
          : "radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.22), transparent 48%), radial-gradient(circle at 80% 25%, rgba(251, 113, 133, 0.16), transparent 55%), linear-gradient(160deg, rgba(31, 41, 55, 0.92), rgba(17, 24, 39, 0.96))",
        color: "#fef3c7",
        textAlign: "center",
        padding: "0.5rem",
      }}
    >
      {backOnly ? (
        <span
          aria-hidden="true"
          style={{
            width: "56%",
            height: "56%",
            borderRadius: 9999,
            border: "1px solid rgba(255, 251, 235, 0.55)",
            boxShadow:
              "0 0 0 10px rgba(196, 161, 92, 0.14), 0 0 0 20px rgba(196, 161, 92, 0.08)",
          }}
        />
      ) : (
        <>
          <span
            style={{ fontSize: "0.7rem", letterSpacing: "0.15em", opacity: 0.9, fontWeight: 700 }}
          >
            LUMINA
          </span>
          <span
            style={{
              position: "absolute",
              left: "0.35rem",
              right: "0.35rem",
              bottom: "0.45rem",
              fontSize: "0.6rem",
              lineHeight: 1.2,
              color: "rgba(255, 251, 235, 0.85)",
            }}
          >
            {alt}
          </span>
        </>
      )}
      {isReversed ? (
        <span
          style={{
            position: "absolute",
            top: "0.35rem",
            right: "0.35rem",
            fontSize: "0.58rem",
            lineHeight: 1,
            padding: "0.18rem 0.32rem",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.72)",
            color: "rgba(120, 53, 15, 0.92)",
            border: "1px solid rgba(180, 83, 9, 0.18)",
            backdropFilter: "blur(2px)",
          }}
        >
          逆位置
        </span>
      ) : null}
    </span>
  );
}

export function TarotCardArtwork({
  imagePath,
  alt,
  isReversed = false,
  className,
  sizes,
}: TarotCardArtworkProps) {
  return (
    <TarotCardArtworkInner
      key={imagePath}
      imagePath={imagePath}
      alt={alt}
      isReversed={isReversed}
      className={className}
      sizes={sizes}
    />
  );
}

function TarotCardArtworkInner({
  imagePath,
  alt,
  isReversed = false,
  className,
  sizes,
}: TarotCardArtworkProps) {
  const [currentSrc, setCurrentSrc] = useState(imagePath || CARD_BACK_IMAGE_PATH);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  if (showPlaceholder) {
    return <Placeholder alt={alt} className={className} isReversed={isReversed} />;
  }

  return (
    <span
      style={{
        display: "block",
        width: "100%",
        maxWidth: "300px",
        height: "auto",
        marginInline: "auto",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "300px",
          height: "auto",
          marginInline: "auto",
          transformOrigin: "center",
          transform: isReversed ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 200ms ease",
        }}
      >
        <Image
          src={currentSrc}
          alt={alt}
          width={300}
          height={500}
          sizes={sizes ?? "(max-width: 768px) 68vw, 300px"}
          className={className}
          style={{ display: "block", width: "100%", height: "auto", maxWidth: "300px" }}
          onError={() => {
            if (currentSrc !== CARD_BACK_IMAGE_PATH) {
              setCurrentSrc(CARD_BACK_IMAGE_PATH);
              return;
            }
            setShowPlaceholder(true);
          }}
        />
      </div>
      {isReversed ? (
        <span
          style={{
            position: "absolute",
            top: "0.35rem",
            right: "0.35rem",
            zIndex: 1,
            fontSize: "0.58rem",
            lineHeight: 1,
            padding: "0.18rem 0.32rem",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.72)",
            color: "rgba(120, 53, 15, 0.92)",
            border: "1px solid rgba(180, 83, 9, 0.18)",
            backdropFilter: "blur(2px)",
          }}
        >
          逆位置
        </span>
      ) : null}
    </span>
  );
}

export function TarotBackArtwork({
  className,
  sizes,
}: {
  className?: string;
  sizes?: string;
}) {
  return <TarotBackArtworkInner key="tarot-back" className={className} sizes={sizes} />;
}

function TarotBackArtworkInner({
  className,
  sizes,
}: {
  className?: string;
  sizes?: string;
}) {
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  if (showPlaceholder) {
    return <Placeholder alt="カード裏面" className={className} backOnly />;
  }

  return (
    <Image
      src={CARD_BACK_IMAGE_PATH}
      alt="カード裏面"
      width={300}
      height={500}
      sizes={sizes ?? "(max-width: 768px) 68vw, 300px"}
      className={className}
      style={{ display: "block", width: "100%", height: "auto", maxWidth: "300px" }}
      onError={() => setShowPlaceholder(true)}
    />
  );
}
