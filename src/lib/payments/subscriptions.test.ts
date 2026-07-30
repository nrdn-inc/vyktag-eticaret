import { describe, expect, it } from "vitest";
import {
  computePeriodEnd,
  decodeSubscriptionConversationId,
  encodeSubscriptionConversationId,
} from "@/lib/payments/subscriptions";

// Veritabanına yazan activateSubscriptionFromCheckout için bkz. subscriptions.db.test.ts
// (npm run test:db). Bu dosya yalnızca saf mantığı test eder.
describe("encodeSubscriptionConversationId / decodeSubscriptionConversationId", () => {
  it("round-trips userId and planId", () => {
    const conversationId = encodeSubscriptionConversationId("user_1", "plan_1");
    expect(decodeSubscriptionConversationId(conversationId)).toEqual({
      userId: "user_1",
      planId: "plan_1",
    });
  });

  it("produces a different conversationId on each call (nonce)", () => {
    const a = encodeSubscriptionConversationId("user_1", "plan_1");
    const b = encodeSubscriptionConversationId("user_1", "plan_1");
    expect(a).not.toBe(b);
  });

  it("returns null for undefined/empty input", () => {
    expect(decodeSubscriptionConversationId(undefined)).toBeNull();
    expect(decodeSubscriptionConversationId(null)).toBeNull();
    expect(decodeSubscriptionConversationId("")).toBeNull();
  });

  it("returns null for a conversationId not produced by encodeSubscriptionConversationId", () => {
    expect(decodeSubscriptionConversationId("order_1")).toBeNull();
    expect(decodeSubscriptionConversationId("sub__onlyuser")).toBeNull();
  });
});

describe("computePeriodEnd", () => {
  it("adds one month for MONTHLY", () => {
    const start = new Date("2026-01-15T00:00:00Z");
    expect(computePeriodEnd(start, "MONTHLY").toISOString()).toBe("2026-02-15T00:00:00.000Z");
  });

  it("adds one year for YEARLY", () => {
    const start = new Date("2026-01-15T00:00:00Z");
    expect(computePeriodEnd(start, "YEARLY").toISOString()).toBe("2027-01-15T00:00:00.000Z");
  });

  it("adds six months for SIX_MONTHS", () => {
    const start = new Date("2026-01-15T00:00:00Z");
    expect(computePeriodEnd(start, "SIX_MONTHS").toISOString()).toBe("2026-07-15T00:00:00.000Z");
  });

  it("clamps month-end overflow instead of spilling into the next month (31 Jan + 1 month = 28 Feb, not 3 Mar)", () => {
    const start = new Date(2026, 0, 31, 12, 0, 0); // 31 Ocak (yerel saat)
    const end = computePeriodEnd(start, "MONTHLY");
    expect(end.getMonth()).toBe(1); // Şubat
    expect(end.getDate()).toBe(28);
  });

  it("clamps 29 Feb + 1 year to 28 Feb on non-leap years", () => {
    const start = new Date(2028, 1, 29, 12, 0, 0); // 29 Şubat 2028 (artık yıl)
    const end = computePeriodEnd(start, "YEARLY");
    expect(end.getFullYear()).toBe(2029);
    expect(end.getMonth()).toBe(1);
    expect(end.getDate()).toBe(28);
  });
});
