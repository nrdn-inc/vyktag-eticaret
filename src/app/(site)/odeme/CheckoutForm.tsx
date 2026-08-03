"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { lineKey } from "@/lib/orders/cart";
import { formatPriceTRY } from "@/lib/format";
import { IyzicoCheckoutForm } from "@/components/IyzicoCheckoutForm";
import { startCheckout, type CheckoutResult } from "./actions";
import { Alert, Badge, Button, Checkbox, EmptyState, Input, buttonVariants } from "@/components/ui";

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
}

export interface CheckoutFormProps {
  savedAddresses: SavedAddress[];
  defaultContact: { firstName: string; lastName: string; email: string; phone: string } | null;
}

const NEW_ADDRESS_ID = "yeni-adres";

function splitAddressFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

export default function CheckoutForm({ savedAddresses, defaultContact }: CheckoutFormProps) {
  const { items, totalKurus, ready } = useCart();

  const initialAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0] ?? null;

  const [selectedAddressId, setSelectedAddressId] = useState(initialAddress?.id ?? NEW_ADDRESS_ID);
  const [firstName, setFirstName] = useState(defaultContact?.firstName ?? "");
  const [lastName, setLastName] = useState(defaultContact?.lastName ?? "");
  const [email, setEmail] = useState(defaultContact?.email ?? "");
  const [phone, setPhone] = useState(initialAddress?.phone ?? defaultContact?.phone ?? "");
  const [identityNumber, setIdentityNumber] = useState("");
  const [addressLine1, setAddressLine1] = useState(initialAddress?.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(initialAddress?.addressLine2 ?? "");
  const [city, setCity] = useState(initialAddress?.city ?? "");
  const [district, setDistrict] = useState(initialAddress?.district ?? "");
  const [postalCode, setPostalCode] = useState(initialAddress?.postalCode ?? "");
  const [contractAccepted, setContractAccepted] = useState(false);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddressLine1, setBillingAddressLine1] = useState("");
  const [billingAddressLine2, setBillingAddressLine2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingDistrict, setBillingDistrict] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");

  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function applyAddress(addressId: string) {
    setSelectedAddressId(addressId);
    if (addressId === NEW_ADDRESS_ID) {
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setDistrict("");
      setPostalCode("");
      return;
    }
    const address = savedAddresses.find((a) => a.id === addressId);
    if (!address) return;
    const { firstName: addrFirstName, lastName: addrLastName } = splitAddressFullName(address.fullName);
    setFirstName(addrFirstName);
    setLastName(addrLastName);
    setPhone(address.phone);
    setAddressLine1(address.addressLine1);
    setAddressLine2(address.addressLine2 ?? "");
    setCity(address.city);
    setDistrict(address.district);
    setPostalCode(address.postalCode);
  }

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
          subscriptionPlanId: item.subscriptionPlanId,
          quantity: item.quantity,
          personalization: item.personalization,
        })),
        contractAccepted,
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
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Sepetiniz boş"
          description="Ödeme adımına geçmek için önce sepetinize ürün ekleyin."
          action={
            <Link href="/urunler" className={buttonVariants({ size: "lg" })}>
              Ürünleri keşfet
            </Link>
          }
        />
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
          {result && !result.ok && <Alert variant="danger">{result.error}</Alert>}

          <section>
            <h2 className="mb-3 text-lg font-semibold">İletişim bilgileri</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input required maxLength={60} placeholder="Ad" aria-label="Ad" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input required maxLength={60} placeholder="Soyad" aria-label="Soyad" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <Input required maxLength={190} type="email" placeholder="E-posta" aria-label="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input required maxLength={20} type="tel" placeholder="Telefon" aria-label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input
                required
                placeholder="TC Kimlik No"
                aria-label="TC Kimlik No"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                inputMode="numeric"
                maxLength={11}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Teslimat adresi</h2>

            {savedAddresses.length > 0 && (
              <div className="mb-4 space-y-2">
                {savedAddresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                      selectedAddressId === address.id
                        ? "border-brand bg-brand/5"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="saved-address"
                      className="mt-1"
                      checked={selectedAddressId === address.id}
                      onChange={() => applyAddress(address.id)}
                    />
                    <span>
                      <span className="font-medium">
                        {address.fullName}
                        {address.isDefault && (
                          <Badge variant="brand" size="sm" className="ml-2">
                            Varsayılan
                          </Badge>
                        )}
                      </span>
                      <span className="block text-zinc-600 dark:text-zinc-400">
                        {address.addressLine1}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ""} — {address.district} /{" "}
                        {address.city} {address.postalCode}
                      </span>
                    </span>
                  </label>
                ))}
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                    selectedAddressId === NEW_ADDRESS_ID
                      ? "border-brand bg-brand/5"
                      : "border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="saved-address"
                    checked={selectedAddressId === NEW_ADDRESS_ID}
                    onChange={() => applyAddress(NEW_ADDRESS_ID)}
                  />
                  Yeni adres gir
                </label>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                required
                maxLength={190}
                placeholder="Adres"
                aria-label="Adres"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                containerClassName="sm:col-span-2"
              />
              <Input
                maxLength={190}
                placeholder="Adres (devamı, isteğe bağlı)"
                aria-label="Adres (devamı, isteğe bağlı)"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                containerClassName="sm:col-span-2"
              />
              <Input required maxLength={100} placeholder="İl" aria-label="İl" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input required maxLength={100} placeholder="İlçe" aria-label="İlçe" value={district} onChange={(e) => setDistrict(e.target.value)} />
              <Input
                required
                placeholder="Posta Kodu"
                aria-label="Posta Kodu"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                inputMode="numeric"
                maxLength={5}
              />
            </div>
          </section>

          <section>
            <Checkbox
              label="Fatura adresi teslimat adresiyle aynı"
              checked={billingSameAsShipping}
              onChange={(e) => setBillingSameAsShipping(e.target.checked)}
            />

            {!billingSameAsShipping && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  required
                  maxLength={190}
                  placeholder="Fatura adresi"
                  aria-label="Fatura adresi"
                  value={billingAddressLine1}
                  onChange={(e) => setBillingAddressLine1(e.target.value)}
                  containerClassName="sm:col-span-2"
                />
                <Input
                  maxLength={190}
                  placeholder="Adres (devamı, isteğe bağlı)"
                  aria-label="Fatura adresi (devamı, isteğe bağlı)"
                  value={billingAddressLine2}
                  onChange={(e) => setBillingAddressLine2(e.target.value)}
                  containerClassName="sm:col-span-2"
                />
                <Input required maxLength={100} placeholder="İl" aria-label="Fatura ili" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} />
                <Input
                  required
                  maxLength={100}
                  placeholder="İlçe"
                  aria-label="Fatura ilçesi"
                  value={billingDistrict}
                  onChange={(e) => setBillingDistrict(e.target.value)}
                />
                <Input
                  required
                  placeholder="Posta Kodu"
                  aria-label="Fatura posta kodu"
                  value={billingPostalCode}
                  onChange={(e) => setBillingPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  inputMode="numeric"
                  maxLength={5}
                />
              </div>
            )}
          </section>

          <section>
            <Checkbox
              required
              checked={contractAccepted}
              onChange={(e) => setContractAccepted(e.target.checked)}
              label={
                <>
                  <Link
                    href="/mesafeli-satis-sozlesmesi"
                    target="_blank"
                    className="font-medium text-brand hover:text-brand-dark"
                  >
                    Mesafeli Satış Sözleşmesi
                  </Link>
                  &apos;ni ve{" "}
                  <Link href="/kvkk" target="_blank" className="font-medium text-brand hover:text-brand-dark">
                    KVKK Aydınlatma Metni
                  </Link>
                  &apos;ni okudum, onaylıyorum.
                </>
              }
            />
          </section>

          <Button
            type="submit"
            disabled={!contractAccepted}
            loading={isPending}
            loadingText="İşleniyor…"
            fullWidth
            size="lg"
          >
            Siparişi Onayla ve Öde · {formatPriceTRY(totalKurus)}
          </Button>
          <Image
            src="/iyzico-ile-ode.svg"
            alt="iyzico ile Öde"
            width={180}
            height={30}
            className="mx-auto h-6 w-auto"
          />
        </form>

        {/* Sipariş özeti */}
        <aside className="h-fit rounded-2xl border border-border-soft bg-surface-muted p-6">
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
          <div className="mt-4 flex justify-between border-t border-border-soft pt-4 text-base font-semibold">
            <span>Toplam</span>
            <span>{formatPriceTRY(totalKurus)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
