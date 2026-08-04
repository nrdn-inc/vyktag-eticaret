import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateBlogPost } from "../actions";
import { BlogPostForm } from "../BlogPostForm";
import { Alert } from "@/components/ui";

export const metadata: Metadata = {
  title: "Yazıyı Düzenle | VYKTag Yönetim",
};

export default async function EditBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
}) {
  const { postId } = await params;
  const { kaydedildi } = await searchParams;
  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
      {/* Kaydetme başarılı olduğunda updateBlogPost/createBlogPost buraya ?kaydedildi=1 ile
          yönlendirir — aksi halde form sessizce yeniden açılıyor ve kaydın işleyip işlemediği
          anlaşılmıyordu. Hata durumunda zaten BlogPostForm içinde Alert(danger) gösteriliyor. */}
      {kaydedildi === "1" && (
        <div className="mt-4">
          <Alert variant="success">Değişiklikler kaydedildi.</Alert>
        </div>
      )}
      <div className="mt-6">
        <BlogPostForm
          action={updateBlogPost.bind(null, postId)}
          submitLabel="Değişiklikleri kaydet"
          initial={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            isPublished: post.isPublished,
          }}
        />
      </div>
    </div>
  );
}
