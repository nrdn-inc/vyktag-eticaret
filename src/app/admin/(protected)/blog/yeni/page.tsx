import type { Metadata } from "next";
import { createBlogPost } from "../actions";
import { BlogPostForm } from "../BlogPostForm";

export const metadata: Metadata = {
  title: "Yeni Yazı | VYKTag Yönetim",
};

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Yeni Yazı</h1>
      <div className="mt-6">
        <BlogPostForm action={createBlogPost} submitLabel="Yazıyı oluştur" />
      </div>
    </div>
  );
}
