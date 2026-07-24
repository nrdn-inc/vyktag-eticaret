"use client";

import { useActionState } from "react";
import { setVariantStock, type StockActionState } from "./actions";

const initialState: StockActionState = {};

export function StockForm({ variantId, currentStock }: { variantId: string; currentStock: number }) {
  const [state, action, pending] = useActionState(setVariantStock.bind(null, variantId), initialState);

  return (
    <form action={action} className="flex items-center gap-2">
      <input
        name="stock"
        type="number"
        min={0}
        step={1}
        defaultValue={currentStock}
        className="w-24 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "…" : "Kaydet"}
      </button>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
      {state.ok && <span className="text-xs text-emerald-600">✓</span>}
    </form>
  );
}
