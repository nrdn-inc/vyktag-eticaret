import type { MetadataRoute } from "next";
import { getActiveProductSlugs } from "@/lib/catalog";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vyktag.com.tr";

const STATIC_PATHS = [
  "",
  "/urunler",
  "/fiyatlandirma",
  "/sss",
  "/hakkimizda",
  "/toplu-siparis",
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
