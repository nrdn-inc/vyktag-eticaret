import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type BuildCheckoutFormRequestInput,
  type BuildSubscriptionCheckoutFormRequestInput,
  buildCheckoutFormRequest,
  buildSubscriptionCheckoutFormRequest,
  extractSubscriptionCheckoutData,
  isPaymentSuccessful,
  isSubscriptionActive,
  kurusToTutarMetni,
} from "@/lib/iyzico";

describe("kurusToTutarMetni", () => {
  it("converts kurus to a two-decimal TL amount string", () => {
    expect(kurusToTutarMetni(59990)).toBe("599.90");
    expect(kurusToTutarMetni(100)).toBe("1.00");
    expect(kurusToTutarMetni(0)).toBe("0.00");
  });
});

function makeInput(): BuildCheckoutFormRequestInput {
  return {
    conversationId: "order_1",
    basketId: "order_1",
    callbackUrl: "https://vyktag.com.tr/api/odeme/geri-donus",
    totalKurus: 1599_80,
    buyer: {
      id: "user_1",
      name: "Mesut",
      surname: "Yılmaz",
      identityNumber: "11111111111",
      email: "mesut@example.com",
      gsmNumber: "+905551112233",
      registrationAddress: "Örnek mahalle, örnek sokak No:1",
      city: "İstanbul",
      country: "Türkiye",
      zipCode: "34000",
      ip: "127.0.0.1",
    },
    shippingAddress: {
      contactName: "Mesut Yılmaz",
      city: "İstanbul",
      country: "Türkiye",
      address: "Örnek mahalle, örnek sokak No:1",
      zipCode: "34000",
    },
    billingAddress: {
      contactName: "Mesut Yılmaz",
      city: "İstanbul",
      country: "Türkiye",
      address: "Örnek mahalle, örnek sokak No:1",
      zipCode: "34000",
    },
    basketItems: [
      {
        id: "item_1",
        name: "VYKTag Kart - Özel Tasarım",
        category1: "Dijital Kartvizit",
        itemType: "PHYSICAL",
        priceKurus: 1599_80,
      },
    ],
  };
}

describe("buildCheckoutFormRequest", () => {
  it("formats the total and basket item prices as TL amount strings", () => {
    const request = buildCheckoutFormRequest(makeInput());
    expect(request.price).toBe("1599.80");
    expect(request.paidPrice).toBe("1599.80");
    expect(request.basketItems[0].price).toBe("1599.80");
  });

  it("carries through conversationId/basketId/callbackUrl for correlation", () => {
    const request = buildCheckoutFormRequest(makeInput());
    expect(request.conversationId).toBe("order_1");
    expect(request.basketId).toBe("order_1");
    expect(request.callbackUrl).toBe("https://vyktag.com.tr/api/odeme/geri-donus");
  });

  it("uses Turkish Lira currency", () => {
    const request = buildCheckoutFormRequest(makeInput());
    expect(request.currency).toBe("TRY");
  });
});

describe("isPaymentSuccessful", () => {
  it("is true only when both status and paymentStatus succeed", () => {
    expect(isPaymentSuccessful({ status: "success", paymentStatus: "SUCCESS" })).toBe(true);
  });

  it("is false when the payment failed", () => {
    expect(isPaymentSuccessful({ status: "success", paymentStatus: "FAILURE" })).toBe(false);
  });

  it("is false when the API call itself failed", () => {
    expect(isPaymentSuccessful({ status: "failure", paymentStatus: "SUCCESS" })).toBe(false);
  });
});

