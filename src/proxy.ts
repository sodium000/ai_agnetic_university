import { NextRequest, NextResponse } from "next/server";
import {
  getRoleDashboardPath,
  getSessionRole,
  isPathAllowedForRole,
} from "@/lib/auth";

function isAuthPage(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/registration") ||
    pathname.startsWith("/otp") ||
    pathname.startsWith("/forgot-password")
  );
}

function isDashboardPage(pathname: string) {
  return (
    pathname.startsWith("/student") ||
    pathname.startsWith("/faculty") ||
    pathname.startsWith("/admin")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const hasSession = Boolean(accessToken || refreshToken);
  const role = getSessionRole(
    accessToken,
    request.cookies.get("userRole")?.value,
  );

  // Logged in → never stay on login; go to the dashboard in the token.
  if (isAuthPage(pathname) && hasSession && role) {
    return NextResponse.redirect(
      new URL(getRoleDashboardPath(role), request.url),
    );
  }

  // Dashboard routes require a session.
  if (isDashboardPage(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role guard: ADMIN token cannot stay on /student, etc.
  if (isDashboardPage(pathname) && role && !isPathAllowedForRole(pathname, role)) {
    return NextResponse.redirect(
      new URL(getRoleDashboardPath(role), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
