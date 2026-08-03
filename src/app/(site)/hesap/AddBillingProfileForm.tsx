"use client";

import { useActionState, useState } from "react";
import { addBillingProfile, type BillingProfileFormState } from "./actions";
import { Alert, Button, Checkbox, Input, RadioGroup } from "@/components/ui";

const initialState: BillingProfileFormState = {};

export function AddBillingProfileForm() {
  const [state, action, pending] = useActionState(addBillingProfile, initialState);
  const [type, setType] = useState<"INDIVIDUAL" | "CORPORATE">("INDIVIDUAL");

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h3 className="text-sm font-semibold">Yeni fatura bilgisi ekle</h3>

      {/* `name="type"` gizli inputlarla senkron tutulur çünkü RadioGroup değeri React state'inde
          tutar; native form gönderimi için `hidden` bir input aracılığıyla iletilir. */}
      <input type="hidden" name="type" value={type} />
      <RadioGroup
        name="type-visual"
        orientation="horizontal"
        value={type}
        onChange={(value) => setType(value as "INDIVIDUAL" | "CORPORATE")}
        options={[
          { value: "INDIVIDUAL", label: "Şahıs" },
          { value: "CORPORATE", label: "Kurumsal" },
        ]}
      />

      <Input required name="title" placeholder="Başlık (ör. Ev faturam)" aria-label="Başlık" />

      {type === "INDIVIDUAL" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input required name="fullName" placeholder="Ad Soyad" aria-label="Ad Soyad" />
          <Input
            required
            name="nationalId"
            placeholder="TC Kimlik No"
            aria-label="TC Kimlik No"
            inputMode="numeric"
            maxLength={11}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            required
            name="companyName"
            placeholder="Firma Unvanı"
            aria-label="Firma Unvanı"
            containerClassName="sm:col-span-2"
          />
          <Input required name="taxOffice" placeholder="Vergi Dairesi" aria-label="Vergi Dairesi" />
          <Input
            required
            name="taxNumber"
            placeholder="Vergi No"
            aria-label="Vergi No"
            inputMode="numeric"
            maxLength={10}
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
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

      <Checkbox name="isDefault" label="Varsayılan fatura bilgim olsun" />

      {state.error && <Alert variant="danger">{state.error}</Alert>}

      <Button type="submit" loading={pending} loadingText="Ekleniyor…">
        Fatura bilgisini ekle
      </Button>
    </form>
  );
}
