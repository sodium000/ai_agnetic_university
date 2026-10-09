import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const { pathname } = request.nextUrl;

  // No token that could maintain the session
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // The session may be recoverable using the refresh token.
  if (!accessToken && refreshToken) {
    const refreshUrl = new URL("/api/auth/refresh", request.url);

    refreshUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(refreshUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/faculty/:path*", "/admin/:path*"],
};
