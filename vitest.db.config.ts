import { configDefaults, defineConfig } from "vitest/config";
import { DB_TEST_PATTERN, sharedConfig } from "./vitest.shared";

/**
 * CANLI Hostinger veritabanına bağlanan (ve yazan) testler. `npm run test:db` ile
 * bilinçli olarak çalıştırılır, varsayılan `npm test` koşumuna dahil değildir.
 *
 * Hostinger hesabının ölçülen limitleri: MAX_CONNECTIONS_PER_HOUR=500,
 * MAX_USER_CONNECTIONS=75. Vitest varsayılanında her test dosyası ayrı bir fork'ta
 * çalışır ve her fork kendi Prisma bağlantı havuzunu açar; veritabanı test dosyaları
 * paralel çalıştığında bu, kotayı hızla tüketen birden çok havuz demekti. Aşağıdaki
 * ayarlar bunu tek havuza indirir.
 */
export default defineConfig({
  ...sharedConfig,
  test: {
    environment: "node",
    include: [`src/${DB_TEST_PATTERN}`],
    exclude: [...configDefaults.exclude],
    // Tüm veritabanı testleri tek işlemde -> tek Prisma bağlantı havuzu.
    fileParallelism: false,
    // Sipariş/seed testleri gerçek yazma yaptığından ağ gecikmesine yer bırakılır.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    env: {
      // Test koşumu üretim uygulamasından daha az bağlantı kullansın.
      DATABASE_CONNECTION_LIMIT: process.env.DATABASE_CONNECTION_LIMIT ?? "2",
    },
  },
});
