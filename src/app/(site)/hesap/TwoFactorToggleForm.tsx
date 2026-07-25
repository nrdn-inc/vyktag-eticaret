"use client";

import { useActionState, useState } from "react";
import {
  confirmTotpEnrollment,
  disableTwoFactor,
  enableTwoFactor,
  startTotpEnrollment,
  type TotpConfirmState,
  type TotpEnrollmentState,
  type TwoFactorToggleState,
} from "./actions";

const initialToggleState: TwoFactorToggleState = {};
const initialEnrollState: TotpEnrollmentState = {};
const initialConfirmState: TotpConfirmState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900 sm:max-w-xs";

type Method = "EMAIL" | "TOTP";

function methodLabel(method: Method): string {
  return method === "TOTP" ? "Authenticator uygulaması" : "E-posta";
}

export function TwoFactorToggleForm({ enabled, method }: { enabled: boolean; method: Method }) {
  const [selectedMethod, setSelectedMethod] = useState<Method>("EMAIL");
  const [enrollCancelled, setEnrollCancelled] = useState(false);

  const [disableState, disableAction, disablePending] = useActionState(disableTwoFactor, initialToggleState);
  const [emailEnableState, emailEnableAction, emailEnablePending] = useActionState(
    enableTwoFactor,
    initialToggleState,
  );
  const [enrollState, enrollAction, enrollPending] = useActionState(startTotpEnrollment, initialEnrollState);
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmTotpEnrollment,
    initialConfirmState,
  );

  if (enabled) {
    return (
      <form action={disableAction} className="space-y-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          İki adımlı doğrulama açık ({methodLabel(method)}). Kapatmak için şifrenizi girin.
        </p>

        <div>
          <label htmlFor="tfa-disable-password" className="block text-sm font-medium">
            Şifreniz
          </label>
          <input
            id="tfa-disable-password"
            required
            name="password"
            type="password"
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        {disableState.error && <p className="text-sm text-red-600">{disableState.error}</p>}

        <button
          type="submit"
          disabled={disablePending}
          className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {disablePending ? "Kaydediliyor…" : "İki adımlı doğrulamayı kapat"}
        </button>
      </form>
    );
  }

  // Authenticator eşleştirmesi başlatıldı (sır + QR üretildi) ve henüz onaylanmadı/vazgeçilmedi:
  // kod doğrulama adımını göster.
  if (enrollState.qrDataUrl && !confirmState.success && !enrollCancelled) {
    return (
      <div className="space-y-4 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Google Authenticator, Authy veya 1Password gibi bir uygulamayla aşağıdaki QR kodu okutun,
          ya da sırrı elle girin. Ardından uygulamada görünen 6 haneli kodu girin.
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element -- sunucuda üretilen QR data URL'i, next/image optimizasyonuna uygun değil. */}
        <img src={enrollState.qrDataUrl} alt="Authenticator uygulaması için TOTP QR kodu" className="h-40 w-40" />

        <p className="break-all rounded-lg bg-zinc-100 px-3 py-2 font-mono text-xs dark:bg-zinc-900">
          {enrollState.secret}
        </p>

        <form action={confirmAction} className="space-y-3">
          <div>
            <label htmlFor="totp-confirm-code" className="block text-sm font-medium">
              6 haneli kod
            </label>
            <input
              id="totp-confirm-code"
              required
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              className={inputClass}
            />
          </div>

          {confirmState.error && <p className="text-sm text-red-600">{confirmState.error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={confirmPending}
              className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {confirmPending ? "Doğrulanıyor…" : "Onayla ve etkinleştir"}
            </button>
            <button
              type="button"
              onClick={() => setEnrollCancelled(true)}
              className="rounded-full border border-zinc-300 px-6 py-2 text-sm font-medium dark:border-zinc-700"
            >
              Vazgeç
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Etkinleştirdiğinizde her girişte ek bir doğrulama istenir. Yöntem seçin ve şifrenizi girin.
      </p>

      <div className="flex gap-2" role="radiogroup" aria-label="İki adımlı doğrulama yöntemi">
        {(["EMAIL", "TOTP"] as const).map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selectedMethod === option}
            onClick={() => {
              setSelectedMethod(option);
              setEnrollCancelled(false);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedMethod === option
                ? "bg-brand text-white"
                : "border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {methodLabel(option)}
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-500">
        {selectedMethod === "TOTP"
          ? "Her girişte authenticator uygulamanızda görünen 6 haneli kod istenir — e-posta gerekmez."
          : "Her girişte e-postanıza gönderilen 6 haneli bir kod istenir."}
      </p>

      <form action={selectedMethod === "EMAIL" ? emailEnableAction : enrollAction} className="space-y-3">
        <div>
          <label htmlFor="tfa-enable-password" className="block text-sm font-medium">
            Şifreniz
          </label>
          <input
            id="tfa-enable-password"
            required
            name="password"
            type="password"
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        {selectedMethod === "EMAIL"
          ? emailEnableState.error && <p className="text-sm text-red-600">{emailEnableState.error}</p>
          : enrollState.error && <p className="text-sm text-red-600">{enrollState.error}</p>}

        <button
          type="submit"
          disabled={emailEnablePending || enrollPending}
          className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {emailEnablePending || enrollPending
            ? "İşleniyor…"
            : selectedMethod === "EMAIL"
              ? "E-posta ile etkinleştir"
              : "Authenticator ile devam et"}
        </button>
      </form>
    </div>
  );
}
