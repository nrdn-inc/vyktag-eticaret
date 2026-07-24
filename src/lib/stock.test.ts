import { describe, expect, it } from "vitest";
import { OrderStatus } from "@/generated/prisma/client";
import {
  aggregateQuantitiesByVariant,
  clampQuantityToStock,
  isStockReleasedStatus,
  isVariantPurchasable,
} from "@/lib/stock";

describe("isStockReleasedStatus", () => {
  it("is true for the stock-releasing statuses", () => {
    expect(isStockReleasedStatus(OrderStatus.CANCELLED)).toBe(true);
    expect(isStockReleasedStatus(OrderStatus.REFUNDED)).toBe(true);
    expect(isStockReleasedStatus(OrderStatus.FAILED)).toBe(true);
  });

  it("is false for the stock-holding statuses", () => {
    expect(isStockReleasedStatus(OrderStatus.PENDING)).toBe(false);
    expect(isStockReleasedStatus(OrderStatus.PAID)).toBe(false);
    expect(isStockReleasedStatus(OrderStatus.PROCESSING)).toBe(false);
    expect(isStockReleasedStatus(OrderStatus.SHIPPED)).toBe(false);
    expect(isStockReleasedStatus(OrderStatus.DELIVERED)).toBe(false);
  });
});

describe("aggregateQuantitiesByVariant", () => {
  it("sums quantities of the same variant across lines", () => {
    const result = aggregateQuantitiesByVariant([
      { variantId: "a", quantity: 2 },
      { variantId: "b", quantity: 1 },
      { variantId: "a", quantity: 3 },
    ]);
    expect(result.get("a")).toBe(5);
    expect(result.get("b")).toBe(1);
  });

  it("rounds each quantity up to at least 1", () => {
    const result = aggregateQuantitiesByVariant([
      { variantId: "a", quantity: 0 },
      { variantId: "a", quantity: -3 },
    ]);
    expect(result.get("a")).toBe(2);
  });
});

describe("isVariantPurchasable", () => {
  it("is true only when stock is positive", () => {
    expect(isVariantPurchasable(1)).toBe(true);
    expect(isVariantPurchasable(0)).toBe(false);
    expect(isVariantPurchasable(-1)).toBe(false);
  });
});

describe("clampQuantityToStock", () => {
  it("returns 0 when out of stock", () => {
    expect(clampQuantityToStock(3, 0)).toBe(0);
  });

  it("caps the quantity at the available stock", () => {
    expect(clampQuantityToStock(5, 3)).toBe(3);
  });

  it("keeps a valid quantity within range", () => {
    expect(clampQuantityToStock(2, 10)).toBe(2);
    expect(clampQuantityToStock(0, 10)).toBe(1);
  });
});
