import { ofetch } from "ofetch";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const apiFetch = ofetch.create({
  baseURL: API_BASE_URL,
  credentials: "include",
});

/** Try documented path first, then a legacy alias. */
export async function apiFetchFirst<T>(
  paths: string[],
  options?: { method?: string; body?: unknown },
): Promise<T> {
  let lastError: unknown;
  for (const path of paths) {
    try {
      return await apiFetch<T>(path, options as never);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export default apiFetch;
