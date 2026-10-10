import type { NextRequest } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const HOP_BY_HOP_HEADERS = [
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

async function proxyBackendRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const backendUrl = new URL(
    `${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`,
    `${BACKEND_API_URL.replace(/\/+$/, "")}/`,
  );
  const requestHeaders = new Headers(request.headers);

  for (const name of HOP_BY_HOP_HEADERS) requestHeaders.delete(name);
  requestHeaders.delete("origin");
  requestHeaders.delete("referer");

  try {
    const upstream = await fetch(backendUrl, {
      method: request.method,
      headers: requestHeaders,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });
    const responseHeaders = new Headers();

    upstream.headers.forEach((value, name) => {
      if (name !== "set-cookie" && !HOP_BY_HOP_HEADERS.includes(name)) {
        responseHeaders.set(name, value);
      }
    });

    for (const cookie of upstream.headers.getSetCookie()) {
      responseHeaders.append(
        "set-cookie",
        cookie.replace(/;\s*Domain=[^;]*/gi, ""),
      );
    }
    responseHeaders.set("cache-control", "no-store");

    return new Response(request.method === "HEAD" ? null : upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    console.error("Backend API proxy request failed:", error);
    return Response.json(
      { success: false, message: "The backend API is currently unavailable." },
      { status: 502 },
    );
  }
}

export {
  proxyBackendRequest as DELETE,
  proxyBackendRequest as GET,
  proxyBackendRequest as HEAD,
  proxyBackendRequest as OPTIONS,
  proxyBackendRequest as PATCH,
  proxyBackendRequest as POST,
  proxyBackendRequest as PUT,
};
