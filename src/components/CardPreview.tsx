interface CardPreviewProps {
  productName: string;
  variantName: string;
  fullName: string;
  title: string;
}

function variantTheme(variantName: string) {
  const normalized = variantName.toLocaleLowerCase("tr-TR");
  if (normalized.includes("siyah")) {
    return { card: "bg-zinc-900", text: "text-white", sub: "text-zinc-300" };
  }
  if (normalized.includes("beyaz")) {
    return { card: "border border-zinc-200 bg-white", text: "text-zinc-900", sub: "text-zinc-500" };
  }
  return { card: "bg-gradient-to-br from-brand to-brand-dark", text: "text-white", sub: "text-white/80" };
}

/** Ürün detay sayfasında kişiselleştirme alanlarına göre canlı güncellenen kart önizlemesi. */
export function CardPreview({ productName, variantName, fullName, title }: CardPreviewProps) {
  const theme = variantTheme(variantName);

  return (
    <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-brand/10 to-brand/30 p-8">
      <div
        className={`flex aspect-[1.6/1] w-full flex-col justify-between rounded-2xl p-6 shadow-lg transition-colors duration-200 ${theme.card}`}
      >
        <span className={`text-xs font-semibold uppercase tracking-widest ${theme.sub}`}>{productName}</span>
        <div>
          <p className={`text-lg font-bold ${theme.text}`}>{fullName.trim() || "Ad Soyad"}</p>
          <p className={`text-sm ${theme.sub}`}>{title.trim() || "Unvan"}</p>
        </div>
      </div>
    </div>
  );
}
