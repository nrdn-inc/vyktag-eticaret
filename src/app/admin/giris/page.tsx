"use client";

import { useActionState, useEffect } from "react";
import { loginAdmin, type LoginState } from "./actions";
import { Alert, Button, Input } from "@/components/ui";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAdmin, initialState);
  
  useEffect(() => {
    if (state.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state.redirectUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-bold tracking-tight">VYKTag Yönetim Paneli</h1>
        <p className="mt-1 text-sm text-zinc-500">Devam etmek için giriş yapın.</p>

        <form action={action} className="mt-6 space-y-4">
          <Input
            id="username"
            name="username"
            type="text"
            label="Kullanıcı adı veya e-posta"
            required
            autoComplete="username"
          />
          <Input id="password" name="password" type="password" label="Şifre" required autoComplete="current-password" />

          {state.error && <Alert variant="danger">{state.error}</Alert>}

          <Button type="submit" loading={pending} loadingText="Giriş yapılıyor…" fullWidth>
            Giriş yap
          </Button>
        </form>
      </div>
    </div>
  );
}
