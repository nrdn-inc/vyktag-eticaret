import type { MetadataRoute } from "next";
import { getActiveProductSlugs } from "@/lib/catalog";
import { B2B_ENABLED } from "@/lib/site";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vyktag.com.tr";

const STATIC_PATHS = [
  "",
  "/urunler",
  "/fiyatlandirma",
  "/sss",
  ...(B2B_ENABLED ? ["/toplu-siparis"] : []),
  "/hakkimizda",
  "/iletisim",
  "/kvkk",
  "/mesafeli-satis-sozlesmesi",
  "/gizlilik-politikasi",
  "/teslimat-ve-iade",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getActiveProductSlugs();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  const productEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/urunler/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...productEntries];
}
