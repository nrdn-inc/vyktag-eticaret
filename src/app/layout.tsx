import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";

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
  title: {
    default: `${siteConfig.name} | NFC Dijital Kartvizit`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
