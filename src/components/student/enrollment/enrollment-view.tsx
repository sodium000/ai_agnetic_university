"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  dropCourseEnrollment,
  enrollCourseSection,
  extractErrorMessage,
  fetchEnrolledCourses,
  initialAvailableSections,
  initialMockEnrollments,
} from "@/services/student-enrollment.service";
import type { EnrolledCourseEnrollment } from "@/types/student-course-enrollment";
import { CourseSectionCard } from "./course-section-card";
import { EnrolledCoursesTable } from "./enrolled-courses-table";
import { EnrollmentHeader } from "./enrollment-header";

export function EnrollmentView() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ENROLLED" | "AVAILABLE"
  >("ALL");
  const [activeTab, setActiveTab] = useState<"catalog" | "my-courses">(
    "catalog",
  );
  const [enrollingSectionId, setEnrollingSectionId] = useState<string | null>(
    null,
  );
  const [droppingEnrollmentId, setDroppingEnrollmentId] = useState<
    string | null
  >(null);

  // Local state for demo / fallback mode if backend server is offline
  const [localFallbackEnrollments, setLocalFallbackEnrollments] = useState<
    EnrolledCourseEnrollment[] | null
  >(null);

  // Query for enrolled courses from GET /api/v1/student/me/courses
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

  // Effective enrolled courses (API data or interactive fallback)
  const enrolledCourses: EnrolledCourseEnrollment[] = useMemo(() => {
    if (localFallbackEnrollments !== null) {
      return localFallbackEnrollments;
    }
    return apiEnrolledCourses || [];
  }, [apiEnrolledCourses, localFallbackEnrollments]);

  // Map of active enrollments
  const activeEnrollments = useMemo(() => {
    return enrolledCourses.filter((e) => e.status === "ENROLLED");
  }, [enrolledCourses]);

  // Set of enrolled section IDs
  const enrolledSectionIds = useMemo(() => {
    return new Set(activeEnrollments.map((e) => e.sectionId || e.section?.id));
  }, [activeEnrollments]);

  // Set of enrolled course IDs
  const enrolledCourseIds = useMemo(() => {
    return new Set(
      activeEnrollments.map(
        (e) =>
          e.section?.courseId ||
          e.section?.course?.id ||
          e.section?.course?.code,
      ),
    );
  }, [activeEnrollments]);

  // Map of enrolled records by section ID
  const enrollmentBySectionId = useMemo(() => {
    const map = new Map<string, EnrolledCourseEnrollment>();
    activeEnrollments.forEach((e) => {
      const sId = e.sectionId || e.section?.id;
      if (sId) map.set(sId, e);
    });
    return map;
  }, [activeEnrollments]);

  // Total credits of currently registered courses
  const totalRegisteredCredits = useMemo(() => {
    return activeEnrollments.reduce(
      (acc, e) => acc + (e.section?.course?.credit || 3),
      0,
    );
  }, [activeEnrollments]);

  // Mutation: Enroll in Course Section (POST /api/v1/student/me/enrollments)
  const enrollMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      setEnrollingSectionId(sectionId);
      // If in demo fallback mode, emulate locally
      if (localFallbackEnrollments !== null || isError) {
        await new Promise((res) => setTimeout(res, 500));
        const section = initialAvailableSections.find(
          (s) => s.id === sectionId,
        );
        if (!section) throw new Error("Section not found");

        const newEnrollment: EnrolledCourseEnrollment = {
          id: `enr-mock-${Date.now()}`,
          studentId: "stu-current-id",
          sectionId,
          status: "ENROLLED",
          enrolledAt: new Date().toISOString(),
          section: {
            ...section,
            enrolledCount: (section.enrolledCount ?? 0) + 1,
          },
        };

        const updated = [
          ...(localFallbackEnrollments || initialMockEnrollments),
          newEnrollment,
        ];
        setLocalFallbackEnrollments(updated);
        return newEnrollment;
      }

      return enrollCourseSection(sectionId);
    },
    onSuccess: (_data, sectionId) => {
      const section = initialAvailableSections.find((s) => s.id === sectionId);
      const courseName = section
        ? `${section.course.code} (${section.name})`
        : "course section";
      toast.success(`Successfully enrolled in ${courseName}`);
      queryClient.invalidateQueries({ queryKey: ["student-enrolled-courses"] });
    },
    onError: (err: unknown) => {
      const msg = extractErrorMessage(
        err,
        "Failed to enroll in course section",
      );
      toast.error(msg);
    },
    onSettled: () => {
      setEnrollingSectionId(null);
    },
  });

  // Mutation: Drop Enrollment (DELETE /api/v1/student/me/enrollments/:id)
  const dropMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      setDroppingEnrollmentId(enrollmentId);
      // If in demo fallback mode, emulate locally
      if (localFallbackEnrollments !== null || isError) {
        await new Promise((res) => setTimeout(res, 500));
        const updated = (
          localFallbackEnrollments || initialMockEnrollments
        ).filter((e) => e.id !== enrollmentId);
        setLocalFallbackEnrollments(updated);
        return { id: enrollmentId, status: "DROPPED" as const };
      }

      return dropCourseEnrollment(enrollmentId);
    },
    onSuccess: () => {
      toast.success("Enrollment successfully dropped");
      queryClient.invalidateQueries({ queryKey: ["student-enrolled-courses"] });
    },
    onError: (err: unknown) => {
      const msg = extractErrorMessage(err, "Failed to drop enrollment");
      toast.error(msg);
    },
    onSettled: () => {
      setDroppingEnrollmentId(null);
    },
  });

  // Filtered sections for Catalog view
  const filteredSections = useMemo(() => {
    return initialAvailableSections.filter((sec) => {
      const isEnrolled = enrolledSectionIds.has(sec.id);

      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        sec.course.title.toLowerCase().includes(query) ||
        sec.course.code.toLowerCase().includes(query) ||
        sec.name.toLowerCase().includes(query) ||
        sec.faculty?.user?.name?.toLowerCase().includes(query);

      // Department filter
      const matchesDept =
        selectedDept === "ALL" || sec.course.department === selectedDept;

      // Status filter
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ENROLLED" && isEnrolled) ||
        (statusFilter === "AVAILABLE" && !isEnrolled);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [searchQuery, selectedDept, statusFilter, enrolledSectionIds]);

  // Loading skeleton state
  if (isLoading && localFallbackEnrollments === null) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full animate-pulse">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
      {/* Header Banner & Stats */}
      <EnrollmentHeader
        enrolledCount={activeEnrollments.length}
        totalCredits={totalRegisteredCredits}
        maxCredits={21}
        semesterName="Fall 2026"
      />

      {/* Offline / Server Error notice with interactive demo fallback */}
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
                        "The local backend server (port 5000) is currently offline.",
                      )
                    : "The local backend server (port 5000) is currently offline."}{" "}
                  You can launch interactive demo mode to test enrolling,
                  duplicate checking, and dropping.
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
                Launch Interactive Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "catalog"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <BookOpen className="size-3.5" />
            <span>Course Catalog</span>
            <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
              {initialAvailableSections.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("my-courses")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "my-courses"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span>My Enrolled Courses</span>
            <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px]">
              {activeEnrollments.length}
            </span>
          </button>
        </div>

        {/* Demo Indicator */}
        {localFallbackEnrollments !== null && (
          <Badge
            variant="outline"
            className="text-xs border-amber-500/40 text-amber-600 bg-amber-500/10"
          >
            Interactive Demo Mode
          </Badge>
        )}
      </div>

      {activeTab === "catalog" ? (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by code (e.g., CSE-301), title, or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs sm:text-sm h-9 bg-card"
              />
            </div>

            {/* Department and Status filter chips */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5">
                {(["ALL", "CSE", "MAT"] as const).map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      selectedDept === dept
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {dept === "ALL" ? "All Depts" : dept}
                  </button>
                ))}
              </div>

              <div className="flex items-center rounded-lg border border-border/60 bg-muted/30 p-0.5">
                {(
                  [
                    { key: "ALL", label: "All" },
                    { key: "AVAILABLE", label: "Available" },
                    { key: "ENROLLED", label: "Enrolled" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatusFilter(item.key)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      statusFilter === item.key
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog Grid */}
          {filteredSections.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
              {filteredSections.map((sec) => {
                const isEnrolledThis = enrolledSectionIds.has(sec.id);
                const isEnrolledOther =
                  !isEnrolledThis &&
                  (enrolledCourseIds.has(sec.courseId) ||
                    enrolledCourseIds.has(sec.course.id) ||
                    enrolledCourseIds.has(sec.course.code));

                const enrollmentRecord = enrollmentBySectionId.get(sec.id);

                return (
                  <CourseSectionCard
                    key={sec.id}
                    section={sec}
                    enrollmentRecord={enrollmentRecord}
                    isEnrolledThisSection={isEnrolledThis}
                    isEnrolledOtherSection={isEnrolledOther}
                    isEnrolling={enrollingSectionId === sec.id}
                    isDropping={Boolean(
                      enrollmentRecord &&
                        droppingEnrollmentId === enrollmentRecord.id,
                    )}
                    onEnroll={async (sId) => {
                      await enrollMutation.mutateAsync(sId);
                    }}
                    onDrop={async (enrId) => {
                      await dropMutation.mutateAsync(enrId);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="border-border/60 shadow-xs">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Search className="size-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground text-base">
                  No courses found
                </h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  No course sections match your search or filter criteria. Try
                  adjusting your search keywords.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDept("ALL");
                    setStatusFilter("ALL");
                  }}
                  className="mt-4 text-xs cursor-pointer"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* My Registered Courses View */
        <EnrolledCoursesTable
          enrollments={activeEnrollments}
          onDrop={async (enrId) => {
            await dropMutation.mutateAsync(enrId);
          }}
          isDropping={droppingEnrollmentId !== null}
        />
      )}
    </main>
  );
}
