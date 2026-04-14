import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { SITE } from '@/lib/site-config'
import { BRANDING } from '@/lib/branding'
import { getSiteSettingsServer } from '@/lib/site-settings-server'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsServer()
  const favUrl = settings?.favicon_url?.trim()

  return {
    title: {
      default: `${SITE.legalName} — Materiais de construção`,
      template: `%s | ${SITE.shortName}`,
    },
    description: SITE.tagline,
    icons: favUrl
      ? { icon: [{ url: favUrl }] }
      : { icon: [{ url: BRANDING.faviconPath, type: 'image/png', sizes: '32x32' }] },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
