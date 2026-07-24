import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";
import {
  createOrderFromCart,
  generateOrderNumber,
  releaseStockIfPaymentFailed,
  setOrderStatus,
  type CheckoutContact,
} from "@/lib/orders";
import { InsufficientStockError } from "@/lib/stock";

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

// Bu proje ayrı bir test veritabanı kullanmıyor (bkz. catalog-seed.test.ts). Sipariş oluşturma
// artık stok düştüğü için, testler gerçek ürünlerin stoğunu tüketmesin diye vitrinde GÖRÜNMEYEN
// (product.isActive = false) ancak sipariş verilebilir (variant.isActive = true) özel bir test
// varyantı kullanır; stoğu her testten önce bilinen bir değere sıfırlanır.
const TEST_PRODUCT_SLUG = "vyktag-test-stok-urunu";
const TEST_VARIANT_SKU = "VYK-TEST-STOK";
const TEST_VARIANT_PRICE = 12345;
const INITIAL_STOCK = 1000;

describe("createOrderFromCart & stok yönetimi", () => {
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

  async function getStock(): Promise<number> {
    const variant = await prisma.productVariant.findUniqueOrThrow({ where: { id: variantId } });
    return variant.stock;
  }

  beforeAll(async () => {
    const product = await prisma.product.upsert({
      where: { slug: TEST_PRODUCT_SLUG },
      update: { isActive: false },
      create: {
        slug: TEST_PRODUCT_SLUG,
        name: "Test Stok Ürünü",
        description: "Otomatik testler için — vitrinde görünmez.",
        images: [],
        isActive: false,
      },
    });

    const variant = await prisma.productVariant.upsert({
      where: { sku: TEST_VARIANT_SKU },
      update: { productId: product.id, isActive: true, priceKurus: TEST_VARIANT_PRICE },
      create: {
        productId: product.id,
        name: "Test",
        sku: TEST_VARIANT_SKU,
        priceKurus: TEST_VARIANT_PRICE,
        stock: INITIAL_STOCK,
        isActive: true,
      },
    });
    variantId = variant.id;
  });

  beforeEach(async () => {
    await prisma.productVariant.update({ where: { id: variantId }, data: { stock: INITIAL_STOCK } });
  });

  it("computes totals from the authoritative DB price, ignoring any client-side amount", async () => {
    const order = await createOrderFromCart([{ variantId, quantity: 2 }], contact, shipping, null);

    expect(order.totalKurus).toBe(TEST_VARIANT_PRICE * 2);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].unitPriceKurus).toBe(TEST_VARIANT_PRICE);
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

  it("decrements stock by the ordered quantity when creating an order", async () => {
    await createOrderFromCart([{ variantId, quantity: 3 }], contact, shipping, null);
    expect(await getStock()).toBe(INITIAL_STOCK - 3);
  });

  it("aggregates quantity across lines of the same variant for the stock decrement", async () => {
    await createOrderFromCart(
      [
        { variantId, quantity: 2, personalization: { fullName: "A" } },
        { variantId, quantity: 3, personalization: { fullName: "B" } },
      ],
      contact,
      shipping,
      null,
    );
    expect(await getStock()).toBe(INITIAL_STOCK - 5);
  });

  it("rejects when stock is insufficient and does not decrement or create the order", async () => {
    await prisma.productVariant.update({ where: { id: variantId }, data: { stock: 2 } });

    await expect(
      createOrderFromCart([{ variantId, quantity: 5 }], contact, shipping, null),
    ).rejects.toBeInstanceOf(InsufficientStockError);

    // Stok değişmemeli (atomik guard, transaction rollback).
    expect(await getStock()).toBe(2);
  });

  it("restores stock when an order moves to a released status (CANCELLED), idempotently", async () => {
    const order = await createOrderFromCart([{ variantId, quantity: 4 }], contact, shipping, null);
    expect(await getStock()).toBe(INITIAL_STOCK - 4);

    await setOrderStatus(order.orderNumber, OrderStatus.CANCELLED);
    expect(await getStock()).toBe(INITIAL_STOCK);

    // İkinci kez iptal etmek stoğu tekrar iade etmemeli (idempotent).
    await setOrderStatus(order.orderNumber, OrderStatus.CANCELLED);
    expect(await getStock()).toBe(INITIAL_STOCK);
  });

  it("re-holds stock when a released order is reactivated", async () => {
    const order = await createOrderFromCart([{ variantId, quantity: 4 }], contact, shipping, null);
    await setOrderStatus(order.orderNumber, OrderStatus.CANCELLED);
    expect(await getStock()).toBe(INITIAL_STOCK);

    await setOrderStatus(order.orderNumber, OrderStatus.PAID);
    expect(await getStock()).toBe(INITIAL_STOCK - 4);
  });

  it("stamps shippedAt when transitioning to SHIPPED", async () => {
    const order = await createOrderFromCart([{ variantId, quantity: 1 }], contact, shipping, null);
    const updated = await setOrderStatus(order.orderNumber, OrderStatus.SHIPPED);
    expect(updated.shippedAt).toBeInstanceOf(Date);
  });

  it("releaseStockIfPaymentFailed restores stock on failure and is a no-op on success", async () => {
    const failed = await createOrderFromCart([{ variantId, quantity: 2 }], contact, shipping, null);
    await releaseStockIfPaymentFailed(failed.id, false);
    expect(await getStock()).toBe(INITIAL_STOCK);
    // Tekrar çağırmak idempotent olmalı.
    await releaseStockIfPaymentFailed(failed.id, false);
    expect(await getStock()).toBe(INITIAL_STOCK);

    const paid = await createOrderFromCart([{ variantId, quantity: 2 }], contact, shipping, null);
    await releaseStockIfPaymentFailed(paid.id, true);
    expect(await getStock()).toBe(INITIAL_STOCK - 2);
  });
});
