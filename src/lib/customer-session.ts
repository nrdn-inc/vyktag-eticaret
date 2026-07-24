import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CUSTOMER_SESSION_COOKIE, verifyCustomerSessionToken } from "@/lib/auth";

const LOGIN_PATH = "/hesap/giris";

/**
 * Oturum cookie'sini veritabanına karşı doğrular (bkz. admin-session.ts'teki eşdeğeri).
 * Sayfa/Server Action başına bir kez React cache ile bellekte tutulur.
 */
export const verifyCustomerSession = cache(async () => {
  const token = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  const payload = verifyCustomerSessionToken(token);
  if (!payload) {
    redirect(LOGIN_PATH);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.emailVerifiedAt) {
    redirect(LOGIN_PATH);
  }

  return user;
});

/** Oturumu zorunlu kılmadan mevcut müşteriyi döner (giriş yapılmamışsa null); yönlendirme yapmaz. */
export const getCurrentCustomer = cache(async () => {
  const token = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  const payload = verifyCustomerSessionToken(token);
  if (!payload) {
    return null;
  }
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.emailVerifiedAt) {
    return null;
  }
  return user;
});
