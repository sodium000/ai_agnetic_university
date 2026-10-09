/**
 * Auth utilities — JWT decoding and role detection.
 * Authentication is cookie-based (HttpOnly); no client-side token storage.
 */

export type UserRole = "STUDENT" | "FACULTY" | "ADMIN" | "SUPER_ADMIN";

export interface DecodedToken {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Decode a JWT payload without verifying the signature.
 * Suitable for client-side role detection only — use only with tokens
 * received directly from the API response body (not from cookie storage).
 */
export function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(padded);
    return JSON.parse(decoded) as DecodedToken;
  } catch {
    return null;
  }
}

/** Get the role from a JWT string */
export function getRoleFromToken(token: string): UserRole | null {
  return decodeJWT(token)?.role ?? null;
}

/** Get the decoded user payload from a JWT string */
export function getUserFromToken(token: string): DecodedToken | null {
  return decodeJWT(token);
}

/** Determine the home path for a given role */
export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case "FACULTY":
      return "/faculty";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
    case "STUDENT":
      return "/student";
    default:
      return "/student";
  }
}
