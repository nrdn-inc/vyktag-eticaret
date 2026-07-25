import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  verifyAdminSessionToken,
  verifyCustomerSessionToken,
} from "@/lib/auth";

const ADMIN_LOGIN_PATH = "/admin/giris";
const CUSTOMER_LOGIN_PATH = "/hesap/giris";
const CUSTOMER_PUBLIC_PATHS = [
  "/hesap/giris",
  "/hesap/kayit",
  "/hesap/dogrula",
  "/hesap/sifremi-unuttum",
  "/hesap/sifre-sifirla",
];

/**
 * /admin/* ve /hesap/* için iyimser (yalnızca imza/süre) kontrol yapar; DB'ye karşı asıl
 * doğrulama ilgili sayfalarda verifyAdminSession() / verifyCustomerSession() ile yapılır.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === ADMIN_LOGIN_PATH) {
      return NextResponse.next();
    }
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!verifyAdminSessionToken(token)) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }
    return NextResponse.next();
  }

  if (CUSTOMER_PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  const token = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!verifyCustomerSessionToken(token)) {
    return NextResponse.redirect(new URL(CUSTOMER_LOGIN_PATH, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/hesap/:path*"],
};
