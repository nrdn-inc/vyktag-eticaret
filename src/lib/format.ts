const tryFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

/** Kuruş cinsinden tutarı Türk Lirası para birimi metnine çevirir (örn. 59990 -> "599,90 ₺"). */
export function formatPriceTRY(priceKurus: number): string {
  return tryFormatter.format(priceKurus / 100);
}
