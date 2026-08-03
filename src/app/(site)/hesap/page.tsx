import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { verifyCustomerSession } from "@/lib/auth/customer-session";
import { deleteAddress, deleteBillingProfile, setDefaultAddress, setDefaultBillingProfile } from "./actions";
import { LogoutForm } from "./LogoutForm";
import { AddAddressForm } from "./AddAddressForm";
import { AddBillingProfileForm } from "./AddBillingProfileForm";
import { TwoFactorToggleForm } from "./TwoFactorToggleForm";
import { Alert, Badge, Button, buttonVariants } from "@/components/ui";

export const metadata = {
  title: "Hesabım",
};

export default async function HesapPage({
  searchParams,
}: {
  searchParams: Promise<{ abonelik?: string }>;
}) {
  const { abonelik } = await searchParams;
  const user = await verifyCustomerSession();
  const [addresses, billingProfiles] = await Promise.all([
    prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    prisma.billingProfile.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {abonelik === "basarili" && (
        <Alert variant="success" className="mb-8">
          Aboneliğiniz başarıyla başlatıldı.
        </Alert>
      )}
      {abonelik === "hata" && (
        <Alert variant="danger" className="mb-8">
          Abonelik işlemi tamamlanamadı. Kartınızdan tutar çekildiyse ve bu mesajı görüyorsanız
          lütfen bizimle iletişime geçin.
        </Alert>
      )}
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hesabım</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {`${user.fullName} · ${user.email}`}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {user.role === UserRole.ADMIN && (
            <Link href="/admin/siparisler" className={buttonVariants({ variant: "muted", size: "sm" })}>
              Yönetim Paneli
            </Link>
          )}
          <LogoutForm />
        </div>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Adreslerim</h2>

        {addresses.length > 0 && (
          <ul className="mb-6 space-y-3">
            {addresses.map((address) => (
              <li
                key={address.id}
                className="rounded-2xl border border-zinc-200 p-4 text-sm dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {address.fullName}
                      {address.isDefault && (
                        <>
                          {" "}
                          <Badge variant="brand" size="sm">
                            Varsayılan
                          </Badge>
                        </>
                      )}
                    </p>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {`${address.district} / ${address.city} ${address.postalCode}`}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400">{address.phone}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {!address.isDefault && (
                      <form action={setDefaultAddress.bind(null, address.id)}>
                        <Button type="submit" variant="link" className="text-xs hover:no-underline">
                          Varsayılan yap
                        </Button>
                      </form>
                    )}
                    <form action={deleteAddress.bind(null, address.id)}>
                      <Button
                        type="submit"
                        variant="link"
                        className="text-xs text-red-600 hover:text-red-700 hover:no-underline"
                      >
                        Sil
                      </Button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <AddAddressForm />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Fatura Bilgilerim</h2>

        {billingProfiles.length > 0 && (
          <ul className="mb-6 space-y-3">
            {billingProfiles.map((profile) => (
              <li
                key={profile.id}
                className="rounded-2xl border border-zinc-200 p-4 text-sm dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {profile.title}{" "}
                      <Badge size="sm">{profile.type === "CORPORATE" ? "Kurumsal" : "Şahıs"}</Badge>
                      {profile.isDefault && (
                        <>
                          {" "}
                          <Badge variant="brand" size="sm">
                            Varsayılan
                          </Badge>
                        </>
                      )}
                    </p>
                    {profile.type === "CORPORATE" ? (
                      <>
                        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{profile.companyName}</p>
                        <p className="text-zinc-600 dark:text-zinc-400">
                          {`${profile.taxOffice} V.D. · ${profile.taxNumber}`}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{profile.fullName}</p>
                        <p className="text-zinc-600 dark:text-zinc-400">{`TCKN: ${profile.nationalId}`}</p>
                      </>
                    )}
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {profile.addressLine1}
                      {profile.addressLine2 ? `, ${profile.addressLine2}` : ""}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      {`${profile.district} / ${profile.city} ${profile.postalCode}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {!profile.isDefault && (
                      <form action={setDefaultBillingProfile.bind(null, profile.id)}>
                        <Button type="submit" variant="link" className="text-xs hover:no-underline">
                          Varsayılan yap
                        </Button>
                      </form>
                    )}
                    <form action={deleteBillingProfile.bind(null, profile.id)}>
                      <Button
                        type="submit"
                        variant="link"
                        className="text-xs text-red-600 hover:text-red-700 hover:no-underline"
                      >
                        Sil
                      </Button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <AddBillingProfileForm />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Güvenlik</h2>
        <TwoFactorToggleForm enabled={user.twoFactorEnabled} method={user.twoFactorMethod} />
      </section>
    </div>
  );
}
