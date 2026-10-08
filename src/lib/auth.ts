/**
 * Auth utilities — token storage, JWT decoding, role detection
 * All browser-only (localStorage). SSR-safe with typeof window checks.
 */

export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

export interface DecodedToken {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/** Store access token in localStorage */
export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
}

/** Retrieve the access token */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken")
  );
}

/** Remove all auth tokens */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("token");
  sessionStorage.removeItem("accessToken");
}

/**
 * Decode a JWT payload without verifying the signature.
 * Suitable for client-side role detection only.
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Pad base64url
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(padded);
    return JSON.parse(decoded) as DecodedToken;
  } catch {
    return null;
  }
}

/** Get the current user's role from the stored token, or null if not logged in */
export function getCurrentRole(): UserRole | null {
  const token = getAccessToken();
  if (!token) return null;
  const decoded = decodeJWT(token);
  return decoded?.role ?? null;
}

/** Get the current user's decoded payload */
export function getCurrentUser(): DecodedToken | null {
  const token = getAccessToken();
  if (!token) return null;
  return decodeJWT(token);
}

/** Determine the home path for a given role */
export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case "FACULTY":
      return "/faculty";
    case "ADMIN":
      return "/admin";
    case "STUDENT":
    default:
      return "/student";
  }
}
