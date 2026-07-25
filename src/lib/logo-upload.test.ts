import { describe, expect, it } from "vitest";
import { isValidLogoDataUrl, MAX_LOGO_DATA_URL_LENGTH } from "@/lib/logo-upload";

describe("isValidLogoDataUrl", () => {
  it("accepts a well-formed png/jpeg/webp data URL within the size limit", () => {
    expect(isValidLogoDataUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE=")).toBe(true);
    expect(isValidLogoDataUrl("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).toBe(true);
    expect(isValidLogoDataUrl("data:image/webp;base64,UklGRg==")).toBe(true);
  });

  it("rejects non-string values", () => {
    expect(isValidLogoDataUrl(undefined)).toBe(false);
    expect(isValidLogoDataUrl(null)).toBe(false);
    expect(isValidLogoDataUrl(123)).toBe(false);
  });

  it("rejects unsupported mime types (e.g. svg, html) so raw markup can never be stored", () => {
    expect(isValidLogoDataUrl("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=")).toBe(false);
    expect(isValidLogoDataUrl("data:text/html;base64,PHNjcmlwdD48L3NjcmlwdD4=")).toBe(false);
  });

  it("rejects a value that isn't a data URL at all", () => {
    expect(isValidLogoDataUrl("javascript:alert(1)")).toBe(false);
    expect(isValidLogoDataUrl("https://example.com/logo.png")).toBe(false);
    expect(isValidLogoDataUrl("")).toBe(false);
  });

  it("rejects a data URL longer than the configured size cap", () => {
    const oversized = "data:image/png;base64," + "A".repeat(MAX_LOGO_DATA_URL_LENGTH);
    expect(isValidLogoDataUrl(oversized)).toBe(false);
  });
});
