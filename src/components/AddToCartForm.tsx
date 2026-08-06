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
import { Alert, Button, Input, PillToggleGroup } from "@/components/ui";

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
  /** Seçili süre planı. null yalnızca hiç durationOptions'ı olmayan ürünlerde (düz varyant satın alma) geçerlidir. */
  durationPlanId: string | null;
  onDurationPlanChange: (planId: string | null) => void;
  fullName: string;
  onFullNameChange: (value: string) => void;
  title: string;
  onTitleChange: (value: string) => void;
  logoDataUrl: string | undefined;
  onLogoChange: (dataUrl: string | undefined) => void;
}

function durationLabel(interval: "MONTHLY" | "SIX_MONTHS" | "YEARLY" | "LIFETIME"): string {
  if (interval === "MONTHLY") return "Aylık";
  if (interval === "SIX_MONTHS") return "6 Ay";
  if (interval === "YEARLY") return "1 Yıl";
  return "Sınırsız";
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
  // Abonelik seçiliyken: ilk kez mi abone oluyor (fiziksel kart abonelikle birlikte, bir
  // kereliğine gönderilir) yoksa zaten kartı olan biri mi yeniliyor (kart tekrar gönderilmez,
  // özel tasarım ücreti de alınmaz). Varsayılan true: ürün sayfasına gelen çoğu ziyaretçi ilk
  // kez abone olur.
  const [isFirstSubscriptionCard, setIsFirstSubscriptionCard] = useState(true);

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

  const isLifetimePlan = selectedDurationPlan?.interval === "LIFETIME";

  // Abonelikte/Sınırsız'da fiziksel kart seçiliyken (ve sunucu tarafında doğrulanmış ücret
  // varyantları mevcutsa) kart dahil edilir ve standart ek ücret alınır; özel tasarım/logo
  // seçilirse onun YERİNE (üzerine değil) daha yüksek bir tek seferlik ücret alınır — bkz.
  // lib/catalog/index.ts subscriptionFirstCardAddon. "Zaten kartım var (yenileme)" veya
  // Sınırsız'da "Link" seçildiğinde kart/ücret hiç eklenmez.
  const includeFirstCard = !!selectedDurationPlan && isFirstSubscriptionCard && !!product.subscriptionFirstCardAddon;
  const wantsCustomDesign = includeFirstCard && hasStructuredOptions && !!selectedAttrs?.customDesign;
  const firstCardFeeKurus = includeFirstCard
    ? wantsCustomDesign
      ? product.subscriptionFirstCardAddon!.customDesignFeeKurus
      : product.subscriptionFirstCardAddon!.standardFeeKurus
    : 0;
  const unitPriceKurus = selectedDurationPlan
    ? selectedDurationPlan.priceKurus + firstCardFeeKurus
    : selectedVariant.priceKurus;

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
    if (logoDataUrl && (!selectedDurationPlan || wantsCustomDesign)) personalization.logo = logoDataUrl;
    if (includeFirstCard && hasStructuredOptions && selectedAttrs) {
      const cardNote = `İlk fiziksel kart: ${selectedAttrs.cardColor} kart, ${selectedAttrs.printColor} baskı.`;
      personalization.note = personalization.note ? `${personalization.note} ${cardNote}` : cardNote;
    }

    const items: CartItem[] = [];

    if (selectedDurationPlan) {
      items.push({
        subscriptionPlanId: selectedDurationPlan.subscriptionPlanId,
        productSlug: product.slug,
        productName: product.name,
        variantName: selectedDurationPlan.name,
        unitPriceKurus: selectedDurationPlan.priceKurus,
        quantity,
        ...(Object.keys(personalization).length > 0 ? { personalization } : {}),
      });

      if (includeFirstCard && product.subscriptionFirstCardAddon) {
        const addon = product.subscriptionFirstCardAddon;
        items.push({
          variantId: wantsCustomDesign ? addon.customDesignVariantId : addon.standardVariantId,
          productSlug: product.slug,
          productName: product.name,
          variantName: wantsCustomDesign ? "İlk Fiziksel Kart (özel tasarım/logo)" : "İlk Fiziksel Kart",
          unitPriceKurus: wantsCustomDesign ? addon.customDesignFeeKurus : addon.standardFeeKurus,
          quantity,
        });
      }
    } else {
      items.push({
        variantId: selectedVariant.id,
        productSlug: product.slug,
        productName: product.name,
        variantName: selectedVariant.name,
        unitPriceKurus: selectedVariant.priceKurus,
        quantity,
        ...(Object.keys(personalization).length > 0 ? { personalization } : {}),
      });
    }

    for (const item of items) addItem(item);
    setAdded(true);
  }

  return (
    <div className="space-y-6">
      {/* Kullanım süresi: 6 Ay / 1 Yıl / Sınırsız — bunlardan biri her zaman seçili olmalı
          ("Sadece Fiziksel Kart" seçeneği bilinçli olarak kaldırıldı, artık kart yalnızca bu
          planlardan birinin ek satırı olarak satın alınabilir). */}
      {product.durationOptions.length > 0 && (
        <div>
          <label className="text-sm font-semibold">Kullanım süresi</label>
          <div className="mt-2">
            <PillToggleGroup
              aria-label="Kullanım süresi"
              value={durationPlanId ?? product.durationOptions[0].subscriptionPlanId}
              onChange={(value) => {
                onDurationPlanChange(value);
                resetSelectionState();
              }}
              options={product.durationOptions.map((plan) => ({
                value: plan.subscriptionPlanId,
                label: `${durationLabel(plan.interval)} · ${formatPriceTRY(plan.priceKurus)}`,
              }))}
            />
          </div>
          {selectedDurationPlan && !product.subscriptionFirstCardAddon && (
            <p className="mt-2 text-xs text-zinc-500">
              Bu seçenekte fiziksel kart gönderilmez, yalnızca dijital profilinize {durationLabel(selectedDurationPlan.interval).toLowerCase()} boyunca kullanım hakkı verilir.
            </p>
          )}
        </div>
      )}

      {/* Sınırsız'da fiziksel kart mı, yalnızca link mi? Diğer planlarda ilk kart mı, yenileme mi? */}
      {selectedDurationPlan && product.subscriptionFirstCardAddon && (
        <div>
          <label className="text-sm font-semibold">Fiziksel kart</label>
          <div className="mt-2">
            <PillToggleGroup
              aria-label="Fiziksel kart"
              value={isFirstSubscriptionCard ? "first" : "renewal"}
              onChange={(value) => setIsFirstSubscriptionCard(value === "first")}
              options={
                isLifetimePlan
                  ? [
                      { value: "first", label: "Fiziksel kart" },
                      { value: "renewal", label: "Link" },
                    ]
                  : [
                      { value: "first", label: "İlk fiziksel kartım" },
                      { value: "renewal", label: "Zaten kartım var (yenileme)" },
                    ]
              }
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            {isLifetimePlan
              ? isFirstSubscriptionCard
                ? `Fiziksel kart gönderilir (+${formatPriceTRY(product.subscriptionFirstCardAddon.standardFeeKurus)}).`
                : "Yalnızca dijital link — fiziksel kart gönderilmez."
              : isFirstSubscriptionCard
                ? `İlk aboneliğinizle birlikte bir fiziksel kart da gönderilir (+${formatPriceTRY(product.subscriptionFirstCardAddon.standardFeeKurus)}).`
                : `Fiziksel kart gönderilmez, yalnızca dijital profilinize ${durationLabel(selectedDurationPlan.interval).toLowerCase()} boyunca kullanım hakkı verilir.`}
          </p>
        </div>
      )}

      {/* Varyant seçimi — fiziksel kart gönderilecekse (bir süre planında "Fiziksel kart"/"İlk
          fiziksel kartım" seçiliyse, ya da hiç süre planı olmayan bir üründe düz varyant
          satın alımında) anlamlı */}
      {(!selectedDurationPlan || includeFirstCard) && (hasStructuredOptions ? (
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
        !selectedDurationPlan &&
        product.variants.length > 1 && (
          <div>
            <label className="text-sm font-semibold">Seçenek</label>
            <div className="mt-2">
              <PillToggleGroup
                aria-label="Seçenek"
                value={variantId}
                onChange={(id) => {
                  onVariantChange(id);
                  setQuantity(1);
                  setAdded(false);
                }}
                options={product.variants.map((variant) => {
                  const variantOutOfStock = !isVariantPurchasable(variant.stock);
                  return {
                    value: variant.id,
                    disabled: variantOutOfStock,
                    label: `${variant.name} · ${formatPriceTRY(variant.priceKurus)}${variantOutOfStock ? " · Tükendi" : ""}`,
                  };
                })}
              />
            </div>
          </div>
        )
      ))}

      {/* Kişiselleştirme */}
      <div>
        <h3 className="text-sm font-semibold">
          {!selectedDurationPlan || includeFirstCard
            ? "Kart üzerindeki bilgiler (isteğe bağlı)"
            : "Dijital profil bilgileri (isteğe bağlı)"}
        </h3>
        {(!selectedDurationPlan || includeFirstCard) && !wantsCustomDesign && (
          <p className="mt-1 text-xs text-zinc-500">
            Logonuzu siparişiniz sonrası sizden ayrıca rica edeceğiz.
          </p>
        )}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <Input
              type="text"
              placeholder="Ad Soyad"
              aria-label="Ad Soyad"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value.slice(0, FULL_NAME_MAX_LENGTH))}
              maxLength={FULL_NAME_MAX_LENGTH}
            />
            <p className="mt-1 text-right text-[11px] text-zinc-400">
              {fullName.length}/{FULL_NAME_MAX_LENGTH}
            </p>
          </div>
          <div>
            <Input
              type="text"
              placeholder="Unvan"
              aria-label="Unvan"
              value={title}
              onChange={(e) => onTitleChange(e.target.value.slice(0, TITLE_MAX_LENGTH))}
              maxLength={TITLE_MAX_LENGTH}
            />
            <p className="mt-1 text-right text-[11px] text-zinc-400">
              {title.length}/{TITLE_MAX_LENGTH}
            </p>
          </div>
          <Input
            type="tel"
            placeholder="Telefon"
            aria-label="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={PERSONALIZATION_FIELD_MAX_LENGTH}
          />
          <Input
            type="text"
            placeholder="Not (ör. tasarım tercihi)"
            aria-label="Not"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={PERSONALIZATION_FIELD_MAX_LENGTH}
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

        <Button onClick={handleAdd} disabled={!inStock} size="lg">
          {inStock ? `Sepete ekle · ${formatPriceTRY(unitPriceKurus * quantity)}` : "Tükendi"}
        </Button>
      </div>

      {added && (
        <Alert variant="success">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">Ürün sepete eklendi.</span>
            <Link href="/sepet" className="font-semibold underline">
              Sepete git
            </Link>
          </div>
        </Alert>
      )}
    </div>
  );
}
