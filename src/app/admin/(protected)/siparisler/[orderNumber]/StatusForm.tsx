"use client";

import { useActionState } from "react";
import { OrderStatus } from "@/generated/prisma/client";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import { updateOrderStatus, type ActionState } from "./actions";

const initialState: ActionState = {};

export function StatusForm({ orderNumber, currentStatus }: { orderNumber: string; currentStatus: OrderStatus }) {
  const [state, action, pending] = useActionState(updateOrderStatus.bind(null, orderNumber), initialState);

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Durumu güncelle"}
      </button>
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      {state.ok && <span className="text-sm text-emerald-600">Güncellendi.</span>}
    </form>
  );
}
