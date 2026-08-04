import { describe, expect, it } from "vitest";
import {
  isValidBlogCoverDataUrl,
  sanitizeBlogCoverImage,
  MAX_BLOG_COVER_DATA_URL_LENGTH,
} from "@/lib/blog-image-upload";

describe("isValidBlogCoverDataUrl", () => {
  it("accepts a well-formed png/jpeg/webp data URL within the size limit", () => {
    expect(isValidBlogCoverDataUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE=")).toBe(true);
    expect(isValidBlogCoverDataUrl("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).toBe(true);
    expect(isValidBlogCoverDataUrl("data:image/webp;base64,UklGRg==")).toBe(true);
  });

  it("rejects non-string values", () => {
    expect(isValidBlogCoverDataUrl(undefined)).toBe(false);
    expect(isValidBlogCoverDataUrl(null)).toBe(false);
    expect(isValidBlogCoverDataUrl(123)).toBe(false);
  });

  it("rejects unsupported mime types (e.g. svg, html) so raw markup can never be stored", () => {
    expect(isValidBlogCoverDataUrl("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=")).toBe(false);
    expect(isValidBlogCoverDataUrl("data:text/html;base64,PHNjcmlwdD48L3NjcmlwdD4=")).toBe(false);
  });

  it("rejects a value that isn't a data URL at all", () => {
    expect(isValidBlogCoverDataUrl("javascript:alert(1)")).toBe(false);
    expect(isValidBlogCoverDataUrl("https://example.com/kapak.png")).toBe(false);
    expect(isValidBlogCoverDataUrl("")).toBe(false);
  });

  it("rejects a data URL longer than the configured size cap", () => {
    const oversized = "data:image/png;base64," + "A".repeat(MAX_BLOG_COVER_DATA_URL_LENGTH);
    expect(isValidBlogCoverDataUrl(oversized)).toBe(false);
  });
});

describe("sanitizeBlogCoverImage", () => {
  const valid = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE=";

  it("returns the value when valid", () => {
    expect(sanitizeBlogCoverImage(valid)).toBe(valid);
  });

  it("returns null for invalid or missing values", () => {
    expect(sanitizeBlogCoverImage(undefined)).toBeNull();
    expect(sanitizeBlogCoverImage(null)).toBeNull();
    expect(sanitizeBlogCoverImage("javascript:alert(1)")).toBeNull();
  });
});
