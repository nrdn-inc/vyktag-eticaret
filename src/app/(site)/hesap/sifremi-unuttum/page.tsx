"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900";

export default function SifremiUnuttumPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  if (state.success) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">E-postanızı kontrol edin</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Şifre sıfırlama bağlantısını içeren bir e-posta gönderdik. Bağlantı 1 saat geçerlidir.
        </p>
        <Link
          href="/hesap/giris"
          className="mt-8 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
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
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            E-posta
          </label>
          <input id="email" name="email" type="email" required autoComplete="username" className={inputClass} />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
        </button>

        <p className="text-center text-sm text-zinc-500">
          <Link href="/hesap/giris" className="font-medium text-brand hover:text-brand-dark">
            Girişe dön
          </Link>
        </p>
      </form>
    </div>
  );
}
