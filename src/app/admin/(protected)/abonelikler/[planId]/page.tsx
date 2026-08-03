import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePlan } from "../actions";
import { PlanForm } from "../PlanForm";

export const metadata: Metadata = {
  title: "Planı Düzenle | VYKTag Yönetim",
};

export default async function EditSubscriptionPlanPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{plan.name}</h1>
      <div className="mt-6">
        <PlanForm
          action={updatePlan.bind(null, planId)}
          submitLabel="Değişiklikleri kaydet"
          initial={{
            name: plan.name,
            slug: plan.slug,
            description: plan.description,
            priceKurus: plan.priceKurus,
            interval: plan.interval,
            features: Array.isArray(plan.features) ? (plan.features as string[]) : [],
            iyzicoPricingPlanRef: plan.iyzicoPricingPlanRef,
            isActive: plan.isActive,
          }}
        />
      </div>
    </div>
  );
}
