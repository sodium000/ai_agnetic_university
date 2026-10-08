import type { Metadata } from "next";
import { NotificationsView } from "@/components/student/notifications/notifications-view";

export const metadata: Metadata = {
  title: "Notifications | Faculty Portal",
  description: "View all your university notifications.",
};

export default function Page() {
  return <NotificationsView />;
}
