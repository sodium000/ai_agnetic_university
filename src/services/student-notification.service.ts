import apiFetch from "@/lib/apiClient";
import type {
  MarkReadApiResponse,
  Notification,
} from "@/types/student-notification";

function extractNotifications(payload: unknown): Notification[] | null {
  if (Array.isArray(payload)) return payload as Notification[];
  if (!payload || typeof payload !== "object") return null;

  const response = payload as Record<string, unknown>;
  for (const key of ["data", "notifications", "items", "results", "result"]) {
    const value = response[key];
    if (Array.isArray(value)) return value as Notification[];
    if (value && typeof value === "object") {
      const nested = extractNotifications(value);
      if (nested) return nested;
    }
  }

  return null;
}

/**
 * GET /api/v1/student/me/notifications
 * Returns all notifications for the logged-in student.
 */
export async function fetchNotifications(
  unreadOnly?: boolean,
): Promise<Notification[]> {
  const url = unreadOnly
    ? "/api/v1/student/me/notifications?unreadOnly=true"
    : "/api/v1/student/me/notifications";

  const response = await apiFetch<unknown>(url);
  const notifications = extractNotifications(response);
  if (notifications) return notifications;

  const serverMessage =
    response &&
    typeof response === "object" &&
    "success" in response &&
    response.success === false &&
    "message" in response &&
    typeof response.message === "string"
      ? response.message
      : null;
  throw new Error(
    serverMessage ?? "Expected an array of notifications in the API response",
  );
}

export async function fetchNotificationDetail(
  id: string,
): Promise<Notification> {
  const response = await apiFetch<MarkReadApiResponse>(
    `/api/v1/student/me/notifications/${encodeURIComponent(id)}`,
  );
  if (response?.data) {
    return response.data;
  }
  throw new Error(response?.message || "Failed to load notification");
}

export const fetchNotification = fetchNotificationDetail;

/**
 * PATCH /api/v1/student/me/notifications/:id/read
 * Marks a specific notification as read.
 */
export async function markNotificationRead(
  id: string,
): Promise<Notification> {
  const response = await apiFetch<MarkReadApiResponse>(
    `/api/v1/student/me/notifications/${encodeURIComponent(id)}/read`,
    { method: "PATCH" },
  );
  if (response?.data) {
    return response.data;
  }
  throw new Error(response?.message || "Failed to mark notification as read");
}

/**
 * PATCH /api/v1/student/me/notifications/read-all
 * Marks all notifications as read.
 */
export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch("/api/v1/student/me/notifications/read-all", {
    method: "PATCH",
  });
}

export const mockNotifications: Notification[] = [
  {
    id: "notif-mock-1",
    userId: "user-mock-uuid",
    title: "Enrollment Window Open",
    message:
      "Course registration for Spring 2026 semester is now open. Enroll by November 30th.",
    type: "INFO",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "notif-mock-2",
    userId: "user-mock-uuid",
    title: "Fee Payment Due",
    message:
      "Your tuition fee invoice (INV-2026-001) of BDT 15,000 is due on October 31st.",
    type: "WARNING",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "notif-mock-3",
    userId: "user-mock-uuid",
    title: "Mid-Term Results Published",
    message:
      "Mid-term examination results for Fall 2026 are now available in the Grades section.",
    type: "SUCCESS",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "notif-mock-4",
    userId: "user-mock-uuid",
    title: "Library Book Overdue",
    message:
      "You have 2 overdue library books. Please return them to avoid late fee charges.",
    type: "ALERT",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "notif-mock-5",
    userId: "user-mock-uuid",
    title: "Campus Holiday Notice",
    message:
      "The university campus will remain closed on November 5th for National Day celebrations.",
    type: "INFO",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];
