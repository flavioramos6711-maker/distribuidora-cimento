import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c1a2e",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            width: 100,
            height: 100,
          }}
        >
          <div style={{ background: "#ea580c", borderRadius: 8 }} />
          <div style={{ background: "#ea580c", borderRadius: 8 }} />
          <div style={{ background: "#ea580c", borderRadius: 8 }} />
          <div style={{ background: "#ea580c", borderRadius: 8 }} />
        </div>
      </div>
    ),
    { ...size },
  )
}
