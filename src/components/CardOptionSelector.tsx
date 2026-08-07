import type { ProductWithVariants } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";
import { isVariantPurchasable } from "@/lib/orders/stock";
import { parseVariantAttributes, type CardColor, type PrintColor } from "@/lib/catalog/product-variant-attributes";
import { LogoUploadInput } from "@/components/LogoUploadInput";
import { Checkbox, PillToggleGroup } from "@/components/ui";

type Variant = ProductWithVariants["variants"][number];

interface CardOptionSelectorProps {
  variants: Variant[];
  selectedVariantId: string;
  onSelect: (variantId: string) => void;
  logoDataUrl?: string;
  onLogoChange: (dataUrl: string | undefined) => void;
  /**
   * "Özel tasarım/logo ekleyin" onay kutusunda gösterilecek "+X TL" farkını dışarıdan verir.
   * Bu bileşen artık yalnızca abonelik/Sınırsız akışında (bkz. AddToCartForm) kullanıldığından,
   * gerçek ücret çıplak varyant fiyat farkı DEĞİL, sunucu tarafında doğrulanmış
   * subscriptionFirstCardAddon ücretlerinin farkıdır. Verilmezse (ör. gelecekte düz varyant
   * satın alma geri gelirse) varyant fiyat farkına geri düşer.
   */
  customDesignSurchargeKurus?: number;
}

const CARD_COLOR_ORDER: CardColor[] = ["Siyah", "Beyaz"];
const PRINT_COLOR_ORDER: PrintColor[] = ["Gümüş", "Altın", "Siyah"];

function uniqueInOrder<T>(values: T[], order: T[]): T[] {
  return order.filter((item) => values.includes(item));
}

/** VYKTag Kart için kart rengi + baskı rengi + özel tasarım/logo eklentisini seçtiren kontrol grubu. */
export function CardOptionSelector({
  variants,
  selectedVariantId,
  onSelect,
  logoDataUrl,
  onLogoChange,
  customDesignSurchargeKurus,
}: CardOptionSelectorProps) {
  const parsed = variants.map((v) => ({ variant: v, attrs: parseVariantAttributes(v.attributes)! }));

  const selected = parsed.find((p) => p.variant.id === selectedVariantId) ?? parsed[0];
  const availableCardColors = uniqueInOrder(
    parsed.map((p) => p.attrs.cardColor),
    CARD_COLOR_ORDER,
  );
  const printColorsForSelectedCard = uniqueInOrder(
    parsed.filter((p) => p.attrs.cardColor === selected.attrs.cardColor).map((p) => p.attrs.printColor),
    PRINT_COLOR_ORDER,
  );

  function findVariant(cardColor: CardColor, printColor: PrintColor, customDesign: boolean) {
    return parsed.find(
      (p) => p.attrs.cardColor === cardColor && p.attrs.printColor === printColor && p.attrs.customDesign === customDesign,
    );
  }

  function selectCardColor(cardColor: CardColor) {
    const printOptions = uniqueInOrder(
      parsed.filter((p) => p.attrs.cardColor === cardColor).map((p) => p.attrs.printColor),
      PRINT_COLOR_ORDER,
    );
    const printColor = printOptions.includes(selected.attrs.printColor) ? selected.attrs.printColor : printOptions[0];
    const match = findVariant(cardColor, printColor, selected.attrs.customDesign) ?? findVariant(cardColor, printColor, false);
    if (match) onSelect(match.variant.id);
  }

  function selectPrintColor(printColor: PrintColor) {
    const match =
      findVariant(selected.attrs.cardColor, printColor, selected.attrs.customDesign) ??
      findVariant(selected.attrs.cardColor, printColor, false);
    if (match) onSelect(match.variant.id);
  }

  function toggleCustomDesign(customDesign: boolean) {
    const match = findVariant(selected.attrs.cardColor, selected.attrs.printColor, customDesign);
    if (match) onSelect(match.variant.id);
    // Ücretli seçenek kapatılınca yüklenen logo da temizlenir — aksi halde özel tasarım
    // ücreti ödenmeyen bir siparişe sessizce bir logo iliştirilmiş olur.
    if (!customDesign) onLogoChange(undefined);
  }

  const baseVariant = findVariant(selected.attrs.cardColor, selected.attrs.printColor, false);
  const customVariant = findVariant(selected.attrs.cardColor, selected.attrs.printColor, true);
  const customDesignSurcharge =
    customDesignSurchargeKurus ??
    (baseVariant && customVariant ? customVariant.variant.priceKurus - baseVariant.variant.priceKurus : 0);

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold">Kart rengi</label>
        <div className="mt-2">
          <PillToggleGroup
            aria-label="Kart rengi"
            value={selected.attrs.cardColor}
            onChange={(value) => selectCardColor(value as CardColor)}
            options={availableCardColors.map((cardColor) => ({ value: cardColor, label: cardColor }))}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">Baskı rengi</label>
        <div className="mt-2">
          <PillToggleGroup
            aria-label="Baskı rengi"
            value={selected.attrs.printColor}
            onChange={(value) => selectPrintColor(value as PrintColor)}
            options={printColorsForSelectedCard.map((printColor) => {
              const match = findVariant(selected.attrs.cardColor, printColor, selected.attrs.customDesign) ?? findVariant(selected.attrs.cardColor, printColor, false);
              const outOfStock = match ? !isVariantPurchasable(match.variant.stock) : false;
              return {
                value: printColor,
                disabled: outOfStock,
                label: `${printColor} Baskı${outOfStock ? " · Tükendi" : ""}`,
              };
            })}
          />
        </div>
      </div>

      {baseVariant && customVariant && (
        <div>
          <Checkbox
            label={`Özel tasarım/logo ekleyin (+${formatPriceTRY(customDesignSurcharge)})`}
            checked={selected.attrs.customDesign}
            onChange={(e) => toggleCustomDesign(e.target.checked)}
          />

          {selected.attrs.customDesign && (
            <div className="mt-4">
              <LogoUploadInput value={logoDataUrl} onChange={onLogoChange} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
