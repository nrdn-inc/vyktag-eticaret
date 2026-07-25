"use server";

import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { BillingProfileType, TwoFactorMethod } from "@/generated/prisma/client";
import { verifyCustomerSession } from "@/lib/customer-session";
import { verifyPassword } from "@/lib/auth";
import { isValidNationalId, isValidTaxNumber } from "@/lib/billing-profiles";
import { buildOtpAuthUrl, generateTotpSecret, verifyTotpCode } from "@/lib/totp";

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

/** İki adımlı doğrulamayı e-posta yöntemiyle etkinleştirir. Kimlik doğrulaması için mevcut şifre yeniden istenir. */
export async function enableTwoFactor(
  _prevState: TwoFactorToggleState,
  formData: FormData,
): Promise<TwoFactorToggleState> {
  const user = await verifyCustomerSession();
  const password = String(formData.get("password") ?? "");

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    return { error: "Şifre hatalı." };
  }

  // Daha önce yarım kalmış bir TOTP eşleştirmesinden kalan sır varsa temizlenir.
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true, twoFactorMethod: TwoFactorMethod.EMAIL, twoFactorSecret: null },
  });
  revalidatePath("/hesap");
  return { success: true };
}

/** İki adımlı doğrulamayı (yöntemi ne olursa olsun) kapatır. Kimlik doğrulaması için mevcut şifre yeniden istenir. */
export async function disableTwoFactor(
  _prevState: TwoFactorToggleState,
  formData: FormData,
): Promise<TwoFactorToggleState> {
  const user = await verifyCustomerSession();
  const password = String(formData.get("password") ?? "");

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    return { error: "Şifre hatalı." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, twoFactorMethod: TwoFactorMethod.EMAIL, twoFactorSecret: null },
  });
  revalidatePath("/hesap");
  return { success: true };
}

export interface TotpEnrollmentState {
  error?: string;
  secret?: string;
  otpAuthUrl?: string;
  qrDataUrl?: string;
}

/**
 * Authenticator uygulamasıyla eşleştirmenin ilk adımı: yeni bir TOTP sırrı üretir, DB'ye
 * yazar (henüz etkinleştirilmez — bkz. confirmTotpEnrollment) ve QR kod + manuel giriş için
 * sırrı döner. Kimlik doğrulaması için mevcut şifre istenir.
 */
export async function startTotpEnrollment(
  _prevState: TotpEnrollmentState,
  formData: FormData,
): Promise<TotpEnrollmentState> {
  const user = await verifyCustomerSession();
  const password = String(formData.get("password") ?? "");

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    return { error: "Şifre hatalı." };
  }

  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret } });

  const otpAuthUrl = buildOtpAuthUrl(secret, user.email);
  const qrDataUrl = await QRCode.toDataURL(otpAuthUrl);

  return { secret, otpAuthUrl, qrDataUrl };
}

export interface TotpConfirmState {
  error?: string;
  success?: boolean;
}

/** Eşleştirmenin ikinci adımı: uygulamada görünen 6 haneli kodu doğrular, doğruysa TOTP'yi etkinleştirir. */
export async function confirmTotpEnrollment(
  _prevState: TotpConfirmState,
  formData: FormData,
): Promise<TotpConfirmState> {
  const user = await verifyCustomerSession();
  const code = String(formData.get("code") ?? "").trim();

  const fresh = await prisma.user.findUnique({ where: { id: user.id } });
  if (!fresh?.twoFactorSecret) {
    return { error: "Önce authenticator uygulamasıyla eşleştirmeyi başlatın." };
  }

  if (!verifyTotpCode(fresh.twoFactorSecret, code)) {
    return { error: "Kod hatalı veya süresi dolmuş." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true, twoFactorMethod: TwoFactorMethod.TOTP },
  });
  revalidatePath("/hesap");
  return { success: true };
}
