import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import Script from 'next/script'
import { SITE } from '@/lib/site-config'
import { BRANDING } from '@/lib/branding'
import { getSiteSettingsServer } from '@/lib/site-settings-server'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '700', '900'],
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

// CSP nonce gerado por middleware - aqui apenas para referência
const cspBase = process.env.NODE_ENV === 'production'
  ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://www.googletagmanager.com https://www.facebook.com; object-src 'none'; base-uri 'self'; form-action 'self';"
  : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"

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
    // Segurança: metatag CSP
    other: {
      'Content-Security-Policy': cspBase,
      'X-DNS-Prefetch-Control': 'on',
      'X-UA-Compatible': 'IE=edge',
    },
    // Referrer policy
    referrer: 'strict-origin-when-cross-origin',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <head>
        {/* Segurança: Meta tags de segurança */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        {/* Segurança: CSP via meta tag (fallback para inline) */}
        <meta
          httpEquiv="Content-Security-Policy"
          content={cspBase}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {children}
        <Toaster position="top-right" richColors />
        <Analytics />

        {/* Google Ads Consent Mode v2 — Conformidade LGPD */}
        <Script
          id="consent-mode"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Consent Mode v2 para Google Ads compliance
              window.dataLayer = window.dataLayer || [];
              function gtagConsent() {
                var consentFlags = {
                  'ad_storage': 'granted',
                  'analytics_storage': 'granted',
                  'wait_for_update': 500
                };
                try {
                  var consent = localStorage.getItem('cookie_consent');
                  if (consent === 'denied' || consent === 'marketing-denied') {
                    consentFlags.ad_storage = 'denied';
                    consentFlags.analytics_storage = 'denied';
                  }
                } catch(e) {}
                dataLayer.push(consentFlags);
              }
              gtagConsent();
            `,
          }}
        />

        {/* Google Tag Manager - carregamento assíncrono */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
              `,
            }}
          />
        )}

        {/* Google Analytics (gtag.js) - carregamento preguiçoso */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    'cookie_flags': 'SameSite=None;Secure',
                    'ads_data_redaction': false,
                    'url_passthrough': true,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Facebook Meta Pixel - carregamento preguiçoso */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <>
            <Script
              id="meta-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  )
}
