"use client";

import {
  BellIcon,
  CircleUserRoundIcon,
  CreditCardIcon,
  EllipsisVerticalIcon,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { clearBrowserAuthCookies } from "@/lib/auth";
import {
  type AuthUser,
  clearStoredAuthenticatedUser,
  fetchUserInfo,
  getStoredAuthenticatedUser,
  logoutUser,
  storeAuthenticatedUser,
} from "@/services/auth.service";
import { fetchFacultyProfile } from "@/services/faculty.service";
import { fetchStudentProfile } from "@/services/student-profile.service";

export function NavUser({ userRole }: { userRole: AuthUser["role"] }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { isMobile } = useSidebar();

  useEffect(() => {
    let cancelled = false;
    const cachedUser = getStoredAuthenticatedUser();
    const isMatchingRole =
      cachedUser?.role === userRole ||
      (userRole === "ADMIN" && cachedUser?.role === "SUPER_ADMIN");
    if (isMatchingRole && cachedUser) setUser(cachedUser);
    else setUser(null);

    async function loadUser() {
      try {
        let currentUser: AuthUser | null = null;
        if (userRole === "STUDENT") {
          const profile = await fetchStudentProfile();
          currentUser = { ...profile.user, role: "STUDENT" };
        } else if (userRole === "FACULTY") {
          const profile = await fetchFacultyProfile();
          currentUser = { ...profile.user, role: "FACULTY" };
        } else if (isMatchingRole && cachedUser) {
          currentUser =
            cachedUser.id === cachedUser.email
              ? cachedUser
              : await fetchUserInfo(cachedUser.id);
        }

        if (currentUser) {
          storeAuthenticatedUser(currentUser);
          if (!cancelled) setUser(currentUser);
        }
      } catch (error) {
        console.warn("Unable to refresh signed-in user details:", error);
      }
    }

    void loadUser();
    return () => {
      cancelled = true;
    };
  }, [userRole]);

  const displayName = user?.name || "User account";
  const avatar = user?.photoUrl || "";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg grayscale">
              <AvatarImage src={avatar} alt={displayName} />
              <AvatarFallback className="rounded-lg">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs text-foreground/70">
                {user?.email || ""}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={avatar} alt={displayName} />
                    <AvatarFallback className="rounded-lg">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || ""}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? (
                <>
                  <DropdownMenuItem>
                    <CircleUserRoundIcon />
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCardIcon />
                    <Link href="/admin/payments">Payments</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BellIcon />
                    <Link href="/admin/reports">Reports</Link>
                  </DropdownMenuItem>
                </>
              ) : userRole === "FACULTY" ? (
                <>
                  <DropdownMenuItem>
                    <CircleUserRoundIcon />
                    <Link href="/faculty/profile">Faculty Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BellIcon />
                    <Link href="/faculty/notifications">Notifications</Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem>
                    <CircleUserRoundIcon />
                    <Link href="/student/profile">Student Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCardIcon />
                    <Link href="/student/payments">Billing</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BellIcon />
                    <Link href="/student/notification">Notifications</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
            <DropdownMenuItem
              onClick={async () => {
                await logoutUser();
                clearStoredAuthenticatedUser();
                clearBrowserAuthCookies();
                window.location.replace("/login");
              }}
              className="cursor-pointer"
            >
              <LogOutIcon />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
