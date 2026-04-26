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
          background: "linear-gradient(135deg, #07111f 0%, #10203f 50%, #12352f 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 28, letterSpacing: 1 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #4c7dff, #5de4c7)",
            }}
          />
          ASafariM Digital
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ fontSize: 82, fontWeight: 700, lineHeight: 0.98, maxWidth: 900 }}>
            Full-stack SaaS with AI at the core.
          </div>
          <div style={{ fontSize: 30, color: "#c8d3e5", maxWidth: 860, lineHeight: 1.35 }}>
            Product engineering, backend architecture, and intelligent workflows for modern teams.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
