import { describe, expect, it } from "vitest";
import {
  isValidProductImageDataUrl,
  sanitizeProductImages,
  MAX_PRODUCT_IMAGE_DATA_URL_LENGTH,
  MAX_IMAGES_PER_VARIANT,
} from "@/lib/product-image-upload";

describe("isValidProductImageDataUrl", () => {
  it("accepts a well-formed png/jpeg/webp data URL within the size limit", () => {
    expect(isValidProductImageDataUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE=")).toBe(true);
    expect(isValidProductImageDataUrl("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).toBe(true);
    expect(isValidProductImageDataUrl("data:image/webp;base64,UklGRg==")).toBe(true);
  });

  it("rejects non-string values", () => {
    expect(isValidProductImageDataUrl(undefined)).toBe(false);
    expect(isValidProductImageDataUrl(null)).toBe(false);
    expect(isValidProductImageDataUrl(123)).toBe(false);
  });

  it("rejects unsupported mime types (e.g. svg, html) so raw markup can never be stored", () => {
    expect(isValidProductImageDataUrl("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=")).toBe(false);
    expect(isValidProductImageDataUrl("data:text/html;base64,PHNjcmlwdD48L3NjcmlwdD4=")).toBe(false);
  });

  it("rejects a value that isn't a data URL at all", () => {
    expect(isValidProductImageDataUrl("javascript:alert(1)")).toBe(false);
    expect(isValidProductImageDataUrl("https://example.com/logo.png")).toBe(false);
    expect(isValidProductImageDataUrl("")).toBe(false);
  });

  it("rejects a data URL longer than the configured size cap", () => {
    const oversized = "data:image/png;base64," + "A".repeat(MAX_PRODUCT_IMAGE_DATA_URL_LENGTH);
    expect(isValidProductImageDataUrl(oversized)).toBe(false);
  });
});

describe("sanitizeProductImages", () => {
  const valid = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE=";

  it("returns an empty array for non-array input", () => {
    expect(sanitizeProductImages(undefined)).toEqual([]);
    expect(sanitizeProductImages(null)).toEqual([]);
    expect(sanitizeProductImages("not-an-array")).toEqual([]);
  });

  it("filters out invalid entries and keeps valid ones", () => {
    expect(sanitizeProductImages([valid, "javascript:alert(1)", 42, valid])).toEqual([valid, valid]);
  });

  it("caps the result at MAX_IMAGES_PER_VARIANT", () => {
    const many = Array(MAX_IMAGES_PER_VARIANT + 5).fill(valid);
    expect(sanitizeProductImages(many)).toHaveLength(MAX_IMAGES_PER_VARIANT);
  });
});
