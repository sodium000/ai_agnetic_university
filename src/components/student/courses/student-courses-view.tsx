"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  GraduationCap,
  Layers,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  dropCourseEnrollment,
  extractErrorMessage,
  fetchEnrolledCourses,
  initialMockEnrollments,
} from "@/services/student-enrollment.service";
import type { EnrolledCourseEnrollment } from "@/types/student-course-enrollment";
import type { CurrentCourse, TodayClass } from "@/types/student-dashboard";

interface FormattedCourseItem {
  enrollmentId: string;
  id: string;
  code: string;
  title: string;
  description?: string | null;
  credit: number;
  department: string;
  sectionId?: string;
  sectionName: string;
  capacity: number;
  enrolledCount?: number;
  schedule: string;
  room: string;
  facultyName: string;
  facultyEmail: string;
  facultyDesignation: string;
  semester: string;
  enrolledAt: string;
  progress: number;
}

interface StudentCoursesViewProps {
  courses?: CurrentCourse[];
  todayClasses?: TodayClass[];
}

export function StudentCoursesView({
  courses: _initialCoursesProp,
  todayClasses: _initialTodayClassesProp,
}: StudentCoursesViewProps = {}) {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCourseForDetails, setSelectedCourseForDetails] =
    useState<FormattedCourseItem | null>(null);
  const [courseToDrop, setCourseToDrop] = useState<FormattedCourseItem | null>(
    null,
  );

  // Local fallback state if backend API is offline
  const [localFallbackEnrollments, setLocalFallbackEnrollments] = useState<
    EnrolledCourseEnrollment[] | null
  >(null);

  // Query enrolled courses via TanStack Query
  const {
    data: apiEnrolledCourses,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["student-enrolled-courses"],
    queryFn: () => fetchEnrolledCourses(),
    retry: 1,
    staleTime: 30000,
  });

  // Effective enrollments
  const enrolledCourses: EnrolledCourseEnrollment[] = useMemo(() => {
    if (localFallbackEnrollments !== null) {
      return localFallbackEnrollments;
    }
    return apiEnrolledCourses || (isError ? initialMockEnrollments : []);
  }, [apiEnrolledCourses, localFallbackEnrollments, isError]);

  // Drop course mutation with cache sync & fallback support
  const dropMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      if (localFallbackEnrollments !== null || isError) {
        await new Promise((res) => setTimeout(res, 500));
        setLocalFallbackEnrollments((prev) =>
          (prev || initialMockEnrollments).filter((e) => e.id !== enrollmentId),
        );
        return { id: enrollmentId, status: "DROPPED" as const };
      }
      return dropCourseEnrollment(enrollmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-enrolled-courses"] });
      toast.success("Course enrollment dropped successfully");
      setCourseToDrop(null);
      if (
        selectedCourseForDetails?.enrollmentId === courseToDrop?.enrollmentId
      ) {
        setSelectedCourseForDetails(null);
      }
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err, "Failed to drop course"));
    },
  });

  // Transform active enrollments into normalized course items
  const activeCourses: FormattedCourseItem[] = useMemo(() => {
    return enrolledCourses
      .filter((e) => e.status === "ENROLLED")
      .map((e, index) => {
        const sec = e.section;
        const crs = sec?.course;
        const fac = sec?.faculty;
        const fallbackProgress = [75, 60, 85, 50, 90][index % 5] || 70;

        return {
          enrollmentId: e.id,
          id: crs?.id || e.sectionId || e.id,
          code: crs?.code || "CRS-101",
          title: crs?.title || "Enrolled Course",
          description:
            crs?.description ||
            "Comprehensive curriculum covering core principles, hands-on lab experiments, and real-world domain problem solving.",
          credit: crs?.credit || 3,
          department:
            crs?.department ||
            (crs?.code?.includes("CSE")
              ? "CSE"
              : crs?.code?.includes("MAT")
                ? "MAT"
                : "GEN"),
          sectionId: sec?.id,
          sectionName: sec?.name || "Section 01",
          capacity: sec?.capacity || 40,
          enrolledCount: sec?.enrolledCount || 30,
          schedule: sec?.schedule || "Mon, Wed 10:00 AM - 11:30 AM",
          room: sec?.room || "Room 402, Academic Bldg A",
          facultyName: fac?.user?.name || "Dr. Assigned Faculty",
          facultyEmail: fac?.user?.email || "faculty@university.edu",
          facultyDesignation: fac?.designation || "Associate Professor",
          semester: sec?.semester?.name || "Fall 2026",
          enrolledAt: e.enrolledAt,
          progress: fallbackProgress,
        };
      });
  }, [enrolledCourses]);

  // Total registered credits
  const totalCredits = useMemo(
    () => activeCourses.reduce((acc, c) => acc + c.credit, 0),
    [activeCourses],
  );

  // Available departments for filtering
  const availableDepts = useMemo(() => {
    const set = new Set<string>();
    activeCourses.forEach((c) => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set);
  }, [activeCourses]);

  // Filtered courses based on search & department
  const filteredCourses = useMemo(() => {
    return activeCourses.filter((course) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.facultyName.toLowerCase().includes(q) ||
        course.room.toLowerCase().includes(q);

      const matchesDept =
        selectedDept === "ALL" || course.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [activeCourses, searchQuery, selectedDept]);

  const handleManualRefresh = async () => {
    await refetch();
    toast.success("Enrolled courses refreshed");
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
      {/* ── Top Header Banner ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/student"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer",
              )}
            >
              <ArrowLeft className="size-3.5" />
              Back to Dashboard
            </Link>
            <span className="text-muted-foreground">•</span>
            <Badge variant="secondary" className="text-xs">
              Semester 6 • Fall 2026
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
            >
              <CheckCircle2 className="mr-1 size-3" />
              {activeCourses.length} Registered
            </Badge>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Current Enrolled Courses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View registered courses, examine class timetables, review venue
            locations, and contact faculty instructors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs cursor-pointer"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
          </Button>

          <Link
            href="/student/enrollment"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-9 cursor-pointer gap-1.5 text-xs",
            )}
          >
            <GraduationCap className="size-4" />
            <span>Course Catalog & Add</span>
          </Link>
        </div>
      </div>

      {/* ── Offline / Demo Fallback Alert ──────────────────────────────────────── */}
      {isError && localFallbackEnrollments === null && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Backend connection unavailable
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {error
                    ? extractErrorMessage(
                        error,
                        "The backend server (port 5000) is currently offline.",
                      )
                    : "The backend server (port 5000) is currently offline."}{" "}
                  Interactive demo mode allows you to preview, view details, and
                  drop enrolled courses.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-8 text-xs cursor-pointer"
              >
                <RefreshCw
                  className={cn("size-3.5 mr-1", isFetching && "animate-spin")}
                />
                Retry
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  setLocalFallbackEnrollments(initialMockEnrollments)
                }
                className="h-8 gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 cursor-pointer text-white"
              >
                <Sparkles className="size-3.5" />
                Interactive Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Metric Summary Cards ──────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Enrolled Courses
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {activeCourses.length}
              </h3>
              <p className="text-xs text-muted-foreground">Active this term</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Registered Credits
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {totalCredits}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  Credits
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {totalCredits >= 15 ? "Full-time workload" : "Part-time load"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Weekly Class Load
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {totalCredits * 1.5}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  Hours
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Lecture & lab hours
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Departments
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {availableDepts.length || 1}
              </h3>
              <p className="text-xs text-muted-foreground">
                Active faculty depts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Search & Filter Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, title, instructor, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant={selectedDept === "ALL" ? "default" : "outline"}
              onClick={() => setSelectedDept("ALL")}
              className="text-xs cursor-pointer h-8"
            >
              All Departments
            </Button>
            {availableDepts.map((dept) => (
              <Button
                key={dept}
                size="sm"
                variant={selectedDept === dept ? "default" : "outline"}
                onClick={() => setSelectedDept(dept)}
                className="text-xs cursor-pointer h-8"
              >
                {dept}
              </Button>
            ))}
          </div>

          <div className="h-5 w-px bg-border/60 mx-1 hidden sm:block" />

          {/* Grid vs List toggle */}
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-1.5 transition-colors cursor-pointer",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Grid Cards View"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md p-1.5 transition-colors cursor-pointer",
                viewMode === "list"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="List View"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading Skeleton ─────────────────────────────────────────────────── */}
      {isLoading && !activeCourses.length && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/60">
              <CardHeader className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </CardContent>
              <CardFooter className="border-t pt-3 flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* ── Courses View: Grid or List ────────────────────────────────────────── */}
      {!isLoading && filteredCourses.length > 0 && viewMode === "grid" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card
              key={course.enrollmentId}
              className="group flex flex-col justify-between border-border/80 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <CardHeader className="space-y-2.5 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-mono font-semibold text-primary"
                      >
                        {course.code}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {course.sectionName}
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
                    <span className="truncate">{course.facultyName}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-[11px] text-muted-foreground truncate">
                      {course.facultyDesignation}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3.5 pt-1">
                  {/* Location & Room */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0 text-primary" />
                    <span>{course.room}</span>
                  </div>

                  {/* Schedule Timetable Box */}
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-primary">
                      <Clock className="size-3.5 shrink-0" />
                      <span>Class Schedule:</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-5 font-mono">
                      {course.schedule}
                    </p>
                  </div>

                  {/* Course Syllabus Snippet */}
                  {course.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </CardContent>
              </div>

              <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCourseForDetails(course)}
                  className="h-8 gap-1.5 text-xs cursor-pointer"
                >
                  <Eye className="size-3.5" />
                  Details
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCourseToDrop(course)}
                  className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  Drop Course
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* ── List / Table View ─────────────────────────────────────────────────── */}
      {!isLoading && filteredCourses.length > 0 && viewMode === "list" && (
        <Card className="border-border/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-border/60">
            {filteredCourses.map((course) => (
              <div
                key={course.enrollmentId}
                className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-start gap-3.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs font-semibold"
                      >
                        {course.code}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {course.sectionName}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {course.credit} Credits
                      </Badge>
                    </div>

                    <h4 className="text-sm font-semibold text-foreground">
                      {course.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {course.facultyName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {course.room}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="size-3" />
                        {course.schedule}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCourseForDetails(course)}
                    className="h-8 gap-1.5 text-xs cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                    Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCourseToDrop(course)}
                    className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    Drop
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!isLoading && filteredCourses.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-border/80">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Layers className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            {activeCourses.length === 0
              ? "No registered courses found"
              : "No matching courses found"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md">
            {activeCourses.length === 0
              ? "You are not currently enrolled in any course sections for Fall 2026. Visit the Course Enrollment catalog to register."
              : "No enrolled courses match your current search criteria or department filter."}
          </p>

          <div className="mt-5 flex items-center gap-3">
            {activeCourses.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-xs"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDept("ALL");
                }}
              >
                Clear Filters
              </Button>
            ) : null}

            <Link
              href="/student/enrollment"
              className={cn(
                buttonVariants({ size: "sm" }),
                "gap-1.5 text-xs cursor-pointer",
              )}
            >
              <GraduationCap className="size-4" />
              Browse Course Catalog
            </Link>
          </div>
        </Card>
      )}

      {/* ── Modal: Course Details & Syllabus ─────────────────────────────────── */}
      <Dialog
        open={Boolean(selectedCourseForDetails)}
        onOpenChange={(open) => {
          if (!open) setSelectedCourseForDetails(null);
        }}
      >
        <DialogContent className="max-w-lg">
          {selectedCourseForDetails && (
            <div>
              <DialogHeader className="space-y-2 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono font-bold text-primary"
                  >
                    {selectedCourseForDetails.code}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {selectedCourseForDetails.sectionName}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {selectedCourseForDetails.credit} Credits
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-emerald-500/30 text-emerald-600 bg-emerald-500/10 ml-auto"
                  >
                    Registered
                  </Badge>
                </div>

                <DialogTitle className="text-lg font-bold">
                  {selectedCourseForDetails.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Official course details, meeting itinerary, and instructional
                  staff.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-xs">
                {/* Syllabus / Description */}
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                    Course Syllabus & Description
                  </span>
                  <p className="text-muted-foreground leading-relaxed mt-1">
                    {selectedCourseForDetails.description}
                  </p>
                </div>

                {/* Faculty Card */}
                <div className="rounded-lg border border-border/60 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <User className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-xs">
                        {selectedCourseForDetails.facultyName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {selectedCourseForDetails.facultyDesignation}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`mailto:${selectedCourseForDetails.facultyEmail}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "h-7 gap-1 px-2 text-xs cursor-pointer",
                    )}
                  >
                    <Mail className="size-3" />
                    Email
                  </a>
                </div>

                {/* Schedule & Venue Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/60 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Clock className="size-3.5 text-primary" />
                      <span>Class Schedule</span>
                    </div>
                    <p className="font-semibold text-foreground font-mono text-[11px]">
                      {selectedCourseForDetails.schedule}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/60 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <MapPin className="size-3.5 text-primary" />
                      <span>Classroom Venue</span>
                    </div>
                    <p className="font-semibold text-foreground text-[11px]">
                      {selectedCourseForDetails.room}
                    </p>
                  </div>
                </div>

                {/* Additional Metadata */}
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/30 p-2.5 text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">
                      Semester
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedCourseForDetails.semester}
                    </span>
                  </div>
                  <div className="border-x border-border/60">
                    <span className="text-[10px] text-muted-foreground block">
                      Capacity
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedCourseForDetails.capacity} Seats
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">
                      Progress
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedCourseForDetails.progress}%
                    </span>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCourseToDrop(selectedCourseForDetails);
                      setSelectedCourseForDetails(null);
                    }}
                    className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    Drop Course
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCourseForDetails(null)}
                    className="h-8 text-xs cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal: Drop Course Confirmation ──────────────────────────────────── */}
      <Dialog
        open={Boolean(courseToDrop)}
        onOpenChange={(open) => {
          if (!open) setCourseToDrop(null);
        }}
      >
        <DialogContent className="max-w-md">
          {courseToDrop && (
            <div>
              <DialogHeader className="space-y-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-1">
                  <AlertTriangle className="size-5" />
                </div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Drop Course Registration?
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Are you sure you want to drop{" "}
                  <strong className="text-foreground">
                    {courseToDrop.code} - {courseToDrop.title}
                  </strong>{" "}
                  ({courseToDrop.sectionName})?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-3 text-xs">
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-muted-foreground">
                  <p>
                    Dropping this course will immediately release your reserved
                    seat and remove it from your Fall 2026 timetable. You may
                    re-enroll from the Course Catalog if seats remain available.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCourseToDrop(null)}
                    disabled={dropMutation.isPending}
                    className="h-8 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      dropMutation.mutate(courseToDrop.enrollmentId)
                    }
                    disabled={dropMutation.isPending}
                    className="h-8 gap-1.5 text-xs cursor-pointer"
                  >
                    {dropMutation.isPending ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin" />
                        Dropping...
                      </>
                    ) : (
                      <>
                        <Trash2 className="size-3.5" />
                        Confirm Drop
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
