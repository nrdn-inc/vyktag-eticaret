"use client";

import { useActionState } from "react";
import { provisionHandoff, type ActionState } from "./actions";

const initialState: ActionState = {};

export function HandoffForm({ orderItemId, orderNumber }: { orderItemId: string; orderNumber: string }) {
  const [state, action, pending] = useActionState(
    provisionHandoff.bind(null, orderItemId, orderNumber),
    initialState,
  );

  return (
    <form action={action} className="mt-3 space-y-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">
      <div className="flex flex-wrap gap-2">
        <input
          name="dkartvizitUsername"
          type="text"
          required
          placeholder="dkartvizit kullanıcı adı"
          className="w-56 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <input
          name="notes"
          type="text"
          placeholder="Not (opsiyonel)"
          className="flex-1 min-w-[10rem] rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Kaydediliyor…" : "Sağlandı olarak işaretle"}
        </button>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
