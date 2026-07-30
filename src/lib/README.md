# `src/lib/` — Domain Katmanı

Bu dizin uygulamanın **domain katmanı**: Prisma erişimi ve iş kuralları burada yaşar.
`src/app/**` (sayfalar, Server Actions, Route Handler'lar) ve `src/components/**` bu
katmanı çağırır, tersi değil.

## 1. Katmanlama kuralı

```
src/app/**              ince transport katmanı
  ↓ çağırır
src/lib/<domain>/        Prisma erişimi + iş kuralları burada
  ↓ kullanır
src/lib/*.ts (kök)       cross-cutting altyapı (prisma.ts, mailer.ts, format.ts, ...)
```

- **`app/**` bir transport katmanıdır.** Bir sayfa/action/route dosyası şunları yapar:
  oturum/form/HTTP'ye özgü kararlar (form alanı okuma, zorunlu-alan kontrolü, idempotency/
  tutar kontrolü gibi *bu isteğe özgü* mantık) + doğru `lib/<domain>` fonksiyonunu çağırma +
  Next.js'e özgü şeyler (`revalidatePath`/`updateTag`, `redirect`). **Yeni kod için kural:**
  doğrudan `@/lib/prisma` import etmez — bir domain fonksiyonu yazıp onu çağırır. (Kod
  tabanında bu kurala uymayan, ad-hoc Prisma okuması yapan bazı eski `page.tsx` dosyaları var
  — bkz. §4 "Bilinen sınırlar".)
