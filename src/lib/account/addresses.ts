import { prisma } from "@/lib/prisma";

export interface AddressInput {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
}

/** Bir kullanıcıya yeni bir adres ekler; `isDefault: true` ise diğer adreslerin varsayılanlığını kaldırır. */
export async function createAddress(userId: string, input: AddressInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    await tx.address.create({
      data: {
        userId,
        fullName: input.fullName,
        phone: input.phone,
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

/** Bir adresi, yalnızca sahibi olan kullanıcı için siler (bulunamazsa/başkasınaysa sessizce hiçbir şey yapmaz). */
export async function deleteAddressForUser(addressId: string, userId: string): Promise<void> {
  await prisma.address.deleteMany({ where: { id: addressId, userId } });
}

/** Bir adresi kullanıcının varsayılan adresi yapar (bulunamazsa/başkasınaysa hiçbir şey yapmaz). */
export async function setDefaultAddressForUser(addressId: string, userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({ where: { id: addressId, userId } });
    if (!address) {
      return;
    }
    await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    await tx.address.update({ where: { id: addressId }, data: { isDefault: true } });
  });
}
