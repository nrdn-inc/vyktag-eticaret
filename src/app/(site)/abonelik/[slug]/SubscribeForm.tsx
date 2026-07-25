"use client";

import { useState, useTransition } from "react";
import { IyzicoCheckoutForm } from "@/components/IyzicoCheckoutForm";
import { startSubscriptionCheckout, type SubscribeResult } from "./actions";

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900";

export function SubscribeForm({ slug, defaultGsmNumber }: { slug: string; defaultGsmNumber: string }) {
  const [identityNumber, setIdentityNumber] = useState("");
  const [gsmNumber, setGsmNumber] = useState(defaultGsmNumber);
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [result, setResult] = useState<SubscribeResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const response = await startSubscriptionCheckout({
        slug,
        identityNumber,
        gsmNumber,
        address: { addressLine1, city, district, postalCode },
      });
      setResult(response);
    });
  }

  if (result?.ok) {
    return (
      <div>
        <p className="mb-6 text-sm text-zinc-500">
          Kart bilgileriniz iyzico&apos;nun güvenli sayfasında alınır.
        </p>
        <IyzicoCheckoutForm content={result.checkoutFormContent} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {result && !result.ok && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {result.error}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Fatura bilgileri</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="TC Kimlik No"
            value={identityNumber}
            onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
            className={inputClass}
            inputMode="numeric"
          />
          <input
            required
            type="tel"
            placeholder="Telefon"
            value={gsmNumber}
            onChange={(e) => setGsmNumber(e.target.value)}
            className={inputClass}
          />
          <input
            required
            placeholder="Adres"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            className={`${inputClass} sm:col-span-2`}
          />
          <input required placeholder="İl" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
          <input
            required
            placeholder="İlçe"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className={inputClass}
          />
          <input
            required
            placeholder="Posta Kodu"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className={inputClass}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "İşleniyor…" : "Aboneliği Başlat ve Öde"}
      </button>
    </form>
  );
}
