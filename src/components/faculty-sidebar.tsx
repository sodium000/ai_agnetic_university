"use client";

import {
  BellIcon,
  BookOpenIcon,
  CircleHelpIcon,
  ClipboardListIcon,
  CommandIcon,
  FileChartColumnIcon,
  FileTextIcon,
  GraduationCap,
  SearchIcon,
  Settings2Icon,
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
  { title: "My Sections", url: "/faculty/sections", icon: <BookOpenIcon /> },
  { title: "Students", url: "/faculty/students", icon: <UsersIcon /> },
  {
    title: "Assignments",
    url: "/faculty/assignments",
    icon: <ClipboardListIcon />,
  },
  { title: "Exams", url: "/faculty/exams", icon: <GraduationCap /> },
  { title: "Attendance", url: "/faculty/attendance", icon: <FileTextIcon /> },
  { title: "Results", url: "/faculty/results", icon: <FileChartColumnIcon /> },
];

const navSecondary = [
  { title: "Settings", url: "#", icon: <Settings2Icon /> },
  { title: "Get Help", url: "#", icon: <CircleHelpIcon /> },
  { title: "Search", url: "#", icon: <SearchIcon /> },
];

const documents = [
  { name: "Notifications", url: "/faculty/notifications", icon: <BellIcon /> },
  { name: "Profile", url: "/faculty/profile", icon: <UsersIcon /> },
];

export function FacultySidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/faculty" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Faculty Portal</span>
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
        <NavUser userRole="FACULTY" />
      </SidebarFooter>
    </Sidebar>
  );
}
