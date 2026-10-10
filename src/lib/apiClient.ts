import { type FetchOptions, ofetch } from "ofetch";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const rawApiFetch = ofetch.create({
  baseURL: API_BASE_URL,
  credentials: "include",
});

const refreshEndpoint = "/auth/api/v1/refresh-token";
let refreshInFlight: Promise<void> | null = null;

function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined;
  }
  const response = error.response;
  if (
    typeof response === "object" &&
    response !== null &&
    "status" in response &&
    typeof response.status === "number"
  ) {
    return response.status;
  }
  return undefined;
}

async function refreshSession(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = rawApiFetch(refreshEndpoint, { method: "POST" })
      .then(() => undefined)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  await refreshInFlight;
}

async function apiFetch<T>(
  request: string,
  options?: FetchOptions<"json">,
): Promise<T> {
  try {
    return await rawApiFetch<T>(request, options);
  } catch (error: unknown) {
    if (
      getHttpStatus(error) !== 401 ||
      request.includes("/login") ||
      request === refreshEndpoint
    ) {
      throw error;
    }

    await refreshSession();
    return rawApiFetch<T>(request, options);
  }
}

/** Try documented path first, then a legacy alias. */
export async function apiFetchFirst<T>(
  paths: string[],
  options?: FetchOptions<"json">,
): Promise<T> {
  let lastError: unknown;
  for (const path of paths) {
    try {
      return await apiFetch<T>(path, options);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export default apiFetch;
