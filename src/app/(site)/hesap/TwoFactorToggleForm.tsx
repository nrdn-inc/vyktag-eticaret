"use client";

import { useActionState } from "react";
import { disableTwoFactor, enableTwoFactor, type TwoFactorToggleState } from "./actions";

const initialState: TwoFactorToggleState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900 sm:max-w-xs";

export function TwoFactorToggleForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(enabled ? disableTwoFactor : enableTwoFactor, initialState);

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {enabled
          ? "İki adımlı doğrulama açık. Her girişte e-postanıza bir kod gönderilir. Kapatmak için şifrenizi girin."
          : "Etkinleştirildiğinde her girişte e-postanıza gönderilen 6 haneli bir kod istenir. Etkinleştirmek için şifrenizi girin."}
      </p>

      <div>
        <label htmlFor="tfa-password" className="block text-sm font-medium">
          Şifreniz
        </label>
        <input
          id="tfa-password"
          required
          name="password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        // `enabled` prop, başarılı bir kaydetmenin ardından revalidatePath ile YENİ durumu
        // yansıtır — bu yüzden mesaj "az önce ne oldu" değil "şu an ne durumda" mantığıyla eşlenir.
        <p className="text-sm text-green-600">
          {enabled ? "İki adımlı doğrulama etkinleştirildi." : "İki adımlı doğrulama kapatıldı."}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : enabled ? "İki adımlı doğrulamayı kapat" : "İki adımlı doğrulamayı etkinleştir"}
      </button>
    </form>
  );
}
