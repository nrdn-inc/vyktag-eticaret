import { describe, expect, it } from "vitest";
import {
  computePeriodEnd,
  decodeSubscriptionConversationId,
  encodeSubscriptionConversationId,
} from "@/lib/subscriptions";

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
});
