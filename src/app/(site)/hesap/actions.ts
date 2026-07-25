"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BillingProfileType } from "@/generated/prisma/client";
import { verifyCustomerSession } from "@/lib/customer-session";
import { verifyPassword } from "@/lib/auth";
import { isValidNationalId, isValidTaxNumber } from "@/lib/billing-profiles";

export interface AddressFormState {
  error?: string;
}

export async function addAddress(_prevState: AddressFormState, formData: FormData): Promise<AddressFormState> {
  const user = await verifyCustomerSession();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const addressLine1 = String(formData.get("addressLine1") ?? "").trim();
  const addressLine2 = String(formData.get("addressLine2") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const isDefault = formData.get("isDefault") === "on";

  if (!fullName || !phone || !addressLine1 || !city || !district || !postalCode) {
    return { error: "Ad soyad, telefon, adres, il, ilçe ve posta kodu zorunludur." };
  }

  await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } });
    }
    await tx.address.create({
      data: {
        userId: user.id,
        fullName,
        phone,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        district,
        postalCode,
        isDefault,
      },
    });
  });

  revalidatePath("/hesap");
  return {};
}

export async function deleteAddress(addressId: string): Promise<void> {
  const user = await verifyCustomerSession();
  await prisma.address.deleteMany({ where: { id: addressId, userId: user.id } });
  revalidatePath("/hesap");
}

export async function setDefaultAddress(addressId: string): Promise<void> {
  const user = await verifyCustomerSession();

  await prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({ where: { id: addressId, userId: user.id } });
    if (!address) {
      return;
    }
    await tx.address.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } });
    await tx.address.update({ where: { id: addressId }, data: { isDefault: true } });
  });

  revalidatePath("/hesap");
}

export interface BillingProfileFormState {
  error?: string;
}

export async function addBillingProfile(
  _prevState: BillingProfileFormState,
  formData: FormData,
): Promise<BillingProfileFormState> {
  const user = await verifyCustomerSession();

  const type = String(formData.get("type") ?? "") === "CORPORATE" ? BillingProfileType.CORPORATE : BillingProfileType.INDIVIDUAL;
  const title = String(formData.get("title") ?? "").trim();
  const addressLine1 = String(formData.get("addressLine1") ?? "").trim();
  const addressLine2 = String(formData.get("addressLine2") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const postalCode = String(formData.get("postalCode") ?? "").trim();
  const isDefault = formData.get("isDefault") === "on";

  if (!title || !addressLine1 || !city || !district || !postalCode) {
    return { error: "Başlık, adres, il, ilçe ve posta kodu zorunludur." };
  }

  let fullName: string | null = null;
  let nationalId: string | null = null;
  let companyName: string | null = null;
  let taxOffice: string | null = null;
  let taxNumber: string | null = null;

  if (type === BillingProfileType.INDIVIDUAL) {
    fullName = String(formData.get("fullName") ?? "").trim();
    nationalId = String(formData.get("nationalId") ?? "").trim();
    if (!fullName || !isValidNationalId(nationalId)) {
      return { error: "Ad soyad ve geçerli bir TC Kimlik No (11 hane) girin." };
    }
  } else {
    companyName = String(formData.get("companyName") ?? "").trim();
    taxOffice = String(formData.get("taxOffice") ?? "").trim();
    taxNumber = String(formData.get("taxNumber") ?? "").trim();
    if (!companyName || !taxOffice || !isValidTaxNumber(taxNumber)) {
      return { error: "Firma unvanı, vergi dairesi ve geçerli bir vergi numarası (10 hane) girin." };
    }
  }

  await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.billingProfile.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } });
    }
    await tx.billingProfile.create({
      data: {
        userId: user.id,
        type,
        title,
        fullName,
        nationalId,
        companyName,
        taxOffice,
        taxNumber,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        district,
        postalCode,
        isDefault,
      },
    });
  });

  revalidatePath("/hesap");
  return {};
}

export async function deleteBillingProfile(billingProfileId: string): Promise<void> {
  const user = await verifyCustomerSession();
  await prisma.billingProfile.deleteMany({ where: { id: billingProfileId, userId: user.id } });
  revalidatePath("/hesap");
}

export async function setDefaultBillingProfile(billingProfileId: string): Promise<void> {
  const user = await verifyCustomerSession();

  await prisma.$transaction(async (tx) => {
    const profile = await tx.billingProfile.findFirst({ where: { id: billingProfileId, userId: user.id } });
    if (!profile) {
      return;
    }
    await tx.billingProfile.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } });
    await tx.billingProfile.update({ where: { id: billingProfileId }, data: { isDefault: true } });
  });

  revalidatePath("/hesap");
}

export interface TwoFactorToggleState {
  error?: string;
  success?: boolean;
}

async function setTwoFactorEnabled(formData: FormData, enabled: boolean): Promise<TwoFactorToggleState> {
  const user = await verifyCustomerSession();
  const password = String(formData.get("password") ?? "");

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    return { error: "Şifre hatalı." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: enabled } });
  revalidatePath("/hesap");
  return { success: true };
}

/** İki adımlı doğrulamayı etkinleştirir. Kimlik doğrulaması için mevcut şifre yeniden istenir. */
export async function enableTwoFactor(
  _prevState: TwoFactorToggleState,
  formData: FormData,
): Promise<TwoFactorToggleState> {
  return setTwoFactorEnabled(formData, true);
}

/** İki adımlı doğrulamayı kapatır. Kimlik doğrulaması için mevcut şifre yeniden istenir. */
export async function disableTwoFactor(
  _prevState: TwoFactorToggleState,
  formData: FormData,
): Promise<TwoFactorToggleState> {
  return setTwoFactorEnabled(formData, false);
}
