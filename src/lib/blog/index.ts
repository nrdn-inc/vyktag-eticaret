import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Katalog verisiyle aynı desen (bkz. lib/catalog/index.ts dosya başı yorumu) — `force-dynamic`
 * kök layout'tan bağımsız olarak yazı sorgularını process genelinde kısa süreliğine önbellekler. */
export const BLOG_CACHE_TAG = "blog";
const BLOG_CACHE_REVALIDATE_SECONDS = 60;

export interface BlogPostSummary {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: Date;
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

/** Vitrin/blog listesi için yayınlanmış yazıları en yeniden eskiye sıralı döner. */
export async function getPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, excerpt: true, coverImage: true, publishedAt: true },
  });
  return posts
    .filter((post): post is typeof post & { publishedAt: Date } => post.publishedAt !== null)
    .map((post) => ({ ...post }));
}

const getPublishedBlogPostsCachedRaw = unstable_cache(getPublishedBlogPosts, ["blog:published-posts"], {
  tags: [BLOG_CACHE_TAG],
  revalidate: BLOG_CACHE_REVALIDATE_SECONDS,
});

/**
 * Sayfaların kullanması gereken, önbelleklenmiş sürüm — bkz. dosya başı yorumu.
 *
 * `unstable_cache`'in üretim ortamındaki (Data Cache) sonucu JSON üzerinden geçer; bu round-trip
 * `Date` nesnelerini düz ISO string'e çevirir (yalnızca `next dev`'de fark edilmez, çünkü orada
 * bellek içi referans korunur). `publishedAt`'i burada yeniden `Date`'e çevirmezsek
 * `toISOString()`/`Intl.DateTimeFormat` çağrıları üretimde 500 hatasıyla patlar.
 */
export async function getPublishedBlogPostsCached(): Promise<BlogPostSummary[]> {
  const posts = await getPublishedBlogPostsCachedRaw();
  return posts.map((post) => ({ ...post, publishedAt: new Date(post.publishedAt) }));
}

/** Yazı detay sayfası için yalnızca yayınlanmış bir yazıyı slug'a göre getirir. */
export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const post = await prisma.blogPost.findFirst({
    where: { slug, isPublished: true },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      metaTitle: true,
      metaDescription: true,
      publishedAt: true,
    },
  });
  if (!post || !post.publishedAt) {
    return null;
  }
  return { ...post, publishedAt: post.publishedAt };
}

const getBlogPostBySlugCachedRaw = unstable_cache(getBlogPostBySlug, ["blog:post-by-slug"], {
  tags: [BLOG_CACHE_TAG],
  revalidate: BLOG_CACHE_REVALIDATE_SECONDS,
});

/** Sayfaların kullanması gereken, önbelleklenmiş sürüm — bkz. getPublishedBlogPostsCached yorumu. */
export async function getBlogPostBySlugCached(slug: string): Promise<BlogPostDetail | null> {
  const post = await getBlogPostBySlugCachedRaw(slug);
  return post ? { ...post, publishedAt: new Date(post.publishedAt) } : null;
}

/** generateStaticParams/sitemap için tüm yayınlanmış yazı slug'larını döner. */
export async function getPublishedBlogSlugs(): Promise<string[]> {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return posts.map((p) => p.slug);
}
