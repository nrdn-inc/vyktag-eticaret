import type { MetadataRoute } from "next";
import { getActiveProductSlugs } from "@/lib/catalog";
import { getPublishedBlogSlugs } from "@/lib/blog";
import { B2B_ENABLED } from "@/lib/site";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vyktag.com.tr";

const STATIC_PATHS = [
  "",
  "/urunler",
  "/fiyatlandirma",
  "/sss",
  "/blog",
  ...(B2B_ENABLED ? ["/toplu-siparis"] : []),
  "/hakkimizda",
  "/iletisim",
  "/kvkk",
  "/mesafeli-satis-sozlesmesi",
  "/gizlilik-politikasi",
  "/teslimat-ve-iade",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, blogSlugs] = await Promise.all([getActiveProductSlugs(), getPublishedBlogSlugs()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  const productEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/urunler/${slug}`,
    lastModified: new Date(),
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...productEntries, ...blogEntries];
}
