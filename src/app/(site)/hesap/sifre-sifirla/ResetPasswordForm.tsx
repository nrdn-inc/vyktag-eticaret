"use client";

import { useActionState } from "react";
import { completePasswordReset, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(completePasswordReset, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Yeni şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="passwordAgain" className="block text-sm font-medium">
          Yeni şifre (tekrar)
        </label>
        <input
          id="passwordAgain"
          name="passwordAgain"
          type="password"
          required
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Şifremi güncelle"}
      </button>
    </form>
  );
}
