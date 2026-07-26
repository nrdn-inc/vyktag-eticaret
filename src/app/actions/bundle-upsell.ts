"use server";

import { prisma } from "@/lib/prisma";

export async function getCrossSellSubscriptionPlan(productSlugs: string[]) {
  if (productSlugs.length === 0) return null;

  // Find a product in the cart that has a crossSellSubscriptionPlan
  const productWithBundle = await prisma.product.findFirst({
    where: {
      slug: { in: productSlugs },
      crossSellSubscriptionPlanId: { not: null },
    },
    include: {
      crossSellSubscriptionPlan: true,
    },
  });

  if (!productWithBundle || !productWithBundle.crossSellSubscriptionPlan) {
    return null;
  }

  const plan = productWithBundle.crossSellSubscriptionPlan;
  if (!plan.isActive || !plan.iyzicoPricingPlanRef) {
    return null;
  }

  return {
    subscriptionPlanId: plan.id,
    planSlug: plan.slug,
    planName: plan.name,
    planDescription: plan.description,
    unitPriceKurus: plan.priceKurus, // Might be discounted, assuming base price for now
    interval: plan.interval,
    triggerProductSlug: productWithBundle.slug,
    triggerProductName: productWithBundle.name,
  };
}
