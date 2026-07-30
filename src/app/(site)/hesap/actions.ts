"use server";

import { revalidatePath } from "next/cache";
import { BillingProfileType } from "@/generated/prisma/client";
import { verifyCustomerSession } from "@/lib/auth/customer-session";
import { verifyPassword } from "@/lib/auth";
import {
  confirmTotpEnrollment as confirmTotpEnrollmentForUser,
  disableTwoFactor as disableTwoFactorForUser,
  enableEmailTwoFactor,
  startTotpEnrollment as startTotpEnrollmentForUser,
} from "@/lib/auth/two-factor";
import { createAddress, deleteAddressForUser, setDefaultAddressForUser } from "@/lib/account/addresses";
import {
  createBillingProfile,
  deleteBillingProfileForUser,
  isValidNationalId,
  isValidTaxNumber,
  setDefaultBillingProfileForUser,
} from "@/lib/account/billing-profiles";

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

  await createAddress(user.id, { fullName, phone, addressLine1, addressLine2, city, district, postalCode, isDefault });

  revalidatePath("/hesap");
  return {};
}

export async function deleteAddress(addressId: string): Promise<void> {
  const user = await verifyCustomerSession();
  await deleteAddressForUser(addressId, user.id);
  revalidatePath("/hesap");
}

export async function setDefaultAddress(addressId: string): Promise<void> {
  const user = await verifyCustomerSession();
  await setDefaultAddressForUser(addressId, user.id);
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

  await createBillingProfile(user.id, {
    type,
    title,
    addressLine1,
    addressLine2,
    city,
    district,
    postalCode,
    isDefault,
    fullName,
    nationalId,
    companyName,
    taxOffice,
    taxNumber,
  });

  revalidatePath("/hesap");
  return {};
}

export async function deleteBillingProfile(billingProfileId: string): Promise<void> {
  const user = await verifyCustomerSession();
  await deleteBillingProfileForUser(billingProfileId, user.id);
  revalidatePath("/hesap");
}

export async function setDefaultBillingProfile(billingProfileId: string): Promise<void> {
  const user = await verifyCustomerSession();
  await setDefaultBillingProfileForUser(billingProfileId, user.id);
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

  await enableEmailTwoFactor(user.id);
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

  await disableTwoFactorForUser(user.id);
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

  return startTotpEnrollmentForUser(user.id, user.email);
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

  const result = await confirmTotpEnrollmentForUser(user.id, code);
  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/hesap");
  return { success: true };
}
