"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerCustomer, type RegisterState } from "./actions";

const initialState: RegisterState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900";

export default function KayitPage() {
  const [state, action, pending] = useActionState(registerCustomer, initialState);

  if (state.success) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">E-postanızı kontrol edin</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          Hesabınızı doğrulamak ve şifrenizi belirlemek için gönderdiğimiz bağlantıya tıklayın.
          Bağlantı 24 saat geçerlidir.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Hesap oluştur</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Zaten hesabınız var mı?{" "}
          <Link href="/hesap/giris" className="font-medium text-brand hover:text-brand-dark">
            Giriş yapın
          </Link>
        </p>
      </header>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium">
            Ad Soyad
          </label>
          <input id="fullName" name="fullName" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            E-posta
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Telefon <span className="text-zinc-400">(isteğe bağlı)</span>
          </label>
          <input id="phone" name="phone" type="tel" className={inputClass} />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Gönderiliyor…" : "Hesap oluştur"}
        </button>
      </form>
    </div>
  );
}
