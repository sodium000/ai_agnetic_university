import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const logoutPaths = ["/api/v1/auth/logout", "/api/v1/logout"];
    for (const path of logoutPaths) {
      try {
        const res = await fetch(`${API_BASE}${path}`, {
          method: "POST",
          headers: { cookie: cookieHeader },
        });
        if (res.ok) break;
      } catch {
        // try next path
      }
    }
  } catch {
    // Always clear cookies on this app even if the API is unreachable.
  }

  const res = NextResponse.json({ success: true });

  for (const name of AUTH_COOKIE_NAMES) {
    cookieStore.delete(name);
    res.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return res;
}
