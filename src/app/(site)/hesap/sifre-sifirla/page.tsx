import Link from "next/link";
import { verifyPasswordResetToken } from "@/lib/auth";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/cn";

export const metadata = {
  title: "Şifreyi Sıfırla",
};

export default async function SifreSifirlaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const payload = token ? verifyPasswordResetToken(token) : null;

  if (!token || !payload) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Bağlantı geçersiz</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Bu şifre sıfırlama bağlantısının süresi dolmuş ya da geçersiz. Yeniden bir bağlantı
          isteyebilirsiniz.
        </p>
        <Link
          href="/hesap/sifremi-unuttum"
          className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-block")}
        >
          Yeniden bağlantı iste
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Yeni şifre belirle</h1>
      </header>

      <ResetPasswordForm token={token} />
    </div>
  );
}
