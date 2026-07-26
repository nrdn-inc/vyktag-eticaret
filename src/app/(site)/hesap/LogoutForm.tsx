"use client";

import { useActionState, useEffect } from "react";
import { logoutCustomer } from "./giris/actions";

const initialState = { redirectUrl: "" };

export function LogoutForm() {
  const [state, action, pending] = useActionState(logoutCustomer, initialState);

  useEffect(() => {
    if (state?.redirectUrl) {
      window.location.href = state.redirectUrl;
    }
  }, [state]);

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand dark:border-zinc-700 disabled:opacity-50"
      >
        {pending ? "Çıkış yapılıyor..." : "Çıkış yap"}
      </button>
    </form>
  );
}
