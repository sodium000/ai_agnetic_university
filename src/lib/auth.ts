/**
 * Role routing helpers.
 * Decode accessToken with `jose` (payload only — no JWT secret in this app).
 * The API still verifies the signature with its own secret.
 */

import { decodeJwt } from "jose";

export type UserRole = "STUDENT" | "FACULTY" | "ADMIN" | "SUPER_ADMIN";

export const AUTH_COOKIE_NAMES = [
  "accessToken",
  "refreshToken",
  "userRole",
] as const;

const KNOWN_ROLES: readonly UserRole[] = [
  "STUDENT",
  "FACULTY",
  "ADMIN",
  "SUPER_ADMIN",
];

export function normalizeRole(role?: string | null): UserRole | null {
  if (!role) return null;

  const upper = role.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const mapped = upper === "SUPERADMIN" ? "SUPER_ADMIN" : upper;

  return KNOWN_ROLES.includes(mapped as UserRole)
    ? (mapped as UserRole)
    : null;
}

function pickRole(value: unknown): UserRole | null {
  if (typeof value === "string") return normalizeRole(value);
  if (Array.isArray(value) && value.length > 0) return pickRole(value[0]);
  if (value && typeof value === "object" && "role" in value) {
    return pickRole((value as { role?: unknown }).role);
  }
  return null;
}

/** Read role from the access token payload. Does not verify the signature. */
export function getRoleFromAccessToken(token?: string | null): UserRole | null {
  if (!token) return null;

  try {
    const payload = decodeJwt(token);
    return (
      pickRole(payload.role) ||
      pickRole(payload.userRole) ||
      pickRole(payload.UserRole) ||
      pickRole(payload.roles) ||
      pickRole(payload.user)
    );
  } catch {
    return null;
  }
}

export function getSessionRole(
  accessToken?: string | null,
  roleCookie?: string | null,
): UserRole | null {
  return getRoleFromAccessToken(accessToken) ?? normalizeRole(roleCookie);
}

export function getRoleDashboardPath(role?: UserRole | string | null): string {
  switch (normalizeRole(role ?? null)) {
    case "FACULTY":
      return "/faculty";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
    case "STUDENT":
      return "/student";
    default:
      return "/login";
  }
}

export function isPathAllowedForRole(
  pathname: string,
  role: UserRole,
): boolean {
  const prefix = getRoleDashboardPath(role);
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getSafeRedirectPath(
  role: UserRole | null,
  nextUrl?: string | null,
): string {
  const home = getRoleDashboardPath(role);

  if (!nextUrl || !nextUrl.startsWith("/") || nextUrl.startsWith("//")) {
    return home;
  }

  if (role && isPathAllowedForRole(nextUrl, role)) {
    return nextUrl;
  }

  return home;
}

export function persistRoleCookie(role?: string | null) {
  const normalized = normalizeRole(role);
  if (typeof document === "undefined" || !normalized) return;

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `userRole=${normalized}; path=/; expires=${expires}; SameSite=Lax`;
}

export function clearBrowserAuthCookies() {
  if (typeof document === "undefined") return;

  for (const name of AUTH_COOKIE_NAMES) {
    document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

/** @deprecated use getRoleFromAccessToken */
export const getRoleFromToken = getRoleFromAccessToken;
