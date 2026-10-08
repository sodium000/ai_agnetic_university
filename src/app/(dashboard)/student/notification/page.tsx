import type { Metadata } from "next";
import { NotificationsView } from "@/components/student/notifications/notifications-view";

export const metadata: Metadata = {
  title: "Notifications | Student Dashboard",
  description:
    "View and manage all your university notifications, announcements, and academic alerts.",
};

export default function StudentNotificationPage() {
  return <NotificationsView />;
}
