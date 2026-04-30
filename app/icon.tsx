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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#002D5B",
          borderRadius: 6,
          position: "relative",
        }}
      >
        {/* Triangle / Bag Accent */}
        <div 
          style={{ 
            width: 14, 
            height: 14, 
            background: "#F47920", 
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            marginBottom: -4
          }} 
        />
        {/* Main Logo Body (simplified) */}
        <div 
          style={{ 
            width: 18, 
            height: 14, 
            background: "white", 
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }} 
        >
          <div style={{ width: 8, height: 2, background: "#002D5B" }} />
        </div>
      </div>
    ),
    { ...size }
  )
}