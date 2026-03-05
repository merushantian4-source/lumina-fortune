import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";

export const runtime = "edge";

type ShareCardRequest = {
  dateLabel?: string;
  themeText?: string;
  closingText?: string;
  bodyText?: string;
  hashtags?: string;
};

let notoSerifFontPromise: Promise<ArrayBuffer | null> | null = null;

async function loadNotoSerifJpFont(): Promise<ArrayBuffer | null> {
  if (!notoSerifFontPromise) {
    notoSerifFontPromise = (async () => {
      try {
        const cssResponse = await fetch(
          "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400",
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
            },
          }
        );
        if (!cssResponse.ok) return null;
        const css = await cssResponse.text();
        const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype|woff2?)'\)/);
        const fontUrl = match?.[1];
        if (!fontUrl) return null;
        const fontResponse = await fetch(fontUrl);
        if (!fontResponse.ok) return null;
        return await fontResponse.arrayBuffer();
      } catch {
        return null;
      }
    })();
  }
  return notoSerifFontPromise;
}

function sanitizeText(text: string | undefined, fallback: string, maxLength: number): string {
  const normalized = (text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;
  return normalized.slice(0, maxLength);
}

function toBodyExcerpt(text: string | undefined): string {
  const normalized = (text ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("🌿") && line !== "今日のひとこと")
    .join(" ");
  return normalized.slice(0, 140);
}

export async function POST(request: Request) {
  let body: ShareCardRequest;
  try {
    body = (await request.json()) as ShareCardRequest;
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const dateLabel = sanitizeText(body.dateLabel, "今日の導き", 40);
  const themeText = sanitizeText(body.themeText, "今日は、光を整える日。", 92);
  const closingText = sanitizeText(body.closingText, "明日のあなたに、少しだけ委ねて。", 92);
  const bodyText = toBodyExcerpt(body.bodyText);
  const hashtags = sanitizeText(body.hashtags, "#白の庭の祈り #LUMINA #今日の導き", 120);
  const fontData = await loadNotoSerifJpFont();

  const stars = [
    { left: 92, top: 120, size: 6 },
    { left: 180, top: 210, size: 4 },
    { left: 965, top: 180, size: 5 },
    { left: 860, top: 1060, size: 4 },
    { left: 160, top: 1120, size: 5 },
    { left: 930, top: 1180, size: 6 },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1350px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background:
            "radial-gradient(circle at 15% 12%, rgba(255,248,221,0.7) 0%, rgba(255,248,221,0) 48%), radial-gradient(circle at 85% 20%, rgba(255,242,220,0.48) 0%, rgba(255,242,220,0) 44%), linear-gradient(168deg, #fbf8f0 0%, #f4ede1 58%, #eee6d6 100%)",
          fontFamily: '"Noto Serif JP", serif',
        }}
      >
        {stars.map((star, index) => (
          <div
            key={`star-${index}`}
            style={{
              position: "absolute",
              left: `${star.left}px`,
              top: `${star.top}px`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.88)",
              boxShadow: "0 0 14px rgba(255,244,196,0.85)",
            }}
          />
        ))}

        <div
          style={{
            width: "900px",
            height: "1160px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRadius: "32px",
            border: "1px solid rgba(207,189,162,0.8)",
            background:
              "linear-gradient(165deg, rgba(255,252,246,0.95), rgba(248,242,230,0.92)), radial-gradient(circle at 20% 10%, rgba(255,255,255,0.9), rgba(255,255,255,0))",
            boxShadow:
              "0 24px 54px -34px rgba(90,75,55,0.38), inset 0 1px 0 rgba(255,255,255,0.85)",
            padding: "68px 74px 58px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", color: "#6d6252" }}>
              <div style={{ fontSize: 42, letterSpacing: "0.08em" }}>白の庭の祈り</div>
              <div style={{ fontSize: 26, letterSpacing: "0.18em" }}>LUMINA</div>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignSelf: "flex-start",
                borderRadius: "999px",
                border: "1px solid rgba(198,180,150,0.9)",
                background: "rgba(255,250,240,0.95)",
                fontSize: 24,
                color: "#7d6f5d",
                padding: "8px 16px",
              }}
            >
              {dateLabel}
            </div>
            <div
              style={{
                borderRadius: "22px",
                border: "1px solid rgba(218,203,179,0.82)",
                background: "rgba(255,255,255,0.72)",
                padding: "28px 30px",
                color: "#4f4639",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div style={{ fontSize: 42, lineHeight: 1.55 }}>{themeText}</div>
              <div style={{ fontSize: 34, lineHeight: 1.55 }}>{closingText}</div>
              {bodyText ? (
                <div style={{ fontSize: 24, lineHeight: 1.7, color: "#6e6456" }}>{bodyText}</div>
              ) : null}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(214,199,173,0.82)",
              paddingTop: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              color: "#6d6252",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: 24 }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "999px",
                    border: "1px solid rgba(193,176,148,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,251,244,0.92)",
                    fontSize: 20,
                  }}
                >
                  🕊
                </div>
                <span>白（ハク）</span>
              </div>
              <div style={{ fontSize: 20, letterSpacing: "0.1em" }}>LUMINA</div>
            </div>
            <div style={{ fontSize: 22, color: "#867864" }}>{hashtags}</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
      fonts: fontData
        ? [
            {
              name: "Noto Serif JP",
              data: fontData,
              weight: 400,
              style: "normal",
            },
          ]
        : undefined,
    }
  );
}
