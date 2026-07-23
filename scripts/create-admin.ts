import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { UserRole } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth";

/**
 * İlk (veya ek) admin kullanıcısını oluşturur/şifresini günceller.
 * Kullanım: npx tsx scripts/create-admin.ts <email> <şifre> "<ad soyad>"
 */
async function main() {
  const [email, password, fullName] = process.argv.slice(2);

  if (!email || !password || !fullName) {
    console.error('Kullanım: npx tsx scripts/create-admin.ts <email> <şifre> "<ad soyad>"');
    process.exitCode = 1;
    return;
  }

  if (password.length < 8) {
    console.error("Şifre en az 8 karakter olmalı.");
    process.exitCode = 1;
    return;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, role: UserRole.ADMIN, fullName },
    create: {
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin kullanıcı hazır: ${user.email} (${user.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
