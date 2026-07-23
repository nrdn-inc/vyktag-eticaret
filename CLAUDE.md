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

## Konvansiyonlar
- Kullanıcıyla iletişim Türkçe.
- Yol haritası fazları README.md'de.
