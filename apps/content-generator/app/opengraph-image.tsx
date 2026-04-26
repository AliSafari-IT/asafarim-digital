import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #07111f 0%, #12304d 52%, #243158 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#aebdda" }}>ASafariM Digital</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 0.98, maxWidth: 930 }}>
            AI Content Generator
          </div>
          <div style={{ fontSize: 30, color: "#d5deef", maxWidth: 840, lineHeight: 1.35 }}>
            Draft blogs, product copy, emails, social campaigns, and summaries in a focused SaaS workspace.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
