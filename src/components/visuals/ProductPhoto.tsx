import Image from "next/image";

interface ProductPhotoProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/** Gerçek ürün fotoğrafları için çerçeveli, gölgeli sunum kutusu. */
export function ProductPhoto({ src, alt, className = "", sizes, priority }: ProductPhotoProps) {
  return (
    <div
      className={`relative aspect-[6/5] w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-zinc-900/5 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes ?? "(min-width: 1024px) 20rem, 90vw"}
        // Fotoğrafların en-boy oranı varyanta göre değişiyor; kırpmak yerine tamamı gösterilir.
        className="object-contain"
      />
    </div>
  );
}
