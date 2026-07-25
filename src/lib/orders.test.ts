import { describe, expect, it } from "vitest";
import { generateOrderNumber } from "@/lib/orders";

// Veritabanına bağlanan sipariş/stok testleri için bkz. orders.db.test.ts
// (npm run test:db). Bu dosya yalnızca saf mantığı test eder.
describe("generateOrderNumber", () => {
  it("uses the VYK-YYYYMMDD-XXXXXX format", () => {
    const orderNumber = generateOrderNumber(new Date("2026-07-23T12:00:00Z"));
    expect(orderNumber).toMatch(/^VYK-20260723-[A-Z2-9]{6}$/);
  });

  it("produces different suffixes across calls", () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    expect(a).not.toBe(b);
  });
});
