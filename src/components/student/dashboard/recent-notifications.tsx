import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Notification, NotificationType } from "@/types/student-dashboard";

function NotificationTypeIcon({ type }: { type: NotificationType }) {
  switch (type) {
    case "WARNING":
      return <AlertTriangle className="size-4 text-amber-500" />;
    case "SUCCESS":
      return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "ALERT":
      return <AlertCircle className="size-4 text-destructive" />;
    default:
      return <Info className="size-4 text-primary" />;
  }
}

interface RecentNotificationsProps {
  notifications: Notification[];
}

export function RecentNotifications({
  notifications,
}: RecentNotificationsProps) {
  const hasNotifications = notifications && notifications.length > 0;
  const unreadCount = hasNotifications
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  return (
    <Card className="flex flex-col border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold sm:text-lg">
              Recent Notifications
            </CardTitle>
            {unreadCount > 0 ? (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} Unread
              </Badge>
            ) : null}
          </div>
          <CardDescription>
            Official university announcements and academic alerts
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {hasNotifications ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3.5 rounded-lg border p-3.5 transition-colors hover:bg-muted/30 ${
                notification.isRead
                  ? "border-border/50 bg-card"
                  : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/80">
                <NotificationTypeIcon type={notification.type} />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm">
                      {notification.title}
                    </h3>
                    {!notification.isRead ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] py-0 px-1.5"
                      >
                        New
                      </Badge>
                    ) : null}
                  </div>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {notification.createdAt}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Bell className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              No recent notifications
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              You are completely up to date.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
