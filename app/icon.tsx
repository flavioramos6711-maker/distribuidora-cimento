import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

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
          background: "#0c1a2e",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            width: 20,
            height: 20,
          }}
        >
          <div style={{ width: 8, height: 8, background: "#ea580c", borderRadius: 2 }} />
          <div style={{ width: 8, height: 8, background: "#ea580c", borderRadius: 2 }} />
          <div style={{ width: 8, height: 8, background: "#ea580c", borderRadius: 2 }} />
          <div style={{ width: 8, height: 8, background: "#ea580c", borderRadius: 2 }} />
        </div>
      </div>
    ),
    { ...size }
  )
}