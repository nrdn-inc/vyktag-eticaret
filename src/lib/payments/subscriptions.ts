import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, SubscriptionStatus } from "@/generated/prisma/client";
import type { Prisma, SubscriptionInterval } from "@/generated/prisma/client";
import type { SubscriptionCheckoutFormData } from "@/lib/payments/iyzico";

const CONVERSATION_ID_SEPARATOR = "__";
const CONVERSATION_ID_PREFIX = "sub";

/**
 * userId + planId çiftini, iyzico'nun conversationId alanında taşınacak tek bir dizeye kodlar.
 * Abonelik henüz ödeme öncesinde bir DB satırına sahip olmadığından (iyzico'nun ACTIVE/PENDING
 * durumu dışında bir "bekliyor" durumumuz yok), geri dönüş noktasındaki eşleşme conversationId
 * üzerinden yapılır — sipariş akışındaki gibi önceden oluşturulmuş bir kayda değil.
 */
export function encodeSubscriptionConversationId(userId: string, planId: string): string {
  const nonce = randomBytes(6).toString("hex");
  return [CONVERSATION_ID_PREFIX, userId, planId, nonce].join(CONVERSATION_ID_SEPARATOR);
}

export interface DecodedSubscriptionConversationId {
  userId: string;
  planId: string;
}

/** encodeSubscriptionConversationId'nin tersi. Biçim uyuşmuyorsa null döner. */
export function decodeSubscriptionConversationId(
  conversationId: string | undefined | null,
): DecodedSubscriptionConversationId | null {
  if (!conversationId) {
    return null;
  }
  const parts = conversationId.split(CONVERSATION_ID_SEPARATOR);
  if (parts.length !== 4 || parts[0] !== CONVERSATION_ID_PREFIX) {
    return null;
  }
  const [, userId, planId] = parts;
  if (!userId || !planId) {
    return null;
  }
  return { userId, planId };
}

/** Abonelik periyoduna göre bir sonraki yenileme tarihini hesaplar (iyzico'nun kendi faturalama takvimi asıldır; bu yalnızca yerel görüntüleme içindir). */
export function computePeriodEnd(start: Date, interval: SubscriptionInterval): Date {
  const end = new Date(start);
  // setMonth/setFullYear ay sonlarında taşar (31 Oca + 1 ay → 3 Mar); günü hedef ayın
  // son gününe sıkıştırarak taşmayı önlüyoruz.
  const day = end.getDate();
  end.setDate(1);
  if (interval === "MONTHLY") {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  end.setDate(Math.min(day, new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()));
  return end;
}

/**
 * iyzico Abonelik Checkout Form geri dönüşünde çağrılır: abonelik + ödeme kayıtlarını oluşturur.
 * `iyzicoReferenceCode` @unique olduğundan aynı token için iki kez çağrılsa bile (ör. iyzico'nun
 * yeniden denemesi) ikinci çağrı upsert'in "update" dalına düşer — idempotenttir.
 */
export async function activateSubscriptionFromCheckout(
  userId: string,
  planId: string,
  data: SubscriptionCheckoutFormData,
): Promise<void> {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new Error(`Abonelik planı bulunamadı: ${planId}`);
  }
  // Derinlemesine savunma: conversationId'den çözülen plan, iyzico'nun bu ödeme için
  // döndürdüğü Fiyatlandırma Planı ile birebir eşleşmeli — uyuşmazlık, karışmış/yeniden
  // kullanılmış bir geri dönüş demektir ve abonelik kaydı oluşturulmaz.
  if (plan.iyzicoPricingPlanRef !== data.pricingPlanReferenceCode) {
    throw new Error("Abonelik planı iyzico dönüşüyle eşleşmiyor.");
  }

  const now = new Date();
  const periodEnd = computePeriodEnd(now, plan.interval);
  const status = data.subscriptionStatus === "ACTIVE" ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PAST_DUE;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.subscription.findUnique({ where: { iyzicoReferenceCode: data.referenceCode } });

    // iyzico aynı token için geri dönüşü yeniden gönderebilir (ör. ağ zaman aşımı sonrası
    // müşterinin sayfayı yenilemesi) — bu durumda yalnızca durumu güncelle, ikinci bir
    // ödeme kaydı oluşturma.
    if (existing) {
      await tx.subscription.update({ where: { id: existing.id }, data: { status } });
      return;
    }

    const subscription = await tx.subscription.create({
      data: {
        userId,
        planId,
        status,
        iyzicoReferenceCode: data.referenceCode,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    await tx.payment.create({
      data: {
        subscriptionId: subscription.id,
        provider: "iyzico",
        providerRef: data.referenceCode,
        status: status === SubscriptionStatus.ACTIVE ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
        amountKurus: plan.priceKurus,
        rawResponse: data as unknown as Prisma.InputJsonValue,
      },
    });
  });
}
