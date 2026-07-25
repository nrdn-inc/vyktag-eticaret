import { describe, expect, it } from "vitest";
import {
  base32Decode,
  base32Encode,
  buildOtpAuthUrl,
  generateTotpSecret,
  hotp,
  verifyTotpCode,
} from "@/lib/totp";

describe("base32Encode / base32Decode", () => {
  it("round-trips arbitrary bytes", () => {
    const original = Buffer.from([0, 1, 2, 3, 4, 5, 250, 251, 252, 253, 254, 255]);
    expect(base32Decode(base32Encode(original))).toEqual(original);
  });

  it("encodes without padding characters", () => {
    expect(base32Encode(Buffer.from("hello"))).not.toContain("=");
  });

  it("ignores non-alphabet characters and padding when decoding", () => {
    const encoded = base32Encode(Buffer.from("test-value"));
    expect(base32Decode(`${encoded}===`)).toEqual(base32Decode(encoded));
  });
});

describe("generateTotpSecret", () => {
  it("produces a base32 string decodable back to 20 bytes (160-bit shared secret)", () => {
    const secret = generateTotpSecret();
    expect(base32Decode(secret)).toHaveLength(20);
  });

  it("produces different secrets on each call", () => {
    expect(generateTotpSecret()).not.toBe(generateTotpSecret());
  });
});

// RFC 4226 Appendix D test vectors: ASCII secret "12345678901234567890", counters 0-9.
// https://www.rfc-editor.org/rfc/rfc4226#appendix-D
describe("hotp (RFC 4226 test vectors)", () => {
  const secret = Buffer.from("12345678901234567890", "ascii");
  const expectedCodes = [
    "755224",
    "287082",
    "359152",
    "969429",
    "338314",
    "254676",
    "287922",
    "162583",
    "399871",
    "520489",
  ];

  it.each(expectedCodes.map((code, counter) => [counter, code] as const))(
    "counter %i produces %s",
    (counter, expected) => {
      expect(hotp(secret, counter)).toBe(expected);
    },
  );
});

describe("buildOtpAuthUrl", () => {
  it("embeds the secret, issuer and account email into an otpauth:// URI", () => {
    const url = buildOtpAuthUrl("JBSWY3DPEHPK3PXP", "musteri@example.com");
    expect(url).toBe(
      "otpauth://totp/VYKTag%3Amusteri%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=VYKTag&algorithm=SHA1&digits=6&period=30",
    );
  });
});

describe("verifyTotpCode", () => {
  // RFC 4226 secret'ı base32'ye çevirip TOTP olarak (sayaç yerine sabit bir "now" ile) doğruluyoruz.
  const secretBase32 = base32Encode(Buffer.from("12345678901234567890", "ascii"));
  const PERIOD_MS = 30_000;

  it("accepts the code for the current time step", () => {
    const now = 5 * PERIOD_MS; // step 5 -> beklenen kod "254676"
    expect(verifyTotpCode(secretBase32, "254676", { now, windowSteps: 0 })).toBe(true);
  });

  it("rejects an incorrect code", () => {
    const now = 5 * PERIOD_MS;
    expect(verifyTotpCode(secretBase32, "000000", { now, windowSteps: 0 })).toBe(false);
  });

  it("accepts the previous time step's code within the clock-drift window", () => {
    const now = 6 * PERIOD_MS; // step 6, ama step 5'in kodu ("254676") pencere içinde kabul edilmeli
    expect(verifyTotpCode(secretBase32, "254676", { now, windowSteps: 1 })).toBe(true);
  });

  it("rejects a code two steps away when windowSteps is 1", () => {
    const now = 7 * PERIOD_MS; // step 7, step 5'in kodu artık pencere dışında
    expect(verifyTotpCode(secretBase32, "254676", { now, windowSteps: 1 })).toBe(false);
  });

  it("rejects malformed input (non-6-digit)", () => {
    const now = 5 * PERIOD_MS;
    expect(verifyTotpCode(secretBase32, "12345", { now })).toBe(false);
    expect(verifyTotpCode(secretBase32, "abcdef", { now })).toBe(false);
  });
});
