"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductWithVariants } from "@/lib/catalog";
import type { CartItem, CartPersonalization } from "@/lib/cart";
import { formatPriceTRY } from "@/lib/format";
import { useCart } from "@/components/CartProvider";

/** Ürün detay sayfasında varyant/adet seçimi, kişiselleştirme ve sepete ekleme formu. */
export function AddToCartForm({ product }: { product: ProductWithVariants }) {
  const { addItem } = useCart();

  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  const selectedVariant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  function handleAdd() {
    // Boş kişiselleştirme alanlarını dahil etme.
    const personalization: CartPersonalization = {};
    if (fullName.trim()) personalization.fullName = fullName.trim();
    if (title.trim()) personalization.title = title.trim();
    if (phone.trim()) personalization.phone = phone.trim();
    if (note.trim()) personalization.note = note.trim();

    const item: CartItem = {
      variantId: selectedVariant.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: selectedVariant.name,
      unitPriceKurus: selectedVariant.priceKurus,
      quantity,
      ...(Object.keys(personalization).length > 0 ? { personalization } : {}),
    };

    addItem(item);
    setAdded(true);
  }

  return (
    <div className="space-y-6">
      {/* Varyant seçimi */}
      {product.variants.length > 1 && (
        <div>
          <label className="text-sm font-semibold">Seçenek</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  setVariantId(variant.id);
                  setAdded(false);
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  variant.id === variantId
                    ? "border-brand bg-brand text-white"
                    : "border-zinc-300 hover:border-brand dark:border-zinc-700"
                }`}
              >
                {variant.name} · {formatPriceTRY(variant.priceKurus)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kişiselleştirme */}
      <div>
        <h3 className="text-sm font-semibold">Kart üzerindeki bilgiler (isteğe bağlı)</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Logonuzu siparişiniz sonrası sizden ayrıca rica edeceğiz.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Ad Soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="text"
            placeholder="Unvan"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="tel"
            placeholder="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="text"
            placeholder="Not (ör. tasarım tercihi)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Adet + sepete ekle */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => {
              setQuantity((q) => Math.max(1, q - 1));
              setAdded(false);
            }}
            className="px-4 py-2 text-lg"
            aria-label="Adet azalt"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => {
              setQuantity((q) => q + 1);
              setAdded(false);
            }}
            className="px-4 py-2 text-lg"
            aria-label="Adet artır"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Sepete ekle · {formatPriceTRY(selectedVariant.priceKurus * quantity)}
        </button>
      </div>

      {added && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-brand/10 px-4 py-3 text-sm">
          <span className="font-medium text-brand-dark">Ürün sepete eklendi.</span>
          <Link href="/sepet" className="font-semibold text-brand underline">
            Sepete git
          </Link>
        </div>
      )}
    </div>
  );
}
