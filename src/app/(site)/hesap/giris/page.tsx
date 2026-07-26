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

const initialLoginState: LoginState = {};
const initialTwoFactorState: TwoFactorLoginState = {};
const initialTotpState: TwoFactorLoginState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900";

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
          <div>
            <label htmlFor="code" className="block text-sm font-medium">
              Doğrulama kodu
            </label>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              className={inputClass}
            />
          </div>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? "Doğrulanıyor…" : "Doğrula ve giriş yap"}
          </button>
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
        <div>
          <label htmlFor="username" className="block text-sm font-medium">
            E-posta veya kullanıcı adı
          </label>
          <input id="username" name="username" type="text" required autoComplete="username" className={inputClass} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium">
              Şifre
            </label>
            <Link href="/hesap/sifremi-unuttum" className="text-xs font-medium text-brand hover:text-brand-dark">
              Şifremi unuttum
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        {loginState.error && <p className="text-sm text-red-600">{loginState.error}</p>}

        <button
          type="submit"
          disabled={loginPending}
          className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {loginPending ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/admin/giris" className="text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          Yönetici Girişi
        </Link>
      </div>
    </div>
  );
}
