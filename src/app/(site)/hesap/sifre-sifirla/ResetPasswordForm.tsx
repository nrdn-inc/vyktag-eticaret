"use client";

import { useActionState } from "react";
import { completePasswordReset, type ResetPasswordState } from "./actions";
import { Alert, Button, Input } from "@/components/ui";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(completePasswordReset, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Input id="password" name="password" type="password" label="Yeni şifre" required autoComplete="new-password" />
      <Input
        id="passwordAgain"
        name="passwordAgain"
        type="password"
        label="Yeni şifre (tekrar)"
        required
        autoComplete="new-password"
      />

      {state.error && <Alert variant="danger">{state.error}</Alert>}

      <Button type="submit" loading={pending} loadingText="Kaydediliyor…" fullWidth>
        Şifremi güncelle
      </Button>
    </form>
  );
}
