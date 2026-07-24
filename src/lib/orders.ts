import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma, UserRole } from "@/generated/prisma/client";
import type { CartPersonalization } from "@/lib/cart";
import { InsufficientStockError, aggregateQuantitiesByVariant, isStockReleasedStatus } from "@/lib/stock";

export interface CheckoutLine {
  variantId: string;
  quantity: number;
  personalization?: CartPersonalization;
}

export interface CheckoutContact {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface CheckoutAddressInput {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
}

const ORDER_NUMBER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // karışabilecek 0/O, 1/I hariç

/** "VYK-YYYYMMDD-XXXXXX" biçiminde, insan tarafından okunabilir bir sipariş numarası üretir. */
export function generateOrderNumber(now: Date = new Date()): string {
  const datePart = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((n, i) => (i === 0 ? String(n) : String(n).padStart(2, "0")))
    .join("");

  let suffix = "";
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i++) {
    suffix += ORDER_NUMBER_CHARS[bytes[i] % ORDER_NUMBER_CHARS.length];
  }

  return `VYK-${datePart}-${suffix}`;
}

/**
 * Henüz giriş sistemi olmadığından (misafir alışveriş), e-postaya göre hafif bir CUSTOMER
 * kullanıcı satırı bulunur/oluşturulur — yalnızca Address kaydını bağlamak için. passwordHash
 * kullanılamaz rastgele bir değerdir; gerçek bir giriş akışı eklendiğinde şifre sıfırlama ile
 * değiştirilmesi gerekir.
 */
async function findOrCreateGuestUser(contact: CheckoutContact) {
  const existing = await prisma.user.findUnique({ where: { email: contact.email } });
  if (existing) {
    return existing;
  }

  return prisma.user.create({
    data: {
      email: contact.email,
      fullName: `${contact.firstName} ${contact.lastName}`.trim(),
      phone: contact.phone,
      role: UserRole.CUSTOMER,
      passwordHash: `guest_${randomBytes(32).toString("hex")}`,
    },
  });
}

/** Sunucu tarafında doğrulanmış fiyatlarla, sepetten yeni bir PENDING sipariş oluşturur. */
export async function createOrderFromCart(
  lines: CheckoutLine[],
  contact: CheckoutContact,
  shipping: CheckoutAddressInput,
  billing: CheckoutAddressInput | null,
) {
  if (lines.length === 0) {
    throw new Error("Sepetiniz boş.");
  }

  const variantIds = [...new Set(lines.map((l) => l.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, isActive: true },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    throw new Error("Sepetinizdeki bazı ürünler artık mevcut değil. Lütfen sepetinizi güncelleyin.");
  }

  const variantById = new Map(variants.map((v) => [v.id, v]));
  const user = await findOrCreateGuestUser(contact);

  const shippingAddress = await prisma.address.create({
    data: {
      userId: user.id,
      fullName: `${contact.firstName} ${contact.lastName}`.trim(),
      phone: contact.phone,
      addressLine1: shipping.addressLine1,
      addressLine2: shipping.addressLine2,
      city: shipping.city,
      district: shipping.district,
      postalCode: shipping.postalCode,
    },
  });

  const billingAddress = billing
    ? await prisma.address.create({
        data: {
          userId: user.id,
          fullName: `${contact.firstName} ${contact.lastName}`.trim(),
          phone: contact.phone,
          addressLine1: billing.addressLine1,
          addressLine2: billing.addressLine2,
          city: billing.city,
          district: billing.district,
          postalCode: billing.postalCode,
        },
      })
    : shippingAddress;

  const items = lines.map((line) => {
    const variant = variantById.get(line.variantId)!;
    const quantity = Math.max(1, Math.floor(line.quantity));
    const unitPriceKurus = variant.priceKurus;
    return {
      productVariantId: variant.id,
      quantity,
      unitPriceKurus,
      totalKurus: unitPriceKurus * quantity,
      personalization: line.personalization
        ? (line.personalization as Prisma.InputJsonValue)
        : undefined,
    };
  });

  const totalKurus = items.reduce((sum, item) => sum + item.totalKurus, 0);
  const quantityByVariant = aggregateQuantitiesByVariant(lines);

  // orderNumber çakışması (çok düşük ihtimal) durumunda birkaç kez yeniden dener.
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Stok, sipariş oluşturulurken atomik olarak düşülür. Koşullu updateMany (stok >= adet)
        // sayesinde iki eşzamanlı sipariş son ürünü aynı anda alamaz — aşırı satış engellenir.
        for (const [variantId, quantity] of quantityByVariant) {
          const result = await tx.productVariant.updateMany({
            where: { id: variantId, isActive: true, stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
          });
          if (result.count === 0) {
            const variant = variantById.get(variantId)!;
            throw new InsufficientStockError(`${variant.product.name} (${variant.name})`);
          }
        }

        return tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            userId: user.id,
            totalKurus,
            shippingAddressId: shippingAddress.id,
            billingAddressId: billingAddress.id,
            items: { create: items },
          },
          include: {
            items: { include: { productVariant: { include: { product: true } } } },
          },
        });
      });
    } catch (error) {
      // Stok yetersizliği kalıcı bir durumdur; yeniden denenmez, doğrudan yükseltilir.
      if (error instanceof InsufficientStockError) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Sipariş oluşturulamadı.");
}

