import { describe, expect, it } from "vitest";
import { generateOrderNumber, sanitizePersonalization } from "@/lib/orders";

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

describe("sanitizePersonalization", () => {
  it("returns undefined for undefined input", () => {
    expect(sanitizePersonalization(undefined)).toBeUndefined();
  });

  it("drops empty/whitespace-only fields", () => {
    expect(sanitizePersonalization({ fullName: "   ", title: "" })).toBeUndefined();
  });

  it("trims surrounding whitespace on kept fields", () => {
    expect(sanitizePersonalization({ fullName: "  Ayşe Demir  " })).toEqual({
      fullName: "Ayşe Demir",
    });
  });

  it("truncates each field to 200 characters, preventing unbounded JSON payloads", () => {
    const huge = "a".repeat(10_000);
    const result = sanitizePersonalization({ fullName: huge, note: huge });

    expect(result?.fullName).toHaveLength(200);
    expect(result?.note).toHaveLength(200);
  });

  it("passes through short, well-formed personalization unchanged", () => {
    const input = { fullName: "Ayşe Demir", title: "Satış Müdürü", phone: "+905551234567", note: "Logo ekleyin" };
    expect(sanitizePersonalization(input)).toEqual(input);
  });

  it("ignores unknown keys not part of the personalization shape", () => {
    const result = sanitizePersonalization({
      fullName: "Ayşe",
      // @ts-expect-error -- kasıtlı olarak beklenmeyen bir alan ekleniyor
      injected: "<script>alert(1)</script>",
    });
    expect(result).toEqual({ fullName: "Ayşe" });
  });
});
