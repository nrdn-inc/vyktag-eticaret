import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateBlogPost } from "../actions";
import { BlogPostForm } from "../BlogPostForm";

export const metadata: Metadata = {
  title: "Yazıyı Düzenle | VYKTag Yönetim",
};

export default async function EditBlogPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
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
