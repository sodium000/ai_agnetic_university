import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CurrentCourse } from "@/types/student-dashboard";

interface CurrentCoursesProps {
  courses: CurrentCourse[];
}

export function CurrentCourses({ courses = [] }: CurrentCoursesProps) {
  const hasCourses = courses && courses.length > 0;
  const totalCredits = hasCourses
    ? courses.reduce((acc, c) => acc + (c.credit || 3), 0)
    : 0;

  return (
    <Card className="flex flex-col border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold sm:text-lg text-foreground">
              Current Courses
            </CardTitle>
            {hasCourses ? (
              <Badge variant="secondary" className="text-xs">
                {courses.length} Enrolled
              </Badge>
            ) : null}
          </div>
          <CardDescription className="text-xs">
            {totalCredits > 0
              ? `${totalCredits} total credits registered for this semester`
              : "Active course enrollments"}
          </CardDescription>
        </div>

        <Link
          href="/student/current-courses"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-xs cursor-pointer",
          )}
        >
          View all
          <ChevronRight className="ml-1 size-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {hasCourses ? (
          <div className="divide-y divide-border/60">
            {courses.slice(0, 5).map((course) => (
              <div
                key={course.id}
                className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="size-4" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">
                        {course.code}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        Sec {course.section}
                      </span>
                    </div>

                    <p className="truncate text-sm font-medium text-foreground/90">
                      {course.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {course.faculty}
                      </span>
                      {course.room ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {course.room}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                  <Badge
                    variant="outline"
                    className="shrink-0 font-medium text-xs"
                  >
                    {course.credit} Credits
                  </Badge>

                  {typeof course.progress === "number" ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground sm:w-28">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-medium">
                        {course.progress}%
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
            <p>No courses registered for this term.</p>
            <Link
              href="/student/enrollment"
              className={cn(
                buttonVariants({ size: "sm" }),
                "mt-3 gap-1.5 text-xs cursor-pointer",
              )}
            >
              <GraduationCap className="size-3.5" />
              Enroll in Courses
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
