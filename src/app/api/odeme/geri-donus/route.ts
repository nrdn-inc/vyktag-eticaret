import { OrderStatus } from "@/generated/prisma/client";
import { isPaymentSuccessful, retrieveCheckoutForm } from "@/lib/payments/iyzico";
import { finalizeOrderPayment, findOrderForPaymentFinalization } from "@/lib/orders";

// iyzico'nun barındırdığı ödeme sayfası, müşterinin tarayıcısından bu adrese POST ile
// yönlendirme yapar. Bu yüzden istek her zaman taze olmalı ve önbelleklenmemelidir.
export const dynamic = "force-dynamic";

function siteUrl(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request): Promise<Response> {
  const origin = siteUrl(request);

  let token: FormDataEntryValue | null = null;
  try {
    // Bu uç nokta herkese açıktır (iyzico'nun barındırdığı sayfadan tarayıcı POST'u ile
    // gelir); bozuk/beklenmeyen içerik türüyle gelen isteklerde formData() fırlatabilir.
    const formData = await request.formData();
    token = formData.get("token");
  } catch {
    return Response.redirect(`${origin}/sepet?odeme=hata`, 303);
  }

  if (typeof token !== "string" || !token) {
    return Response.redirect(`${origin}/sepet?odeme=hata`, 303);
  }

  let result;
  try {
    // Ödeme durumu yalnızca bu sunucu-sunucu sorgusuna göre belirlenir; POST gövdesindeki
    // hiçbir alana (token hariç) güvenilmez — bu, iyzico'nun önerdiği doğrulama yöntemidir.
    result = await retrieveCheckoutForm(token);
  } catch (error) {
    console.error("[odeme/geri-donus] iyzico sorgu hatası:", error);
    return Response.redirect(`${origin}/sepet?odeme=hata`, 303);
  }

  const orderId = result.conversationId;
  const order = orderId ? await findOrderForPaymentFinalization(orderId) : null;

  if (!order) {
    console.error("[odeme/geri-donus] eşleşen sipariş bulunamadı, conversationId:", orderId);
    return Response.redirect(`${origin}/sepet?odeme=hata`, 303);
  }

  /**
   * Idempotency kontrolü: Sipariş daha önce ödenmişse işlemi yoksayarak 
   * mükerrer payment kaydı veya FAILED durumuna düşme riskini önleriz.
   */
  if (order.status === OrderStatus.PAID) {
    console.warn(`[odeme/geri-donus] Mükerrer webhook engellendi. Sipariş zaten ödenmiş: ${order.id}`);
    return Response.redirect(`${origin}/siparis/${order.orderNumber}`, 303);
  }

  let success = isPaymentSuccessful(result);
  const amountKurus = Math.round(Number(result.paidPrice ?? result.price ?? 0) * 100);

  /**
   * Tutar doğrulama: Ödenen tutar, sistemin beklediği tutardan az olamaz.
   * Bu kontrol sepet tutarının istemcide manipüle edilmesini engeller.
   */
  if (success && amountKurus < order.totalKurus) {
    console.error(`[odeme/geri-donus] Tutar manipülasyonu girişimi! Beklenen: ${order.totalKurus}, Ödenen: ${amountKurus}, Order: ${order.id}`);
    success = false;
  }

  await finalizeOrderPayment(order, {
    success,
    amountKurus,
    providerRef: result.paymentId || token,
    rawResponse: result,
  });

  return Response.redirect(`${origin}/siparis/${order.orderNumber}`, 303);
}
