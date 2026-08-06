"use client";

import { useActionState, useState } from "react";
import { slugify } from "@/lib/slugify";
import { formatPriceTRY } from "@/lib/format";
// Yalnızca tip olarak import edilir (import type) — Prisma enum'unu DEĞER olarak (ör.
// SubscriptionInterval.MONTHLY) bir "use client" bileşeninde kullanmak, tüm Prisma Client
// çalışma zamanını (node:module gibi Node'a özgü bağımlılıklarla) tarayıcı paketine sokup
// derlemeyi kırar. Değerler için düz string literal'ler kullanılır (bkz. aşağıdaki IntervalValue).
import type { SubscriptionInterval } from "@/generated/prisma/client";
import type { PlanFormState } from "./actions";
import { Alert, Button, Checkbox, Input, Select, Textarea } from "@/components/ui";

type IntervalValue = "MONTHLY" | "SIX_MONTHS" | "YEARLY" | "LIFETIME";

const INTERVAL_OPTIONS: { value: IntervalValue; label: string }[] = [
  { value: "MONTHLY", label: "Aylık" },
  { value: "SIX_MONTHS", label: "6 Ay" },
  { value: "YEARLY", label: "Yıllık" },
  // Tek seferlik ödeme, iyzico Abonelik (recurring) altyapısını kullanmaz — bkz.
  // schema.prisma SubscriptionInterval.LIFETIME yorumu. Fiyatlandırma sayfasında gösterilmez,
  // yalnızca ürün sayfasındaki süre seçicisinden erişilir (bkz. catalog/index.ts).
  { value: "LIFETIME", label: "Sınırsız (tek seferlik)" },
];

interface PlanFormProps {
  action: (state: PlanFormState, formData: FormData) => Promise<PlanFormState>;
  submitLabel: string;
  initial?: {
    name: string;
    slug: string;
    description: string;
    priceKurus: number;
    interval: SubscriptionInterval;
    features: string[];
    iyzicoPricingPlanRef: string | null;
    isActive: boolean;
  };
}

const initialState: PlanFormState = {};

/** Yeni abonelik planı oluşturma ve var olan planı düzenleme formlarının ortak gövdesi. */
export function PlanForm({ action, submitLabel, initial }: PlanFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [priceKurus, setPriceKurus] = useState(initial?.priceKurus ?? 0);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <Input
        name="name"
        label="Plan adı"
        required
        value={name}
        onChange={(e) => {
          const value = e.target.value;
          setName(value);
          if (!slugTouched) setSlug(slugify(value));
        }}
      />
      <Input
        name="slug"
        label="Slug"
        required
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(e.target.value);
        }}
      />
      <Textarea name="description" label="Açıklama" required rows={3} defaultValue={initial?.description} />

      <div>
        <Input
          name="priceKurus"
          label="Fiyat (kuruş)"
          type="number"
          min={0}
          step={1}
          required
          value={priceKurus}
          onChange={(e) => setPriceKurus(Number(e.target.value) || 0)}
        />
        <p className="mt-1 text-xs text-zinc-500">= {formatPriceTRY(priceKurus)}</p>
      </div>

      <Select name="interval" label="Periyot" required options={INTERVAL_OPTIONS} defaultValue={initial?.interval ?? "SIX_MONTHS"} />

      <Textarea
        name="features"
        label="Özellikler"
        description="Her satır bir madde olarak vitrinde listelenir."
        required
        rows={4}
        defaultValue={initial?.features.join("\n")}
      />

      <Input
        name="iyzicoPricingPlanRef"
        label="iyzico Fiyatlandırma Planı referansı"
        description="Boş bırakılırsa vitrinde 'Yakında' gösterilir ve satın alma kapalı kalır. iyzico panelinde Fiyatlandırma Planı oluşturduktan sonra referans kodunu buraya girin."
        defaultValue={initial?.iyzicoPricingPlanRef ?? ""}
      />

      <Checkbox name="isActive" label="Vitrinde göster (aktif)" defaultChecked={initial?.isActive ?? true} />

      {state.error && <Alert variant="danger">{state.error}</Alert>}

      <Button type="submit" loading={pending} loadingText="Kaydediliyor…">
        {submitLabel}
      </Button>
    </form>
  );
}
