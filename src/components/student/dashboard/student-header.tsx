import {
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  RefreshCw,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Student } from "@/types/student-dashboard";

interface StudentHeaderProps {
  student: Student;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenSchedule?: () => void;
}

export function StudentHeader({
  student,
  onRefresh,
  isRefreshing,
  onOpenSchedule,
}: StudentHeaderProps) {
  const name = student?.name || "Student";
  const firstName = name.split(" ")[0];
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="size-4 text-primary" />
            <span>Student Portal</span>
            <span>•</span>
            <span className="font-medium text-foreground">
              {student?.departmentCode || "CSE"}
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Welcome back, {firstName} 👋
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s an overview of your academic journey, schedules, and
            active enrollments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw
                className={cn("size-3.5", isRefreshing && "animate-spin")}
              />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSchedule}
            className="h-8 gap-1.5 text-xs cursor-pointer"
          >
            <CalendarDays className="size-3.5" />
            Class Schedule
          </Button>

          <Link
            href="/student/enrollment"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-8 gap-1.5 text-xs cursor-pointer",
            )}
          >
            <GraduationCap className="size-3.5" />
            Enrollment
          </Link>

          <Link
            href="/student/grades"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 gap-1.5 text-xs cursor-pointer",
            )}
          >
            Grades
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Student Profile Overview Card */}
      <Card className="overflow-hidden border-border/80 shadow-xs">
        <CardContent className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-primary/20 sm:size-18">
              {student?.photoUrl ? (
                <AvatarImage src={student.photoUrl} alt={name} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                {initials || <UserRound className="size-7" />}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {name}
                </h2>
                <Badge variant="secondary" className="font-mono text-xs">
                  {student?.studentId || "STUDENT-ID"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                <span className="font-medium text-foreground">
                  {student?.department || "Computer Science & Engineering"}
                </span>
                <span>•</span>
                <span>
                  Year {student?.currentYear || 3}, Semester{" "}
                  {student?.currentSemester || 6}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-8 border-t pt-4 lg:border-t-0 lg:pt-0">
            <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm sm:grid-cols-3 lg:gap-8">
              <div className="space-y-0.5">
                <span className="text-muted-foreground">Program</span>
                <p className="font-medium text-foreground">
                  {student?.programCode || "BSC-CSE"}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground">Admission Year</span>
                <p className="font-medium text-foreground">
                  {student?.admissionYear || 2023}
                </p>
              </div>

              <div className="col-span-2 space-y-0.5 sm:col-span-1">
                <span className="text-muted-foreground">Student Email</span>
                <p className="truncate font-medium text-foreground max-w-[200px]">
                  {student?.email || "student@university.edu"}
                </p>
              </div>
            </div>

            <Link
              href="/student/profile"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10 self-start sm:self-center cursor-pointer",
              )}
            >
              <span>View Profile</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
