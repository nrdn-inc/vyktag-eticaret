"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { BLOG_CACHE_TAG } from "@/lib/blog";
import { sanitizeBlogCoverImage } from "@/lib/blog-image-upload";
import { slugify } from "@/lib/slugify";

export interface BlogPostFormState {
  error?: string;
}

function revalidateBlog(slug?: string) {
  revalidatePath("/blog");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
  revalidatePath("/sitemap.xml");
  updateTag(BLOG_CACHE_TAG);
}

function readPostFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const metaTitle = String(formData.get("metaTitle") ?? "").trim() || null;
  const metaDescription = String(formData.get("metaDescription") ?? "").trim() || null;
  const coverImage = sanitizeBlogCoverImage(formData.get("coverImage"));
  const isPublished = formData.get("isPublished") === "on";

  return {
    title,
    slug: slugify(rawSlug || title),
    excerpt,
    content,
    metaTitle,
    metaDescription,
    coverImage,
    isPublished,
  };
}

function validatePostFields(fields: ReturnType<typeof readPostFields>): string | null {
  if (!fields.title) return "Başlık gerekli.";
  if (!fields.slug) return "Geçerli bir slug oluşturulamadı — lütfen başlığı veya slug'ı kontrol edin.";
  if (!fields.excerpt) return "Özet gerekli.";
  if (!fields.content) return "İçerik gerekli.";
  return null;
}

/** Yeni blog yazısı oluşturur. */
export async function createBlogPost(_prevState: BlogPostFormState, formData: FormData): Promise<BlogPostFormState> {
  await verifyAdminSession();

  const fields = readPostFields(formData);
  const error = validatePostFields(fields);
  if (error) {
    return { error };
  }

  const existing = await prisma.blogPost.findUnique({ where: { slug: fields.slug } });
  if (existing) {
    return { error: `"${fields.slug}" slug'ı zaten kullanılıyor. Lütfen farklı bir slug girin.` };
  }

  const post = await prisma.blogPost.create({
    data: {
      title: fields.title,
      slug: fields.slug,
      excerpt: fields.excerpt,
      content: fields.content,
      coverImage: fields.coverImage,
      metaTitle: fields.metaTitle,
      metaDescription: fields.metaDescription,
      isPublished: fields.isPublished,
      publishedAt: fields.isPublished ? new Date() : null,
    },
  });

  revalidateBlog(fields.slug);
  redirect(`/admin/blog/${post.id}`);
}

/** Var olan bir blog yazısını günceller. */
export async function updateBlogPost(
  postId: string,
  _prevState: BlogPostFormState,
  formData: FormData,
): Promise<BlogPostFormState> {
  await verifyAdminSession();

  const current = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!current) {
    return { error: "Yazı bulunamadı." };
  }

  const fields = readPostFields(formData);
  const error = validatePostFields(fields);
  if (error) {
    return { error };
  }

  if (fields.slug !== current.slug) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: fields.slug } });
    if (existing) {
      return { error: `"${fields.slug}" slug'ı zaten kullanılıyor. Lütfen farklı bir slug girin.` };
    }
  }

  // publishedAt yalnızca taslaktan yayına GEÇİŞTE damgalanır — zaten yayında olan bir yazı
  // yeniden kaydedildiğinde ilk yayın tarihi korunur (blog kronolojisi bozulmasın diye).
  const publishedAt = fields.isPublished ? (current.publishedAt ?? new Date()) : null;

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      title: fields.title,
      slug: fields.slug,
      excerpt: fields.excerpt,
      content: fields.content,
      coverImage: fields.coverImage,
      metaTitle: fields.metaTitle,
      metaDescription: fields.metaDescription,
      isPublished: fields.isPublished,
      publishedAt,
    },
  });

  revalidateBlog(current.slug);
  if (fields.slug !== current.slug) {
    revalidateBlog(fields.slug);
  }
  redirect(`/admin/blog/${postId}`);
}

export interface TogglePublishedState {
  error?: string;
  isActive?: boolean;
}

/** Yazıyı tek tıkla yayınla/taslağa al. */
export async function toggleBlogPostPublished(postId: string): Promise<TogglePublishedState> {
  await verifyAdminSession();

  const current = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!current) {
    return { error: "Yazı bulunamadı." };
  }

  const nextPublished = !current.isPublished;
  const updated = await prisma.blogPost.update({
    where: { id: postId },
    data: {
      isPublished: nextPublished,
      publishedAt: nextPublished ? (current.publishedAt ?? new Date()) : null,
    },
  });

  revalidateBlog(updated.slug);
  revalidatePath("/admin/blog");
  return { isActive: updated.isPublished };
}
