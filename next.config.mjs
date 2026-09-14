/** @type {import('next').NextConfig} */
// Env: Next.js carrega .env, .env.local, .env.development.local, etc. na raiz deste projeto.
// Turbopack (next dev --turbo) usa as mesmas regras; reinicie o dev server após mudar variáveis.
const nextConfig = {
  typescript: {
    // NUNCA ignore erros TypeScript em produção - isso mascara bugs reais
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.333obra.com.br" },
      { protocol: "https", hostname: "**.leroymerlin.com.br" },
      { protocol: "https", hostname: "**.tcdn.com.br" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Desativar header X-Powered-By para segurança
  poweredByHeader: false,
  // Performance: habilitar compressão e cache
  compress: true,
  // Segurança: configurar headers de resposta
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Segurança básica
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS será configurado via middleware para HTTPS
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://distribuidora-cimento-flavioramos6711-3618s-projects.vercel.app" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type,Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ]
  },
}

export default nextConfig
