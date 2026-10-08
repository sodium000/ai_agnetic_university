"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  RefreshCw,
  Sparkles,
  Users,
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
  fetchFacultySections,
  mockSections,
} from "@/services/faculty.service";
import type { Section } from "@/types/faculty";

function SectionCard({ section }: { section: Section }) {
  const fill = Math.round((section.enrolledCount / section.capacity) * 100);
  const fillColor =
    fill >= 90 ? "bg-destructive" : fill >= 75 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base font-semibold">
                {section.course.code}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {section.name}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  section.semester.status === "ONGOING"
                    ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                    : "",
                )}
              >
                {section.semester.status}
              </Badge>
            </div>
            <CardDescription className="text-sm font-medium text-foreground/80">
              {section.course.title}
            </CardDescription>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {section.schedule && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Schedule:</span>
            <span>{section.schedule}</span>
          </div>
        )}
        {section.room && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Room:</span>
            <span>{section.room}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Semester:</span>
          <span>{section.semester.name}</span>
        </div>

        {/* Enrollment Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="size-3.5" />
              Enrollment
            </span>
            <span className="font-medium">
              {section.enrolledCount} / {section.capacity}
              <span className="text-muted-foreground ml-1">({fill}%)</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", fillColor)}
              style={{ width: `${fill}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/faculty/students?sectionId=${section.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "flex-1 h-8 text-xs cursor-pointer",
            )}
          >
            <Users className="size-3.5 mr-1.5" />
            Students
          </Link>
          <Link
            href={`/faculty/attendance?sectionId=${section.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "flex-1 h-8 text-xs cursor-pointer",
            )}
          >
            Attendance
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function FacultySectionsView() {
  const [demoFallback, setDemoFallback] = useState<Section[] | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["faculty-sections"],
    queryFn: () => fetchFacultySections(),
    retry: 1,
    staleTime: 30000,
  });

  const sections = data ?? demoFallback ?? [];

  if (isError && !demoFallback) {
    const msg = error instanceof Error ? error.message : "Failed to load sections.";
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
        <Link href="/faculty" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1.5 px-2 text-xs text-muted-foreground w-fit cursor-pointer")}>
          <ArrowLeft className="size-3.5" /> Back to Dashboard
        </Link>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <AlertTriangle className="size-10 text-destructive mb-3" />
            <h2 className="font-bold text-lg">Failed to Load Sections</h2>
            <p className="text-sm text-muted-foreground mt-1">{msg}</p>
            <div className="mt-5 flex gap-3">
              <Button onClick={() => refetch()} disabled={isFetching} className="gap-2 text-xs">
                <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} /> Retry
              </Button>
              <Button variant="outline" onClick={() => setDemoFallback(mockSections)} className="gap-2 text-xs border-primary/20 text-primary">
                <Sparkles className="size-3.5" /> Load Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/faculty" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1.5 px-2 text-xs text-muted-foreground cursor-pointer")}>
              <ArrowLeft className="size-3.5" /> Back to Dashboard
            </Link>
            {demoFallback && (
              <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-600 bg-amber-500/10">Demo Mode</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Sections</h1>
          <p className="text-sm text-muted-foreground">Course sections assigned to you this semester</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching} className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground self-start cursor-pointer">
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Grid */}
      {isLoading && !sections.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : sections.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => <SectionCard key={s.id} section={s} />)}
        </div>
      ) : (
        <Card className="border-border/80">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <BookOpen className="size-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm font-medium">No sections assigned</p>
            <p className="text-xs text-muted-foreground mt-1">You have no course sections this semester.</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
