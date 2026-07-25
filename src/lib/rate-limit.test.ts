import { describe, expect, it } from "vitest";
import { clientIpFromHeaders, consumeRateLimit } from "@/lib/rate-limit";

describe("consumeRateLimit", () => {
  it("allows requests up to the configured maximum", () => {
    const key = `test:${crypto.randomUUID()}`;
    for (let i = 0; i < 5; i++) {
      expect(consumeRateLimit(key, { max: 5, windowMs: 60_000 })).toBe(true);
    }
  });

  it("rejects the request once the maximum is exceeded within the window", () => {
    const key = `test:${crypto.randomUUID()}`;
    for (let i = 0; i < 3; i++) {
      consumeRateLimit(key, { max: 3, windowMs: 60_000 });
    }
    expect(consumeRateLimit(key, { max: 3, windowMs: 60_000 })).toBe(false);
  });

  it("keeps rejecting further requests once the limit is hit (does not reset early)", () => {
    const key = `test:${crypto.randomUUID()}`;
    for (let i = 0; i < 2; i++) {
      consumeRateLimit(key, { max: 2, windowMs: 60_000 });
    }
    expect(consumeRateLimit(key, { max: 2, windowMs: 60_000 })).toBe(false);
    expect(consumeRateLimit(key, { max: 2, windowMs: 60_000 })).toBe(false);
  });

  it("tracks independent keys separately", () => {
    const keyA = `test:${crypto.randomUUID()}`;
    const keyB = `test:${crypto.randomUUID()}`;
    for (let i = 0; i < 3; i++) consumeRateLimit(keyA, { max: 3, windowMs: 60_000 });

    expect(consumeRateLimit(keyA, { max: 3, windowMs: 60_000 })).toBe(false);
    // Farklı anahtar (ör. farklı IP/e-posta) kendi penceresine sahip, etkilenmemeli.
    expect(consumeRateLimit(keyB, { max: 3, windowMs: 60_000 })).toBe(true);
  });

  it("resets the count after the window expires", async () => {
    const key = `test:${crypto.randomUUID()}`;
    expect(consumeRateLimit(key, { max: 1, windowMs: 30 })).toBe(true);
    expect(consumeRateLimit(key, { max: 1, windowMs: 30 })).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(consumeRateLimit(key, { max: 1, windowMs: 30 })).toBe(true);
  });
});

describe("clientIpFromHeaders", () => {
  it("takes the first address from a comma-separated x-forwarded-for chain", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5, 70.41.3.18, 150.172.238.178" });
    expect(clientIpFromHeaders(headers)).toBe("203.0.113.5");
  });

  it("trims surrounding whitespace", () => {
    const headers = new Headers({ "x-forwarded-for": "  203.0.113.5  ,70.41.3.18" });
    expect(clientIpFromHeaders(headers)).toBe("203.0.113.5");
  });

  it("falls back to a local address when the header is missing", () => {
    expect(clientIpFromHeaders(new Headers())).toBe("127.0.0.1");
  });
});
