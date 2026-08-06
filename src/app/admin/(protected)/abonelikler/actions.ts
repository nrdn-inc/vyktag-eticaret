"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import { SubscriptionInterval } from "@/generated/prisma/client";
import { CATALOG_CACHE_TAG } from "@/lib/catalog";
import { REVALIDATE_PATHS } from "@/lib/revalidate";
import { slugify } from "@/lib/slugify";

export interface PlanFormState {
  error?: string;
}

const INTERVALS: SubscriptionInterval[] = [
  SubscriptionInterval.MONTHLY,
  SubscriptionInterval.SIX_MONTHS,
  SubscriptionInterval.YEARLY,
  SubscriptionInterval.LIFETIME,
];

function revalidateCatalog() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
  updateTag(CATALOG_CACHE_TAG);
}

function readPlanFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceKurus = Number(formData.get("priceKurus"));
  const interval = String(formData.get("interval") ?? "");
  const featuresRaw = String(formData.get("features") ?? "");
  const features = featuresRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const iyzicoPricingPlanRef = String(formData.get("iyzicoPricingPlanRef") ?? "").trim() || null;
  const isActive = formData.get("isActive") === "on";

  return {
    name,
    slug: slugify(rawSlug || name),
    description,
    priceKurus,
    interval,
    features,
    iyzicoPricingPlanRef,
    isActive,
  };
}

function validatePlanFields(fields: ReturnType<typeof readPlanFields>): string | null {
  if (!fields.name) return "Plan adı gerekli.";
  if (!fields.slug) return "Geçerli bir slug oluşturulamadı — lütfen plan adını veya slug'ı kontrol edin.";
  if (!fields.description) return "Açıklama gerekli.";
  if (!Number.isInteger(fields.priceKurus) || fields.priceKurus < 0) return "Fiyat 0 veya daha büyük bir tam sayı (kuruş) olmalı.";
  if (!INTERVALS.includes(fields.interval as SubscriptionInterval)) return "Geçerli bir periyot seçin.";
  if (fields.features.length === 0) return "En az bir özellik satırı girin.";
  return null;
}

/** Yeni abonelik planı oluşturur. */
export async function createPlan(_prevState: PlanFormState, formData: FormData): Promise<PlanFormState> {
  await verifyAdminSession();

  const fields = readPlanFields(formData);
  const error = validatePlanFields(fields);
  if (error) {
    return { error };
  }

  const existing = await prisma.subscriptionPlan.findUnique({ where: { slug: fields.slug } });
  if (existing) {
    return { error: `"${fields.slug}" slug'ı zaten kullanılıyor. Lütfen farklı bir slug girin.` };
  }

  const plan = await prisma.subscriptionPlan.create({
    data: {
      name: fields.name,
      slug: fields.slug,
      description: fields.description,
      priceKurus: fields.priceKurus,
      interval: fields.interval as SubscriptionInterval,
      features: fields.features,
      iyzicoPricingPlanRef: fields.iyzicoPricingPlanRef,
      isActive: fields.isActive,
    },
  });

  revalidateCatalog();
  redirect(`/admin/abonelikler/${plan.id}`);
}

/** Var olan bir abonelik planını günceller. */
export async function updatePlan(
  planId: string,
  _prevState: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  await verifyAdminSession();

  const current = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!current) {
    return { error: "Plan bulunamadı." };
  }

  const fields = readPlanFields(formData);
  const error = validatePlanFields(fields);
  if (error) {
    return { error };
  }

  if (fields.slug !== current.slug) {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { slug: fields.slug } });
    if (existing) {
      return { error: `"${fields.slug}" slug'ı zaten kullanılıyor. Lütfen farklı bir slug girin.` };
    }
  }

  await prisma.subscriptionPlan.update({
    where: { id: planId },
    data: {
      name: fields.name,
      slug: fields.slug,
      description: fields.description,
      priceKurus: fields.priceKurus,
      interval: fields.interval as SubscriptionInterval,
      features: fields.features,
      iyzicoPricingPlanRef: fields.iyzicoPricingPlanRef,
      isActive: fields.isActive,
    },
  });

  revalidateCatalog();
  redirect(`/admin/abonelikler/${planId}`);
}

export interface ToggleActiveState {
  error?: string;
  isActive?: boolean;
}

/** Planı tek tıkla aktif/pasif yapar. */
export async function togglePlanActive(planId: string): Promise<ToggleActiveState> {
  await verifyAdminSession();

  const current = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!current) {
    return { error: "Plan bulunamadı." };
  }

  const updated = await prisma.subscriptionPlan.update({
    where: { id: planId },
    data: { isActive: !current.isActive },
  });

  revalidateCatalog();
  revalidatePath("/admin/abonelikler");
  return { isActive: updated.isActive };
}
