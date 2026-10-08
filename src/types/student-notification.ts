export type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ALERT";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Notification[];
}

export interface MarkReadApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Notification;
}
