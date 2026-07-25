import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vyktag.com.tr";

// Botların /admin, /api, /hesap gibi özel/hassas ve SEO değeri olmayan yolları
// taramasını engeller. Bu dosya yokken her bot isteği tam bir 404 render'ı
// tetikleyip Hostinger'daki eşzamanlı süreç limitini gereksiz yere tüketiyordu.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/hesap", "/sepet", "/odeme", "/siparis"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
