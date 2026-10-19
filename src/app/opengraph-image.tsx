import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/env";

export const alt = `${SITE_NAME}: free previous year question papers`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social-share picture for every page that has no image of its own. */
export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#FACC15",
        color: "#121212",
        border: "16px solid #121212",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 700 }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            background: "#121212",
            color: "#FACC15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
          }}
        >
          N
        </div>
        {SITE_NAME}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
          Previous year papers.
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: "#FF5722",
          }}
        >
          Turn study into success.
        </div>
      </div>
      <div style={{ fontSize: 34, fontWeight: 600 }}>
        University exams · UPSC · SSC · GATE · NEET · UGC NET
      </div>
    </div>,
    size,
  );
}
