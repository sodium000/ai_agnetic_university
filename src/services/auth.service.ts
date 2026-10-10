import apiFetch, { apiFetchFirst } from "@/lib/apiClient";

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
 * POST /api/v1/auth/login
 */
export async function loginUser(
  payload: LoginPayload,
): Promise<LoginApiResponse["data"]> {
  const response = await apiFetchFirst<LoginApiResponse>(
    ["/api/v1/auth/login", "/api/v1/login"],
    { method: "POST", body: payload },
  );

  if (response?.data?.user || response?.data?.accessToken) {
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
