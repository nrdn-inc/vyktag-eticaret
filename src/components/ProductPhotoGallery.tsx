import { CARD_VARIANT_PHOTOS, CUSTOMIZATION_SAMPLE_PHOTOS } from "@/lib/product-photos";
import { ProductPhoto } from "@/components/visuals/ProductPhoto";

/** VYKTag Kart'ın gerçek stüdyo fotoğrafları — marka baskılı varyantlar + kişiselleştirme örnekleri. */
export function ProductPhotoGallery() {
  return (
    <section className="mt-16 border-t border-border-soft pt-12">
      <h2 className="text-lg font-semibold">Gerçek ürün fotoğrafları</h2>
      <p className="mt-1 text-sm text-zinc-500">VYKTag Kart&apos;ın siyah, beyaz ve altın varak baskı seçenekleri.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ProductPhoto src={CARD_VARIANT_PHOTOS.siyah} alt="VYKTag Kart — siyah, gümüş baskı" />
        <ProductPhoto src="/images/5.jpg" alt="VYKTag Kart — siyah, altın varak baskı" />
        <ProductPhoto src={CARD_VARIANT_PHOTOS.beyaz} alt="VYKTag Kart — beyaz, siyah baskı" />
        <ProductPhoto src="/images/8.jpg" alt="VYKTag Kart — beyaz, altın varak baskı" />
      </div>

      <h3 className="mt-10 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Kendi logonuzla kişiselleştirme örnekleri
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CUSTOMIZATION_SAMPLE_PHOTOS.map((src) => (
          <ProductPhoto key={src} src={src} alt="Kişiselleştirilmiş VYKTag Kart örneği" />
        ))}
      </div>
    </section>
  );
}
