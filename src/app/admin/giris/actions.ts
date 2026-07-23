"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { ADMIN_SESSION_COOKIE, createAdminSessionToken, verifyPassword } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

const GENERIC_ERROR = "E-posta veya şifre hatalı.";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function loginAdmin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: GENERIC_ERROR };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== UserRole.ADMIN) {
    return { error: GENERIC_ERROR };
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    return { error: GENERIC_ERROR };
  }

  const token = createAdminSessionToken(user.id);
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/admin/siparisler");
}

export async function logoutAdmin(): Promise<void> {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/giris");
}
