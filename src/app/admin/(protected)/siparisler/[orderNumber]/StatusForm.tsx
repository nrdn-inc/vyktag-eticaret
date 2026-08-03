"use client";

import { useActionState } from "react";
import { OrderStatus } from "@/generated/prisma/client";
import { ORDER_STATUS_LABELS } from "@/lib/orders/order-status";
import { updateOrderStatus, type ActionState } from "./actions";
import { Button, Select } from "@/components/ui";

const initialState: ActionState = {};

export function StatusForm({ orderNumber, currentStatus }: { orderNumber: string; currentStatus: OrderStatus }) {
  const [state, action, pending] = useActionState(updateOrderStatus.bind(null, orderNumber), initialState);

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <Select
        name="status"
        defaultValue={currentStatus}
        aria-label="Sipariş durumu"
        options={Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
      />
      <Button type="submit" loading={pending} loadingText="Kaydediliyor…">
        Durumu güncelle
      </Button>
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      {state.ok && <span className="text-sm text-emerald-600">Güncellendi.</span>}
    </form>
  );
}
