"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { OrderStatus, HandoffStatus } from "@/generated/prisma/client";
import { verifyAdminSession } from "@/lib/admin-session";

export interface ActionState {
  error?: string;
  ok?: boolean;
}

function revalidateOrder(orderNumber: string) {
  revalidatePath(`/admin/siparisler/${orderNumber}`);
  revalidatePath("/admin/siparisler");
}

export async function updateOrderStatus(
  orderNumber: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifyAdminSession();

  const status = String(formData.get("status") ?? "");
  if (!(status in OrderStatus)) {
    return { error: "Geçersiz durum." };
  }

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) {
    return { error: "Sipariş bulunamadı." };
  }

  const now = new Date();
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: status as OrderStatus,
      shippedAt: status === OrderStatus.SHIPPED && !order.shippedAt ? now : order.shippedAt,
      deliveredAt: status === OrderStatus.DELIVERED && !order.deliveredAt ? now : order.deliveredAt,
    },
  });

  revalidateOrder(orderNumber);
  return { ok: true };
}

export async function updateTracking(
  orderNumber: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifyAdminSession();

  const trackingCarrier = String(formData.get("trackingCarrier") ?? "").trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) {
    return { error: "Sipariş bulunamadı." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      trackingCarrier: trackingCarrier || null,
      trackingNumber: trackingNumber || null,
    },
  });

  revalidateOrder(orderNumber);
  return { ok: true };
}

export async function provisionHandoff(
  orderItemId: string,
  orderNumber: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await verifyAdminSession();

  const dkartvizitUsername = String(formData.get("dkartvizitUsername") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!dkartvizitUsername) {
    return { error: "dkartvizit kullanıcı adı gerekli." };
  }

  await prisma.dkartvizitHandoff.upsert({
    where: { orderItemId },
    update: {
      status: HandoffStatus.PROVISIONED,
      dkartvizitUsername,
      notes: notes || null,
      provisionedById: admin.id,
      provisionedAt: new Date(),
    },
    create: {
      orderItemId,
      status: HandoffStatus.PROVISIONED,
      dkartvizitUsername,
      notes: notes || null,
      provisionedById: admin.id,
      provisionedAt: new Date(),
    },
  });

  revalidateOrder(orderNumber);
  return { ok: true };
}
