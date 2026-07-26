import { execSync } from "node:child_process";
import type { NextConfig } from "next";

/**
 * Her dağıtımda değişen bir kimlik: istemcide önceki dağıtımdan kalan bir sayfa,
 * yeni sunucuyla client-side navigasyon (ör. <Link>) denediğinde Next.js bu kimlik
 * uyuşmazlığını fark edip düz istemci içi geçiş yerine tam sayfa yenilemesi yapar.
 * Aksi halde eski istemci yeni sunucunun RSC akış verisini çözemez ve bunu ham
 * metin olarak ekrana basar (bkz. Next.js "Version Skew" dokümantasyonu).
 */
function resolveDeploymentId(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return String(Date.now());
  }
}

// iyzico'nun barındırdığı Checkout Form widget'ı, ödeme sayfamıza gömülen inline bir
// <script> ile çalışır ve kendi alan adlarından kaynak yükler (bkz.
// components/IyzicoCheckoutForm.tsx). CSP bu yüzden script-src'de 'unsafe-inline'
// içerir ve iyzico'nun tüm alt alan adlarına izin verir — daha sıkı bir nonce tabanlı
// politika, iyzico'nun canlı ortamda döndürdüğü gerçek script içeriğine karşı
// doğrulanmadan devreye alınırsa ödeme akışını sessizce kırma riski taşır.
const IYZICO_ORIGINS = "https://*.iyzipay.com https://*.iyzico.com";

// React'in geliştirme modu (Fast Refresh, hata ayıklama call stack'leri) eval()
// kullanır ve "React will never use eval() in production mode" der — yani bu yalnızca
// `next dev` için gerekli, üretim derlemesini gevşetmez.
const scriptSrc = ["'self'", "'unsafe-inline'", IYZICO_ORIGINS];
if (process.env.NODE_ENV !== "production") {
  scriptSrc.push("'unsafe-eval'");
}

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${IYZICO_ORIGINS}`,
  "font-src 'self' data:",
  `connect-src 'self' ${IYZICO_ORIGINS}`,
  `frame-src ${IYZICO_ORIGINS}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // iyzipay, kaynaklarını fs.readdirSync + dinamik require ile çalışma anında yükler;
  // bu Next.js'in sunucu bundle'ına dahil edilemez, native Node.js require'a bırakılmalı.
  serverExternalPackages: ["iyzipay"],

  deploymentId: resolveDeploymentId(),

  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        source: "/(.*).csv",
        headers: [
          { key: "Content-Type", value: "text/csv; charset=utf-8" },
          { key: "Content-Disposition", value: "attachment" },
        ],
      },
    ];
  },
};

export default nextConfig;
