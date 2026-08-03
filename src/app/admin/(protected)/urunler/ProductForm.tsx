"use client";

import { useActionState, useState } from "react";
import { slugify } from "@/lib/slugify";
import type { ProductFormState } from "./actions";
import { Alert, Button, Checkbox, Input, Textarea } from "@/components/ui";

interface ProductFormProps {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  submitLabel: string;
  initial?: {
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
  };
}

const initialState: ProductFormState = {};

/** Yeni ürün oluşturma ve var olan ürünü düzenleme formlarının ortak gövdesi. */
export function ProductForm({ action, submitLabel, initial }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(initial?.name ?? "");
  // Slug kullanıcı tarafından elle değiştirilmediği sürece addan otomatik türetilir;
  // düzenleme sırasında (initial verilmişse) mevcut slug korunur, ad değişse bile üzerine yazılmaz.
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <Input
        name="name"
        label="Ürün adı"
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
        description="Ürün sayfasının adresi (ör. vyktag-kart). Yalnızca küçük harf, rakam ve tire."
        required
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(e.target.value);
        }}
      />
      <Textarea name="description" label="Açıklama" required rows={4} defaultValue={initial?.description} />
      <Checkbox name="isActive" label="Vitrinde göster (aktif)" defaultChecked={initial?.isActive ?? true} />

      {state.error && <Alert variant="danger">{state.error}</Alert>}

      <Button type="submit" loading={pending} loadingText="Kaydediliyor…">
        {submitLabel}
      </Button>
    </form>
  );
}
