"use client";

import { useActionState } from "react";
import { addAddress, type AddressFormState } from "./actions";

const initialState: AddressFormState = {};

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900";

export function AddAddressForm() {
  const [state, action, pending] = useActionState(addAddress, initialState);

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h3 className="text-sm font-semibold">Yeni adres ekle</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required name="fullName" placeholder="Ad Soyad" className={inputClass} />
        <input required name="phone" type="tel" placeholder="Telefon" className={inputClass} />
        <input required name="addressLine1" placeholder="Adres" className={`${inputClass} sm:col-span-2`} />
        <input name="addressLine2" placeholder="Adres (devamı, isteğe bağlı)" className={`${inputClass} sm:col-span-2`} />
        <input required name="city" placeholder="İl" className={inputClass} />
        <input required name="district" placeholder="İlçe" className={inputClass} />
        <input required name="postalCode" placeholder="Posta Kodu" className={inputClass} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" />
        Varsayılan adresim olsun
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Ekleniyor…" : "Adresi ekle"}
      </button>
    </form>
  );
}
