import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("includes static marketing pages and active product slugs", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://vyktag.com.tr");
    expect(urls).toContain("https://vyktag.com.tr/urunler");
    expect(urls).toContain("https://vyktag.com.tr/urunler/vyktag-kart");
  });
});
