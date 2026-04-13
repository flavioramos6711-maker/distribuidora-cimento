/** @type {import('next').NextConfig} */
// Env: Next.js carrega .env, .env.local, .env.development.local, etc. na raiz deste projeto.
// Turbopack (next dev --turbo) usa as mesmas regras; reinicie o dev server após mudar variáveis.
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
}

export default nextConfig
