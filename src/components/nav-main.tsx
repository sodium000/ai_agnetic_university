"use client";

import { CirclePlusIcon, LayoutDashboardIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
  }[];
}) {
  const pathname = usePathname();

  const isItemActive = (url: string, explicitActive?: boolean) => {
    if (explicitActive !== undefined) return explicitActive;
    if (!url || url === "#") return false;

    const cleanPath = pathname.replace(/\/$/, "");
    const cleanUrl = url.replace(/\/$/, "");

    if (cleanPath === cleanUrl) return true;

    // Handle student dashboard route aliases (/student and /dashboard)
    if (
      (cleanUrl === "/student" || cleanUrl === "/dashboard") &&
      (cleanPath === "/student" || cleanPath === "/dashboard")
    ) {
      return true;
    }

    if (
      cleanUrl !== "" &&
      cleanUrl !== "/" &&
      cleanPath.startsWith(`${cleanUrl}/`)
    ) {
      return true;
    }

    return false;
  };

  const isDashboardActive =
    pathname === "/student" || pathname === "/dashboard";

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Dashboard"
              render={<Link href="/student" />}
              isActive={isDashboardActive}
              className={cn(
                "min-w-8 duration-200 ease-linear",
                isDashboardActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <LayoutDashboardIcon />
              <span>Dashboard</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <MailIcon />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const active = isItemActive(item.url, item.isActive);
            const isLink = Boolean(item.url && item.url !== "#");

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={active}
                  render={isLink ? <Link href={item.url} /> : undefined}
                  className={cn(
                    "cursor-pointer transition-all duration-150 ease-in-out",
                    active
                      ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-2xs [&>svg]:text-primary"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&>svg]:text-muted-foreground hover:[&>svg]:text-foreground",
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
