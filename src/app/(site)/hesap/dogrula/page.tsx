import Link from "next/link";
import { verifyEmailVerificationToken } from "@/lib/auth";
import { SetPasswordForm } from "./SetPasswordForm";

export const metadata = {
  title: "Hesabı Doğrula",
};

export default async function DogrulaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const payload = token ? verifyEmailVerificationToken(token) : null;

  if (!token || !payload) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Bağlantı geçersiz</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Bu doğrulama bağlantısının süresi dolmuş ya da geçersiz. Yeniden kayıt olarak yeni bir
          bağlantı isteyebilirsiniz.
        </p>
        <Link
          href="/hesap/kayit"
          className="mt-8 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Yeniden kayıt ol
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Hesabınızı doğrulayın</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Devam etmek için bir şifre belirleyin.
        </p>
      </header>

      <SetPasswordForm token={token} />
    </div>
  );
}
