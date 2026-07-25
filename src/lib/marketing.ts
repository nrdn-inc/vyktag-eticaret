/**
 * Pazarlama sayfalarının metin içeriği. Kaynak: "Dijital Kartvizit Platformu —
 * Kurumsal Çözüm Tanıtımı" broşürü. Tek yerde tutulur ki sayfalar arasında tutarlı
 * kalsın ve güncellemek için JSX'e dokunmak gerekmesin.
 */

export interface ValueProp {
  icon: IconName;
  title: string;
  text: string;
}

/** NfcIcon bileşeninin çizebildiği ikon adları. */
export type IconName =
  | "refresh"
  | "chart"
  | "leaf"
  | "shield"
  | "contact"
  | "palette"
  | "bolt"
  | "nfc";

/** Ana sayfadaki "Neden dijital kartvizit?" bölümü. */
export const VALUE_PROPS: ValueProp[] = [
  {
    icon: "refresh",
    title: "Anında güncelleme",
    text: "Telefonunuz, unvanınız ya da adresiniz değişti mi? Panelden saniyeler içinde güncelleyin. Dağıttığınız tüm kartlar otomatik olarak yeni bilgiyi gösterir — yeniden baskı yok.",
  },
  {
    icon: "chart",
    title: "Ölçülebilir etkileşim",
    text: "Kartınızın kaç kez görüntülendiğini ve kaç kişinin sizi rehberine eklediğini canlı olarak izleyin. Kağıt kartvizitte asla bilemeyeceğiniz veriler.",
  },
  {
    icon: "leaf",
    title: "Sürdürülebilir",
    text: "Tek bir kart, ömür boyu kullanım. Kağıt israfını ortadan kaldırır ve şirketinizin sürdürülebilirlik (ESG) hedeflerine somut katkı sağlar.",
  },
  {
    icon: "shield",
    title: "Kurumsal güvenlik",
    text: "İki adımlı doğrulama (2FA) korumalı yönetim paneli, güvenli oturum altyapısı ve kaba kuvvet saldırı engelleme ile verileriniz korunur.",
  },
];

export interface HowItWorksStep {
  step: string;
  title: string;
  text: string;
}

/** Ana sayfadaki 3 adımlı kullanım akışı. */
export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    step: "01",
    title: "Kartınızı seçin",
    text: "VYKTag Kart, Tag veya Phonecard arasından size uygun olanı seçin. Dilerseniz logonuzu ve kurumsal tasarımınızı ekleyerek kişiselleştirin.",
  },
  {
    step: "02",
    title: "Profilinizi kuralım",
    text: "Siparişiniz sonrası dijital kartvizit profilinizi dkartvizit.com üzerinde sizin için açar ve hazırlarız. IT departmanınıza ek yük binmez.",
  },
  {
    step: "03",
    title: "Tek dokunuşla paylaşın",
    text: "Kartınızı bir telefona yaklaştırın; iletişim bilgileriniz, sosyal hesaplarınız ve tüm bağlantılarınız anında açılsın. Uygulama gerekmez.",
  },
];

/** Dijital kartvizit sayfasının ziyaretçiye sunduğu özellikler (broşür sayfa 4). */
export const CARD_FEATURES: string[] = [
  "Profil fotoğrafı, unvan ve kısa tanıtım metni",
  "Tek dokunuşla “Rehbere Ekle” — otomatik kişi kaydı",
  "Ara, WhatsApp, E-posta, Konum, Web, Instagram kısayolları",
  "Kart üzerinde “Bana Ulaşın” formu",
  "IBAN ve fatura bilgileri — tek dokunuşla kopyalanır",
  "İndirilebilir QR kod (PNG/SVG) ve kişisel link",
  "Doküman/katalog paylaşımı ve randevu bağlantısı",
  "Kurumsal renk ve yazı tipi uyarlaması",
];

export interface Audience {
  title: string;
  text: string;
}

