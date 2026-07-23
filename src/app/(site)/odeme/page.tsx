"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { lineKey } from "@/lib/cart";
import { formatPriceTRY } from "@/lib/format";
import { IyzicoCheckoutForm } from "@/components/IyzicoCheckoutForm";
import { startCheckout, type CheckoutResult } from "./actions";

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900";

export default function CheckoutPage() {
  const { items, totalKurus, ready } = useCart();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddressLine1, setBillingAddressLine1] = useState("");
  const [billingAddressLine2, setBillingAddressLine2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingDistrict, setBillingDistrict] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");

  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const response = await startCheckout({
        contact: { firstName, lastName, email, phone },
        identityNumber,
        shipping: { addressLine1, addressLine2, city, district, postalCode },
        billing: billingSameAsShipping
          ? null
          : {
              addressLine1: billingAddressLine1,
              addressLine2: billingAddressLine2,
              city: billingCity,
              district: billingDistrict,
              postalCode: billingPostalCode,
            },
        lines: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          personalization: item.personalization,
        })),
      });
      setResult(response);
    });
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-zinc-500">Yükleniyor…</p>
      </div>
    );
  }

  if (items.length === 0 && !(result?.ok ?? false)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Sepetiniz boş</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Ödeme adımına geçmek için önce sepetinize ürün ekleyin.
        </p>
        <Link
          href="/urunler"
          className="mt-8 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Ürünleri keşfet
        </Link>
      </div>
    );
  }

  if (result?.ok) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Ödemenizi tamamlayın</h1>
        <p className="mb-8 text-sm text-zinc-500">
          Sipariş No: <span className="font-medium">{result.orderNumber}</span> — kart bilgileriniz
          iyzico&apos;nun güvenli sayfasında alınır.
        </p>
        <IyzicoCheckoutForm content={result.checkoutFormContent} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Ödeme</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-8">
          {result && !result.ok && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {result.error}
            </div>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold">İletişim bilgileri</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="Ad" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
              <input required placeholder="Soyad" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
              <input required type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              <input required type="tel" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              <input
                required
                placeholder="TC Kimlik No"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                className={inputClass}
                inputMode="numeric"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Teslimat adresi</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required placeholder="Adres" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className={`${inputClass} sm:col-span-2`} />
              <input placeholder="Adres (devamı, isteğe bağlı)" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className={`${inputClass} sm:col-span-2`} />
              <input required placeholder="İl" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
              <input required placeholder="İlçe" value={district} onChange={(e) => setDistrict(e.target.value)} className={inputClass} />
              <input required placeholder="Posta Kodu" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} />
            </div>
          </section>

          <section>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={billingSameAsShipping}
                onChange={(e) => setBillingSameAsShipping(e.target.checked)}
              />
              Fatura adresi teslimat adresiyle aynı
            </label>

            {!billingSameAsShipping && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input required placeholder="Fatura adresi" value={billingAddressLine1} onChange={(e) => setBillingAddressLine1(e.target.value)} className={`${inputClass} sm:col-span-2`} />
                <input placeholder="Adres (devamı, isteğe bağlı)" value={billingAddressLine2} onChange={(e) => setBillingAddressLine2(e.target.value)} className={`${inputClass} sm:col-span-2`} />
                <input required placeholder="İl" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className={inputClass} />
                <input required placeholder="İlçe" value={billingDistrict} onChange={(e) => setBillingDistrict(e.target.value)} className={inputClass} />
                <input required placeholder="Posta Kodu" value={billingPostalCode} onChange={(e) => setBillingPostalCode(e.target.value)} className={inputClass} />
              </div>
            )}
          </section>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "İşleniyor…" : `Siparişi Onayla ve Öde · ${formatPriceTRY(totalKurus)}`}
          </button>
        </form>

        {/* Sipariş özeti */}
        <aside className="h-fit rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-semibold">Sipariş özeti</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={lineKey(item)} className="flex justify-between text-sm">
                <span>
                  {item.productName} <span className="text-zinc-500">({item.variantName})</span> ×{item.quantity}
                </span>
                <span className="font-medium">{formatPriceTRY(item.unitPriceKurus * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 text-base font-semibold dark:border-zinc-800">
            <span>Toplam</span>
            <span>{formatPriceTRY(totalKurus)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
