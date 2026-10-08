"use client";

import { LayoutDashboardIcon, MailIcon } from "lucide-react";
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

  const cleanPath = pathname.replace(/\/$/, "");
  const isFacultyPath = cleanPath.startsWith("/faculty");
  const dashboardHome = isFacultyPath ? "/faculty" : "/student";
  const isDashboardActive =
    cleanPath === "/student" ||
    cleanPath === "/faculty" ||
    cleanPath === "/dashboard";

  const isItemActive = (url: string, explicitActive?: boolean) => {
    if (explicitActive !== undefined) return explicitActive;
    if (!url || url === "#") return false;

    const cleanUrl = url.replace(/\/$/, "");

    // Exact match
    if (cleanPath === cleanUrl) return true;

    // Subpath match — exclude root dashboard paths from prefix matching
    if (
      cleanUrl !== "/student" &&
      cleanUrl !== "/faculty" &&
      cleanUrl !== "/dashboard" &&
      cleanUrl !== "" &&
      cleanUrl !== "/" &&
      cleanPath.startsWith(`${cleanUrl}/`)
    ) {
      return true;
    }

    return false;
  };

  const activeClasses =
    "bg-primary! text-primary-foreground! font-semibold shadow-xs [&>svg]:text-primary-foreground! hover:bg-primary/90! hover:text-primary-foreground!";

  const inactiveClasses =
    "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&>svg]:text-muted-foreground hover:[&>svg]:text-foreground font-medium";

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Dashboard"
              render={<Link href={dashboardHome} />}
              isActive={isDashboardActive}
              className={cn(
                "min-w-8 duration-150 ease-in-out cursor-pointer transition-colors",
                isDashboardActive ? activeClasses : inactiveClasses,
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
                    "cursor-pointer transition-colors duration-150 ease-in-out",
                    active ? activeClasses : inactiveClasses,
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
