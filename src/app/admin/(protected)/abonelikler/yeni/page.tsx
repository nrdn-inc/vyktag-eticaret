import type { Metadata } from "next";
import { createPlan } from "../actions";
import { PlanForm } from "../PlanForm";

export const metadata: Metadata = {
  title: "Yeni Abonelik Planı | VYKTag Yönetim",
};

export default function NewSubscriptionPlanPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Yeni Abonelik Planı</h1>
      <div className="mt-6">
        <PlanForm action={createPlan} submitLabel="Planı oluştur" />
      </div>
    </div>
  );
}
