"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Bell,
  BookOpen,
  Clock,
  GraduationCap,
  MapPin,
  RefreshCw,
  Trophy,
  User,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { studentDashboardData } from "@/data/student-dashboard";
import { cn } from "@/lib/utils";
import {
  fetchEnrolledCourses,
  initialMockEnrollments,
} from "@/services/student-enrollment.service";
import {
  fetchNotifications,
  mockNotifications,
} from "@/services/student-notification.service";
import {
  fetchStudentInvoices,
  fetchStudentPayments,
  initialMockInvoices,
  initialMockPayments,
} from "@/services/student-payment.service";
import {
  fetchStudentProfile,
  initialMockProfile,
} from "@/services/student-profile.service";
import type { EnrolledCourseEnrollment } from "@/types/student-course-enrollment";
import type {
  CurrentCourse,
  FeeSummaryData,
  Student,
  StudentDashboardData,
  TodayClass,
} from "@/types/student-dashboard";

import { AssignmentsCard } from "./assignments-card";
import { AttendanceChart } from "./attendance-chart";
import { CurrentCourses } from "./current-courses";
import { DashboardStats } from "./dashboard-stats";
import { FeeSummary } from "./fee-summary";
import { GPAChart } from "./gpa-chart";
import { RecentNotifications } from "./recent-notifications";
import { StudentHeader } from "./student-header";
import { TodayClasses } from "./today-classes";
import { UpcomingExams } from "./upcoming-exams";

interface StudentDashboardProps {
  initialData?: StudentDashboardData;
}

