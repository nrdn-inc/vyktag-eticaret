import { afterEach, describe, expect, it, vi } from "vitest";
import { hashPassword, verifyPassword, createAdminSessionToken, verifyAdminSessionToken } from "@/lib/auth";

describe("hashPassword / verifyPassword", () => {
  it("verifies the correct password against its hash", async () => {
    const hash = await hashPassword("cok-guclu-sifre-123");
    await expect(verifyPassword("cok-guclu-sifre-123", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("cok-guclu-sifre-123");
    await expect(verifyPassword("yanlis-sifre", hash)).resolves.toBe(false);
  });

  it("produces a different hash (different salt) for the same password each time", async () => {
    const hashA = await hashPassword("ayni-sifre");
    const hashB = await hashPassword("ayni-sifre");
    expect(hashA).not.toBe(hashB);
  });

  it("rejects malformed stored values", async () => {
    await expect(verifyPassword("sifre", "gecersiz-format")).resolves.toBe(false);
  });
});

describe("createAdminSessionToken / verifyAdminSessionToken", () => {
  const ORIGINAL_SECRET = "test-secret-anahtar";

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips a valid token back to the same userId", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const token = createAdminSessionToken("user_123");
    const payload = verifyAdminSessionToken(token);
    expect(payload?.userId).toBe("user_123");
  });

  it("rejects a token signed with a different secret", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const token = createAdminSessionToken("user_123");

    vi.stubEnv("ADMIN_SESSION_SECRET", "farkli-anahtar");
    expect(verifyAdminSessionToken(token)).toBeNull();
  });

  it("rejects a tampered payload", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const token = createAdminSessionToken("user_123");
    const [, signature] = token.split(".");
    const tamperedPayload = Buffer.from(JSON.stringify({ userId: "user_456", exp: Date.now() + 1000 })).toString(
      "base64url",
    );
    expect(verifyAdminSessionToken(`${tamperedPayload}.${signature}`)).toBeNull();
  });

  it("rejects an expired token", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const expiredPayload = Buffer.from(JSON.stringify({ userId: "user_123", exp: Date.now() - 1000 })).toString(
      "base64url",
    );
    const badToken = `${expiredPayload}.deadbeef`;
    expect(verifyAdminSessionToken(badToken)).toBeNull();
  });

  it("rejects null/empty tokens", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    expect(verifyAdminSessionToken(null)).toBeNull();
    expect(verifyAdminSessionToken(undefined)).toBeNull();
    expect(verifyAdminSessionToken("")).toBeNull();
  });
});
