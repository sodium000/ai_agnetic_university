import apiFetch from "@/lib/apiClient";
import { getRoleDashboardPath, getRoleFromToken } from "@/lib/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
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

export async function loginUser(
  payload: LoginPayload,
): Promise<LoginApiResponse["data"]> {
  const response = await apiFetch<LoginApiResponse>("/api/v1/auth/login", {
    method: "POST",
    body: payload,
  });

  if (response?.data?.user) {
    return response.data;
  }

  const token = response.data?.accessToken;

  if (token) {
    const role = getRoleFromToken(token);

    if (role) {
      const path = getRoleDashboardPath(role);

      if (typeof window !== "undefined") {
        window.location.href = path;
      }
    }
  }

  throw new Error(response?.message || "Login failed. Please try again.");
}

export async function logoutUser(): Promise<void> {
  try {
    await apiFetch("/api/v1/auth/logout", { method: "POST" });
  } catch {}
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
    return await apiFetch("/api/v1/auth/verifyUser", {
      method: "POST",
      body: payload,
    });
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string };
    const msg = err?.data?.message || err?.message || "Registration failed";
    throw new Error(msg);
  }
}

export async function verifyRegistrationOtp(payload: VerifyOtpPayload) {
  try {
    return await apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: payload,
    });
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string };
    const msg = err?.data?.message || err?.message || "Invalid OTP";
    throw new Error(msg);
  }
}

export async function resendRegistrationOtp(email: string) {
  try {
    return await apiFetch("/api/v1/auth/resend-registration-otp", {
      method: "POST",
      body: { email },
    });
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string };
    const msg = err?.data?.message || err?.message || "Unable to resend OTP";
    throw new Error(msg);
  }
}
