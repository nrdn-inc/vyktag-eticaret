import { describe, expect, it } from "vitest";
import { HandoffStatus, OrderStatus, UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

describe("prisma client", () => {
  it("instantiates the singleton without throwing", () => {
    expect(prisma).toBeDefined();
    expect(prisma.user).toBeDefined();
    expect(prisma.order).toBeDefined();
  });

  it("exposes the expected schema enums", () => {
    expect(UserRole.ADMIN).toBe("ADMIN");
    expect(OrderStatus.PENDING).toBe("PENDING");
    expect(HandoffStatus.PROVISIONED).toBe("PROVISIONED");
  });
});
