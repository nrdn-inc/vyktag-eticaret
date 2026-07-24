"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { OrderStatus, HandoffStatus } from "@/generated/prisma/client";
import { verifyAdminSession } from "@/lib/admin-session";
import { setOrderStatus } from "@/lib/orders";
import { InsufficientStockError } from "@/lib/stock";

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

  try {
    // setOrderStatus durum güncellemesini ve stok uzlaştırmasını (iptal/iade'de iade,
    // yeniden aktifleştirmede yeniden düşüm) tek transaction içinde yapar.
    await setOrderStatus(orderNumber, status as OrderStatus);
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return { error: error.message };
    }
    if (error instanceof Error && error.message === "Sipariş bulunamadı.") {
      return { error: error.message };
    }
    console.error("[admin/updateOrderStatus] hata:", error);
    return { error: "Durum güncellenemedi." };
  }

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
