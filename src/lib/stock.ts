// Yalnızca tip olarak içe aktarılır (import type) — bu dosya istemci bileşenlerinden
// (AddToCartForm, ProductCard) de kullanıldığından Prisma'nın Node.js bağımlılıklarının
// tarayıcı paketine sızmaması gerekir. import type derleme anında tamamen silinir.
import type { OrderStatus } from "@/generated/prisma/client";

/**
 * Stoğun geri iade edildiği (serbest bırakıldığı) sipariş durumları. Bir sipariş bu
 * durumlardan birine geçtiğinde, sipariş oluşturulurken düşülen stok geri eklenir.
 */
export const STOCK_RELEASED_STATUSES: readonly OrderStatus[] = ["CANCELLED", "REFUNDED", "FAILED"];

/** Verilen durumda stoğun serbest bırakılmış (iade edilmiş) olması gerekip gerekmediğini döner. */
export function isStockReleasedStatus(status: OrderStatus): boolean {
  return STOCK_RELEASED_STATUSES.includes(status);
}

/** Stok yetersiz olduğunda fırlatılan hata — sipariş oluşturma tekrar denenmez. */
export class InsufficientStockError extends Error {
  constructor(productLabel: string) {
    super(`"${productLabel}" için yeterli stok yok. Lütfen sepetinizi güncelleyin.`);
    this.name = "InsufficientStockError";
  }
}

export interface QuantityLine {
  variantId: string;
  quantity: number;
}

/**
 * Sepet satırlarındaki adetleri varyant bazında toplar (aynı varyant farklı
 * kişiselleştirmelerle birden çok satırda olabilir). Adetler en az 1'e yuvarlanır.
 */
export function aggregateQuantitiesByVariant(lines: QuantityLine[]): Map<string, number> {
  const byVariant = new Map<string, number>();
  for (const line of lines) {
    const quantity = Math.max(1, Math.floor(line.quantity));
    byVariant.set(line.variantId, (byVariant.get(line.variantId) ?? 0) + quantity);
  }
  return byVariant;
}

/** Bir varyantın satın alınabilir olup olmadığını (stok > 0) döner. */
export function isVariantPurchasable(stock: number): boolean {
  return stock > 0;
}

/** Adet seçiminde izin verilen en yüksek değeri döner (stokla sınırlı, en az 0). */
export function clampQuantityToStock(quantity: number, stock: number): number {
  if (stock <= 0) {
    return 0;
  }
  return Math.min(Math.max(1, Math.floor(quantity)), stock);
}
