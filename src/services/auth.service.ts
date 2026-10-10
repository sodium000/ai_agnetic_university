import apiFetch from "@/lib/apiClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "FACULTY" | "ADMIN" | "SUPER_ADMIN";
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
 * POST /api/v1/login
 * User login — sets HttpOnly cookies on the browser and returns tokens/user
 */
export async function loginUser(
  payload: LoginPayload,
): Promise<LoginApiResponse["data"]> {
  let response: LoginApiResponse;
  try {
    response = await apiFetch<LoginApiResponse>("/api/v1/login", {
      method: "POST",
      body: payload,
    });
  } catch (primaryErr: unknown) {
    // If backend mounted on /auth/api/v1/login, fallback gracefully
    try {
      response = await apiFetch<LoginApiResponse>("/auth/api/v1/login", {
        method: "POST",
        body: payload,
      });
    } catch {
      throw primaryErr;
    }
  }

  if (response?.data?.user || response?.data?.accessToken) {
    return response.data;
  }

  throw new Error(response?.message || "Login failed. Please try again.");
}

/**
 * POST /api/auth/logout (Next.js) → backend /api/v1/logout
 * Clears accessToken, refreshToken, and userRole on this origin.
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
 * POST /api/v1/refresh-token
 * Refreshes the accessToken using the refreshToken cookie
 */
export async function refreshAccessToken(): Promise<{
  accessToken: string;
  refreshToken?: string;
}> {
  const response = await apiFetch<{
    success: boolean;
    data: { accessToken: string; refreshToken?: string };
  }>("/api/v1/refresh-token", {
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

/**
 * Step 1: POST /api/v1/auth/register
 * Sends 6-digit OTP to the user's email and saves pending info in Redis
 */
export async function registerUser(payload: RegisterPayload) {
  try {
    return await apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: payload,
    });
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string };
    const msg = err?.data?.message || err?.message || "Registration failed";
    throw new Error(msg);
  }
}

/**
 * Step 2: POST /api/v1/auth/verifyUser
 * Verifies 6-digit OTP against Redis and creates the account
 */
export async function verifyRegistrationOtp(payload: VerifyOtpPayload) {
  try {
    return await apiFetch("/api/v1/auth/verifyUser", {
      method: "POST",
      body: payload,
    });
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string };
    const msg = err?.data?.message || err?.message || "Invalid OTP";
    throw new Error(msg);
  }
}

/**
 * Resend OTP — calls Step 1 to send a fresh code to email
 */
export async function resendRegistrationOtp(email: string) {
  try {
    return await apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: { email },
    });
  } catch (error: unknown) {
    const err = error as { data?: { message?: string }; message?: string };
    const msg = err?.data?.message || err?.message || "Unable to resend OTP";
    throw new Error(msg);
  }
}

/**
 * GET /api/v1/me/:userId
 * Retrieves user info for a given ID
 */
export async function fetchUserInfo(userId: string): Promise<AuthUser> {
  const response = await apiFetch<{ success: boolean; data: AuthUser }>(
    `/api/v1/me/${encodeURIComponent(userId)}`,
  );
  return response.data;
}

/**
 * POST /api/v1/forgot-password
 * Sends password reset OTP to user email
 */
export async function forgotPassword(email: string) {
  return await apiFetch("/api/v1/forgot-password", {
    method: "POST",
    body: { email },
  });
}

/**
 * POST /api/v1/reset-password
 * Resets password with verified OTP
 */
export async function resetPassword(payload: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  return await apiFetch("/api/v1/reset-password", {
    method: "POST",
    body: payload,
  });
}
