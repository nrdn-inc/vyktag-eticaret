/** Şahıs ve kurumsal fatura bilgisi profillerinin doğrulama kuralları + CRUD'u. */

import { prisma } from "@/lib/prisma";
import type { BillingProfileType } from "@/generated/prisma/client";

/**
 * TC Kimlik No'nun resmi checksum algoritmasına göre biçimsel geçerliliğini kontrol eder:
 * 11 hane, ilk hane 0 olamaz, 10. ve 11. haneler diğer hanelerden hesaplanan kontrol
 * basamaklarıyla eşleşmelidir.
 */
export function isValidNationalId(value: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(value)) {
    return false;
  }
  const digits = value.split("").map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = (((oddSum * 7 - evenSum) % 10) + 10) % 10;
  if (digit10 !== digits[9]) {
    return false;
  }
  const digit11 = (oddSum + evenSum + digits[9]) % 10;
  return digit11 === digits[10];
}

/**
 * Vergi numarasının 10 haneli sayısal biçimde olduğunu kontrol eder. Resmi checksum
 * algoritması TC Kimlik No'nunki gibi kamuya açık/güvenilir şekilde belgelenmediğinden
 * yalnızca biçim doğrulanır.
 */
export function isValidTaxNumber(value: string): boolean {
  return /^[0-9]{10}$/.test(value);
}

export interface BillingProfileInput {
  type: BillingProfileType;
  title: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
  fullName: string | null;
  nationalId: string | null;
  companyName: string | null;
  taxOffice: string | null;
  taxNumber: string | null;
}

/** Bir kullanıcıya yeni bir fatura profili ekler; `isDefault: true` ise diğerlerinin varsayılanlığını kaldırır. */
export async function createBillingProfile(userId: string, input: BillingProfileInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.billingProfile.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    await tx.billingProfile.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        fullName: input.fullName,
        nationalId: input.nationalId,
        companyName: input.companyName,
        taxOffice: input.taxOffice,
        taxNumber: input.taxNumber,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || null,
        city: input.city,
        district: input.district,
        postalCode: input.postalCode,
        isDefault: input.isDefault,
      },
    });
  });
}

/** Bir fatura profilini, yalnızca sahibi olan kullanıcı için siler (bulunamazsa hiçbir şey yapmaz). */
export async function deleteBillingProfileForUser(billingProfileId: string, userId: string): Promise<void> {
  await prisma.billingProfile.deleteMany({ where: { id: billingProfileId, userId } });
}

/** Bir fatura profilini kullanıcının varsayılanı yapar (bulunamazsa hiçbir şey yapmaz). */
export async function setDefaultBillingProfileForUser(billingProfileId: string, userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const profile = await tx.billingProfile.findFirst({ where: { id: billingProfileId, userId } });
    if (!profile) {
      return;
    }
    await tx.billingProfile.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    await tx.billingProfile.update({ where: { id: billingProfileId }, data: { isDefault: true } });
  });
}
