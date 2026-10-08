"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  Info,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  mockNotifications,
} from "@/services/student-notification.service";
import type {
  Notification,
  NotificationType,
} from "@/types/student-notification";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const diff = now - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function NotificationIcon({ type }: { type: NotificationType }) {
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

function NotificationTypeBadge({ type }: { type: NotificationType }) {
  const variants: Record<
    NotificationType,
    { label: string; className: string }
  > = {
    INFO: {
      label: "Info",
      className: "border-primary/30 text-primary bg-primary/10",
    },
    WARNING: {
      label: "Warning",
      className: "border-amber-500/30 text-amber-600 bg-amber-500/10",
    },
    SUCCESS: {
      label: "Success",
      className: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
    },
    ALERT: {
      label: "Alert",
      className:
        "border-destructive/30 text-destructive bg-destructive/10",
    },
  };
  const v = variants[type] ?? variants.INFO;
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] py-0 px-1.5 font-medium", v.className)}
    >
      {v.label}
    </Badge>
  );
}

// ─── Single Notification Row ──────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  isMarking: boolean;
}

function NotificationItem({
  notification,
  onMarkRead,
  isMarking,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-3.5 rounded-xl border p-4 transition-all duration-200",
        notification.isRead
          ? "border-border/50 bg-card hover:bg-muted/20"
          : "border-primary/20 bg-primary/5 hover:bg-primary/8",
      )}
    >
      {/* Icon */}
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/80">
        <NotificationIcon type={notification.type} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm leading-snug">
              {notification.title}
            </h3>
            <NotificationTypeBadge type={notification.type} />
            {!notification.isRead && (
              <span className="inline-flex size-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {notification.message}
        </p>

        {!notification.isRead && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isMarking}
            onClick={() => onMarkRead(notification.id)}
            className="mt-1 h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <CheckCheck className="size-3.5" />
            Mark as read
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function NotificationsView() {
  const queryClient = useQueryClient();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [demoFallback, setDemoFallback] = useState<Notification[] | null>(
    null,
  );

  const {
    data: apiNotifications,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["student-notifications", showUnreadOnly],
    queryFn: () => fetchNotifications(showUnreadOnly),
    retry: 1,
    staleTime: 30000,
  });

  // Mark single read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (demoFallback) {
        await new Promise((res) => setTimeout(res, 400));
        return id;
      }
      await markNotificationRead(id);
      return id;
    },
    onSuccess: (id) => {
      if (demoFallback) {
        setDemoFallback((prev) =>
          prev
            ? prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            : prev,
        );
        return;
      }
      queryClient.setQueryData(
        ["student-notifications", showUnreadOnly],
        (old: Notification[] | undefined) =>
          old ? old.map((n) => (n.id === id ? { ...n, isRead: true } : n)) : old,
      );
    },
  });

  // Mark all read
  const markAllMutation = useMutation({
    mutationFn: async () => {
      if (demoFallback) {
        await new Promise((res) => setTimeout(res, 600));
        return;
      }
      await markAllNotificationsRead();
    },
    onSuccess: () => {
      if (demoFallback) {
        setDemoFallback((prev) =>
          prev ? prev.map((n) => ({ ...n, isRead: true })) : prev,
        );
        return;
      }
      queryClient.setQueryData(
        ["student-notifications", showUnreadOnly],
        (old: Notification[] | undefined) =>
          old ? old.map((n) => ({ ...n, isRead: true })) : old,
      );
    },
  });

  const notifications = apiNotifications ?? demoFallback ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const displayed = showUnreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  // ── Error State ─────────────────────────────────────────────────────────────
  if (isError && !demoFallback) {
    const errMsg =
      error instanceof Error ? error.message : "Unable to load notifications.";

    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-5xl mx-auto w-full">
        <div>
          <Link
            href="/student"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer",
            )}
          >
            <ArrowLeft className="size-3.5" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="border-destructive/30 bg-destructive/5 shadow-xs">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive mb-4">
              <BellOff className="size-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Failed to Load Notifications
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {errMsg}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-2 cursor-pointer text-xs"
              >
                <RefreshCw
                  className={cn("size-3.5", isFetching && "animate-spin")}
                />
                {isFetching ? "Retrying..." : "Retry"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDemoFallback(mockNotifications)}
                className="gap-2 cursor-pointer text-xs border-primary/20 text-primary hover:bg-primary/5"
              >
                <Sparkles className="size-3.5" />
                Load Demo Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ── Loading Skeleton ─────────────────────────────────────────────────────────
  if (isLoading && !demoFallback) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-7 w-32 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 w-full animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </main>
    );
  }

  // ── Main View ──────────────────────────────────────────────────────────────
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/student"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer",
              )}
            >
              <ArrowLeft className="size-3.5" />
              Back to Dashboard
            </Link>
            {unreadCount > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} Unread
                </Badge>
              </>
            )}
            {demoFallback && (
              <Badge
                variant="outline"
                className="text-xs border-amber-500/40 text-amber-600 bg-amber-500/10"
              >
                Demo Mode
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Notifications
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUnreadOnly((prev) => !prev)}
            className={cn(
              "h-8 gap-1.5 px-2.5 text-xs cursor-pointer",
              showUnreadOnly && "border-primary/40 text-primary bg-primary/5",
            )}
          >
            <Bell className="size-3.5" />
            {showUnreadOnly ? "All" : "Unread only"}
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="h-8 gap-1.5 px-2.5 text-xs cursor-pointer"
            >
              <CheckCheck
                className={cn(
                  "size-3.5",
                  markAllMutation.isPending && "animate-pulse",
                )}
              />
              {markAllMutation.isPending ? "Marking..." : "Mark all read"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh notifications"
            className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Notifications Card */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold sm:text-lg">
                All Notifications
              </CardTitle>
              <CardDescription>
                Official university announcements, fee alerts, and academic
                updates
              </CardDescription>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-muted/60">
              <Bell className="size-5 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {displayed.length > 0 ? (
            displayed.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={(id) => markReadMutation.mutate(id)}
                isMarking={
                  markReadMutation.isPending &&
                  markReadMutation.variables === notification.id
                }
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Bell className="size-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">
                {showUnreadOnly
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {showUnreadOnly
                  ? "You have read all your notifications."
                  : "You are completely up to date."}
              </p>
              {showUnreadOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-xs cursor-pointer"
                  onClick={() => setShowUnreadOnly(false)}
                >
                  View all notifications
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
