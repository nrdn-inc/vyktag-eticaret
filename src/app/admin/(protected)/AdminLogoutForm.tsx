"use client";

import { useActionState, useEffect } from "react";
import { logoutAdmin } from "@/app/admin/giris/actions";
import { Button } from "@/components/ui";

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
      <Button
        type="submit"
        variant="link"
        loading={pending}
        loadingText="Çıkış yapılıyor..."
        className="text-zinc-600 hover:text-zinc-900 hover:no-underline dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        Çıkış yap
      </Button>
    </form>
  );
}