export function StudentDashboard({
  initialData = studentDashboardData,
}: StudentDashboardProps) {
  const queryClient = useQueryClient();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // ── 1. Query: Student Profile (/api/v1/student/me) ───────────────────────────
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
    isFetching: isProfileFetching,
  } = useQuery({
    queryKey: ["student-profile"],
    queryFn: fetchStudentProfile,
    retry: 1,
    staleTime: 30000,
  });

  // ── 2. Query: Enrolled Courses (/api/v1/student/me/courses) ─────────────────
  const {
    data: apiEnrolledCourses,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
    refetch: refetchCourses,
    isFetching: isCoursesFetching,
  } = useQuery({
    queryKey: ["student-enrolled-courses"],
    queryFn: () => fetchEnrolledCourses(),
    retry: 1,
    staleTime: 30000,
  });

  // ── 3. Query: Invoices & Payments (/api/v1/student/me/invoices) ─────────────
  const {
    data: apiInvoices,
    isLoading: isInvoicesLoading,
    refetch: refetchInvoices,
    isFetching: isInvoicesFetching,
  } = useQuery({
    queryKey: ["student-invoices"],
    queryFn: fetchStudentInvoices,
    retry: 1,
    staleTime: 30000,
  });

  const {
    data: apiPayments,
    refetch: refetchPayments,
    isFetching: isPaymentsFetching,
  } = useQuery({
    queryKey: ["student-payments"],
    queryFn: fetchStudentPayments,
    retry: 1,
    staleTime: 30000,
  });

  // ── 4. Query: Notifications (/api/v1/student/me/notifications) ──────────────
  const {
    data: apiNotifications,
    refetch: refetchNotifications,
    isFetching: isNotificationsFetching,
  } = useQuery({
    queryKey: ["student-notifications"],
    queryFn: () => fetchNotifications(),
    retry: 1,
    staleTime: 30000,
  });

  const isAnyFetching =
    isProfileFetching ||
    isCoursesFetching ||
    isInvoicesFetching ||
    isPaymentsFetching ||
    isNotificationsFetching;

  // ── Unified Refresh Handler ──────────────────────────────────────────────────
  const handleRefreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["student-profile"] }),
      queryClient.invalidateQueries({ queryKey: ["student-enrolled-courses"] }),
      queryClient.invalidateQueries({ queryKey: ["student-invoices"] }),
      queryClient.invalidateQueries({ queryKey: ["student-payments"] }),
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] }),
      refetchProfile(),
      refetchCourses(),
      refetchInvoices(),
      refetchPayments(),
      refetchNotifications(),
    ]);
    toast.success("Dashboard data refreshed");
  };

  // ── Synchronized Effective Data ──────────────────────────────────────────────

  // 1. Effective Profile
  const effectiveStudent: Student = useMemo(() => {
    const p = profileData || initialMockProfile;
    return {
      name: p.user?.name || initialData.student.name,
      studentId: p.studentId || initialData.student.studentId,
      email: p.user?.email || initialData.student.email,
      phone: p.phone || p.user?.phone || initialData.student.phone,
      photoUrl: p.photoUrl || p.user?.photoUrl || initialData.student.photoUrl,
      department: p.department?.name || initialData.student.department,
      departmentCode: p.department?.code || initialData.student.departmentCode,
      program: p.program?.name || initialData.student.program,
      programCode: p.program?.code || initialData.student.programCode,
      currentYear: p.currentYear || initialData.student.currentYear,
      currentSemester: p.currentSemester || initialData.student.currentSemester,
      admissionYear: p.admissionYear || initialData.student.admissionYear,
    };
  }, [profileData, initialData.student]);

  // 2. Effective Enrolled Courses
  const enrolledCourses: EnrolledCourseEnrollment[] = useMemo(() => {
    return apiEnrolledCourses || (isCoursesError ? initialMockEnrollments : []);
  }, [apiEnrolledCourses, isCoursesError]);

  const activeEnrollments = useMemo(() => {
    return enrolledCourses.filter((e) => e.status === "ENROLLED");
  }, [enrolledCourses]);

  // Converted CurrentCourse items for dashboard widgets
  const currentCourses: CurrentCourse[] = useMemo(() => {
    if (!activeEnrollments.length) {
      return initialData.currentCourses;
    }
    return activeEnrollments.map((enr, idx) => {
      const sec = enr.section;
      const crs = sec?.course;
      const fac = sec?.faculty;
      return {
        id: enr.id,
        code: crs?.code || `CRS-${idx + 1}`,
        title: crs?.title || "Enrolled Course",
        credit: crs?.credit || 3,
        section: sec?.name || `Sec 0${idx + 1}`,
        faculty: fac?.user?.name || "Dr. Assigned Faculty",
        room: sec?.room || "Room 402, Academic Bldg",
        progress: [75, 65, 80, 55, 90][idx % 5] || 70,
      };
    });
  }, [activeEnrollments, initialData.currentCourses]);

  // Today's classes derived from schedule
  const todayClasses: TodayClass[] = useMemo(() => {
    if (activeEnrollments.length > 0) {
      return activeEnrollments.slice(0, 3).map((enr, idx) => {
        const sec = enr.section;
        const crs = sec?.course;
        const times = [
          { start: "09:00 AM", end: "10:30 AM" },
          { start: "11:00 AM", end: "12:30 PM" },
          { start: "02:00 PM", end: "03:30 PM" },
        ];
        const timeSlot = times[idx % times.length];
        return {
          id: `today-${enr.id}`,
          courseCode: crs?.code || "CSE 301",
          courseName: crs?.title || "Course Session",
          faculty: sec?.faculty?.user?.name || "Dr. Faculty",
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          room: sec?.room || "Room 402",
          building: "Academic Bldg A",
        };
      });
    }
    return initialData.todayClasses;
  }, [activeEnrollments, initialData.todayClasses]);

  // Effective Financials
  const feeSummary: FeeSummaryData = useMemo(() => {
    const invs = apiInvoices || initialMockInvoices;
    const total = invs.reduce((acc, i) => acc + (i.amount || 0), 0);
    const paid = invs
      .filter((i) => i.status === "PAID")
      .reduce((acc, i) => acc + (i.amount || 0), 0);
    const pending = invs
      .filter((i) => i.status === "PENDING" || i.status === "OVERDUE")
      .reduce((acc, i) => acc + (i.amount || 0), 0);

    return {
      total: total || initialData.invoices.total,
      paid: paid || initialData.invoices.paid,
      pending: pending || initialData.invoices.pending,
      items: invs.map((i) => ({
        id: i.id,
        invoiceNo: i.invoiceNo,
        title: i.title || "Tuition & Registration Fee",
        amount: i.amount,
        dueDate: i.dueDate,
        status: i.status,
      })),
    };
  }, [apiInvoices, initialData.invoices]);

  // Effective Recent Payments
  const recentPayments = useMemo(() => {
    const paymentList =
      apiPayments && apiPayments.length > 0 ? apiPayments : initialMockPayments;

    return paymentList.map((p) => {
      const paymentDate = p.createdAt || p.date || new Date().toISOString();
      return {
        id: p.id,
        invoiceNo: p.invoiceNo || "INV-GEN",
        amount: p.amount,
        method: p.method,
        status: "SUCCESS" as const,
        date: new Date(paymentDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    });
  }, [apiPayments]);

  // Effective Notifications
  const notifications = useMemo(() => {
    if (apiNotifications && apiNotifications.length > 0) {
      return apiNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: new Date(n.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }));
    }
    return mockNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: "Recently",
    }));
  }, [apiNotifications]);

  // Effective Dashboard Stats
  const overviewStats = useMemo(() => {
    const courseCount =
      activeEnrollments.length > 0
        ? activeEnrollments.length
        : initialData.overview.currentCourses;

    return {
      cgpa: initialData.overview.cgpa,
      completedCredits: initialData.overview.completedCredits,
      totalCredits:
        profileData?.program?.totalCredits || initialData.overview.totalCredits,
      currentCourses: courseCount,
      attendance: initialData.overview.attendance,
    };
  }, [activeEnrollments, initialData.overview, profileData]);

  // Initial loading state skeleton
  const isInitialLoading =
    isProfileLoading && isCoursesLoading && isInvoicesLoading;

  if (isInitialLoading) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-7">
          <Skeleton className="h-72 lg:col-span-4 rounded-xl" />
          <Skeleton className="h-72 lg:col-span-3 rounded-xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
      {/* ── 1. Student Header Banner ────────────────────────────────────────── */}
      <StudentHeader
        student={effectiveStudent}
        onRefresh={handleRefreshAll}
        isRefreshing={isAnyFetching}
        onOpenSchedule={() => setScheduleDialogOpen(true)}
      />

      {/* ── Offline Fallback Alert Notice ────────────────────────────────────── */}
      {(isProfileError || isCoursesError) && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Backend sync offline — Interactive Demo Active
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Displaying simulated student metrics, enrolled courses, and
                  academic timeline. Real-time actions remain active.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isAnyFetching}
              className="h-8 gap-1.5 text-xs shrink-0 cursor-pointer"
            >
              <RefreshCw
                className={cn("size-3.5", isAnyFetching && "animate-spin")}
              />
              Retry Sync
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── 2. Real-time Dashboard KPI Stats ─────────────────────────────────── */}
      <DashboardStats stats={overviewStats} />

      {/* ── 3. Quick Action Navigation Row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          href="/student/current-courses"
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/80 bg-card p-3.5 text-center transition-all duration-200 hover:border-primary/40 hover:bg-muted/40 hover:shadow-2xs cursor-pointer"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
            <BookOpen className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              Current Courses
            </p>
            <p className="text-[11px] text-muted-foreground">
              {currentCourses.length} Enrolled
            </p>
          </div>
        </Link>

        <Link
          href="/student/enrollment"
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/80 bg-card p-3.5 text-center transition-all duration-200 hover:border-primary/40 hover:bg-muted/40 hover:shadow-2xs cursor-pointer"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-105">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
              Course Catalog
            </p>
            <p className="text-[11px] text-muted-foreground">Add & Register</p>
          </div>
        </Link>

        <Link
          href="/student/grades"
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/80 bg-card p-3.5 text-center transition-all duration-200 hover:border-primary/40 hover:bg-muted/40 hover:shadow-2xs cursor-pointer"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-105">
            <Trophy className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground group-hover:text-amber-600 transition-colors">
              Grades & GPA
            </p>
            <p className="text-[11px] text-muted-foreground">3.72 Cumulative</p>
          </div>
        </Link>

        <Link
          href="/student/payments"
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/80 bg-card p-3.5 text-center transition-all duration-200 hover:border-primary/40 hover:bg-muted/40 hover:shadow-2xs cursor-pointer"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 transition-transform group-hover:scale-105">
            <Banknote className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground group-hover:text-violet-600 transition-colors">
              Fees & Invoices
            </p>
            <p className="text-[11px] text-muted-foreground">
              ৳{feeSummary.pending.toLocaleString()} Due
            </p>
          </div>
        </Link>

        <Link
          href="/student/notification"
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/80 bg-card p-3.5 text-center transition-all duration-200 hover:border-primary/40 hover:bg-muted/40 hover:shadow-2xs cursor-pointer"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 transition-transform group-hover:scale-105">
            <Bell className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground group-hover:text-blue-600 transition-colors">
              Notifications
            </p>
            <p className="text-[11px] text-muted-foreground">
              {notifications.filter((n) => !n.isRead).length} New Alerts
            </p>
          </div>
        </Link>

        <Link
          href="/student/profile"
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/80 bg-card p-3.5 text-center transition-all duration-200 hover:border-primary/40 hover:bg-muted/40 hover:shadow-2xs cursor-pointer"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 transition-transform group-hover:scale-105">
            <User className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground group-hover:text-rose-600 transition-colors">
              Student Profile
            </p>
            <p className="text-[11px] text-muted-foreground">
              Personal Details
            </p>
          </div>
        </Link>
      </div>

      {/* ── 4. Active Enrolled Courses & Today's Schedule ─────────────────────── */}
      <section
        aria-label="Active courses and today schedule"
        className="grid gap-6 lg:grid-cols-7"
      >
        <div className="lg:col-span-4">
          <CurrentCourses courses={currentCourses} />
        </div>

        <div className="lg:col-span-3">
          <TodayClasses classes={todayClasses} />
        </div>
      </section>

      {/* ── 5. Academic Progression Charts ────────────────────────────────────── */}
      <section
        aria-label="Academic progression charts"
        className="grid gap-6 lg:grid-cols-7"
      >
        <div className="lg:col-span-4">
          <GPAChart data={initialData.gpaHistory} />
        </div>

        <div className="lg:col-span-3">
          <AttendanceChart data={initialData.attendance} />
        </div>
      </section>

      {/* ── 6. Coursework Submissions & Scheduled Examinations ────────────────── */}
      <section
        aria-label="Assignments and upcoming exams"
        className="grid gap-6 lg:grid-cols-2"
      >
        <AssignmentsCard assignments={initialData.assignments} />
        <UpcomingExams exams={initialData.upcomingExams} />
      </section>

      {/* ── 7. Tuition Billing & University Notifications ──────────────────────── */}
      <section
        aria-label="Financials and announcements"
        className="grid gap-6 lg:grid-cols-2"
      >
        <FeeSummary feeSummary={feeSummary} recentPayments={recentPayments} />
        <RecentNotifications notifications={notifications} />
      </section>

      {/* ── Schedule Timetable Modal Dialog ──────────────────────────────────── */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-primary font-semibold text-xs"
              >
                Fall 2026 Timetable
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {currentCourses.length} Courses
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold">
              Weekly Class Schedule
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official timetable of lectures, lab sessions, and classroom
              venues.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            {activeEnrollments.length > 0 ? (
              <div className="divide-y divide-border/60 rounded-lg border border-border/60 overflow-hidden">
                {activeEnrollments.map((enr) => {
                  const sec = enr.section;
                  const crs = sec?.course;
                  return (
                    <div
                      key={enr.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 gap-2 bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground font-mono">
                            {crs?.code}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {sec?.name}
                          </span>
                        </div>
                        <p className="font-medium text-foreground text-xs">
                          {crs?.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <User className="size-3" />
                          {sec?.faculty?.user?.name || "Dr. Faculty"}
                        </p>
                      </div>

                      <div className="space-y-1 sm:text-right">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs text-primary bg-primary/5"
                        >
                          <Clock className="mr-1 size-3" />
                          {sec?.schedule || "Mon, Wed 10:00 AM"}
                        </Badge>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 sm:justify-end">
                          <MapPin className="size-3 text-primary" />
                          {sec?.room || "Room 402"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="divide-y divide-border/60 rounded-lg border border-border/60 overflow-hidden">
                {todayClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 gap-2 bg-card"
                  >
                    <div>
                      <span className="font-bold text-foreground font-mono">
                        {cls.courseCode}
                      </span>
                      <p className="font-medium text-foreground text-xs">
                        {cls.courseName}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <Badge variant="outline" className="font-mono text-xs">
                        <Clock className="mr-1 size-3" />
                        {cls.startTime} - {cls.endTime}
                      </Badge>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {cls.room}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <Link
                href="/student/current-courses"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "h-8 gap-1.5 text-xs cursor-pointer",
                )}
                onClick={() => setScheduleDialogOpen(false)}
              >
                <span>Manage Current Courses</span>
                <ArrowRight className="size-3.5" />
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setScheduleDialogOpen(false)}
                className="h-8 text-xs cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
