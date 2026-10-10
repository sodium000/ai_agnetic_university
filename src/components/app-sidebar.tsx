"use client";

import {
  Banknote,
  BellIcon,
  CircleHelpIcon,
  CommandIcon,
  FileChartColumnIcon,
  FileIcon,
  GraduationCap,
  ListIcon,
  SearchIcon,
  Settings2Icon,
  Trophy,
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

const data = {
  navMain: [
    {
      title: "Current Courses",
      url: "/student/current-courses",
      icon: <ListIcon />,
    },
    {
      title: "Course Enrollment",
      url: "/student/enrollment",
      icon: <GraduationCap />,
    },
    {
      title: "Grades",
      url: "/student/grades",
      icon: <Trophy />,
    },
    {
      title: "Payments",
      url: "/student/payments",
      icon: <Banknote />,
    },
    {
      title: "Profile",
      url: "/student/profile",
      icon: <UsersIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: <Settings2Icon />,
    },
    {
      title: "Get Help",
      url: "#",
      icon: <CircleHelpIcon />,
    },
    {
      title: "Search",
      url: "#",
      icon: <SearchIcon />,
    },
  ],
  documents: [
    {
      name: "Notifications",
      url: "/student/notification",
      icon: <BellIcon />,
    },
    {
      name: "Reports",
      url: "#",
      icon: <FileChartColumnIcon />,
    },
    {
      name: "Resources",
      url: "#",
      icon: <FileIcon />,
    },
  ],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/student" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Acme Inc.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser userRole="STUDENT" />
      </SidebarFooter>
    </Sidebar>
  );
}
