"use client";

import { useQuery } from "@tanstack/react-query";
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
import { useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import {
  fetchEnrolledCourses,
  fetchStudentAssignments,
  fetchStudentAttendance,
  fetchStudentSchedule,
  fetchStudentTranscript,
} from "@/services/student-enrollment.service";
import { fetchNotifications } from "@/services/student-notification.service";
import {
  fetchStudentInvoices,
  fetchStudentPayments,
} from "@/services/student-payment.service";
import { fetchStudentProfile } from "@/services/student-profile.service";
import type { EnrolledCourseEnrollment } from "@/types/student-course-enrollment";
import type {
  Assignment,
  AssignmentStatus,
  AttendanceData,
  CurrentCourse,
  ExamType,
  FeeSummaryData,
  GPAHistory,
  Student,
  TodayClass,
  UpcomingExam,
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

type ApiRecord = Record<string, unknown>;
type ScheduledClass = TodayClass & { dayOfWeek: string };

function asRecord(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ApiRecord)
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asText(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function asNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatDate(
  value: unknown,
  options: Intl.DateTimeFormatOptions,
): string {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(
        date,
      );
}

function formatTime(value: unknown): string {
  if (!value) return "—";
  const time = String(value);
  const match = /(?:T|^)(\d{1,2}):(\d{2})/.exec(time);
  if (!match) {
    return /^\d{4}-\d{2}-\d{2}/.test(time) ? "—" : time;
  }
  const date = new Date(
    Date.UTC(2000, 0, 1, Number(match[1]), Number(match[2])),
  );
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

export function StudentDashboard() {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(
      new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date()),
    );
  }, []);

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
    isError: isInvoicesError,
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
    isError: isPaymentsError,
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
    isError: isNotificationsError,
    refetch: refetchNotifications,
    isFetching: isNotificationsFetching,
  } = useQuery({
    queryKey: ["student-notifications"],
    queryFn: () => fetchNotifications(),
    retry: 1,
    staleTime: 30000,
  });

  const {
    data: scheduleData,
    isLoading: isScheduleLoading,
    isError: isScheduleError,
    isFetching: isScheduleFetching,
    refetch: refetchSchedule,
  } = useQuery({
    queryKey: ["student-schedule"],
    queryFn: fetchStudentSchedule,
    retry: 1,
    staleTime: 30000,
  });

  const {
    data: attendanceData,
    isLoading: isAttendanceLoading,
    isError: isAttendanceError,
    isFetching: isAttendanceFetching,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: ["student-attendance"],
    queryFn: fetchStudentAttendance,
    retry: 1,
    staleTime: 30000,
  });

  const {
    data: transcriptData,
    isLoading: isTranscriptLoading,
    isError: isTranscriptError,
    isFetching: isTranscriptFetching,
    refetch: refetchTranscript,
  } = useQuery({
    queryKey: ["student-transcript"],
    queryFn: fetchStudentTranscript,
    retry: 1,
    staleTime: 30000,
  });

  const {
    data: apiAssignments,
    isLoading: isAssignmentsLoading,
    isError: isAssignmentsError,
    isFetching: isAssignmentsFetching,
    refetch: refetchAssignments,
  } = useQuery({
    queryKey: ["student-assignments"],
    queryFn: fetchStudentAssignments,
    retry: 1,
    staleTime: 30000,
  });

  const isAnyFetching =
    isProfileFetching ||
    isCoursesFetching ||
    isInvoicesFetching ||
    isPaymentsFetching ||
    isNotificationsFetching ||
    isScheduleFetching ||
    isAttendanceFetching ||
    isTranscriptFetching ||
    isAssignmentsFetching;

  // ── Unified Refresh Handler ──────────────────────────────────────────────────
  const handleRefreshAll = async () => {
    const results = await Promise.all([
      refetchProfile(),
      refetchCourses(),
      refetchInvoices(),
      refetchPayments(),
      refetchNotifications(),
      refetchSchedule(),
      refetchAttendance(),
      refetchTranscript(),
      refetchAssignments(),
    ]);
    if (results.some((result) => result.isError)) {
      toast.error("Some dashboard data could not be refreshed");
    } else {
      toast.success("Dashboard data refreshed");
    }
  };

  // ── Synchronized Effective Data ──────────────────────────────────────────────

  // 1. Effective Profile
  const effectiveStudent: Student = useMemo(() => {
    const p = profileData;
    return {
      name: p?.user?.name || "",
      studentId: p?.studentId || "",
      email: p?.user?.email || "",
      phone: p?.phone || p?.user?.phone || "",
      photoUrl: p?.photoUrl || p?.user?.photoUrl || undefined,
      department: p?.department?.name || "",
      departmentCode: p?.department?.code || "",
      program: p?.program?.name || "",
      programCode: p?.program?.code || "",
      currentYear: p?.currentYear ?? 0,
      currentSemester: p?.currentSemester ?? 0,
      admissionYear: p?.admissionYear ?? 0,
    };
  }, [profileData]);

  // 2. Effective Enrolled Courses
  const enrolledCourses: EnrolledCourseEnrollment[] = useMemo(() => {
    return apiEnrolledCourses || [];
  }, [apiEnrolledCourses]);

  const activeEnrollments = useMemo(() => {
    return enrolledCourses.filter((e) => e.status === "ENROLLED");
  }, [enrolledCourses]);

  // Converted CurrentCourse items for dashboard widgets
  const currentCourses: CurrentCourse[] = useMemo(() => {
    return activeEnrollments.map((enr) => {
      const sec = enr.section;
      const crs = sec?.course;
      const fac = sec?.faculty;
      return {
        id: enr.id,
        code: crs?.code || "—",
        title: crs?.title || "—",
        credit: asNumber(crs?.credit),
        section: sec?.name || "—",
        faculty: fac?.user?.name || "—",
        room: sec?.room || "",
      };
    });
  }, [activeEnrollments]);

  const scheduledClasses: ScheduledClass[] = useMemo(() => {
    return asArray(asRecord(scheduleData).classSchedules)
      .map(asRecord)
      .map((item, index) => {
        const section = asRecord(item.section);
        const course = asRecord(section.course);
        const faculty = asRecord(section.faculty);
        return {
          id: asText(item.id) || `schedule-${index}`,
          dayOfWeek: asText(item.dayOfWeek),
          courseCode: asText(course.code) || "—",
          courseName: asText(course.title) || "—",
          faculty: asText(asRecord(faculty.user).name) || "—",
          startTime: formatTime(item.startTime),
          endTime: formatTime(item.endTime),
          room: asText(item.room) || asText(section.room),
          building: asText(item.building) || asText(section.building),
        };
      });
  }, [scheduleData]);

  // Today's classes derived from the backend timetable.
  const todayClasses: TodayClass[] = useMemo(() => {
    if (!today) return [];
    return scheduledClasses.filter(
      (item) =>
        item.dayOfWeek.slice(0, 3).toLowerCase() ===
        today.slice(0, 3).toLowerCase(),
    );
  }, [scheduledClasses, today]);

  // Effective Financials
  const feeSummary: FeeSummaryData = useMemo(() => {
    const invs = apiInvoices || [];
    const total = invs.reduce((acc, i) => acc + (i.amount || 0), 0);
    const paid = invs
      .filter((i) => i.status === "PAID")
      .reduce((acc, i) => acc + (i.amount || 0), 0);
    const pending = invs
      .filter((i) => i.status === "PENDING" || i.status === "OVERDUE")
      .reduce((acc, i) => acc + (i.amount || 0), 0);

    return {
      total,
      paid,
      pending,
      items: invs.map((i) => ({
        id: i.id,
        invoiceNo: i.invoiceNo,
        title: i.title || i.invoiceNo,
        amount: i.amount,
        dueDate: i.dueDate,
        status: i.status,
      })),
    };
  }, [apiInvoices]);

  // Effective Recent Payments
  const recentPayments = useMemo(() => {
    const paymentList = apiPayments || [];

    return paymentList.map((p) => {
      const paymentDate = p.createdAt || p.date;
      return {
        id: p.id,
        invoiceNo: p.invoiceNo || "—",
        amount: p.amount,
        method: p.method,
        status: p.status,
        date: formatDate(paymentDate, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
    });
  }, [apiPayments]);

  // Effective Notifications
  const notifications = useMemo(() => {
    return (apiNotifications || []).map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: formatDate(n.createdAt, {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [apiNotifications]);

  // Effective Dashboard Stats
  const overviewStats = useMemo(() => {
    const transcript = asRecord(transcriptData);
    const academicSummary = asRecord(transcript.academicSummary);
    const attendanceSummary = asRecord(asRecord(attendanceData).summary);

    return {
      cgpa: asNumber(academicSummary.cgpa),
      completedCredits: asNumber(academicSummary.totalCreditsEarned),
      totalCredits: asNumber(profileData?.program?.totalCredits),
      currentCourses: activeEnrollments.length,
      attendance: asNumber(
        String(attendanceSummary.percentage ?? "0").replace("%", ""),
      ),
    };
  }, [activeEnrollments.length, attendanceData, profileData, transcriptData]);

  const gpaHistory: GPAHistory[] = useMemo(() => {
    return asArray(asRecord(transcriptData).semesters)
      .map(asRecord)
      .map((semester) => ({
        semester: [asText(semester.semesterName), asText(semester.semesterYear)]
          .filter(Boolean)
          .join(" "),
        gpa: asNumber(semester.sgpa),
      }))
      .filter((semester) => semester.semester && semester.gpa > 0);
  }, [transcriptData]);

  const attendanceChartData: AttendanceData[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const record of asArray(asRecord(attendanceData).records).map(
      asRecord,
    )) {
      const status = asText(record.status).toUpperCase();
      const label =
        status === "PRESENT"
          ? "Present"
          : status === "LATE"
            ? "Late"
            : status === "ABSENT"
              ? "Absent"
              : null;
      if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return (["Present", "Late", "Absent"] as const)
      .filter((status) => (counts.get(status) ?? 0) > 0)
      .map((status) => ({ status, count: counts.get(status) ?? 0 }));
  }, [attendanceData]);

  const assignments: Assignment[] = useMemo(() => {
    return asArray(apiAssignments)
      .map(asRecord)
      .map((assignment, index) => {
        const course = asRecord(assignment.course);
        const section = asRecord(assignment.section);
        const sectionCourse = asRecord(section.course);
        const deadline = asText(assignment.deadline);
        const rawStatus = asText(
          assignment.submissionStatus ?? asRecord(assignment.submission).status,
        ).toUpperCase();
        const submitted =
          rawStatus === "SUBMITTED" || Boolean(assignment.submittedAt);
        const status: AssignmentStatus =
          rawStatus === "LATE"
            ? "LATE"
            : submitted
              ? "SUBMITTED"
              : deadline && new Date(deadline).getTime() < Date.now()
                ? "OVERDUE"
                : "PENDING";
        return {
          id: asText(assignment.id) || `assignment-${index}`,
          title: asText(assignment.title) || "—",
          course: asText(course.code) || asText(sectionCourse.code) || "—",
          deadline: formatDate(deadline, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          status,
          marks: asNumber(assignment.totalMarks),
        };
      });
  }, [apiAssignments]);

  const upcomingExams: UpcomingExam[] = useMemo(() => {
    return asArray(asRecord(scheduleData).examSchedules)
      .map(asRecord)
      .filter((exam) => {
        const examDate = new Date(asText(exam.examDate));
        return (
          !Number.isNaN(examDate.getTime()) && examDate.getTime() >= Date.now()
        );
      })
      .map((exam, index) => {
        const section = asRecord(exam.section);
        const course = asRecord(section.course);
        const examDate = asText(exam.examDate);
        const examType = asText(exam.type).toUpperCase();
        const type: ExamType =
          examType === "MIDTERM" ||
          examType === "FINAL" ||
          examType === "QUIZ" ||
          examType === "PRACTICAL"
            ? examType
            : "FINAL";
        return {
          id: asText(exam.id) || `exam-${index}`,
          title: asText(exam.title) || asText(exam.type) || "Exam",
          type,
          courseCode: asText(course.code) || "—",
          courseName: asText(course.title) || "—",
          date: formatDate(examDate, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          time: formatTime(exam.startTime ?? examDate),
          room: asText(exam.room) || asText(section.room) || "—",
          totalMarks: asNumber(exam.totalMarks) || undefined,
        };
      });
  }, [scheduleData]);

  // Initial loading state skeleton
  const isInitialLoading =
    isProfileLoading ||
    isCoursesLoading ||
    isInvoicesLoading ||
    isScheduleLoading ||
    isAttendanceLoading ||
    isTranscriptLoading ||
    isAssignmentsLoading;

  const hasApiErrors =
    isProfileError ||
    isCoursesError ||
    isInvoicesError ||
    isPaymentsError ||
    isNotificationsError ||
    isScheduleError ||
    isAttendanceError ||
    isTranscriptError ||
    isAssignmentsError;

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

      {/* ── API Sync Notice ──────────────────────────────────────────────────── */}
      {hasApiErrors && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Some dashboard data could not be loaded
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dashboard sections show only information returned by the
                  backend. Try refreshing or check the API connection.
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
      <DashboardStats
        stats={overviewStats}
        availability={{
          cgpa: Boolean(transcriptData) && !isTranscriptError,
          credits:
            Boolean(transcriptData) &&
            !isTranscriptError &&
            Boolean(profileData?.program?.totalCredits),
          courses: !isCoursesError,
          attendance:
            Boolean(attendanceData) &&
            !isAttendanceError &&
            asNumber(asRecord(asRecord(attendanceData).summary).total) > 0 &&
            asText(asRecord(asRecord(attendanceData).summary).percentage) !==
              "N/A",
        }}
      />

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
            <p className="text-[11px] text-muted-foreground">
              {transcriptData && !isTranscriptError && overviewStats.cgpa > 0
                ? `${overviewStats.cgpa.toFixed(2)} Cumulative`
                : "No published GPA"}
            </p>
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
          <GPAChart data={gpaHistory} />
        </div>

        <div className="lg:col-span-3">
          <AttendanceChart data={attendanceChartData} />
        </div>
      </section>

      {/* ── 6. Coursework Submissions & Scheduled Examinations ────────────────── */}
      <section
        aria-label="Assignments and upcoming exams"
        className="grid gap-6 lg:grid-cols-2"
      >
        <AssignmentsCard assignments={assignments} />
        <UpcomingExams exams={upcomingExams} />
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
                Weekly Schedule
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {currentCourses.length} Courses
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold">
              Weekly Class Schedule
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Class times, days, and rooms from your current timetable.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            {scheduledClasses.length > 0 ? (
              <div className="divide-y divide-border/60 rounded-lg border border-border/60 overflow-hidden">
                {scheduledClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 gap-2 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground font-mono">
                          {cls.courseCode}
                        </span>
                        <span className="text-muted-foreground">
                          {cls.dayOfWeek || "—"}
                        </span>
                      </div>
                      <p className="font-medium text-foreground text-xs">
                        {cls.courseName}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <User className="size-3" />
                        {cls.faculty || "—"}
                      </p>
                    </div>

                    <div className="space-y-1 sm:text-right">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs text-primary bg-primary/5"
                      >
                        <Clock className="mr-1 size-3" />
                        {cls.startTime} - {cls.endTime}
                      </Badge>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 sm:justify-end">
                        <MapPin className="size-3 text-primary" />
                        {[cls.room, cls.building].filter(Boolean).join(", ") ||
                          "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 p-6 text-center text-sm text-muted-foreground">
                No class schedule is available.
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
