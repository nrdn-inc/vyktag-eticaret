import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import "dotenv/config";

/** Birim ve veritabanı test yapılandırmalarının ortak kısmı. */
export const sharedConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
};

/** Canlı veritabanına bağlanan testlerin dosya adı kalıbı. */
export const DB_TEST_PATTERN = "**/*.db.test.ts";
