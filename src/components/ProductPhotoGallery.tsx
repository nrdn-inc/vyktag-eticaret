import { CUSTOMIZATION_SAMPLE_PHOTOS } from "@/lib/product-photos";
import { ProductPhoto } from "@/components/visuals/ProductPhoto";

const BRANDED_PHOTOS = [
  { src: "/images/kart-siyah-altin.jpg", alt: "VYKTag Kart — siyah kart, altın baskı" },
  { src: "/images/kart-siyah-gumus.jpg", alt: "VYKTag Kart — siyah kart, gümüş baskı" },
  { src: "/images/kart-beyaz-altin.jpg", alt: "VYKTag Kart — beyaz kart, altın baskı" },
  { src: "/images/kart-beyaz-siyah.jpg", alt: "VYKTag Kart — beyaz kart, siyah baskı" },
];

/** VYKTag Kart'ın gerçek stüdyo fotoğrafları — marka baskılı varyantlar + kişiselleştirme örnekleri. */
export function ProductPhotoGallery() {
  return (
    <section className="mt-16 border-t border-border-soft pt-12">
      <h2 className="text-lg font-semibold">Gerçek ürün fotoğrafları</h2>
      <p className="mt-1 text-sm text-zinc-500">
        VYKTag Kart&apos;ın siyah ve beyaz kart üzerinde altın, gümüş ve siyah baskı seçenekleri.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {BRANDED_PHOTOS.map((photo) => (
          <ProductPhoto key={photo.src} src={photo.src} alt={photo.alt} />
        ))}
      </div>

      <h3 className="mt-10 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Kendi logonuzla kişiselleştirme örnekleri
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CUSTOMIZATION_SAMPLE_PHOTOS.map((src) => (
          <ProductPhoto key={src} src={src} alt="Kendi logosuyla kişiselleştirilmiş VYKTag Kart örneği" />
        ))}
      </div>
    </section>
  );
}
