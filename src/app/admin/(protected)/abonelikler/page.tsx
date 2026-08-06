import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPriceTRY } from "@/lib/format";
import { togglePlanActive } from "./actions";
import { ActiveToggleForm } from "@/components/admin/ActiveToggleForm";
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Abonelik Planları | VYKTag Yönetim",
};

export const dynamic = "force-dynamic";

const INTERVAL_LABELS: Record<string, string> = {
  MONTHLY: "Aylık",
  SIX_MONTHS: "6 Ay",
  YEARLY: "Yıllık",
  LIFETIME: "Sınırsız",
};

async function getPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { createdAt: "asc" } });
}

export default async function AdminSubscriptionPlansPage() {
  const plans = await getPlans();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Abonelik Planları</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Fiyatlandırma sayfasındaki abonelik planlarını buradan yönetin.
          </p>
        </div>
        <Link href="/admin/abonelikler/yeni">
          <Button>Yeni Plan</Button>
        </Link>
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Periyot</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Satış durumu</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>{INTERVAL_LABELS[plan.interval] ?? plan.interval}</TableCell>
                <TableCell>{formatPriceTRY(plan.priceKurus)}</TableCell>
                <TableCell>
                  <Badge variant={plan.iyzicoPricingPlanRef ? "success" : "warning"} size="sm">
                    {plan.iyzicoPricingPlanRef ? "Aktif satışta" : "Yakında"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ActiveToggleForm action={togglePlanActive.bind(null, plan.id)} isActive={plan.isActive} />
                </TableCell>
                <TableCell>
                  <Link href={`/admin/abonelikler/${plan.id}`} className="text-sm font-medium text-brand hover:text-brand-dark">
                    Düzenle
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
