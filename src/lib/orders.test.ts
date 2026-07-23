import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createOrderFromCart, generateOrderNumber, type CheckoutContact } from "@/lib/orders";

describe("generateOrderNumber", () => {
  it("uses the VYK-YYYYMMDD-XXXXXX format", () => {
    const orderNumber = generateOrderNumber(new Date("2026-07-23T12:00:00Z"));
    expect(orderNumber).toMatch(/^VYK-20260723-[A-Z2-9]{6}$/);
  });

  it("produces different suffixes across calls", () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    expect(a).not.toBe(b);
  });
});

// Bu proje ayrı bir test veritabanı kullanmıyor (bkz. catalog-seed.test.ts); testler gerçek
// Hostinger veritabanına karşı, açıkça test amaçlı bir e-posta ile çalışır.
describe("createOrderFromCart", () => {
  const contact: CheckoutContact = {
    email: "test-siparis@vyktag-test.local",
    firstName: "Test",
    lastName: "Müşteri",
    phone: "+905551234567",
  };
  const shipping = {
    addressLine1: "Test Mahallesi Test Sokak No:1",
    city: "İstanbul",
    district: "Kadıköy",
    postalCode: "34000",
  };

  let variantId: string;
  let variantPriceKurus: number;

  beforeAll(async () => {
    const variant = await prisma.productVariant.findUniqueOrThrow({
      where: { sku: "VYK-TAG-STD" },
    });
    variantId = variant.id;
    variantPriceKurus = variant.priceKurus;
  });

  it("computes totals from the authoritative DB price, ignoring any client-side amount", async () => {
    const order = await createOrderFromCart(
      [{ variantId, quantity: 2 }],
      contact,
      shipping,
      null,
    );

    expect(order.totalKurus).toBe(variantPriceKurus * 2);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].unitPriceKurus).toBe(variantPriceKurus);
    expect(order.orderNumber).toMatch(/^VYK-\d{8}-[A-Z2-9]{6}$/);
  });

  it("reuses the same guest user for repeated checkouts with the same email", async () => {
    const first = await createOrderFromCart([{ variantId, quantity: 1 }], contact, shipping, null);
    const second = await createOrderFromCart([{ variantId, quantity: 1 }], contact, shipping, null);

    expect(second.userId).toBe(first.userId);
  });

  it("creates a separate billing address when billing differs from shipping", async () => {
    const billing = {
      addressLine1: "Fatura Mahallesi Fatura Sokak No:2",
      city: "Ankara",
      district: "Çankaya",
      postalCode: "06000",
    };
    const order = await createOrderFromCart([{ variantId, quantity: 1 }], contact, shipping, billing);

    expect(order.billingAddressId).not.toBe(order.shippingAddressId);
  });

  it("rejects an empty cart", async () => {
    await expect(createOrderFromCart([], contact, shipping, null)).rejects.toThrow("Sepetiniz boş");
  });

  it("rejects an unknown or inactive variant id", async () => {
    await expect(
      createOrderFromCart([{ variantId: "olmayan-varyant-id", quantity: 1 }], contact, shipping, null),
    ).rejects.toThrow(/mevcut değil/);
  });
});
