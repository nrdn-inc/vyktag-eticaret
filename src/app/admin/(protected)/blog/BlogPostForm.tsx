"use client";

import { useActionState, useState } from "react";
import { slugify } from "@/lib/slugify";
import { ProductImageUploadInput } from "@/components/admin/ProductImageUploadInput";
import type { BlogPostFormState } from "./actions";
import { Alert, Button, Checkbox, Input, Textarea } from "@/components/ui";

interface BlogPostFormProps {
  action: (state: BlogPostFormState, formData: FormData) => Promise<BlogPostFormState>;
  submitLabel: string;
  initial?: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    isPublished: boolean;
  };
}

const initialState: BlogPostFormState = {};

/** Yeni blog yazısı oluşturma ve var olan yazıyı düzenleme formlarının ortak gövdesi. */
export function BlogPostForm({ action, submitLabel, initial }: BlogPostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState(initial?.title ?? "");
  // Slug kullanıcı tarafından elle değiştirilmediği sürece başlıktan otomatik türetilir;
  // düzenleme sırasında (initial verilmişse) mevcut slug korunur.
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [coverImage, setCoverImage] = useState<string[]>(initial?.coverImage ? [initial.coverImage] : []);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <Input
        name="title"
        label="Başlık"
        required
        value={title}
        onChange={(e) => {
          const value = e.target.value;
          setTitle(value);
          if (!slugTouched) setSlug(slugify(value));
        }}
      />
      <Input
        name="slug"
        label="Slug"
        description="Yazının adresi (ör. nfc-kartvizit-nedir). Yalnızca küçük harf, rakam ve tire."
        required
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(e.target.value);
        }}
      />
      <Textarea
        name="excerpt"
        label="Özet"
        description="Blog listesinde kart altında ve meta açıklama olarak (metaDescription boşsa) kullanılır."
        required
        rows={3}
        defaultValue={initial?.excerpt}
      />
      <Textarea
        name="content"
        label="İçerik (Markdown)"
        description="Başlıklar için #/##, kalın için **metin**, liste için - kullanabilirsiniz."
        required
        rows={16}
        defaultValue={initial?.content}
      />

      <ProductImageUploadInput
        value={coverImage}
        onChange={setCoverImage}
        maxImages={1}
        label="Kapak görseli"
        description="Blog listesinde ve sosyal medya paylaşımlarında (OG) kullanılır. Eklenmezse görsel gösterilmez."
      />
      {coverImage[0] && <input type="hidden" name="coverImage" value={coverImage[0]} />}

      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-sm font-semibold">SEO (opsiyonel)</p>
        <p className="mt-1 text-xs text-zinc-500">Boş bırakılırsa başlık/özet arama sonuçlarında doğrudan kullanılır.</p>
        <div className="mt-3 space-y-3">
          <Input name="metaTitle" label="Meta başlık" defaultValue={initial?.metaTitle ?? ""} />
          <Textarea name="metaDescription" label="Meta açıklama" rows={2} defaultValue={initial?.metaDescription ?? ""} />
        </div>
      </div>

      <Checkbox name="isPublished" label="Yayınla" defaultChecked={initial?.isPublished ?? false} />

      {state.error && <Alert variant="danger">{state.error}</Alert>}

      <Button type="submit" loading={pending} loadingText="Kaydediliyor…">
        {submitLabel}
      </Button>
    </form>
  );
}
