import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decryptTotpSecret, encryptTotpSecret, resetTotpSecretKeyCache } from "@/lib/totp-secret-crypto";

describe("encryptTotpSecret / decryptTotpSecret", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-secret-anahtar");
    resetTotpSecretKeyCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetTotpSecretKeyCache();
  });

  it("round-trips a base32 secret", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    expect(decryptTotpSecret(encryptTotpSecret(secret))).toBe(secret);
  });

  it("produces a different ciphertext each time (random IV) that still decrypts correctly", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const a = encryptTotpSecret(secret);
    const b = encryptTotpSecret(secret);
    expect(a).not.toBe(b);
    expect(decryptTotpSecret(a)).toBe(secret);
    expect(decryptTotpSecret(b)).toBe(secret);
  });

  it("returns null for null/undefined/empty stored values", () => {
    expect(decryptTotpSecret(null)).toBeNull();
    expect(decryptTotpSecret(undefined)).toBeNull();
    expect(decryptTotpSecret("")).toBeNull();
  });

  it("returns null for malformed or tampered ciphertext (GCM auth tag mismatch)", () => {
    const stored = encryptTotpSecret("JBSWY3DPEHPK3PXP");
    const [iv, tag, enc] = stored.split(":");
    const flipped = enc.slice(0, -1) + (enc.endsWith("0") ? "1" : "0");
    expect(decryptTotpSecret(`${iv}:${tag}:${flipped}`)).toBeNull();
    expect(decryptTotpSecret("duz-metin-eski-kayit")).toBeNull();
  });

  it("returns null when decrypting under a different key (secret rotated)", () => {
    const stored = encryptTotpSecret("JBSWY3DPEHPK3PXP");
    vi.stubEnv("ADMIN_SESSION_SECRET", "farkli-anahtar");
    resetTotpSecretKeyCache();
    expect(decryptTotpSecret(stored)).toBeNull();
  });
});
