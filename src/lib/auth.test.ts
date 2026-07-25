import { afterEach, describe, expect, it, vi } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createAdminSessionToken,
  verifyAdminSessionToken,
  createCustomerSessionToken,
  verifyCustomerSessionToken,
  createEmailVerificationToken,
  verifyEmailVerificationToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
  createTwoFactorChallengeToken,
  verifyTwoFactorChallengeToken,
  createTotpChallengeToken,
  verifyTotpChallengeToken,
} from "@/lib/auth";

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

describe("müşteri oturumu ve e-posta doğrulama token'ları", () => {
  const ORIGINAL_SECRET = "test-secret-anahtar";

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips a valid customer session token", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const token = createCustomerSessionToken("musteri_1");
    expect(verifyCustomerSessionToken(token)?.userId).toBe("musteri_1");
  });

  it("round-trips a valid email verification token", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const token = createEmailVerificationToken("musteri_1");
    expect(verifyEmailVerificationToken(token)?.userId).toBe("musteri_1");
  });

  it("rejects cross-purpose use: an email verification token is not a valid admin/customer session", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const emailToken = createEmailVerificationToken("musteri_1");
    expect(verifyAdminSessionToken(emailToken)).toBeNull();
    expect(verifyCustomerSessionToken(emailToken)).toBeNull();
  });

  it("rejects cross-purpose use: a customer session token is not a valid admin session or email token", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const customerToken = createCustomerSessionToken("musteri_1");
    expect(verifyAdminSessionToken(customerToken)).toBeNull();
    expect(verifyEmailVerificationToken(customerToken)).toBeNull();
  });

  it("round-trips a valid customer session token that carries an iat", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const before = Date.now();
    const token = createCustomerSessionToken("musteri_1");
    const payload = verifyCustomerSessionToken(token);
    expect(payload?.iat).toBeGreaterThanOrEqual(before);
  });
});

describe("createPasswordResetToken / verifyPasswordResetToken", () => {
  const ORIGINAL_SECRET = "test-secret-anahtar";

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips a valid password reset token", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const token = createPasswordResetToken("musteri_1");
    expect(verifyPasswordResetToken(token)?.userId).toBe("musteri_1");
  });

  it("rejects cross-purpose use: a password reset token is not a valid session or email token", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const resetToken = createPasswordResetToken("musteri_1");
    expect(verifyCustomerSessionToken(resetToken)).toBeNull();
    expect(verifyEmailVerificationToken(resetToken)).toBeNull();
    expect(verifyAdminSessionToken(resetToken)).toBeNull();
  });

  it("rejects an email verification token used as a password reset token", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const emailToken = createEmailVerificationToken("musteri_1");
    expect(verifyPasswordResetToken(emailToken)).toBeNull();
  });
});

describe("createTwoFactorChallengeToken / verifyTwoFactorChallengeToken", () => {
  const ORIGINAL_SECRET = "test-secret-anahtar";

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts the correct code and returns the userId", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const { token, code } = createTwoFactorChallengeToken("musteri_1");
    expect(code).toMatch(/^[0-9]{6}$/);
    expect(verifyTwoFactorChallengeToken(token, code)).toBe("musteri_1");
  });

  it("rejects an incorrect code", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const { token, code } = createTwoFactorChallengeToken("musteri_1");
    const wrongCode = code === "000000" ? "111111" : "000000";
    expect(verifyTwoFactorChallengeToken(token, wrongCode)).toBeNull();
  });

  it("does not leak the code hash to other token purposes", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const { token, code } = createTwoFactorChallengeToken("musteri_1");
    expect(verifyCustomerSessionToken(token)).toBeNull();
    expect(verifyPasswordResetToken(token)).toBeNull();
    // Farklı bir secret altında aynı kod bile geçerli olmamalı.
    vi.stubEnv("ADMIN_SESSION_SECRET", "farkli-anahtar");
    expect(verifyTwoFactorChallengeToken(token, code)).toBeNull();
  });

  it("rejects null/empty tokens and codes", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    expect(verifyTwoFactorChallengeToken(null, "123456")).toBeNull();
    expect(verifyTwoFactorChallengeToken(undefined, "123456")).toBeNull();
    const { token } = createTwoFactorChallengeToken("musteri_1");
    expect(verifyTwoFactorChallengeToken(token, "")).toBeNull();
  });
});

describe("createTotpChallengeToken / verifyTotpChallengeToken", () => {
  const ORIGINAL_SECRET = "test-secret-anahtar";

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips a valid TOTP challenge token", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const token = createTotpChallengeToken("musteri_1");
    expect(verifyTotpChallengeToken(token)).toBe("musteri_1");
  });

  it("is not interchangeable with the email 2FA pending token (different purposes)", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    const totpToken = createTotpChallengeToken("musteri_1");
    expect(verifyTwoFactorChallengeToken(totpToken, "123456")).toBeNull();

    const { token: emailToken } = createTwoFactorChallengeToken("musteri_1");
    expect(verifyTotpChallengeToken(emailToken)).toBeNull();
  });

  it("rejects null/empty tokens", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", ORIGINAL_SECRET);
    expect(verifyTotpChallengeToken(null)).toBeNull();
    expect(verifyTotpChallengeToken(undefined)).toBeNull();
    expect(verifyTotpChallengeToken("")).toBeNull();
  });
});
