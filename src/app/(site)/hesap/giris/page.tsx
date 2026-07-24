"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginCustomer, type LoginState } from "./actions";

const initialState: LoginState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900";

export default function GirisPage() {
  const [state, action, pending] = useActionState(loginCustomer, initialState);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Giriş yap</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Hesabınız yok mu?{" "}
          <Link href="/hesap/kayit" className="font-medium text-brand hover:text-brand-dark">
            Hesap oluşturun
          </Link>
        </p>
      </header>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            E-posta
          </label>
          <input id="email" name="email" type="email" required autoComplete="username" className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
    </div>
  );
}