/**
 * Bir siparişin durumunu değiştirir ve stoğu uzlaştırır — hepsi tek bir transaction içinde:
 * - Serbest bırakan bir duruma (FAILED/CANCELLED/REFUNDED) geçişte, stok henüz iade edilmediyse
 *   iade eder (idempotent).
 * - Serbest bırakılmış bir siparişi tekrar aktif bir duruma alırken, stoğu yeniden düşer
 *   (koşullu; yeterli stok yoksa InsufficientStockError fırlatır).
 * Ayrıca SHIPPED/DELIVERED anlarında shippedAt/deliveredAt zaman damgalarını doldurur.
 */
export async function setOrderStatus(orderNumber: string, status: OrderStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) {
      throw new Error("Sipariş bulunamadı.");
    }

    const shouldBeReleased = isStockReleasedStatus(status);
    const variantLines = order.items.filter(
      (item): item is typeof item & { productVariantId: string } => item.productVariantId !== null,
    );

    let stockRestored = order.stockRestored;

    if (shouldBeReleased && !order.stockRestored) {
      // Stoğu iade et.
      for (const item of variantLines) {
        await tx.productVariant.updateMany({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } },
        });
      }
      stockRestored = true;
    } else if (!shouldBeReleased && order.stockRestored) {
      // Daha önce iade edilmiş stoğu yeniden düş (siparişi tekrar aktifleştirme).
      for (const item of variantLines) {
        const result = await tx.productVariant.updateMany({
          where: { id: item.productVariantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          throw new InsufficientStockError("Bu sipariş için stok yeniden ayrılamıyor");
        }
      }
      stockRestored = false;
    }

    const now = new Date();
    return tx.order.update({
      where: { id: order.id },
      data: {
        status,
        stockRestored,
        shippedAt: status === OrderStatus.SHIPPED && !order.shippedAt ? now : order.shippedAt,
        deliveredAt: status === OrderStatus.DELIVERED && !order.deliveredAt ? now : order.deliveredAt,
      },
    });
  });
}

/**
 * Ödeme sonucuna göre stoğu uzlaştırır (yalnızca callback için). Ödeme başarısızsa stoğu iade
 * eder; başarılıysa (stok düşülü kalmalı) hiçbir şey yapmaz. Idempotent'tir.
 */
export async function releaseStockIfPaymentFailed(orderId: string, paymentSucceeded: boolean) {
  if (paymentSucceeded) {
    return;
  }
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.stockRestored) {
      return;
    }
    for (const item of order.items) {
      if (item.productVariantId) {
        await tx.productVariant.updateMany({
          where: { id: item.productVariantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    await tx.order.update({ where: { id: order.id }, data: { stockRestored: true } });
  });
}
