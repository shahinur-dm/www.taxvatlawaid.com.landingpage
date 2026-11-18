import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "tvla_admin_session";

async function hasValidAdminCookie(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  const secret =
    process.env.ADMIN_JWT_SECRET ||
    "fallback-dev-only-change-admin-jwt-secret-in-env";
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthed = await hasValidAdminCookie(request);

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAuthed) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/admin/login" && isAuthed) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
