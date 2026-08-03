"use client";

import { useActionState } from "react";
import { setVariantStock, type StockActionState } from "./actions";
import { Button, Input } from "@/components/ui";

const initialState: StockActionState = {};

export function StockForm({ variantId, currentStock }: { variantId: string; currentStock: number }) {
  const [state, action, pending] = useActionState(setVariantStock.bind(null, variantId), initialState);

  return (
    <form action={action} className="flex items-center gap-2">
      <Input
        name="stock"
        type="number"
        min={0}
        step={1}
        defaultValue={currentStock}
        aria-label="Stok"
        fieldSize="sm"
        containerClassName="w-24"
      />
      <Button type="submit" size="sm" loading={pending} loadingText="…">
        Kaydet
      </Button>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
      {state.ok && <span className="text-xs text-emerald-600">✓</span>}
    </form>
  );
}
