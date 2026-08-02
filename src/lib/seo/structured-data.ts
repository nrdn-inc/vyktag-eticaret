/**
 * schema.org yapılandırılmış veri (JSON-LD) üreticileri.
 *
 * Google, ürün sayfalarında fiyat/stok durumunu ve SSS sayfalarında açılır soru-cevapları
 * yalnızca bu işaretleme varsa zengin sonuç (rich result) olarak gösterir — sayfanın görünen
 * içeriği aynı kalsa bile arama sonuçlarındaki alanı ve tıklanma oranı belirgin şekilde artar.
 * Buradaki her üretici düz bir nesne döner; sayfaya `<JsonLd>` bileşeniyle basılır.
 */

import type { ProductWithVariants } from "@/lib/catalog";
import type { FaqItem } from "@/lib/marketing";
import { isVariantPurchasable } from "@/lib/orders/stock";
import { legalInfo, siteConfig } from "@/lib/site";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vyktag.com.tr";

/** Kuruş → schema.org'un beklediği ondalıklı fiyat dizesi ("34999" → "349.99"). */
function kurusToPriceString(kurus: number): string {
  return (kurus / 100).toFixed(2);
}

/**
 * Organization + iletişim bilgileri. Google'ın "knowledge panel"ine ve marka aramalarında
 * doğru logo/iletişim gösterimine kaynak olur; her sayfada bir kez basılır.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: siteConfig.name,
    legalName: legalInfo.companyLegalName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: siteConfig.description,
    email: legalInfo.email,
    telephone: legalInfo.phones,
    address: {
      "@type": "PostalAddress",
      streetAddress: legalInfo.address,
      addressLocality: "İstanbul",
      addressCountry: "TR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: legalInfo.email,
      telephone: legalInfo.phones[0],
      availableLanguage: ["Turkish"],
    },
  };
}

/** WebSite — arama sonuçlarında site adının doğru görünmesini sağlar. */
export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
    inLanguage: "tr-TR",
    publisher: { "@id": `${siteUrl}/#organization` },
  };
}

/**
 * Product + AggregateOffer. Ürünün birden çok varyantı (renk/baskı/özel tasarım) farklı
 * fiyatlarda olduğundan tek bir `Offer` yerine `AggregateOffer` (lowPrice/highPrice)
 * kullanılır — Google sonuçta "₺349,99 - ₺499,99" aralığını gösterebilir.
 */
export function productJsonLd(product: ProductWithVariants) {
  const variantPrices = product.variants.map((v) => v.priceKurus);
  const anyInStock = product.variants.some((v) => isVariantPurchasable(v.stock));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteUrl}/urunler/${product.slug}#product`,
    name: product.name,
    description: product.description,
    url: `${siteUrl}/urunler/${product.slug}`,
    brand: { "@type": "Brand", name: siteConfig.name },
    category: "Dijital Kartvizit",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "TRY",
      lowPrice: kurusToPriceString(Math.min(...variantPrices)),
      highPrice: kurusToPriceString(Math.max(...variantPrices)),
      offerCount: product.variants.length,
      availability: anyInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": `${siteUrl}/#organization` },
    },
  };
}

/** FAQPage — arama sonucunda soruların açılır liste olarak görünmesini sağlar. */
export function faqJsonLd(items: readonly FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** BreadcrumbList — arama sonucunda URL yerine "Ana sayfa > Ürünler > ..." yolunu gösterir. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