/** "Kimler için ideal?" bölümü (broşür sayfa 3). */
export const AUDIENCES: Audience[] = [
  {
    title: "Satış ekipleri",
    text: "Fuarlarda ve saha ziyaretlerinde tek dokunuşla bilgi paylaşır, potansiyel müşteri bilgisini kart üzerinden anında toplar.",
  },
  {
    title: "Üst yönetim",
    text: "Toplantılarda ve davetlerde kurumsal, şık ve her zaman güncel bir imaj sunar.",
  },
  {
    title: "İnsan kaynakları",
    text: "Yeni personeli dakikalar içinde sisteme ekler, ayrılanların kartını tek tıkla devre dışı bırakır.",
  },
  {
    title: "Finans ve danışmanlık",
    text: "Banka hesap ve fatura bilgilerini kartvizit üzerinden hızlı ve pratik şekilde paylaşır.",
  },
  {
    title: "Saha ve teknik servis",
    text: "Müşteri ziyaretlerinde iletişim, konum ve randevu bilgilerini anında sunar.",
  },
];

export interface ComparisonRow {
  feature: string;
  printed: string;
  digital: string;
}

/** Basılı kartvizit ile karşılaştırma tablosu (broşür sayfa 9). */
export const COMPARISON: ComparisonRow[] = [
  {
    feature: "Bilgi güncelleme",
    printed: "Yeniden baskı gerekir",
    digital: "Panelden anında, ücretsiz",
  },
  {
    feature: "Güncelleme maliyeti",
    printed: "Her değişiklikte tekrar baskı",
    digital: "Tek seferlik kurulum",
  },
  {
    feature: "Performans takibi",
    printed: "Ölçülemez",
    digital: "Görüntülenme ve rehbere ekleme istatistikleri",
  },
  {
    feature: "Kaybolma / yıpranma",
    printed: "Yüksek risk",
    digital: "Link ve QR her zaman erişilebilir",
  },
  {
    feature: "İçerik kapasitesi",
    printed: "Sadece temel bilgiler",
    digital: "Doküman, randevu, banka/fatura bilgisi",
  },
  {
    feature: "Marka tutarlılığı",
    printed: "Baskı kalitesine bağlı",
    digital: "Tüm kartlarda tek merkezden otomatik",
  },
  {
    feature: "Müşteri adayı takibi",
    printed: "Yok",
    digital: "Otomatik talep formu + anlık bildirim",
  },
  {
    feature: "Çevresel etki",
    printed: "Sürekli kağıt ve baskı israfı",
    digital: "Kağıtsız — ESG hedeflerine katkı",
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

/** Ürün ve platform hakkında sık sorulan sorular (mağaza + broşür sayfa 10). */
export const FAQ: FaqItem[] = [
  {
    q: "VYKTag kart nasıl çalışır?",
    a: "Kartın içinde bir NFC çipi bulunur. Kartı NFC destekli bir telefona yaklaştırdığınızda dijital kartvizit profiliniz otomatik olarak açılır. NFC desteklemeyen telefonlar için kartın üzerindeki QR kod da aynı işi görür.",
  },
  {
    q: "NFC kartı okutmak için özel bir uygulama gerekir mi?",
    a: "Hayır. Güncel Android ve iPhone cihazların büyük çoğunluğu NFC kartları doğrudan okur, ek bir uygulama kurulumu gerekmez. QR kod seçeneği ise her telefonun kamerasıyla çalışır.",
  },
  {
    q: "Dijital profilimi nasıl yönetirim?",
    a: "Kartınıza bağlı profiliniz dkartvizit.com üzerinde barındırılır. Siparişiniz sonrası hesabınızı sizin için açarız; iletişim bilgilerinizi, sosyal medya hesaplarınızı ve bağlantılarınızı buradan istediğiniz zaman güncelleyebilirsiniz.",
  },
  {
    q: "Kartıma logo veya özel tasarım ekleyebilir miyim?",
    a: "Evet. Özel Tasarım seçeneğiyle kartınıza kurumsal logonuzu ve tasarımınızı ekleyebiliriz. Arka plan, buton ve yazı renklerinizi kurumsal kimliğinize göre ayarlayabilir, sunulan yazı tipi seçenekleriyle markanızı yansıtabilirsiniz.",
  },
  {
    q: "Personel sayımız değişirse ne olur?",
    a: "Yeni personel eklemek veya ayrılan bir personelin kartını pasif hale getirmek yönetim panelinden anında yapılır; fiziksel kartları toplamanıza gerek kalmaz.",
  },
  {
    q: "Verilerimiz ne kadar güvende?",
    a: "Yönetim paneli iki adımlı doğrulama (2FA), güvenli şifre sıfırlama ve oturum güvenliği önlemleriyle korunur. Kaba kuvvet (brute-force) saldırılarına karşı koruma bulunur.",
  },
  {
    q: "Basılı kartvizitlerimizi tamamen bırakmamız mı gerekiyor?",
    a: "Hayır. Dijital kartvizit, mevcut basılı kartvizitlerinizle birlikte kullanılabilir; geçiş sürecinde herhangi bir risk almazsınız.",
  },
  {
    q: "Abonelik almak zorunda mıyım?",
    a: "Hayır. Fiziksel kart tek seferlik bir alımdır ve temel dijital profil ücretsizdir. Premium abonelik yalnızca gelişmiş analitik, sınırsız bağlantı ve özel temalar gibi ek özellikler isterseniz gereklidir.",
  },
  {
    q: "Kargo ne kadar sürer?",
    a: "Standart kartlar hazırlandıktan sonra kargoya verilir. Özel tasarımlı kartlarda tasarım onayı sonrası üretim süresi eklenir. Kargo takip numaranız siparişiniz gönderildiğinde tarafınıza iletilir.",
  },
];

/**
 * Ana sayfa hero slider'ında dönen mesajlar. Her slayt farklı bir satın alma
 * gerekçesini öne çıkarır.
 */
export interface HeroSlide {
  eyebrow: string;
  title: string;
  highlight: string;
  text: string;
  variant: "siyah" | "beyaz" | "özel";
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "NFC & QR destekli",
    title: "Kartvizit dağıtma devri bitti.",
    highlight: "Artık tek dokunuş yeterli.",
    text: "İletişim bilgilerinizi, sosyal medya hesaplarınızı ve tüm bağlantılarınızı saniyeler içinde paylaşın. Karşı tarafın uygulama indirmesine gerek yok.",
    variant: "siyah",
  },
  {
    eyebrow: "Her zaman güncel",
    title: "Bilgileriniz değişti mi?",
    highlight: "Kartınız kendini günceller.",
    text: "Unvanınız, telefonunuz ya da adresiniz değiştiğinde panelden saniyeler içinde güncelleyin. Dağıttığınız tüm kartlar yeni bilgiyi gösterir.",
    variant: "beyaz",
  },
  {
    eyebrow: "Kurumsal çözüm",
    title: "Tüm ekibiniz için",
    highlight: "tek merkezden yönetim.",
    text: "Excel şablonuyla onlarca personeli dakikalar içinde ekleyin, kurumsal renklerinizi tüm kartlara tek tıkla uygulayın, görüntülenme istatistiklerini izleyin.",
    variant: "özel",
  },
];

/**
 * Ürün kartlarında gösterilen vurgu rozetleri (slug -> rozet metni).
 * Kampanyaya göre buradan düzenlenir; eşleşmeyen ürünlerde rozet gösterilmez.
 */
export const PRODUCT_BADGES: Record<string, string> = {
  "vyktag-kart": "En çok satan",
  "vyktag-tag": "En popüler",
};

/** Ana sayfada güven veren kısa istatistik şeritleri. */
export const TRUST_STATS = [
  { value: "0", suffix: " uygulama", label: "Karşı tarafın indirmesi gerekmez" },
  { value: "3", suffix: " saniye", label: "Bilgi paylaşım süresi" },
  { value: "∞", suffix: "", label: "Sınırsız güncelleme hakkı" },
  { value: "2FA", suffix: "", label: "Korumalı yönetim paneli" },
] as const;
