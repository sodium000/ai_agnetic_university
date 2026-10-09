"use client";

import {
  Banknote,
  BookMarked,
  BookOpenIcon,
  Building2,
  CalendarIcon,
  CircleHelpIcon,
  ClipboardCheck,
  FileBarChart2,
  GraduationCap,
  Layers,
  SearchIcon,
  Settings2Icon,
  ShieldCheck,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navMain = [
  { title: "Students", url: "/admin/students", icon: <UsersIcon /> },
  { title: "Faculty", url: "/admin/faculty", icon: <GraduationCap /> },
  { title: "Departments", url: "/admin/departments", icon: <Building2 /> },
  { title: "Programs", url: "/admin/programs", icon: <BookMarked /> },
  { title: "Courses", url: "/admin/courses", icon: <BookOpenIcon /> },
  { title: "Semesters", url: "/admin/semesters", icon: <CalendarIcon /> },
  { title: "Sections", url: "/admin/sections", icon: <Layers /> },
  { title: "Enrollments", url: "/admin/enrollments", icon: <ClipboardCheck /> },
  { title: "Payments", url: "/admin/payments", icon: <Banknote /> },
  { title: "Reports", url: "/admin/reports", icon: <FileBarChart2 /> },
];

const navSecondary = [
  { title: "System Settings", url: "#", icon: <Settings2Icon /> },
  { title: "Audit Logs", url: "#", icon: <ShieldCheck /> },
  { title: "Help & Docs", url: "#", icon: <CircleHelpIcon /> },
];

const documents = [
  { name: "Academic Reports", url: "/admin/reports", icon: <FileBarChart2 /> },
  { name: "Financial Ledger", url: "/admin/payments", icon: <Banknote /> },
];

const adminUser = {
  name: "System Administrator",
  email: "admin@university.edu",
  avatar: "/avatars/shadcn.jpg",
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/admin" />}
            >
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ShieldCheck className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-sm font-semibold tracking-tight">Admin Console</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">University HQ</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={adminUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
