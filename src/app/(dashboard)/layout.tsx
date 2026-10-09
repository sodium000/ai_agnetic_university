"use client";

import type { ReactNode } from "react";
import React from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFaculty = pathname.startsWith("/faculty");
  const isAdmin = pathname.startsWith("/admin");

  // Faculty and Admin have their own dedicated sidebar and header layouts
  if (isFaculty || isAdmin) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
