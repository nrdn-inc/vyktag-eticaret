"use client";

import { useActionState } from "react";
import { updateTracking, type ActionState } from "./actions";

const initialState: ActionState = {};

export function TrackingForm({
  orderNumber,
  trackingCarrier,
  trackingNumber,
}: {
  orderNumber: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
}) {
  const [state, action, pending] = useActionState(updateTracking.bind(null, orderNumber), initialState);

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="trackingCarrier" className="block text-xs font-medium text-zinc-500">
          Kargo firması
        </label>
        <input
          id="trackingCarrier"
          name="trackingCarrier"
          type="text"
          defaultValue={trackingCarrier ?? ""}
          placeholder="Örn. Yurtiçi Kargo"
          className="mt-1 w-48 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="trackingNumber" className="block text-xs font-medium text-zinc-500">
          Takip numarası
        </label>
        <input
          id="trackingNumber"
          name="trackingNumber"
          type="text"
          defaultValue={trackingNumber ?? ""}
          className="mt-1 w-48 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Kaydediliyor…" : "Kargo bilgisini kaydet"}
      </button>
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      {state.ok && <span className="text-sm text-emerald-600">Kaydedildi.</span>}
    </form>
  );
}
