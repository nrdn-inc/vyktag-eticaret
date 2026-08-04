import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleBlogPostPublished } from "./actions";
import { ActiveToggleForm } from "@/components/admin/ActiveToggleForm";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Blog | VYKTag Yönetim",
};

export const dynamic = "force-dynamic";

async function getPosts() {
  return prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(date);
}

export default async function AdminBlogPage() {
  const posts = await getPosts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="mt-1 text-sm text-zinc-500">
            SEO içeriklerini buradan yazın, düzenleyin ve yayınlayın.
          </p>
        </div>
        <Link href="/admin/blog/yeni">
          <Button>Yeni Yazı</Button>
        </Link>
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Yayın tarihi</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="text-zinc-500">{post.slug}</TableCell>
                <TableCell>{formatDate(post.publishedAt)}</TableCell>
                <TableCell>
                  <ActiveToggleForm action={toggleBlogPostPublished.bind(null, post.id)} isActive={post.isPublished} />
                </TableCell>
                <TableCell>
                  <Link href={`/admin/blog/${post.id}`} className="text-sm font-medium text-brand hover:text-brand-dark">
                    Düzenle
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
