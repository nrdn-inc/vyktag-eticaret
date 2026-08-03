"use client";

import { useActionState } from "react";
import { updateTracking, type ActionState } from "./actions";
import { Button, Input } from "@/components/ui";

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
      <Input
        id="trackingCarrier"
        name="trackingCarrier"
        type="text"
        label="Kargo firması"
        defaultValue={trackingCarrier ?? ""}
        placeholder="Örn. Yurtiçi Kargo"
        containerClassName="w-48"
      />
      <Input
        id="trackingNumber"
        name="trackingNumber"
        type="text"
        label="Takip numarası"
        defaultValue={trackingNumber ?? ""}
        containerClassName="w-48"
      />
      {/* Bilinçli olarak marka rengi değil, ters (yüksek kontrast) renk — bu sayfadaki tek
          "durum güncelleme" değil "kargo bilgisi kaydetme" eylemini görsel olarak ayırır. */}
      <Button
        type="submit"
        loading={pending}
        loadingText="Kaydediliyor…"
        className="bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Kargo bilgisini kaydet
      </Button>
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      {state.ok && <span className="text-sm text-emerald-600">Kaydedildi.</span>}
    </form>
  );
}
