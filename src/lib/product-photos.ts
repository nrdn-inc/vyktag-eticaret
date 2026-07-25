import type { CardVariant } from "@/components/visuals/NfcCard";

/**
 * Gerçek ürün stüdyo fotoğrafları. Yalnızca VYKTag Kart için mevcuttur (Tag ve Phonecard
 * farklı bir form faktörüne sahip olduğundan bu fotoğraflarla temsil edilemez).
 */
export const CARD_VARIANT_PHOTOS: Record<CardVariant, string> = {
  siyah: "/images/4.jpg",
  beyaz: "/images/7.jpg",
  özel: "/images/2.jpg",
};

/** Kişiselleştirme örnekleri: farklı renk/bitiş kombinasyonlarında "LOGONUZ" yer tutuculu kartlar. */
export const CUSTOMIZATION_SAMPLE_PHOTOS: string[] = ["/images/1.jpg", "/images/3.jpg", "/images/6.jpg"];

/** Gerçek fotoğrafı bulunan ürünlerin slug'ları. */
export const PRODUCTS_WITH_REAL_PHOTOS = new Set(["vyktag-kart"]);
