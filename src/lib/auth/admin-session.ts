import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth";

/**
 * Oturum cookie'sini veritabanına karşı doğrular (güvenli kontrol — proxy.ts'teki
 * iyimser kontrolün aksine). Sayfa/Server Action başına bir kez React cache ile bellekte tutulur.
 */
export const verifyAdminSession = cache(async () => {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const payload = verifyAdminSessionToken(token);
  if (!payload) {
    redirect("/admin/giris");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== UserRole.ADMIN) {
    redirect("/admin/giris");
  }

  return user;
});
