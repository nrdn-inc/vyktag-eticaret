"use server";

import { getCurrentCustomer } from "@/lib/customer-session";
import { getPurchasableSubscriptionPlanBySlug } from "@/lib/catalog";
import { encodeSubscriptionConversationId } from "@/lib/subscriptions";
import { initializeSubscriptionCheckoutForm } from "@/lib/iyzico";

export interface SubscribeAddressInput {
  addressLine1: string;
  city: string;
  district: string;
  postalCode: string;
}

export interface SubscribeInput {
  slug: string;
  identityNumber: string;
  gsmNumber: string;
  address: SubscribeAddressInput;
}

export type SubscribeResult =
  | { ok: true; checkoutFormContent: string }
  | { ok: false; error: string };

const TC_KIMLIK_REGEX = /^\d{11}$/;

/**
 * Giriş yapmış müşteri için iyzico Abonelik Checkout Form'unu başlatır. Fiyat/plan bilgisi
 * yalnızca veritabanından (Fiyatlandırma Planı referansıyla birlikte) okunur; istemciden
 * hiçbir tutar/plan kimliğine güvenilmez — yalnızca slug alınır.
 */
export async function startSubscriptionCheckout(input: SubscribeInput): Promise<SubscribeResult> {
  try {
    const user = await getCurrentCustomer();
    if (!user) {
      return { ok: false, error: "Abone olmak için giriş yapmalısınız." };
    }

    if (!TC_KIMLIK_REGEX.test(input.identityNumber)) {
      return { ok: false, error: "TC Kimlik No 11 haneli olmalıdır." };
    }

    const plan = await getPurchasableSubscriptionPlanBySlug(input.slug);
    if (!plan) {
      return { ok: false, error: "Bu abonelik planı şu anda satışa açık değil." };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const [firstName, ...restName] = user.fullName.trim().split(/\s+/);
    const surname = restName.join(" ") || firstName;

    const address = {
      contactName: user.fullName,
      city: input.address.city,
      district: input.address.district,
      country: "Türkiye",
      address: input.address.addressLine1,
      zipCode: input.address.postalCode,
    };

    const { checkoutFormContent } = await initializeSubscriptionCheckoutForm({
      conversationId: encodeSubscriptionConversationId(user.id, plan.id),
      callbackUrl: `${siteUrl}/api/abonelik/geri-donus`,
      pricingPlanReferenceCode: plan.iyzicoPricingPlanRef,
      customer: {
        name: firstName,
        surname,
        identityNumber: input.identityNumber,
        email: user.email,
        gsmNumber: input.gsmNumber,
        billingAddress: address,
        shippingAddress: address,
      },
    });

    return { ok: true, checkoutFormContent };
  } catch (error) {
    console.error("[abonelik] hata:", error);
    const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.";
    return { ok: false, error: message };
  }
}
