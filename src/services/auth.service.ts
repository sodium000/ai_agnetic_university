import { decodeJwt } from "jose";
import apiFetch, { apiFetchFirst } from "@/lib/apiClient";
import { getRoleFromAccessToken, normalizeRole } from "@/lib/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN" | "SUPER_ADMIN";
  status?: string;
  photoUrl?: string | null;
}

const AUTHENTICATED_USER_KEY = "authenticatedUser";

export function storeAuthenticatedUser(user: AuthUser): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTHENTICATED_USER_KEY, JSON.stringify(user));
  }
}

export function getStoredAuthenticatedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const storedUser = window.localStorage.getItem(AUTHENTICATED_USER_KEY);
  if (!storedUser) return null;

  try {
    const user: unknown = JSON.parse(storedUser);
    if (
      user &&
      typeof user === "object" &&
      "id" in user &&
      typeof user.id === "string" &&
      "name" in user &&
      typeof user.name === "string" &&
      "email" in user &&
      typeof user.email === "string" &&
      "role" in user &&
      typeof user.role === "string"
    ) {
      return user as AuthUser;
    }
  } catch {
    window.localStorage.removeItem(AUTHENTICATED_USER_KEY);
  }

  return null;
}

export function clearStoredAuthenticatedUser(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTHENTICATED_USER_KEY);
  }
}

export interface LoginApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
    user: AuthUser;
  };
}

/**
 * POST /auth/api/v1/login
 * The backend mounts its auth router at /auth and defines /api/v1/login.
 */
export async function loginUser(
  payload: LoginPayload,
): Promise<LoginApiResponse["data"]> {
  clearStoredAuthenticatedUser();
  const response = await apiFetchFirst<LoginApiResponse>(
    ["/auth/api/v1/login"],
    { method: "POST", body: payload },
  );

  if (response?.data?.user || response?.data?.accessToken) {
    if (response.data.user) {
      storeAuthenticatedUser(response.data.user);
    } else if (response.data.accessToken) {
      try {
        const claims = decodeJwt(response.data.accessToken);
        const claimUser =
          claims.user && typeof claims.user === "object"
            ? (claims.user as Record<string, unknown>)
            : {};
        const role =
          normalizeRole(
            typeof claims.role === "string"
              ? claims.role
              : typeof claimUser.role === "string"
                ? claimUser.role
                : null,
          ) ?? getRoleFromAccessToken(response.data.accessToken);
        const name =
          (typeof claims.name === "string" && claims.name) ||
          (typeof claimUser.name === "string" && claimUser.name) ||
          payload.email.split("@")[0];
        const id =
          (typeof claims.sub === "string" && claims.sub) ||
          (typeof claims.userId === "string" && claims.userId) ||
          (typeof claimUser.id === "string" && claimUser.id) ||
          payload.email;

        if (role) {
          storeAuthenticatedUser({
            id,
            name,
            email: payload.email,
            role,
          });
        }
      } catch {
        // Login still succeeds if the token does not expose readable identity claims.
      }
    }
    return response.data;
  }

  throw new Error(response?.message || "Login failed. Please try again.");
}

/**
 * POST /api/auth/logout (Next.js) → backend /api/v1/auth/logout
 */
export async function logoutUser(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {}
}

/**
 * POST /api/v1/auth/refresh-token
 */
export async function refreshAccessToken(): Promise<{
  accessToken: string;
  refreshToken?: string;
}> {
  const response = await apiFetchFirst<{
    success: boolean;
    data: { accessToken: string; refreshToken?: string };
  }>(["/api/v1/auth/refresh-token", "/api/v1/refresh-token"], {
    method: "POST",
  });
  return response.data;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export async function registerUser(payload: RegisterPayload) {
  try {
    return await apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: payload,
    });
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string };
    throw new Error(err?.data?.message || err?.message || "Registration failed");
  }
}

export async function verifyRegistrationOtp(
  payload: VerifyOtpPayload,
): Promise<LoginApiResponse["data"] | null> {
  try {
    const response = await apiFetch<LoginApiResponse>(
      "/api/v1/auth/verifyUser",
      { method: "POST", body: payload },
    );
    if (response?.data?.user) {
      storeAuthenticatedUser(response.data.user);
    }
    return response?.data ?? null;
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string };
    throw new Error(err?.data?.message || err?.message || "Invalid OTP");
  }
}

export async function resendRegistrationOtp(email: string) {
  try {
    return await apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: { email },
    });
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string };
    throw new Error(err?.data?.message || err?.message || "Unable to resend OTP");
  }
}

export async function fetchUserInfo(userId: string): Promise<AuthUser> {
  const response = await apiFetchFirst<{ success: boolean; data: AuthUser }>([
    `/api/v1/auth/me/${encodeURIComponent(userId)}`,
    `/auth/api/v1/me/${encodeURIComponent(userId)}`,
    `/api/v1/me/${encodeURIComponent(userId)}`,
  ]);
  return response.data;
}

export const fetchCurrentUser = fetchUserInfo;
export const getCurrentUser = fetchUserInfo;

export async function forgotPassword(email: string) {
  return await apiFetchFirst(
    ["/api/v1/auth/forgot-password", "/api/v1/forgot-password"],
    { method: "POST", body: { email } },
  );
}

export async function resetPassword(payload: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  return await apiFetchFirst(
    ["/api/v1/auth/reset-password", "/api/v1/reset-password"],
    { method: "POST", body: payload },
  );
}
