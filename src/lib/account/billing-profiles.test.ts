import { describe, expect, it } from "vitest";
import { isValidNationalId, isValidTaxNumber } from "@/lib/account/billing-profiles";

describe("isValidNationalId", () => {
  it("accepts a real, checksum-valid TC Kimlik No", () => {
    // Bilinen, kamuya açık örnek geçerli TC Kimlik No (test amaçlı).
    expect(isValidNationalId("10000000146")).toBe(true);
  });

  it("rejects a number with an invalid checksum", () => {
    expect(isValidNationalId("10000000147")).toBe(false);
  });

  it("rejects numbers that are not exactly 11 digits", () => {
    expect(isValidNationalId("123456789")).toBe(false);
    expect(isValidNationalId("123456789012")).toBe(false);
  });

  it("rejects a leading zero", () => {
    expect(isValidNationalId("01234567890")).toBe(false);
  });

  it("rejects non-numeric input", () => {
    expect(isValidNationalId("1234567890a")).toBe(false);
  });

  it("rejects all-zero digits", () => {
    expect(isValidNationalId("00000000000")).toBe(false);
  });
});

describe("isValidTaxNumber", () => {
  it("accepts a 10-digit numeric string", () => {
    expect(isValidTaxNumber("1234567890")).toBe(true);
  });

  it("rejects a string that is not exactly 10 digits", () => {
    expect(isValidTaxNumber("123456789")).toBe(false);
    expect(isValidTaxNumber("12345678901")).toBe(false);
  });

  it("rejects non-numeric input", () => {
    expect(isValidTaxNumber("123456789a")).toBe(false);
  });
});
