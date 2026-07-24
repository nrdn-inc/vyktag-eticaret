"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyCustomerSession } from "@/lib/customer-session";

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
