import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { getBlogPostBySlugCached } from "@/lib/blog";
import { JsonLd } from "@/components/JsonLd";
import { blogPostJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlugCached(slug);
  if (!post) {
    return { title: "Yazı bulunamadı" };
  }
  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${slug}`,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(date);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlugCached(slug);

  if (!post) {
    notFound();
  }

  // İçerik yalnızca admin tarafından girildiği için (kullanıcı-üretimi içerik değil) ek bir
  // sanitization katmanı gerekmiyor — ürün görseli/açıklaması ile aynı güven seviyesi.
  const contentHtml = await marked.parse(post.content);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLd data={blogPostJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana sayfa", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <nav className="mb-8 text-sm text-zinc-500">
        <Link href="/blog" className="hover:text-brand">
          Blog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-700 dark:text-zinc-300">{post.title}</span>
      </nav>

      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{formatDate(post.publishedAt)}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>

      {post.coverImage && (
        // h-auto: görsel doğal en-boy oranıyla, kırpılmadan gösterilir (bkz. blog/page.tsx'teki
        // object-contain yorumu — sabit 16:9 kutu farklı oranlı yüklemelerde görseli keserdi).
        // eslint-disable-next-line @next/next/no-img-element -- admin'de yüklenen data URL, next/image optimizasyonuna uygun değil.
        <img src={post.coverImage} alt={post.title} className="mt-8 h-auto w-full rounded-2xl object-contain" />
      )}

      <div
        className="prose prose-zinc mt-8 max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-brand"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  );
}
