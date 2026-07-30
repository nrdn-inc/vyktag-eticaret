/**
 * Hafif, bellek içi sabit pencereli (fixed-window) hız sınırlayıcı. Giriş/kayıt gibi
 * herkese açık uçları kaba kuvvet (brute-force) ve e-posta bombalama denemelerine karşı
 * korur.
 *
 * SINIR: Durum yalnızca bu Node.js sürecinin belleğinde tutulur — süreç yeniden
 * başladığında sıfırlanır ve birden fazla süreç/instance arasında paylaşılmaz. Hostinger
 * Kurumsal Web Hosting bu uygulamayı tek bir yönetilen Node.js süreciyle çalıştırdığından
 * (bkz. CLAUDE.md) bu, kimlik doğrulama uçları için anlamlı bir koruma sağlar; ölçek
 * yatay olarak birden fazla sürece çıkarsa merkezi bir depoya (ör. veritabanı/Redis)
 * taşınması gerekir.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, WindowEntry>();

// Bellek sızıntısını önlemek için süresi dolmuş kayıtları periyodik temizle.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupScheduled(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  cleanupTimer.unref?.();
}

export interface RateLimitOptions {
  /** Pencere içinde izin verilen azami istek sayısı. */
  max: number;
  /** Pencere uzunluğu (ms). */
  windowMs: number;
}

/**
 * `key` için bir istek dener; limit aşılmadıysa true, aşıldıysa false döner.
 * Her çağrı sayaç artırır — yalnızca izin kontrolü değil, tüketim de yapar.
 */
export function consumeRateLimit(key: string, options: RateLimitOptions): boolean {
  ensureCleanupScheduled();
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return true;
  }

  if (entry.count >= options.max) {
    return false;
  }

  entry.count += 1;
  return true;
}

/** Sunucu action'larında istemci IP'sini elde eder (bkz. odeme/actions.ts'teki eşdeğer). */
export function clientIpFromHeaders(headerList: Headers): string {
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
}
