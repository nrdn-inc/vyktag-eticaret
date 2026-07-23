import { describe, expect, it } from "vitest";
import {
  type CartItem,
  addItem,
  cartItemCount,
  cartTotalKurus,
  lineKey,
  removeItem,
  updateQuantity,
} from "@/lib/cart";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId: "v1",
    productSlug: "vyktag-kart",
    productName: "Vyktag Kart",
    variantName: "Siyah",
    unitPriceKurus: 59990,
    quantity: 1,
    ...overrides,
  };
}

describe("addItem", () => {
  it("adds a new line", () => {
    const items = addItem([], makeItem());
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });

  it("merges quantity for the same variant + personalization", () => {
    const items = addItem([makeItem()], makeItem({ quantity: 2 }));
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it("keeps different personalizations as separate lines", () => {
    const a = makeItem({ personalization: { fullName: "Ali" } });
    const b = makeItem({ personalization: { fullName: "Veli" } });
    const items = addItem(addItem([], a), b);
    expect(items).toHaveLength(2);
  });

  it("keeps different variants as separate lines", () => {
    const items = addItem(addItem([], makeItem()), makeItem({ variantId: "v2" }));
    expect(items).toHaveLength(2);
  });
});

describe("updateQuantity", () => {
  it("sets a new quantity", () => {
    const base = [makeItem()];
    const items = updateQuantity(base, lineKey(base[0]), 5);
    expect(items[0].quantity).toBe(5);
  });

  it("removes the line when quantity drops to zero or below", () => {
    const base = [makeItem()];
    expect(updateQuantity(base, lineKey(base[0]), 0)).toHaveLength(0);
    expect(updateQuantity(base, lineKey(base[0]), -3)).toHaveLength(0);
  });
});

describe("removeItem", () => {
  it("removes the matching line", () => {
    const base = [makeItem(), makeItem({ variantId: "v2" })];
    const items = removeItem(base, lineKey(base[0]));
    expect(items).toHaveLength(1);
    expect(items[0].variantId).toBe("v2");
  });
});

describe("cartTotalKurus", () => {
  it("sums unit price times quantity across lines", () => {
    const items = [makeItem({ quantity: 2 }), makeItem({ variantId: "v2", unitPriceKurus: 39990 })];
    expect(cartTotalKurus(items)).toBe(59990 * 2 + 39990);
  });

  it("is zero for an empty cart", () => {
    expect(cartTotalKurus([])).toBe(0);
  });
});

describe("cartItemCount", () => {
  it("sums quantities", () => {
    const items = [makeItem({ quantity: 2 }), makeItem({ variantId: "v2", quantity: 3 })];
    expect(cartItemCount(items)).toBe(5);
  });
});
