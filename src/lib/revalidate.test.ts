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
});

describe("REVALIDATE_PATHS", () => {
  it("covers the catalog-driven pages", () => {
    expect(REVALIDATE_PATHS).toContain("/");
    expect(REVALIDATE_PATHS).toContain("/urunler");
    expect(REVALIDATE_PATHS).toContain("/fiyatlandirma");
  });
});
