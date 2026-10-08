"use client";

import { ArrowLeft, BookOpen, Calendar, Clock, Layers } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnrollmentHeaderProps {
  enrolledCount: number;
  totalCredits: number;
  maxCredits?: number;
  semesterName?: string;
}

export function EnrollmentHeader({
  enrolledCount,
  totalCredits,
  maxCredits = 21,
  semesterName = "Fall 2026",
}: EnrollmentHeaderProps) {
  const creditPercentage = Math.min(
    Math.round((totalCredits / maxCredits) * 100),
    100,
  );

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/student"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer",
              )}
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-muted-foreground">•</span>
            <Badge variant="secondary" className="text-xs">
              {semesterName}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <Badge
              variant="outline"
              className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs"
            >
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Enrollment Window Open</span>
            </Badge>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Course Registration & Enrollment
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Select course sections for the upcoming academic semester. You can
            review your registered courses and drop if needed.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Enrolled Courses */}
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Registered Courses
              </p>
              <p className="text-2xl font-bold text-foreground">
                {enrolledCount}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">
                  courses
                </span>
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <BookOpen className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Registered Credits */}
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Registered Credits
              </p>
              <p className="text-2xl font-bold text-foreground">
                {totalCredits}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">
                  / {maxCredits} max
                </span>
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
              <Layers className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Credit Limit Progress */}
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Credit Workload
              </p>
              <span className="text-xs font-semibold text-foreground">
                {creditPercentage}%
              </span>
            </div>
            <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  creditPercentage >= 90 ? "bg-amber-500" : "bg-primary",
                )}
                style={{ width: `${creditPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Add/Drop Period */}
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Add/Drop Deadline
              </p>
              <p className="text-sm font-semibold text-foreground">
                30 October 2026
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" /> 21 days remaining
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
              <Calendar className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
