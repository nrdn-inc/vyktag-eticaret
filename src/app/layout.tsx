import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { legalInfo, siteConfig } from "@/lib/site";
import { organizationJsonLd, siteUrl, webSiteJsonLd } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/JsonLd";

// Statik/ISR sayfalar CDN'de (Hostinger hcdn) uzun süre önbelleğe alınabiliyor; sık art
// arda deploy'larda eski build'in JS/RSC parçaları sunucudan silindiğinden, önbellekteki
// eski bir sayfa artık var olmayan parçalara işaret edip ham RSC akış verisini ekrana
// basabiliyor veya "This page couldn't load" hatası verebiliyor (bkz. Next.js "Version
// Skew" ve "CDN Caching" dokümantasyonu — CDN'in _rsc sorgu parametresini önbellek
// anahtarına dahil etmemesi durumunda oluşur). Her sayfayı istek anında render ederek
// (Cache-Control: private, no-store) bu hata sınıfını tamamen ortadan kaldırıyoruz.
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  // metadataBase olmadan OpenGraph/Twitter görsellerinin göreli yolları mutlak URL'ye
  // çevrilemez; paylaşım önizlemeleri görselsiz kalır.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} | NFC Dijital Kartvizit`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "NFC kartvizit",
    "dijital kartvizit",
    "akıllı kartvizit",
    "NFC kart",
    "QR kartvizit",
    "kurumsal kartvizit",
    "VYKTag",
  ],
  authors: [{ name: legalInfo.companyLegalName }],
  creator: legalInfo.companyLegalName,
  publisher: legalInfo.companyLegalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | NFC Dijital Kartvizit`,
    description: siteConfig.description,
    url: siteUrl,
    images: [{ url: "/logo.png", width: 512, height: 512, alt: `${siteConfig.name} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | NFC Dijital Kartvizit`,
    description: siteConfig.description,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Giriş animasyonları JavaScript ile tetiklenir. JavaScript çalışmazsa
          içerik gizli kalmamalı; bu stil animasyonu tamamen devre dışı bırakır.
        */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        {/*
          Marka/şirket kimliği her sayfada bir kez bildirilir; sayfaya özgü Product, FAQPage
          ve BreadcrumbList işaretlemeleri bunlara `@id` ile bağlanır (bkz. lib/seo).
        */}
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={webSiteJsonLd()} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
