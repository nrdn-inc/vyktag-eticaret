/** Site geneli sabit bilgiler ve navigasyon menüsü. */
export const siteConfig = {
  name: "VYKTag",
  company: "VYK Teknoloji",
  tagline: "Tek dokunuşla dijital kartvizit",
  description:
    "VYKTag NFC dijital kartvizitleri ile iletişim bilgilerinizi tek dokunuşla paylaşın. Fiziksel kartlar, telefon etiketleri ve premium dijital profil.",
} as const;

export const mainNav = [
  { label: "Ürünler", href: "/urunler" },
  { label: "Fiyatlandırma", href: "/fiyatlandirma" },
  { label: "SSS", href: "/sss" },
  { label: "Kurumsal (B2B)", href: "/toplu-siparis" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "Giriş", href: "https://dkartvizit.com" },
] as const;

/** Yasal metinlerde ve iletişim alanlarında kullanılan şirket bilgileri (vergi levhasına göre). */
export const legalInfo = {
  companyLegalName: "VYK Teknoloji Sanayi ve Ticaret Limited Şirketi",
  address: "Silivrikapı Mah. Vidin Cad. Çağdaş Apt No: 32 B, Fatih/İstanbul",
  taxOffice: "Fatih Vergi Dairesi",
  taxNumber: "9261072855",
  email: "satis@vyktag.com.tr",
  phones: ["0535 357 73 00", "0531 698 33 61"],
  withdrawalPeriodDays: 14,
} as const;

export const legalNav = [
  { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
  { label: "Teslimat ve İade Şartları", href: "/teslimat-ve-iade" },
  { label: "KVKK Aydınlatma Metni", href: "/kvkk" },
  { label: "Gizlilik ve Çerez Politikası", href: "/gizlilik-politikasi" },
] as const;
