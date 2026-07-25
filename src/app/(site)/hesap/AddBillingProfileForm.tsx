"use client";

import { useActionState, useState } from "react";
import { addBillingProfile, type BillingProfileFormState } from "./actions";

const initialState: BillingProfileFormState = {};

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900";

export function AddBillingProfileForm() {
  const [state, action, pending] = useActionState(addBillingProfile, initialState);
  const [type, setType] = useState<"INDIVIDUAL" | "CORPORATE">("INDIVIDUAL");

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h3 className="text-sm font-semibold">Yeni fatura bilgisi ekle</h3>

      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="INDIVIDUAL"
            checked={type === "INDIVIDUAL"}
            onChange={() => setType("INDIVIDUAL")}
          />
          Şahıs
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="CORPORATE"
            checked={type === "CORPORATE"}
            onChange={() => setType("CORPORATE")}
          />
          Kurumsal
        </label>
      </div>

      <input required name="title" placeholder="Başlık (ör. Ev faturam)" className={`${inputClass} w-full`} />

      {type === "INDIVIDUAL" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <input required name="fullName" placeholder="Ad Soyad" className={inputClass} />
          <input
            required
            name="nationalId"
            placeholder="TC Kimlik No"
            inputMode="numeric"
            maxLength={11}
            className={inputClass}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <input required name="companyName" placeholder="Firma Unvanı" className={`${inputClass} sm:col-span-2`} />
          <input required name="taxOffice" placeholder="Vergi Dairesi" className={inputClass} />
          <input
            required
            name="taxNumber"
            placeholder="Vergi No"
            inputMode="numeric"
            maxLength={10}
            className={inputClass}
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <input required name="addressLine1" placeholder="Adres" className={`${inputClass} sm:col-span-2`} />
        <input name="addressLine2" placeholder="Adres (devamı, isteğe bağlı)" className={`${inputClass} sm:col-span-2`} />
        <input required name="city" placeholder="İl" className={inputClass} />
        <input required name="district" placeholder="İlçe" className={inputClass} />
        <input required name="postalCode" placeholder="Posta Kodu" className={inputClass} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" />
        Varsayılan fatura bilgim olsun
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Ekleniyor…" : "Fatura bilgisini ekle"}
      </button>
    </form>
  );
}
