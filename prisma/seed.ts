import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { seedCatalog } from "../src/lib/catalog-seed";

async function main() {
  await seedCatalog(prisma);
  console.log("Seed tamamlandı: ürün kataloğu ve abonelik planları veritabanına işlendi.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
