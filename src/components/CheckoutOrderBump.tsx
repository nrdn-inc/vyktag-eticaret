"use client";

import { useEffect, useState } from "react";
import { getCrossSellProduct } from "@/app/actions/cross-sell";
import { useCart } from "@/components/CartProvider";
import { formatPriceTRY } from "@/lib/format";
import type { CartItem } from "@/lib/orders/cart";
import { Button } from "@/components/ui";

/**
 * Checkout Order Bump bileşeni: Kullanıcının sepete eklemiş olduğu ana ürünün yanına
 * tamamlayıcı, düşük fiyatlı bir ürünü (örn. telefon arkası NFC sticker) tek tıkla eklemesini sağlar.
 */
export function CheckoutOrderBump() {
  const [crossSellItem, setCrossSellItem] = useState<Omit<CartItem, "quantity"> | null>(null);
  const [loading, setLoading] = useState(true);
  const { items, addItem } = useCart();

  useEffect(() => {
    async function loadItem() {
      try {
        const item = await getCrossSellProduct();
        setCrossSellItem(item);
      } catch (error) {
        console.error("Order bump yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, []);

  if (loading || !crossSellItem) {
    return null; // Yüklenirken veya ürün yoksa UI'ı meşgul etme.
  }

  // Eğer bu ürün zaten sepette varsa order bump'ı gösterme.
  const isAlreadyInCart = items.some((item) => item.productSlug === crossSellItem.productSlug);
  if (isAlreadyInCart) {
    return null;
  }

  const handleAdd = () => {
    addItem({ ...crossSellItem, quantity: 1 });
  };

  return (
    <div className="mt-8 rounded-2xl border-2 border-dashed border-brand/50 bg-brand/5 p-5 dark:border-brand/30 dark:bg-brand/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Özel Teklif: {crossSellItem.productName}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Telefonunuzun arkasına yapıştırarak dijital kartvizitinizi her an yanınızda taşıyın. Sadece <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatPriceTRY(crossSellItem.unitPriceKurus)}</span>!
            </p>
          </div>
        </div>
        {/* Bilinçli olarak marka rengi değil, yüksek kontrastlı ters renk (order bump'ın
            geri kalan CTA'lardan görsel olarak ayrışması amaçlanıyor). */}
        <Button
          onClick={handleAdd}
          className="whitespace-nowrap bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Sepete Ekle
        </Button>
      </div>
    </div>
  );
}
