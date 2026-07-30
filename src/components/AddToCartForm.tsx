"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductWithVariants } from "@/lib/catalog";
import type { CartItem, CartPersonalization } from "@/lib/orders/cart";
import { formatPriceTRY } from "@/lib/format";
import { isVariantPurchasable } from "@/lib/orders/stock";
import { parseVariantAttributes } from "@/lib/catalog/product-variant-attributes";
import { useCart } from "@/components/CartProvider";
import { CardOptionSelector } from "@/components/CardOptionSelector";

// Bu eşiğin altındaki stokta müşteriye "son X adet" uyarısı gösterilir.
const LOW_STOCK_THRESHOLD = 10;

// Sunucu tarafındaki üst sınırla eşleşir (bkz. lib/orders.ts PERSONALIZATION_FIELD_MAX_LENGTH);
// burada yalnızca kullanıcıya anında geri bildirim vermek için tekrarlanır.
const PERSONALIZATION_FIELD_MAX_LENGTH = 200;

// Ad/unvan doğrudan kartın üzerinde basılır; fiziksel kart genişliğinde okunaklı kalması
// için yukarıdaki genel sınırdan çok daha dar tutulur (telefon/not alanları etkilenmez).
const FULL_NAME_MAX_LENGTH = 30;
const TITLE_MAX_LENGTH = 35;

interface AddToCartFormProps {
  product: ProductWithVariants;
  variantId: string;
  onVariantChange: (variantId: string) => void;
  /** null = "Sınırsız" (fiziksel kart, varyant seçimiyle); doluysa seçili süreli kullanım hakkı planı. */
  durationPlanId: string | null;
  onDurationPlanChange: (planId: string | null) => void;
  fullName: string;
  onFullNameChange: (value: string) => void;
  title: string;
  onTitleChange: (value: string) => void;
  logoDataUrl: string | undefined;
  onLogoChange: (dataUrl: string | undefined) => void;
}

function durationLabel(interval: "MONTHLY" | "SIX_MONTHS" | "YEARLY"): string {
  if (interval === "MONTHLY") return "Aylık";
  if (interval === "SIX_MONTHS") return "6 Ay";
  return "1 Yıl";
}

