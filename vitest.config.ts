import { configDefaults, defineConfig } from "vitest/config";
import { DB_TEST_PATTERN, sharedConfig } from "./vitest.shared";

// Varsayılan `npm test`: yalnızca veritabanına DOKUNMAYAN testler. Böylece geliştirme
// sırasında sık sık test çalıştırmak canlı Hostinger veritabanına bağlantı açmaz ve
// hesabın saatlik bağlantı kotasını (MAX_CONNECTIONS_PER_HOUR=500) tüketmez.
// Veritabanı testleri için: npm run test:db (bkz. vitest.db.config.ts)
export default defineConfig({
  ...sharedConfig,
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: [...configDefaults.exclude, DB_TEST_PATTERN],
  },
});
