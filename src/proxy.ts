import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth";

const LOGIN_PATH = "/admin/giris";

/**
 * /admin/* için iyimser (yalnızca imza/süre) kontrol yapar; DB'ye karşı asıl doğrulama
 * her admin sayfasında verifyAdminSession() ile (src/lib/admin-session.ts) yapılır.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === LOGIN_PATH) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const payload = verifyAdminSessionToken(token);

  if (!payload) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
