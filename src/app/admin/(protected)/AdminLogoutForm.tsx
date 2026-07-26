"use client";

import { useActionState, useEffect } from "react";
import { logoutAdmin } from "@/app/admin/giris/actions";

const initialState = { redirectUrl: "" };

export function AdminLogoutForm() {
  const [state, action, pending] = useActionState(logoutAdmin, initialState);

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
        className="font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 disabled:opacity-50"
      >
        {pending ? "Çıkış yapılıyor..." : "Çıkış yap"}
      </button>
    </form>
  );
}
