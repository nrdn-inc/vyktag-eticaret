// Sepet, istemci tarafında (localStorage) tutulur; sunucuya yalnızca ödeme adımında (Faz 3) gönderilir.
// Buradaki fonksiyonlar saf/yan etkisizdir, böylece test edilebilir ve context içinde yeniden kullanılır.

export interface CartPersonalization {
  fullName?: string;
  title?: string;
  phone?: string;
  note?: string;
}

export interface CartItem {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  unitPriceKurus: number;
  quantity: number;
  personalization?: CartPersonalization;
}

/**
 * Bir sepet kalemini tekilleştiren anahtar. Aynı varyant farklı kişiselleştirmelerle
 * eklendiğinde ayrı satır olarak durması için kişiselleştirme de anahtara dahildir.
 */
export function lineKey(item: CartItem): string {
  return `${item.variantId}::${JSON.stringify(item.personalization ?? {})}`;
}

/** Sepete kalem ekler; aynı anahtardaki kalem varsa adedini artırır. */
export function addItem(items: CartItem[], item: CartItem): CartItem[] {
  const key = lineKey(item);
  const exists = items.some((i) => lineKey(i) === key);
  if (exists) {
    return items.map((i) =>
      lineKey(i) === key ? { ...i, quantity: i.quantity + item.quantity } : i,
    );
  }
  return [...items, item];
}

/** Anahtarı verilen kalemin adedini günceller; adet 0 veya altına inerse kalemi kaldırır. */
export function updateQuantity(items: CartItem[], key: string, quantity: number): CartItem[] {
  if (quantity <= 0) {
    return removeItem(items, key);
  }
  return items.map((i) => (lineKey(i) === key ? { ...i, quantity } : i));
}

/** Anahtarı verilen kalemi sepetten kaldırır. */
export function removeItem(items: CartItem[], key: string): CartItem[] {
  return items.filter((i) => lineKey(i) !== key);
}

/** Sepetteki tüm kalemlerin toplam tutarını (kuruş) döner. */
export function cartTotalKurus(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPriceKurus * i.quantity, 0);
}

/** Sepetteki toplam ürün adedini (rozet için) döner. */
export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