/** Ürün detay sayfasında süre/varyant/adet seçimi, kişiselleştirme ve sepete ekleme formu. */
export function AddToCartForm({
  product,
  variantId,
  onVariantChange,
  durationPlanId,
  onDurationPlanChange,
  fullName,
  onFullNameChange,
  title,
  onTitleChange,
  logoDataUrl,
  onLogoChange,
}: AddToCartFormProps) {
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  const selectedVariant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const selectedDurationPlan = product.durationOptions.find((p) => p.subscriptionPlanId === durationPlanId) ?? null;

  // Tüm varyantlar yapılandırılmış attributes taşıyorsa (VYKTag Kart), kart rengi + baskı
  // rengi + özel tasarım seçicisi gösterilir; aksi halde (Tag/Phonecard gibi tek boyutlu
  // varyantlarda) eski düz "Seçenek" buton listesi kullanılır.
  const hasStructuredOptions = product.variants.every((v) => parseVariantAttributes(v.attributes) !== null);
  const selectedAttrs = parseVariantAttributes(selectedVariant.attributes);

  // Süreli kullanım hakkı planlarının stok kavramı yok — her zaman satın alınabilir.
  const inStock = selectedDurationPlan ? true : isVariantPurchasable(selectedVariant.stock);
  const atMaxQuantity = selectedDurationPlan ? false : quantity >= selectedVariant.stock;
  const isLowStock = !selectedDurationPlan && inStock && selectedVariant.stock <= LOW_STOCK_THRESHOLD;
  const unitPriceKurus = selectedDurationPlan ? selectedDurationPlan.priceKurus : selectedVariant.priceKurus;

  function resetSelectionState() {
    setQuantity(1);
    setAdded(false);
  }

  function handleAdd() {
    if (!inStock) return;
    // Boş kişiselleştirme alanlarını dahil etme.
    const personalization: CartPersonalization = {};
    if (fullName.trim()) personalization.fullName = fullName.trim();
    if (title.trim()) personalization.title = title.trim();
    if (phone.trim()) personalization.phone = phone.trim();
    if (note.trim()) personalization.note = note.trim();
    if (logoDataUrl && !selectedDurationPlan) personalization.logo = logoDataUrl;

    const item: CartItem = selectedDurationPlan
      ? {
          subscriptionPlanId: selectedDurationPlan.subscriptionPlanId,
          productSlug: product.slug,
          productName: product.name,
          variantName: selectedDurationPlan.name,
          unitPriceKurus: selectedDurationPlan.priceKurus,
          quantity,
          ...(Object.keys(personalization).length > 0 ? { personalization } : {}),
        }
      : {
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
      {/* Kullanım süresi: fiziksel kart (sınırsız) veya süreli kullanım hakkı */}
      {product.durationOptions.length > 0 && (
        <div>
          <label className="text-sm font-semibold">Kullanım süresi</label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onDurationPlanChange(null);
                resetSelectionState();
              }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                !selectedDurationPlan
                  ? "border-brand bg-brand text-white"
                  : "border-zinc-300 hover:border-brand dark:border-zinc-700"
              }`}
            >
              Sınırsız (fiziksel kart)
            </button>
            {product.durationOptions.map((plan) => (
              <button
                key={plan.subscriptionPlanId}
                type="button"
                onClick={() => {
                  onDurationPlanChange(plan.subscriptionPlanId);
                  resetSelectionState();
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedDurationPlan?.subscriptionPlanId === plan.subscriptionPlanId
                    ? "border-brand bg-brand text-white"
                    : "border-zinc-300 hover:border-brand dark:border-zinc-700"
                }`}
              >
                {durationLabel(plan.interval)} · {formatPriceTRY(plan.priceKurus)}
              </button>
            ))}
          </div>
          {selectedDurationPlan && (
            <p className="mt-2 text-xs text-zinc-500">
              Bu seçenekte fiziksel kart gönderilmez, yalnızca dijital profilinize {durationLabel(selectedDurationPlan.interval).toLowerCase()} boyunca kullanım hakkı verilir.
            </p>
          )}
        </div>
      )}

      {/* Varyant seçimi — yalnızca "Sınırsız" (fiziksel kart) seçiliyken anlamlı */}
      {!selectedDurationPlan && (hasStructuredOptions ? (
        <CardOptionSelector
          variants={product.variants}
          selectedVariantId={selectedVariant.id}
          onSelect={(id) => {
            onVariantChange(id);
            setQuantity(1);
            setAdded(false);
          }}
          logoDataUrl={logoDataUrl}
          onLogoChange={onLogoChange}
        />
      ) : (
        product.variants.length > 1 && (
          <div>
            <label className="text-sm font-semibold">Seçenek</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants.map((variant) => {
                const variantOutOfStock = !isVariantPurchasable(variant.stock);
                return (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={variantOutOfStock}
                    onClick={() => {
                      onVariantChange(variant.id);
                      setQuantity(1);
                      setAdded(false);
                    }}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      variant.id === variantId
                        ? "border-brand bg-brand text-white"
                        : "border-zinc-300 hover:border-brand dark:border-zinc-700"
                    }`}
                  >
                    {variant.name} · {formatPriceTRY(variant.priceKurus)}
                    {variantOutOfStock && " · Tükendi"}
                  </button>
                );
              })}
            </div>
          </div>
        )
      ))}

      {/* Kişiselleştirme */}
      <div>
        <h3 className="text-sm font-semibold">
          {selectedDurationPlan ? "Dijital profil bilgileri (isteğe bağlı)" : "Kart üzerindeki bilgiler (isteğe bağlı)"}
        </h3>
        {!selectedDurationPlan && !selectedAttrs?.customDesign && (
          <p className="mt-1 text-xs text-zinc-500">
            Logonuzu siparişiniz sonrası sizden ayrıca rica edeceğiz.
          </p>
        )}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <input
              type="text"
              placeholder="Ad Soyad"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value.slice(0, FULL_NAME_MAX_LENGTH))}
              maxLength={FULL_NAME_MAX_LENGTH}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-1 text-right text-[11px] text-zinc-400">
              {fullName.length}/{FULL_NAME_MAX_LENGTH}
            </p>
          </div>
          <div>
            <input
              type="text"
              placeholder="Unvan"
              value={title}
              onChange={(e) => onTitleChange(e.target.value.slice(0, TITLE_MAX_LENGTH))}
              maxLength={TITLE_MAX_LENGTH}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
            />
            <p className="mt-1 text-right text-[11px] text-zinc-400">
              {title.length}/{TITLE_MAX_LENGTH}
            </p>
          </div>
          <input
            type="tel"
            placeholder="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={PERSONALIZATION_FIELD_MAX_LENGTH}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="text"
            placeholder="Not (ör. tasarım tercihi)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={PERSONALIZATION_FIELD_MAX_LENGTH}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Stok durumu */}
      {!inStock ? (
        <p className="text-sm font-semibold text-red-600">Bu ürün şu anda tükendi.</p>
      ) : (
        isLowStock && (
          <p className="text-sm font-medium text-amber-600">Son {selectedVariant.stock} adet!</p>
        )
      )}

      {/* Adet + sepete ekle */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
          <button
            type="button"
            disabled={!inStock}
            onClick={() => {
              setQuantity((q) => Math.max(1, q - 1));
              setAdded(false);
            }}
            className="px-4 py-2 text-lg disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Adet azalt"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold">{quantity}</span>
          <button
            type="button"
            disabled={!inStock || atMaxQuantity}
            onClick={() => {
              setQuantity((q) => (selectedDurationPlan ? q + 1 : Math.min(selectedVariant.stock, q + 1)));
              setAdded(false);
            }}
            className="px-4 py-2 text-lg disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Adet artır"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!inStock}
          className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {inStock ? `Sepete ekle · ${formatPriceTRY(unitPriceKurus * quantity)}` : "Tükendi"}
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