- **`lib/<domain>/`** — Prisma sorguları, transaction'lar, iş kuralları burada yaşar. Bir
  klasörde `index.ts` varsa o dosya domain'in birincil/en çok kullanılan modülüdür (`@/lib/
  catalog` gibi bir import otomatik olarak `catalog/index.ts`'e çözülür); domain'in daha az
  kullanılan parçaları kendi adlarıyla sibling dosyalar olarak durur ve kendi yollarından
  import edilir (`@/lib/orders/stock` gibi) — `index.ts` bunları yeniden export etmez.
- **`components/ui/`** — framework-agnostic tasarım sistemi (Button, Input, Modal, Table...).
  Hiçbir `lib/` dosyasına bağımlı değildir.
- **`components/`** — sunum bileşenleri. Veriyi prop olarak alır; `lib/*`'ten yalnızca saf
  tip/yardımcı fonksiyon import edebilir (`formatPriceTRY`, `isVariantPurchasable`,
  `parseVariantAttributes` gibi) — **asla Prisma'ya dokunmaz**. Bu yön hiçbir zaman tersine
  dönmemeli: bir `lib/` dosyası `components/`'tan veya `app/`'tan import etmemeli. (Projede
  bu kuralın ihlal edildiği tek yer — `lib/product-variant-attributes.ts`'in `components/
  visuals/NfcCard.tsx`'ten `CardVariant`/`resolveCardVariant` alması — düzeltildi: bu tip/
  fonksiyon artık `catalog/product-variant-attributes.ts`'te tanımlı, `NfcCard.tsx` oradan
  import ediyor.)

## 2. Domain klasörleri

```
src/lib/
  auth/          kimlik doğrulama, oturumlar, 2FA/TOTP, rate-limit
  catalog/       ürün/plan okuma, katalog seed, varyant görsel çözümleme
  orders/        sepet, sipariş yaşam döngüsü, stok, ödeme sonlandırma
  account/       müşterinin kendi adres/fatura profili verisi
  payments/      iyzico entegrasyonu, abonelik yaşam döngüsü
  (kök)          cross-cutting altyapı — bkz. §3
```

Her domain klasöründeki testler (`*.test.ts`, `*.db.test.ts`) konu aldıkları dosyanın yanında
durur (proje geneli kural, `CLAUDE.md`'de tanımlı `npm test` / `npm run test:db` ayrımına
tabidir).

**`auth/`** — `index.ts` (oturum doğrulama, şifre hash'leme, sıfırlama/doğrulama token'ları),
`admin-session.ts`, `customer-session.ts`, `customer-auth.ts`, `totp.ts`,
`totp-secret-crypto.ts`, `two-factor.ts` (2FA enrollment/toggle orkestrasyonu — `totp.ts`'in
üzerine kurulu, bilinçli olarak `account/` değil burada: login akışındaki 2FA kod doğrulaması
da bu dosyalardan besleniyor, 2FA'nın tamamı tek domain'de), `rate-limit.ts`.

**`catalog/`** — `index.ts` (`getActiveProducts`/`getProductBySlug`/
`getActiveSubscriptionPlans` + `unstable_cache` sarmalı `*Cached` varyantları — bkz. dosya
başı yorumu), `catalog-seed.ts`, `product-photos.ts`, `product-variant-attributes.ts`
(`CardVariant`/`CardAccent`/`resolveCardVariant` dahil — bkz. §1).

**`orders/`** — `index.ts` (`createOrderFromCart`, `setOrderStatus`,
`releaseStockIfPaymentFailed`, `finalizeOrderPayment` + `findOrderForPaymentFinalization`),
`order-status.ts`, `cart.ts`, `stock.ts` (**Prisma'sız** — istemci bileşenlerinden de
`import`landığı için, bkz. dosya başı yorumu), `stock-admin.ts` (admin stok güncellemesi —
Prisma'ya bağımlı olduğu için `stock.ts`'ten ayrı bir dosyada).

**`account/`** — `addresses.ts`, `billing-profiles.ts` (doğrulayıcılar + CRUD).

**`payments/`** — `iyzico.ts` (ödeme gateway entegrasyonu), `subscriptions.ts` (abonelik
yaşam döngüsü, `iyzico.ts`'e bağımlı).

## 3. Kökte kalan cross-cutting dosyalar

`prisma.ts`/`prisma-pool.ts` (bağlantı havuzu), `mailer.ts`, `revalidate.ts`,
`html-escape.ts`, `logo-upload.ts`, `cn.ts`, `format.ts`, `use-is-mounted.ts`, `site.ts`,
`marketing.ts` — bilinçli olarak domain klasörlerine taşınmadı: her biri zaten tek amaçlı,
tek bir domain'e ait olmayan (birden çok domain tarafından kullanılan) ya da salt statik
içerik dosyası. Taşımak risk ekler, okunabilirlik faydası getirmez.

## 4. Bilinen sınırlar (bu geçişin kapsamı dışında, gerçek bulgular)

- Bazı `page.tsx` dosyaları (`admin/siparisler/page.tsx`, `admin/stok/page.tsx`,
  `hesap/page.tsx`, `siparis/[orderNumber]/page.tsx` ve birkaç `actions.ts`) hâlâ
  `@/lib/prisma`'ya doğrudan bağlanıp kendi salt-okunur sorgularını yazıyor, bir domain
  fonksiyonu üzerinden değil. Yeni kod §1'deki kurala uymalı; bu mevcut okumaların taşınması
  ayrı, düşük riskli bir sonraki adım olurdu.
- `components/AddToCartForm.tsx`, `CardOptionSelector.tsx`, `ProductCard.tsx` gibi bazı
  sunum bileşenleri `isVariantPurchasable`/`parseVariantAttributes` gibi saf domain
  yardımcılarını doğrudan import ediyor (Prisma'ya değil — bu kural ihlali değil, ama bir
  view-model/DTO katmanı yerine domain tipine doğrudan bağımlılık). Küçük, gerçek ama
  kapsam dışı bırakıldı.
- `account/addresses.ts`, `account/billing-profiles.ts`'in yeni CRUD fonksiyonları ve
  `orders/stock-admin.ts` için henüz test yok (bu mantık daha önce de test edilmiyordu —
  bu geçiş davranışı korudu, test kapsamı eklemedi). `orders/index.ts`'teki
  `finalizeOrderPayment` bunun istisnası: gerçek ödeme sonuçlandırma mantığı olduğu için
  `orders.db.test.ts`'e özel olarak test eklendi.
