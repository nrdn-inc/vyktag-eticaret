import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedBlogPostsCached } from "@/lib/blog";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { PageHero } from "@/components/PageHero";
import { EmptyState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Blog",
  description: "NFC dijital kartvizit, networking ve VYKTag ürünleri hakkında rehberler ve haberler.",
  alternates: { canonical: "/blog" },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(date);
}

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPostsCached();

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([{ name: "Ana sayfa", path: "/" }, { name: "Blog", path: "/blog" }])} />

      <PageHero
        eyebrow="Blog"
        title="Dijital kartvizit rehberleri ve haberler"
        description="NFC teknolojisi, networking ipuçları ve VYKTag ürünleri hakkında yazılar."
      />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        {posts.length === 0 ? (
          <EmptyState title="Henüz yazı yok" description="Çok yakında burada yeni içerikler olacak." />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group overflow-hidden rounded-3xl border border-border-soft bg-surface transition-all hover:border-brand/40 hover:shadow-xl"
              >
                <Link href={`/blog/${post.slug}`}>
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin'de yüklenen data URL, next/image optimizasyonuna uygun değil.
                    <img src={post.coverImage} alt={post.title} className="aspect-[16/9] w-full object-cover" />
                  ) : (
                    <div className="aspect-[16/9] w-full bg-gradient-to-br from-brand/10 via-accent/5 to-transparent" />
                  )}
                  <div className="p-6">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {formatDate(post.publishedAt)}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold group-hover:text-brand">{post.title}</h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
