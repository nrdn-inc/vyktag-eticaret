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
import { Alert, Button, Input, PillToggleGroup } from "@/components/ui";

const initialToggleState: TwoFactorToggleState = {};
const initialEnrollState: TotpEnrollmentState = {};
const initialConfirmState: TotpConfirmState = {};

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

        <Input
          id="tfa-disable-password"
          required
          name="password"
          type="password"
          label="Şifreniz"
          autoComplete="current-password"
          containerClassName="sm:max-w-xs"
        />

        {disableState.error && <Alert variant="danger">{disableState.error}</Alert>}

        <Button type="submit" loading={disablePending} loadingText="Kaydediliyor…">
          İki adımlı doğrulamayı kapat
        </Button>
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
          <Input
            id="totp-confirm-code"
            required
            name="code"
            label="6 haneli kod"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            containerClassName="sm:max-w-xs"
          />

          {confirmState.error && <Alert variant="danger">{confirmState.error}</Alert>}

          <div className="flex gap-3">
            <Button type="submit" loading={confirmPending} loadingText="Doğrulanıyor…">
              Onayla ve etkinleştir
            </Button>
            <Button type="button" variant="muted" onClick={() => setEnrollCancelled(true)}>
              Vazgeç
            </Button>
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

      <PillToggleGroup
        aria-label="İki adımlı doğrulama yöntemi"
        size="sm"
        value={selectedMethod}
        onChange={(value) => {
          setSelectedMethod(value as Method);
          setEnrollCancelled(false);
        }}
        options={[
          { value: "EMAIL", label: methodLabel("EMAIL") },
          { value: "TOTP", label: methodLabel("TOTP") },
        ]}
      />

      <p className="text-xs text-zinc-500">
        {selectedMethod === "TOTP"
          ? "Her girişte authenticator uygulamanızda görünen 6 haneli kod istenir — e-posta gerekmez."
          : "Her girişte e-postanıza gönderilen 6 haneli bir kod istenir."}
      </p>

      <form action={selectedMethod === "EMAIL" ? emailEnableAction : enrollAction} className="space-y-3">
        <Input
          id="tfa-enable-password"
          required
          name="password"
          type="password"
          label="Şifreniz"
          autoComplete="current-password"
          containerClassName="sm:max-w-xs"
        />

        {selectedMethod === "EMAIL"
          ? emailEnableState.error && <Alert variant="danger">{emailEnableState.error}</Alert>
          : enrollState.error && <Alert variant="danger">{enrollState.error}</Alert>}

        <Button type="submit" loading={emailEnablePending || enrollPending} loadingText="İşleniyor…">
          {selectedMethod === "EMAIL" ? "E-posta ile etkinleştir" : "Authenticator ile devam et"}
        </Button>
      </form>
    </div>
  );
}
