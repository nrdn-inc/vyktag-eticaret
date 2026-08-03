"use client";

import { useActionState, useState } from "react";
import { formatPriceTRY } from "@/lib/format";
import type { CardColor, PrintColor } from "@/lib/catalog/product-variant-attributes";
import type { VariantFormState } from "./actions";
import { ProductImageUploadInput } from "@/components/admin/ProductImageUploadInput";
import { Alert, Button, Checkbox, Input, Select } from "@/components/ui";

const CARD_COLOR_OPTIONS: { value: CardColor; label: string }[] = [
  { value: "Siyah", label: "Siyah" },
  { value: "Beyaz", label: "Beyaz" },
];
const PRINT_COLOR_OPTIONS: { value: PrintColor; label: string }[] = [
  { value: "Gümüş", label: "Gümüş" },
  { value: "Altın", label: "Altın" },
  { value: "Siyah", label: "Siyah" },
];

interface VariantFormProps {
  action: (state: VariantFormState, formData: FormData) => Promise<VariantFormState>;
  submitLabel: string;
  initial?: {
    name: string;
    sku: string;
    priceKurus: number;
    stock: number;
    isActive: boolean;
    attributes: { cardColor: CardColor; printColor: PrintColor; customDesign: boolean } | null;
    images: string[];
  };
}

const initialState: VariantFormState = {};

/** Yeni varyant oluşturma ve var olan varyantı düzenleme formlarının ortak gövdesi. */
export function VariantForm({ action, submitLabel, initial }: VariantFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [priceKurus, setPriceKurus] = useState(initial?.priceKurus ?? 0);
  const [structured, setStructured] = useState(Boolean(initial?.attributes));
  const [images, setImages] = useState<string[]>(initial?.images ?? []);

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <Input name="name" label="Varyant adı" required defaultValue={initial?.name} />
      <Input
        name="sku"
        label="SKU"
        description="Benzersiz ürün kodu, ör. VYK-KART-SIYAH-GUMUS."
        required
        defaultValue={initial?.sku}
      />

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

      <Input name="stock" label="Stok" type="number" min={0} step={1} required defaultValue={initial?.stock ?? 0} />

      <Checkbox name="isActive" label="Vitrinde satışa açık (aktif)" defaultChecked={initial?.isActive ?? true} />

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <Checkbox
          label="Yapılandırılmış seçenekler (kart rengi / baskı rengi)"
          description="VYKTag Kart'ın renk seçici arayüzünün çalışması için bu ürünün TÜM varyantlarında işaretli olmalı — bazıları işaretli bazıları değilse seçici devre dışı kalır ve düz bir liste gösterilir."
          checked={structured}
          onChange={(e) => setStructured(e.target.checked)}
        />
        {structured && (
          <div className="mt-4 space-y-3">
            <input type="hidden" name="structured" value="on" />
            <Select
              name="cardColor"
              label="Kart rengi"
              options={CARD_COLOR_OPTIONS}
              defaultValue={initial?.attributes?.cardColor ?? "Siyah"}
            />
            <Select
              name="printColor"
              label="Baskı rengi"
              options={PRINT_COLOR_OPTIONS}
              defaultValue={initial?.attributes?.printColor ?? "Gümüş"}
            />
            <Checkbox name="customDesign" label="Özel tasarım/logo varyantı" defaultChecked={initial?.attributes?.customDesign ?? false} />
          </div>
        )}
      </div>

      <ProductImageUploadInput value={images} onChange={setImages} />
      {images.map((src, index) => (
        <input key={index} type="hidden" name="images" value={src} />
      ))}

      {state.error && <Alert variant="danger">{state.error}</Alert>}

      <Button type="submit" loading={pending} loadingText="Kaydediliyor…">
        {submitLabel}
      </Button>
    </form>
  );
}