function makeSubscriptionInput(): BuildSubscriptionCheckoutFormRequestInput {
  return {
    conversationId: "sub__user_1__plan_1__abcd1234",
    callbackUrl: "https://vyktag.com.tr/api/abonelik/geri-donus",
    pricingPlanReferenceCode: "pricing-plan-ref-1",
    customer: {
      name: "Mesut",
      surname: "Yılmaz",
      identityNumber: "11111111111",
      email: "mesut@example.com",
      gsmNumber: "+905551112233",
      billingAddress: {
        contactName: "Mesut Yılmaz",
        city: "İstanbul",
        district: "Kadıköy",
        country: "Türkiye",
        address: "Örnek mahalle, örnek sokak No:1",
        zipCode: "34000",
      },
      shippingAddress: {
        contactName: "Mesut Yılmaz",
        city: "İstanbul",
        district: "Kadıköy",
        country: "Türkiye",
        address: "Örnek mahalle, örnek sokak No:1",
        zipCode: "34000",
      },
    },
  };
}

describe("buildSubscriptionCheckoutFormRequest", () => {
  it("carries through conversationId/callbackUrl/pricingPlanReferenceCode for correlation", () => {
    const request = buildSubscriptionCheckoutFormRequest(makeSubscriptionInput());
    expect(request.conversationId).toBe("sub__user_1__plan_1__abcd1234");
    expect(request.callbackUrl).toBe("https://vyktag.com.tr/api/abonelik/geri-donus");
    expect(request.pricingPlanReferenceCode).toBe("pricing-plan-ref-1");
  });

  it("always requests an immediately active subscription (hosted checkout form collects the card)", () => {
    const request = buildSubscriptionCheckoutFormRequest(makeSubscriptionInput());
    expect(request.subscriptionInitialStatus).toBe("ACTIVE");
  });
});

describe("isSubscriptionActive", () => {
  it("is true only when subscriptionStatus is ACTIVE", () => {
    expect(isSubscriptionActive({ subscriptionStatus: "ACTIVE" })).toBe(true);
  });

  it("is false for any other status", () => {
    expect(isSubscriptionActive({ subscriptionStatus: "PENDING" })).toBe(false);
    expect(isSubscriptionActive({ subscriptionStatus: "CANCELED" })).toBe(false);
  });
});

describe("extractSubscriptionCheckoutData", () => {
  it("reads fields from a 'data'-wrapped response", () => {
    const extracted = extractSubscriptionCheckoutData({
      status: "success",
      data: {
        conversationId: "sub__user_1__plan_1__abcd1234",
        referenceCode: "ref-1",
        customerReferenceCode: "cust-1",
        pricingPlanReferenceCode: "plan-ref-1",
        subscriptionStatus: "ACTIVE",
      },
    });
    expect(extracted).toEqual({
      conversationId: "sub__user_1__plan_1__abcd1234",
      referenceCode: "ref-1",
      customerReferenceCode: "cust-1",
      pricingPlanReferenceCode: "plan-ref-1",
      subscriptionStatus: "ACTIVE",
    });
  });

  it("reads fields from a flat (unwrapped) response", () => {
    const extracted = extractSubscriptionCheckoutData({
      status: "success",
      conversationId: "sub__user_1__plan_1__abcd1234",
      referenceCode: "ref-1",
      customerReferenceCode: "cust-1",
      pricingPlanReferenceCode: "plan-ref-1",
      subscriptionStatus: "ACTIVE",
    });
    expect(extracted?.referenceCode).toBe("ref-1");
  });

  it("returns null when the response has no referenceCode/subscriptionStatus (failed call)", () => {
    expect(extractSubscriptionCheckoutData({ status: "failure" })).toBeNull();
  });
});

describe("getClient (indirectly via initializeCheckoutForm)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("rejects with a clear Turkish error when API credentials are missing", async () => {
    vi.stubEnv("IYZICO_API_KEY", "");
    vi.stubEnv("IYZICO_SECRET_KEY", "");
    vi.stubEnv("IYZICO_BASE_URL", "");
    const { initializeCheckoutForm } = await import("@/lib/iyzico");

    await expect(initializeCheckoutForm(makeInput())).rejects.toThrow(/API bilgileri tanımlı değil/);
  });
});
