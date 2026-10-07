import {
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Student } from "@/types/student-dashboard";

interface StudentHeaderProps {
  student: Student;
}

export function StudentHeader({ student }: StudentHeaderProps) {
  const firstName = student.name.split(" ")[0];
  const initials = student.name
    .split(" ")
    .map((part) => part[0])
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
              {student.departmentCode}
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {firstName} 👋
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your academic journey today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm">
            <CalendarDays className="mr-2 size-4" />
            Class Schedule
          </Button>

          <Button size="sm">
            Academic Transcript
            <ArrowUpRight className="ml-1.5 size-4" />
          </Button>
        </div>
      </div>

      {/* Student Profile Overview Card */}
      <Card className="overflow-hidden border-border/80 shadow-xs">
        <CardContent className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-primary/20 sm:size-18">
              {student.photoUrl ? (
                <AvatarImage src={student.photoUrl} alt={student.name} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                {initials || <UserRound className="size-7" />}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {student.name}
                </h2>
                <Badge variant="secondary" className="font-mono text-xs">
                  {student.studentId}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                <span className="font-medium text-foreground">
                  {student.department}
                </span>
                <span>•</span>
                <span>
                  Year {student.currentYear}, Semester {student.currentSemester}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 text-xs sm:text-sm sm:grid-cols-3 lg:border-t-0 lg:pt-0 lg:gap-8">
            <div className="space-y-0.5">
              <span className="text-muted-foreground">Program</span>
              <p className="font-medium text-foreground">
                {student.programCode}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-muted-foreground">Admission Year</span>
              <p className="font-medium text-foreground">
                {student.admissionYear}
              </p>
            </div>

            <div className="col-span-2 space-y-0.5 sm:col-span-1">
              <span className="text-muted-foreground">Student Email</span>
              <p className="truncate font-medium text-foreground">
                {student.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
