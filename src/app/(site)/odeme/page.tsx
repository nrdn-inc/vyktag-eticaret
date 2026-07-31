import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/auth/customer-session";
import CheckoutForm, { type SavedAddress } from "./CheckoutForm";

export const metadata = {
  title: "Ödeme",
};

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

/**
 * Girişli müşteriler için kayıtlı adresleri ve iletişim bilgilerini önceden doldurur; misafir
 * ödemede (oturum yoksa) form her zamanki gibi boş gelir.
 */
export default async function CheckoutPage() {
  const user = await getCurrentCustomer();

  let savedAddresses: SavedAddress[] = [];
  let defaultContact: { firstName: string; lastName: string; email: string; phone: string } | null = null;

  if (user) {
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    savedAddresses = addresses.map((address) => ({
      id: address.id,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      district: address.district,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    }));

    const { firstName, lastName } = splitFullName(user.fullName);
    const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    defaultContact = { firstName, lastName, email: user.email, phone: defaultAddress?.phone ?? "" };
  }

  return <CheckoutForm savedAddresses={savedAddresses} defaultContact={defaultContact} />;
}
