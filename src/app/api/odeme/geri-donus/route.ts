import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentStatus, type Prisma } from "@/generated/prisma/client";
import { isPaymentSuccessful, retrieveCheckoutForm } from "@/lib/iyzico";

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
  const order = orderId ? await prisma.order.findUnique({ where: { id: orderId } }) : null;

  if (!order) {
    console.error("[odeme/geri-donus] eşleşen sipariş bulunamadı, conversationId:", orderId);
    return Response.redirect(`${origin}/sepet?odeme=hata`, 303);
  }

  const success = isPaymentSuccessful(result);
  const amountKurus = Math.round(Number(result.paidPrice ?? result.price ?? 0) * 100);

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: success ? OrderStatus.PAID : OrderStatus.FAILED },
    }),
    prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "iyzico",
        providerRef: result.paymentId || token,
        status: success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
        amountKurus,
        rawResponse: result as unknown as Prisma.InputJsonValue,
      },
    }),
  ]);

  return Response.redirect(`${origin}/siparis/${order.orderNumber}`, 303);
}
