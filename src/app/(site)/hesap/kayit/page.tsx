"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerCustomer, type RegisterState } from "./actions";
import { Alert, Button, Input } from "@/components/ui";

const initialState: RegisterState = {};

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
        <Input id="fullName" name="fullName" type="text" label="Ad Soyad" required />
        <Input id="email" name="email" type="email" label="E-posta" required autoComplete="email" />
        <Input
          id="phone"
          name="phone"
          type="tel"
          label={
            <>
              Telefon <span className="text-zinc-400">(isteğe bağlı)</span>
            </>
          }
        />

        {state.error && <Alert variant="danger">{state.error}</Alert>}

        <Button type="submit" loading={pending} loadingText="Gönderiliyor…" fullWidth>
          Hesap oluştur
        </Button>
      </form>
    </div>
  );
}
