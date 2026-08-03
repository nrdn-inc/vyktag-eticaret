"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import {
  loginCustomer,
  verifyTotpLogin,
  verifyTwoFactorLogin,
  type LoginState,
  type TwoFactorLoginState,
} from "./actions";
import { Alert, Button, Input } from "@/components/ui";

const initialLoginState: LoginState = {};
const initialTwoFactorState: TwoFactorLoginState = {};
const initialTotpState: TwoFactorLoginState = {};

export default function GirisPage() {
  const [loginState, loginAction, loginPending] = useActionState(loginCustomer, initialLoginState);
  const [twoFactorState, twoFactorAction, twoFactorPending] = useActionState(
    verifyTwoFactorLogin,
    initialTwoFactorState,
  );
  const [totpState, totpAction, totpPending] = useActionState(verifyTotpLogin, initialTotpState);

  useEffect(() => {
    const url = loginState.redirectUrl || twoFactorState.redirectUrl || totpState.redirectUrl;
    if (url) {
      window.location.href = url;
    }
  }, [loginState.redirectUrl, twoFactorState.redirectUrl, totpState.redirectUrl]);

  // Şifre doğrulandıktan sonra 2FA kodu istenmişse (ilk kez ya da yanlış kod sonrası tekrar),
  // aynı adımda kalırız. Yöntem yalnızca ilk giriş isteğinde belirlenir ve değişmez.
  const isTotp = loginState.twoFactorMethod === "TOTP";
  const pendingTwoFactorToken =
    (isTotp ? totpState.token : twoFactorState.token) ?? loginState.twoFactorToken;

  if (pendingTwoFactorToken) {
    const state = isTotp ? totpState : twoFactorState;
    const action = isTotp ? totpAction : twoFactorAction;
    const pending = isTotp ? totpPending : twoFactorPending;

    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Doğrulama kodu</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {isTotp
              ? "Authenticator uygulamanızda görünen 6 haneli kodu girin."
              : "E-postanıza gönderdiğimiz 6 haneli kodu girin."}
          </p>
        </header>

        <form action={action} className="space-y-4">
          <input type="hidden" name="token" value={pendingTwoFactorToken} />
          <Input
            id="code"
            name="code"
            label="Doğrulama kodu"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
          />

          {state.error && <Alert variant="danger">{state.error}</Alert>}

          <Button type="submit" loading={pending} loadingText="Doğrulanıyor…" fullWidth>
            Doğrula ve giriş yap
          </Button>
        </form>
      </div>
    );
  }

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

      <form action={loginAction} className="space-y-4">
        <Input
          id="username"
          name="username"
          type="text"
          label="E-posta veya kullanıcı adı"
          required
          autoComplete="username"
        />
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium">
              Şifre
            </label>
            <Link href="/hesap/sifremi-unuttum" className="text-xs font-medium text-brand hover:text-brand-dark">
              Şifremi unuttum
            </Link>
          </div>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>

        {loginState.error && <Alert variant="danger">{loginState.error}</Alert>}

        <Button type="submit" loading={loginPending} loadingText="Giriş yapılıyor…" fullWidth>
          Giriş yap
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/admin/giris" className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          Yönetici Girişi
        </Link>
      </div>
    </div>
  );
}
