"use client";

import { useState, useTransition } from "react";
import { IyzicoCheckoutForm } from "@/components/IyzicoCheckoutForm";
import { startSubscriptionCheckout, type SubscribeResult } from "./actions";
import { Alert, Button, Input } from "@/components/ui";

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
      {result && !result.ok && <Alert variant="danger">{result.error}</Alert>}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Fatura bilgileri</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            required
            placeholder="TC Kimlik No"
            aria-label="TC Kimlik No"
            value={identityNumber}
            onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
            inputMode="numeric"
          />
          <Input
            required
            type="tel"
            placeholder="Telefon"
            aria-label="Telefon"
            value={gsmNumber}
            onChange={(e) => setGsmNumber(e.target.value)}
          />
          <Input
            required
            placeholder="Adres"
            aria-label="Adres"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            containerClassName="sm:col-span-2"
          />
          <Input required placeholder="İl" aria-label="İl" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input
            required
            placeholder="İlçe"
            aria-label="İlçe"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <Input
            required
            placeholder="Posta Kodu"
            aria-label="Posta Kodu"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </div>
      </section>

      <Button type="submit" loading={isPending} loadingText="İşleniyor…" fullWidth size="lg">
        Aboneliği Başlat ve Öde
      </Button>
    </form>
  );
}
