"use client";

import { useActionState } from "react";
import { Badge, Button } from "@/components/ui";

export interface ToggleActiveState {
  error?: string;
  isActive?: boolean;
}

interface ActiveToggleFormProps {
  action: (state: ToggleActiveState, formData: FormData) => Promise<ToggleActiveState>;
  isActive: boolean;
}

/** Ürün/varyant/abonelik planı satırlarında tek tıkla aktif/pasif geçişi (bkz. urunler/actions.ts toggleProductActive). */
export function ActiveToggleForm({ action, isActive }: ActiveToggleFormProps) {
  const [state, formAction, pending] = useActionState(action, { isActive });
  const currentlyActive = state.isActive ?? isActive;

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Badge variant={currentlyActive ? "success" : "neutral"} size="sm">
        {currentlyActive ? "Aktif" : "Pasif"}
      </Badge>
      <Button type="submit" variant="link" size="sm" loading={pending} loadingText="…">
        {currentlyActive ? "Pasifleştir" : "Aktifleştir"}
      </Button>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
