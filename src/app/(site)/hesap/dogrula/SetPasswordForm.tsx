"use client";

import { useActionState } from "react";
import { completeEmailVerification, type CompleteVerificationState } from "./actions";

const initialState: CompleteVerificationState = {};

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900";

export function SetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(completeEmailVerification, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Şifre
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
          Şifre (tekrar)
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
        {pending ? "Kaydediliyor…" : "Şifremi belirle ve hesabımı doğrula"}
      </button>
    </form>
  );
}
