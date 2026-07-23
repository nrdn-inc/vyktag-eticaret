import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

// Hostinger MySQL bağlantısını gerçek bir sorguyla doğrular. Sadece okuma yapar.
describe("prisma live database connection", () => {
  it("connects to the Hostinger MySQL database and reads every table", async () => {
    await expect(prisma.user.count()).resolves.toBeGreaterThanOrEqual(0);
    await expect(prisma.product.count()).resolves.toBeGreaterThanOrEqual(0);
    await expect(prisma.productVariant.count()).resolves.toBeGreaterThanOrEqual(0);
    await expect(prisma.subscriptionPlan.count()).resolves.toBeGreaterThanOrEqual(0);
    await expect(prisma.order.count()).resolves.toBeGreaterThanOrEqual(0);
    await expect(prisma.orderItem.count()).resolves.toBeGreaterThanOrEqual(0);
    await expect(prisma.subscription.count()).resolves.toBeGreaterThanOrEqual(0);
    await expect(prisma.payment.count()).resolves.toBeGreaterThanOrEqual(0);
    await expect(prisma.dkartvizitHandoff.count()).resolves.toBeGreaterThanOrEqual(0);
  });
});
