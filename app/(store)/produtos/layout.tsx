import type { Metadata } from 'next'
import { SITE } from '@/lib/site-config'
export const metadata: Metadata = {
  title: {
    default: `Produtos — ${SITE.legalName}`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.tagline,
  keywords: ['materiais de construção', 'cimento', 'argamassa', 'ferragens', 'atacado', 'Ribeirão Preto'],
  openGraph: {
    title: `Produtos — ${SITE.legalName}`,
    description: SITE.tagline,
    type: 'website',
    siteName: SITE.shortName,
    url: `${SITE.siteUrl}/produtos`,
    images: [
      {
        url: `${SITE.siteUrl}/og-default.png`,
        width: 1200,
        height: 630,
        alt: `${SITE.shortName} — Produtos`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Produtos — ${SITE.legalName}`,
    description: SITE.tagline,
  },
  alternates: {
    canonical: `${SITE.siteUrl}/produtos`,
  },
}
export default function ProdutosLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
