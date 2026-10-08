import apiFetch from "@/lib/apiClient";
import { setAccessToken } from "@/lib/auth";

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

  if (response?.data?.accessToken) {
    setAccessToken(response.data.accessToken);
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }
    return response.data;
  }

  throw new Error(response?.message || "Login failed. Please try again.");
}

export async function logoutUser(): Promise<void> {
  try {
    await apiFetch("/api/v1/auth/logout", { method: "POST" });
  } catch {}
}
