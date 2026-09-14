// =============================================================================
// COMPONENTE DE STRUCTURED DATA — JSON-LD para SEO do Google
// =============================================================================
"use client"

import Script from "next/script"
import { SITE } from "@/lib/site-config"

interface Props {
  data: Record<string, unknown>
}

/**
 * Componente para injetar JSON-LD structured data via next/script
 * Usa strategy="afterInteractive" para não bloquear o carregamento
 */
export function JsonLd({ data }: Props) {
  const jsonString = JSON.stringify(data)

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  )
}

/**
 * Componente para injetar múltiplos JSON-LD
 */
export function MultiJsonLd({ items }: { items: Record<string, unknown>[] }) {
  return (
    <>
      {items.map((data, i) => (
        <Script
          key={`jsonld-${i}`}
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  )
}

/**
 * Gera e injeta automaticamente o schema de LocalBusiness na página
 */
export function SiteStructuredData() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.legalName,
    description: SITE.tagline,
    url: SITE.siteUrl || SITE.website,
    telephone: `+55${SITE.whatsappE164}`,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      postalCode: SITE.address.zip,
      addressCountry: "BR",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "07:00",
        closes: "12:00",
      },
    ],
    image: `${SITE.siteUrl || SITE.website}/og-default.png`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: "-21.1767",
      longitude: "-47.8110",
    },
    sameAs: [
      SITE.website,
      `https://wa.me/${SITE.whatsappE164}`,
      `https://www.facebook.com/${SITE.shortName.toLowerCase()}`,
      `https://www.instagram.com/${SITE.shortName.toLowerCase()}`,
    ],
    paymentAccepted: "PIX, Dinheiro, Cartão",
    priceRange: "R$",
  }

  return <JsonLd data={localBusiness} />
}

/**
 * Gera e injeta o schema de Product para página de produto individual
 */
export function ProductStructuredData({
  name,
  description,
  price,
  sku,
  image,
  originalPrice,
  availability,
  rating,
  reviewCount,
  url,
}: {
  name: string
  description: string
  price: number
  sku: string
  image: string
  originalPrice?: number | null
  availability?: "InStock" | "OutOfStock" | "PreOrder"
  rating?: number
  reviewCount?: number
  url: string
}) {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku,
    image,
    brand: {
      "@type": "Brand",
      name: SITE.shortName,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BRL",
      price: price.toFixed(2),
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: `https://schema.org/${availability || "InStock"}`,
      seller: {
        "@type": "Organization",
        name: SITE.legalName,
      },
      ...(originalPrice && originalPrice > price
        ? {
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 30,
            },
          }
        : {}),
    },
    ...(rating && reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.toString(),
            reviewCount: reviewCount.toString(),
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  }

  return <JsonLd data={productSchema} />
}

/**
 * Gera e injeta o schema de BreadcrumbList para navegação
 */
export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <JsonLd data={schema} />
}

/**
 * Gera e injeta FAQ schema
 */
export function FAQStructuredData({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return <JsonLd data={schema} />
}
