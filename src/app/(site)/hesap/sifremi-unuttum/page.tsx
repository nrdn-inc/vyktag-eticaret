"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";
import { Alert, Button, Input, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/cn";

const initialState: ForgotPasswordState = {};

export default function SifremiUnuttumPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  if (state.success) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">E-postanızı kontrol edin</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Şifre sıfırlama bağlantısını içeren bir e-posta gönderdik. Bağlantı 1 saat geçerlidir.
        </p>
        <Link href="/hesap/giris" className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-block")}>
          Girişe dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Şifremi unuttum</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Hesabınıza kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
        </p>
      </header>

      <form action={action} className="space-y-4">
        <Input id="email" name="email" type="email" label="E-posta" required autoComplete="username" />

        {state.error && <Alert variant="danger">{state.error}</Alert>}

        <Button type="submit" loading={pending} loadingText="Gönderiliyor…" fullWidth>
          Sıfırlama bağlantısı gönder
        </Button>

        <p className="text-center text-sm text-zinc-500">
          <Link href="/hesap/giris" className="font-medium text-brand hover:text-brand-dark">
            Girişe dön
          </Link>
        </p>
      </form>
    </div>
  );
}
