"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const portal = segments[0] || "student";
  const subPage = segments[1]
    ? segments[1]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : null;

  const portalHome = `/${portal}`;
  const portalName =
    portal === "admin"
      ? "Admin Portal"
      : portal === "faculty"
        ? "Faculty Portal"
        : "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-xs transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {subPage ? (
                <BreadcrumbLink render={<Link href={portalHome} />}>
                  {portalName}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="font-semibold text-foreground">
                  {portalName}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {subPage && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-foreground">
                    {subPage}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
