import Link from "next/link";
import { verifyAdminSession } from "@/lib/admin-session";
import { logoutAdmin } from "@/app/admin/giris/actions";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await verifyAdminSession();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin/siparisler" className="font-bold tracking-tight">
              Vyktag Yönetim
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/siparisler" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Siparişler
              </Link>
              <Link href="/admin/stok" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Stok
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-zinc-500">{user.fullName}</span>
            <form action={logoutAdmin}>
              <button type="submit" className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                Çıkış yap
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
