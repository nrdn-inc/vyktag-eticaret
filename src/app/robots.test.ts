import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  it("disallows admin, api and account-specific paths", () => {
    const { rules, sitemap } = robots();
    const rule = Array.isArray(rules) ? rules[0] : rules;

    expect(rule.allow).toBe("/");
    expect(rule.disallow).toEqual(
      expect.arrayContaining(["/admin", "/api", "/hesap", "/sepet", "/odeme", "/siparis"]),
    );
    expect(sitemap).toBe("https://vyktag.com.tr/sitemap.xml");
  });
});
