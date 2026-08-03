"use client";

import { useActionState } from "react";
import { provisionHandoff, type ActionState } from "./actions";
import { Alert, Button, Input } from "@/components/ui";

const initialState: ActionState = {};

export function HandoffForm({ orderItemId, orderNumber }: { orderItemId: string; orderNumber: string }) {
  const [state, action, pending] = useActionState(
    provisionHandoff.bind(null, orderItemId, orderNumber),
    initialState,
  );

  return (
    <form action={action} className="mt-3 space-y-2 rounded-lg bg-surface-muted p-3">
      <div className="flex flex-wrap gap-2">
        <Input
          name="dkartvizitUsername"
          type="text"
          required
          placeholder="dkartvizit kullanıcı adı"
          aria-label="dkartvizit kullanıcı adı"
          containerClassName="w-56"
        />
        <Input
          name="notes"
          type="text"
          placeholder="Not (opsiyonel)"
          aria-label="Not"
          containerClassName="min-w-[10rem] flex-1"
        />
        <Button type="submit" loading={pending} loadingText="Kaydediliyor…">
          Sağlandı olarak işaretle
        </Button>
      </div>
      {state.error && <Alert variant="danger">{state.error}</Alert>}
    </form>
  );
}
