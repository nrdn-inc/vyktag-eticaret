# VYKTag E-Ticaret

NFC dijital kartvizit **satış & pazarlama** mağazası. Ana firma: **VYK Teknoloji** · Marka: **VYKTag**.

Bu proje yalnızca mağaza + pazarlama katmanıdır. Dijital profil/SaaS platformu ayrı ve hazırdır (dkartvizit.com) — burada yeniden yazılmaz.

## Ne satılıyor?

- **Tek seferlik:** Fiziksel NFC kartlar (logo/kişiselleştirme ile)
- **Tekrarlayan:** Premium / abonelik planları

## Teknoloji

| Katman | Seçim |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Stil | Tailwind CSS |
| Veritabanı | MySQL (Hostinger) + Prisma ORM |
| Ödeme | iyzico (tek çekim) + iyzico Abonelik (recurring) |
| Hosting | Hostinger Kurumsal Web Hosting (managed Node.js, GitHub deploy) |
| dkartvizit entegrasyonu | MVP'de manuel (admin sipariş sonrası hesap açar) |

## Yol Haritası

- [x] **Faz 0** — İskelet + git + deploy hattı + DB şeması
- [x] **Faz 1** — Pazarlama sitesi (anasayfa, ürünler, fiyatlandırma, SSS) · SEO
- [x] **Faz 2** — Mağaza: ürün detay, kart kişiselleştirme (metin), sepet · logo yükleme MVP'de manuel (sipariş sonrası)
- [x] **Faz 3** — iyzico checkout (tek çekim ürünler), sipariş oluşturma · abonelik (Faz 3b) sırada
- [x] **Faz 4** — Sipariş & admin paneli, dkartvizit'e manuel hesap devri, kargo takibi
- [x] **Yasal uyum** — KVKK Aydınlatma Metni, Mesafeli Satış Sözleşmesi (cayma hakkı dahil), Gizlilik/Çerez Politikası; ödeme adımında sözleşme onayı zorunlu
- [ ] **Faz 5** — Cila: analitik, çoklu dil, indirim kodları

## Geliştirme

```bash
npm install
npm run dev
```

`http://localhost:3000` adresinde açılır. Ortam değişkenleri için `.env.example` dosyasını `.env` olarak kopyalayın.
