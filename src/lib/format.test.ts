import { describe, expect, it } from "vitest";
import { formatPriceTRY } from "@/lib/format";

describe("formatPriceTRY", () => {
  it("formats kurus as Turkish Lira currency text", () => {
    expect(formatPriceTRY(59990)).toBe("₺599,90");
  });

  it("formats whole-lira amounts without dangling cents", () => {
    expect(formatPriceTRY(49900)).toBe("₺499,00");
  });

  it("formats zero", () => {
    expect(formatPriceTRY(0)).toBe("₺0,00");
  });
});
