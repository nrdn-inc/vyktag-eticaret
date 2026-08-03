import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugify("VYKTag Kart")).toBe("vyktag-kart");
  });

  it("transliterates Turkish characters", () => {
    expect(slugify("Özel Tasarım Ürünü")).toBe("ozel-tasarim-urunu");
  });

  it("collapses non-alphanumeric runs into a single hyphen and trims edges", () => {
    expect(slugify("  Çok   Özel! Ürün?? ")).toBe("cok-ozel-urun");
  });
});
