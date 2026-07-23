"use server";

import { headers } from "next/headers";
import { createOrderFromCart, type CheckoutAddressInput, type CheckoutContact } from "@/lib/orders";
import { initializeCheckoutForm } from "@/lib/iyzico";
import type { CartPersonalization } from "@/lib/cart";

export interface CheckoutCartLine {
  variantId: string;
  quantity: number;
  personalization?: CartPersonalization;
}

export interface CheckoutInput {
  contact: CheckoutContact;
  identityNumber: string;
  shipping: CheckoutAddressInput;
  /** null: fatura adresi teslimat adresiyle aynı. */
  billing: CheckoutAddressInput | null;
  lines: CheckoutCartLine[];
}

export type CheckoutResult =
  | { ok: true; checkoutFormContent: string; orderNumber: string }
  | { ok: false; error: string };

const TC_KIMLIK_REGEX = /^\d{11}$/;

function formatAddressLine(address: CheckoutAddressInput): string {
  return [address.addressLine1, address.addressLine2, address.district].filter(Boolean).join(", ");
}

/**
 * Sepetten sunucu tarafında doğrulanmış bir sipariş oluşturur ve iyzico Checkout Form'u başlatır.
 * Fiyatlar yalnızca veritabanından okunur; istemciden gelen hiçbir tutar bilgisine güvenilmez.
 */
export async function startCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  try {
    if (!TC_KIMLIK_REGEX.test(input.identityNumber)) {
      return { ok: false, error: "TC Kimlik No 11 haneli olmalıdır." };
    }

    const order = await createOrderFromCart(input.lines, input.contact, input.shipping, input.billing);

    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const billingForBuyer = input.billing ?? input.shipping;
    const fullName = `${input.contact.firstName} ${input.contact.lastName}`.trim();

    const { checkoutFormContent } = await initializeCheckoutForm({
      conversationId: order.id,
      basketId: order.id,
      callbackUrl: `${siteUrl}/api/odeme/geri-donus`,
      totalKurus: order.totalKurus,
      buyer: {
        id: order.userId ?? order.id,
        name: input.contact.firstName,
        surname: input.contact.lastName,
        identityNumber: input.identityNumber,
        email: input.contact.email,
        gsmNumber: input.contact.phone,
        registrationAddress: input.shipping.addressLine1,
        city: input.shipping.city,
        country: "Türkiye",
        zipCode: input.shipping.postalCode,
        ip,
      },
      shippingAddress: {
        contactName: fullName,
        city: input.shipping.city,
        country: "Türkiye",
        address: formatAddressLine(input.shipping),
        zipCode: input.shipping.postalCode,
      },
      billingAddress: {
        contactName: fullName,
        city: billingForBuyer.city,
        country: "Türkiye",
        address: formatAddressLine(billingForBuyer),
        zipCode: billingForBuyer.postalCode,
      },
      basketItems: order.items.map((item) => ({
        id: item.id,
        name: item.productVariant
          ? `${item.productVariant.product.name} - ${item.productVariant.name}`
          : "Vyktag ürünü",
        category1: "Dijital Kartvizit",
        itemType: "PHYSICAL",
        priceKurus: item.totalKurus,
      })),
    });

    return { ok: true, checkoutFormContent, orderNumber: order.orderNumber };
  } catch (error) {
    console.error("[checkout] hata:", error);
    const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.";
    return { ok: false, error: message };
  }
}
