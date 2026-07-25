import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { buildPoolConfig } from "@/lib/prisma-pool";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaMariaDb(
    buildPoolConfig(process.env.DATABASE_URL, process.env.DATABASE_CONNECTION_LIMIT),
  );
  return new PrismaClient({ adapter });
}

/**
 * Üretimde de globalThis üzerinde önbelleklenir. Next.js sunucu kodunu birden çok
 * paket (chunk) hâlinde derleyebildiği ve bu modül işlem başına birden fazla kez
 * değerlendirilebildiği için, ortama göre ayrım yapmak aynı işlem içinde birden çok
 * bağlantı havuzu oluşmasına — dolayısıyla bağlantı kotasının katlanarak tüketilmesine
 * — yol açabiliyordu. Havuz ayarları için bkz. prisma-pool.ts.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

/** Test/script sonunda havuzu kapatır; açık kalan bağlantılar sunucu kotasını tüketmesin. */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}
