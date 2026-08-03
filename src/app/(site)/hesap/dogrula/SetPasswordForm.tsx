"use client";

import { useActionState } from "react";
import { completeEmailVerification, type CompleteVerificationState } from "./actions";
import { Alert, Button, Input } from "@/components/ui";

const initialState: CompleteVerificationState = {};

export function SetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(completeEmailVerification, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Input id="password" name="password" type="password" label="Şifre" required autoComplete="new-password" />
      <Input
        id="passwordAgain"
        name="passwordAgain"
        type="password"
        label="Şifre (tekrar)"
        required
        autoComplete="new-password"
      />

      {state.error && <Alert variant="danger">{state.error}</Alert>}

      <Button type="submit" loading={pending} loadingText="Kaydediliyor…" fullWidth>
        Şifremi belirle ve hesabımı doğrula
      </Button>
    </form>
  );
}
