"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Layers,
  MapPin,
  Search,
  Sparkles,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { studentDashboardData } from "@/data/student-dashboard";
import type { CurrentCourse, TodayClass } from "@/types/student-dashboard";

interface StudentCoursesViewProps {
  courses?: CurrentCourse[];
  todayClasses?: TodayClass[];
}

export function StudentCoursesView({
  courses = studentDashboardData.currentCourses,
  todayClasses = studentDashboardData.todayClasses,
}: StudentCoursesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "CSE" | "MAT">("ALL");

  const totalCredits = useMemo(
    () => courses.reduce((acc, c) => acc + c.credit, 0),
    [courses]
  );

  const averageProgress = useMemo(() => {
    if (!courses.length) return 0;
    const total = courses.reduce((acc, c) => acc + (c.progress ?? 0), 0);
    return Math.round(total / courses.length);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.faculty.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === "ALL" || course.code.startsWith(selectedFilter);

      return matchesSearch && matchesFilter;
    });
  }, [courses, searchQuery, selectedFilter]);

  // Map today's class schedule by course code
  const todayClassMap = useMemo(() => {
    const map = new Map<string, TodayClass>();
    todayClasses.forEach((c) => {
      map.set(c.courseCode, c);
    });
    return map;
  }, [todayClasses]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8">
      {/* Top Banner & Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/student"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              )}
            >
              <ArrowLeft className="size-3.5" />
              Back to Dashboard
            </Link>
            <span className="text-muted-foreground">•</span>
            <Badge variant="secondary" className="text-xs">
              Semester 6 • Fall 2026
            </Badge>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Current Enrolled Courses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your registered courses, view class venues, track syllabus progress, and connect with faculty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "cursor-pointer"
            )}
          >
            <Calendar className="mr-2 size-4" />
            Class Schedule
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Enrolled Courses</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {courses.length}
              </h3>
              <p className="text-xs text-muted-foreground">Active this semester</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Registered Credits</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {totalCredits} <span className="text-sm font-normal text-muted-foreground">Credits</span>
              </h3>
              <p className="text-xs text-muted-foreground">Full-time workload</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Average Progress</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {averageProgress}%
              </h3>
              <p className="text-xs text-muted-foreground">Semester coursework</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Today&apos;s Classes</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {todayClasses.length} <span className="text-sm font-normal text-muted-foreground">Sessions</span>
              </h3>
              <p className="text-xs text-muted-foreground">Scheduled today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, title, or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Button
            size="sm"
            variant={selectedFilter === "ALL" ? "default" : "outline"}
            onClick={() => setSelectedFilter("ALL")}
            className="text-xs cursor-pointer"
          >
            All Departments
          </Button>
          <Button
            size="sm"
            variant={selectedFilter === "CSE" ? "default" : "outline"}
            onClick={() => setSelectedFilter("CSE")}
            className="text-xs cursor-pointer"
          >
            Computer Science (CSE)
          </Button>
          <Button
            size="sm"
            variant={selectedFilter === "MAT" ? "default" : "outline"}
            onClick={() => setSelectedFilter("MAT")}
            className="text-xs cursor-pointer"
          >
            Mathematics (MAT)
          </Button>
        </div>
      </div>

      {/* Courses Cards Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const todayClass = todayClassMap.get(course.code);

            return (
              <Card
                key={course.id}
                className="group flex flex-col justify-between border-border/80 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <CardHeader className="space-y-2 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-semibold text-primary">
                          {course.code}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Sec {course.section}
                        </Badge>
                      </div>

                      <Badge variant="secondary" className="font-medium text-xs">
                        {course.credit} Credits
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <User className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{course.faculty}</span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-1">
                    {/* Location & Room */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0 text-primary" />
                      <span>{course.room || "Room Assigned Later"}</span>
                    </div>

                    {/* Today's Schedule Tag if active */}
                    {todayClass ? (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs text-foreground">
                        <div className="flex items-center gap-1.5 font-medium text-primary">
                          <Clock className="size-3.5 shrink-0" />
                          <span>Today: {todayClass.startTime} - {todayClass.endTime}</span>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          {todayClass.room} • {todayClass.building}
                        </p>
                      </div>
                    ) : null}

                    {/* Progress Bar */}
                    {typeof course.progress === "number" ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Curriculum Progress</span>
                          <span className="font-semibold text-foreground">
                            {course.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </div>

                <CardFooter className="flex items-center justify-between border-t border-border/60 pt-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    <span>Registered</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="xs" className="cursor-pointer">
                      Syllabus
                    </Button>
                    <Button size="xs" className="cursor-pointer">
                      Materials
                      <ExternalLink className="ml-1 size-3" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Layers className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold">No courses found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No enrolled courses match your search or filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 cursor-pointer"
            onClick={() => {
              setSearchQuery("");
              setSelectedFilter("ALL");
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </main>
  );
}
