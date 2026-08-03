"use client";

import { useActionState } from "react";
import { addAddress, type AddressFormState } from "./actions";
import { Alert, Button, Checkbox, Input } from "@/components/ui";

const initialState: AddressFormState = {};

export function AddAddressForm() {
  const [state, action, pending] = useActionState(addAddress, initialState);

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h3 className="text-sm font-semibold">Yeni adres ekle</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input required name="fullName" placeholder="Ad Soyad" aria-label="Ad Soyad" />
        <Input required name="phone" type="tel" placeholder="Telefon" aria-label="Telefon" />
        <Input
          required
          name="addressLine1"
          placeholder="Adres"
          aria-label="Adres"
          containerClassName="sm:col-span-2"
        />
        <Input
          name="addressLine2"
          placeholder="Adres (devamı, isteğe bağlı)"
          aria-label="Adres (devamı, isteğe bağlı)"
          containerClassName="sm:col-span-2"
        />
        <Input required name="city" placeholder="İl" aria-label="İl" />
        <Input required name="district" placeholder="İlçe" aria-label="İlçe" />
        <Input required name="postalCode" placeholder="Posta Kodu" aria-label="Posta Kodu" />
      </div>

      <Checkbox name="isDefault" label="Varsayılan adresim olsun" />

      {state.error && <Alert variant="danger">{state.error}</Alert>}

      <Button type="submit" loading={pending} loadingText="Ekleniyor…">
        Adresi ekle
      </Button>
    </form>
  );
}
