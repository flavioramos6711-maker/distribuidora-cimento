import { ImageResponse } from "next/og"

export const size = { width: 512, height: 512 }
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
          background: "#002D5B",
          borderRadius: 80,
        }}
      >
        {/* Letter M — built with 5 vertical bars and diagonal cuts via clip-path */}
        <svg
          width="360"
          height="340"
          viewBox="0 0 360 340"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* White M shape */}
          <path
            d="M20 320 L20 20 L90 20 L180 160 L270 20 L340 20 L340 320 L270 320 L270 140 L180 280 L90 140 L90 320 Z"
            fill="white"
          />
          {/* Orange inverted triangle overlaid on the V notch of M */}
          <polygon
            points="90,20 270,20 180,160"
            fill="#F47920"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}