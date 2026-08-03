"use client";

import { useActionState, useEffect } from "react";
import { logoutCustomer } from "./giris/actions";
import { Button } from "@/components/ui";

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
      <Button type="submit" variant="muted" className="text-sm" loading={pending} loadingText="Çıkış yapılıyor...">
        Çıkış yap
      </Button>
    </form>
  );
}
