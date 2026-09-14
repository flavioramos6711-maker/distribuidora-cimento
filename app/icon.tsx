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
          background: "#FFFFFF",
          borderRadius: 110,
          border: "12px solid #0055FF",
          boxShadow: "0 20px 50px rgba(0, 85, 255, 0.4)",
          padding: "20px",
        }}
      >
        <div style={{ position: "relative", width: 440, height: 320, display: "flex" }}>
          <svg
            width="440"
            height="320"
            viewBox="0 0 440 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Letra C esquerda (Luminous Blue) */}
            <path
              d="M135 60 C80 60 40 100 40 160 C40 220 80 260 135 260 C170 260 195 245 208 220 L168 200 C160 215 148 225 135 225 C102 225 80 198 80 160 C80 122 102 95 135 95 C148 95 160 105 168 120 L208 100 C195 75 170 60 135 60 Z"
              fill="#0055FF"
            />
            {/* Silhueta da Casa Central (Laranja Atacado) */}
            {/* Telhado */}
            <polygon points="220,50 160,115 280,115" fill="#FF7700" />
            {/* Chaminé */}
            <rect x="250" y="60" width="18" height="40" fill="#FF7700" />
            {/* Corpo da casa */}
            <rect x="170" y="115" width="100" height="145" fill="#FF7700" />
            {/* Letra C direita (Luminous Blue) */}
            <path
              d="M395 60 C340 60 300 100 300 160 C300 220 340 260 395 260 C430 260 455 245 468 220 L428 200 C420 215 408 225 395 225 C362 225 340 198 340 160 C340 122 362 95 395 95 C408 95 420 105 428 120 L468 100 C455 75 430 60 395 60 Z"
              fill="#0055FF"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              left: 220,
              top: 187,
              transform: "translate(-50%, -50%)",
              fontSize: 125,
              fontWeight: 900,
              fontStyle: "italic",
              fontFamily: "sans-serif",
              color: "#FFFFFF",
              textAlign: "center",
              lineHeight: 1,
            }}
          >
            &amp;
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
