/** Site geneli sabit bilgiler ve navigasyon menüsü. */
export const siteConfig = {
  name: "Vyktag",
  company: "VYK Teknoloji",
  tagline: "Tek dokunuşla dijital kartvizit",
  description:
    "Vyktag NFC dijital kartvizitleri ile iletişim bilgilerinizi tek dokunuşla paylaşın. Fiziksel kartlar, telefon etiketleri ve premium dijital profil.",
} as const;

export const mainNav = [
  { label: "Ürünler", href: "/urunler" },
  { label: "Fiyatlandırma", href: "/fiyatlandirma" },
  { label: "SSS", href: "/sss" },
] as const;
