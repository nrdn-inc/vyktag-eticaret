@AGENTS.md

# CLAUDE.md — Vyktag E-Ticaret

## Proje
NFC dijital kartvizit **satış & pazarlama mağazası** (marka: Vyktag, firma: VYK Teknoloji).
Yalnızca mağaza + pazarlama. Profil/SaaS platformu ayrı ve hazır: **dkartvizit.com** — burada yeniden yazma.
Referans rakip: idycard.com.

## Kapsam
- Satılan: tek seferlik fiziksel NFC kartlar (logo/kişiselleştirme) + tekrarlayan premium/abonelik planları.
- dkartvizit entegrasyonu MVP'de **manuel** (admin sipariş sonrası hesabı açar).

## Stack
- Next.js (App Router, TypeScript, `src/`), Tailwind CSS
- MySQL (Hostinger) + Prisma ORM
- Ödeme: iyzico (tek çekim) + iyzico Abonelik (recurring)
- Hosting: Hostinger **Kurumsal Web Hosting** — managed Node.js, GitHub deploy. VPS DEĞİL; kalıcı process/WebSocket sınırlarına dikkat.

## Komutlar
- `npm run dev` — geliştirme
- `npm run build` / `npm start` — prod build
- `npm run lint` — ESLint
- `npm test` — Vitest test bench

## Test Bench
Her yeni özellik için test yazılır (Vitest). Bir özellik eklendiğinde/değiştirildiğinde
`npm test` çalıştırılır ve geçmeden iş tamamlanmış sayılmaz — `tsc --noEmit` ve lint ile birlikte.

## Konvansiyonlar
- Kullanıcıyla iletişim Türkçe.
- Yol haritası fazları README.md'de.
- Kod (değişken/fonksiyon adları, iç mantık yorumları): **İngilizce**.
- Müşteriye görünen tüm metinler (UI, hata mesajları, e-postalar): **Türkçe**, Türkçe karakterler (ı, ş, ğ, ü, ö, ç, İ) doğru render edilmeli (UTF-8).
- Doc-comment gerekiyorsa JSDoc/TSDoc formatı kullanılır, içeriği **Türkçe** yazılır.

## Git / Versiyonlama
- Push işlemlerini **her zaman Claude yapar**, kullanıcı manuel push yapmaz.
- Semantic versioning `package.json` `"version"` alanında tutulur: `x.y.z`
  - `x`: geriye uyumluluğu bozan değişiklik
  - `y`: yeni özellik
  - `z`: bug fix
- Her commit mesajı `[x.y.z]` ile başlar, ardından yapılanlar **Türkçe** anlatılır.
  Örnek: `[0.2.0] Ürün kataloğu ve sepet sayfası eklendi`
