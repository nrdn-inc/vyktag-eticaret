import {
  extractSubscriptionCheckoutData,
  isSubscriptionActive,
  retrieveSubscriptionCheckoutForm,
} from "@/lib/payments/iyzico";
import { activateSubscriptionFromCheckout, decodeSubscriptionConversationId } from "@/lib/payments/subscriptions";

// iyzico'nun barındırdığı abonelik ödeme sayfası, müşterinin tarayıcısından bu adrese POST ile
// yönlendirme yapar. Bu yüzden istek her zaman taze olmalı ve önbelleklenmemelidir.
export const dynamic = "force-dynamic";

function siteUrl(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
}

export async function POST(request: Request): Promise<Response> {
  const origin = siteUrl(request);

  let token: FormDataEntryValue | null = null;
  try {
    const formData = await request.formData();
    token = formData.get("token");
  } catch {
    return Response.redirect(`${origin}/hesap?abonelik=hata`, 303);
  }

  if (typeof token !== "string" || !token) {
    return Response.redirect(`${origin}/hesap?abonelik=hata`, 303);
  }

  let result;
  try {
    // Abonelik durumu yalnızca bu sunucu-sunucu sorgusuna göre belirlenir; POST gövdesindeki
    // hiçbir alana (token hariç) güvenilmez.
    result = await retrieveSubscriptionCheckoutForm(token);
  } catch (error) {
    console.error("[abonelik/geri-donus] iyzico sorgu hatası:", error);
    return Response.redirect(`${origin}/hesap?abonelik=hata`, 303);
  }

  const data = extractSubscriptionCheckoutData(result);
  const decoded = decodeSubscriptionConversationId(data?.conversationId);

  if (!data || !decoded) {
    console.error("[abonelik/geri-donus] eşleşen abonelik bulunamadı, conversationId:", data?.conversationId);
    return Response.redirect(`${origin}/hesap?abonelik=hata`, 303);
  }

  try {
    await activateSubscriptionFromCheckout(decoded.userId, decoded.planId, data);
  } catch (error) {
    console.error("[abonelik/geri-donus] abonelik kaydı oluşturulamadı:", error);
    return Response.redirect(`${origin}/hesap?abonelik=hata`, 303);
  }

  return Response.redirect(
    `${origin}/hesap?abonelik=${isSubscriptionActive(data) ? "basarili" : "hata"}`,
    303,
  );
}
