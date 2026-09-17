import { ImageResponse } from "next/og"

export const size = { width: 512, height: 512 }
export const contentType = "image/png"

// Favicon corporativo C&C — azul marinho #002D5B, monograma branco com & laranja #F47920.
// Borda clara sutil para contraste em abas dark e light.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#002D5B",
          borderRadius: 112,
          border: "10px solid rgba(255,255,255,0.35)",
          boxShadow: "0 0 0 6px #002D5B",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 190,
            lineHeight: 1,
            letterSpacing: -8,
          }}
        >
          <span style={{ color: "#FFFFFF" }}>C</span>
          <span style={{ color: "#F47920", fontSize: 150, margin: "0 6px" }}>&amp;</span>
          <span style={{ color: "#FFFFFF" }}>C</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
