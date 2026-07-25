import { describe, expect, it } from "vitest";
import { REVALIDATE_PATHS, isRevalidateAuthorized } from "@/lib/revalidate";

describe("isRevalidateAuthorized", () => {
  it("accepts a matching secret", () => {
    expect(isRevalidateAuthorized("gizli", "gizli")).toBe(true);
  });

  it("rejects a mismatching secret", () => {
    expect(isRevalidateAuthorized("yanlis", "gizli")).toBe(false);
  });

  it("rejects when no secret is provided", () => {
    expect(isRevalidateAuthorized(null, "gizli")).toBe(false);
  });

  it("rejects when the server has no secret configured", () => {
    expect(isRevalidateAuthorized("gizli", undefined)).toBe(false);
    expect(isRevalidateAuthorized("gizli", "")).toBe(false);
  });

  it("rejects a secret of different length without throwing", () => {
    // timingSafeEqual eşit uzunlukta buffer bekler; kısa devre kontrolü olmadan atardı.
    expect(isRevalidateAuthorized("kisa", "cok-daha-uzun-bir-gizli-anahtar")).toBe(false);
    expect(isRevalidateAuthorized("cok-daha-uzun-bir-gizli-anahtar", "kisa")).toBe(false);
  });

  it("accepts a long, realistic secret", () => {
    const secret = "a".repeat(64);
    expect(isRevalidateAuthorized(secret, secret)).toBe(true);
  });
});

describe("REVALIDATE_PATHS", () => {
  it("covers the catalog-driven pages", () => {
    expect(REVALIDATE_PATHS).toContain("/");
    expect(REVALIDATE_PATHS).toContain("/urunler");
    expect(REVALIDATE_PATHS).toContain("/fiyatlandirma");
  });
});
