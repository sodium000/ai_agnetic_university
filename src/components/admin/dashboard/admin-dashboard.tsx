"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createAdminCourse,
  createAdminFaculty,
  createAdminStudent,
  fetchAdminDashboardStats,
  fetchAdminEnrollments,
  fetchAdminPayments,
  forceEnrollStudent,
  mockAdminDepartments,
  mockAdminPrograms,
  mockAdminSections,
} from "@/services/admin.service";
import type {
  AdminDashboardStats,
  AdminEnrollment,
  AdminPayment,
} from "@/types/admin";

export function AdminDashboard() {
  const queryClient = useQueryClient();

  // Queries
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery<AdminDashboardStats>({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: fetchAdminDashboardStats,
  });

  const { data: enrollments } = useQuery<AdminEnrollment[]>({
    queryKey: ["admin", "enrollments"],
    queryFn: fetchAdminEnrollments,
  });

  const { data: payments } = useQuery<AdminPayment[]>({
    queryKey: ["admin", "payments"],
    queryFn: fetchAdminPayments,
  });

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin"] }),
      refetchStats(),
    ]);
    toast.success("Dashboard metrics refreshed");
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* ── Top Header Banner ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Academic System
            </span>
            <span className="text-xs text-muted-foreground">• Semester: Fall 2026</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            University Admin Console
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            System-wide statistics, institutional governance, and academic administration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 text-xs cursor-pointer shadow-xs"
          >
            <RefreshCw className="size-3.5" /> Refresh Data
          </Button>
          <QuickActionModals />
        </div>
      </div>

      {/* ── KPI Stat Cards ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total Students"
          value={stats?.totalStudents ?? 1420}
          subtitle="System-wide"
          trend="+12% YoY"
          icon={Users}
          color="emerald"
          href="/admin/students"
        />
        <KpiCard
          title="Total Faculty"
          value={stats?.totalFaculty ?? 86}
          subtitle="Active Members"
          trend="8 Departments"
          icon={GraduationCap}
          color="primary"
          href="/admin/faculty"
        />
        <KpiCard
          title="Departments"
          value={stats?.totalDepartments ?? 8}
          subtitle="Accredited"
          trend="4 Faculties"
          icon={Building2}
          color="amber"
          href="/admin/departments"
        />
        <KpiCard
          title="Total Courses"
          value={stats?.totalCourses ?? 124}
          subtitle="Curriculum"
          trend="42 Sections"
          icon={BookOpen}
          color="indigo"
          href="/admin/courses"
        />
        <KpiCard
          title="Active Enrollments"
          value={stats?.activeEnrollments ?? 3840}
          subtitle="Current Term"
          trend="94% Capacity"
          icon={UserCheck}
          color="violet"
          href="/admin/enrollments"
        />
        <KpiCard
          title="Total Revenue"
          value={`৳${((stats?.totalRevenue ?? 28450000) / 1000000).toFixed(1)}M`}
          subtitle="Collected"
          trend="142 Pending"
          icon={Banknote}
          color="rose"
          href="/admin/payments"
        />
      </div>

      {/* ── Revenue & Enrollment Analytics ────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Monthly Revenue Breakdown */}
        <Card className="lg:col-span-4 shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Tuition & Revenue Stream</CardTitle>
              <CardDescription className="text-xs">
                Monthly revenue collections (in BDT) over current academic year
              </CardDescription>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              View ledger <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2 items-end h-44">
                {(stats?.monthlyRevenue || [
                  { month: "Jan", amount: 2200000 },
                  { month: "Feb", amount: 3100000 },
                  { month: "Mar", amount: 1800000 },
                  { month: "Apr", amount: 4500000 },
                  { month: "May", amount: 2900000 },
                  { month: "Jun", amount: 5100000 },
                  { month: "Jul", amount: 3750000 },
                  { month: "Aug", amount: 5100000 },
                ]).map((item) => {
                  const max = 5500000;
                  const heightPercent = Math.min(100, Math.round((item.amount / max) * 100));
                  return (
                    <div key={item.month} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                        {(item.amount / 100000).toFixed(0)}L
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/80 to-primary transition-all group-hover:from-primary group-hover:to-primary/90"
                      />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary" /> Net Collections: ৳28.45M
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  +18.4% vs Previous Term
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment by Department */}
        <Card className="lg:col-span-3 shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Enrollment Distribution</CardTitle>
              <CardDescription className="text-xs">
                Active students distributed by academic department
              </CardDescription>
            </div>
            <Link
              href="/admin/departments"
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              All depts <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3.5">
              {(stats?.enrollmentByDepartment || [
                { department: "CSE (Computer Science)", count: 1450 },
                { department: "EEE (Electrical Eng)", count: 820 },
                { department: "BBA (Business Admin)", count: 760 },
                { department: "Pharmacy", count: 480 },
                { department: "English & Humanities", count: 330 },
              ]).map((item) => {
                const total = 3840;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.department} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{item.department}</span>
                      <span className="text-muted-foreground font-mono">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Institutional Quick Access Modules ───────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Institutional Governance & Operations
        </h2>
        <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <QuickModuleCard
            title="Student Directory"
            desc="Add profiles, batch filters, manage enrollments"
            href="/admin/students"
            icon={Users}
            count="1,420 Enrolled"
          />
          <QuickModuleCard
            title="Faculty Directory"
            desc="Faculty appointments, profiles & department ranks"
            href="/admin/faculty"
            icon={GraduationCap}
            count="86 Instructors"
          />
          <QuickModuleCard
            title="Degree Programs"
            desc="Curriculum plans, duration, credit requirements"
            href="/admin/programs"
            icon={Layers}
            count="12 Programs"
          />
          <QuickModuleCard
            title="Course Catalog"
            desc="Course syllabus, credits & prerequisite definitions"
            href="/admin/courses"
            icon={BookOpen}
            count="124 Courses"
          />
          <QuickModuleCard
            title="Semesters & Terms"
            desc="Academic calendars, registration dates & statuses"
            href="/admin/semesters"
            icon={Calendar}
            count="Active: Fall 2026"
          />
          <QuickModuleCard
            title="Sections & Schedules"
            desc="Room assignments, weekly timetable & capacity"
            href="/admin/sections"
            icon={Clock}
            count="42 Sections"
          />
          <QuickModuleCard
            title="System Enrollments"
            desc="Force register students, capacity overrides"
            href="/admin/enrollments"
            icon={CheckCircle2}
            count="Force Enroll Hub"
          />
          <QuickModuleCard
            title="System Reports"
            desc="Financial audits, GPA trends, institutional analytics"
            href="/admin/reports"
            icon={TrendingUp}
            count="Executive Analytics"
          />
        </div>
      </div>

      {/* ── Recent Activity Tables ───────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Enrollments */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent Enrollments</CardTitle>
              <CardDescription className="text-xs">
                Real-time course enrollments system-wide
              </CardDescription>
            </div>
            <Link
              href="/admin/enrollments"
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              All enrollments <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {(enrollments?.slice(0, 5) || []).map((enr) => (
                <div key={enr.id} className="flex items-center justify-between px-4 py-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">
                      {enr.student?.user.name || "Student"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {enr.student?.studentId} • {enr.section?.course.code}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      {enr.status}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(enr.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="shadow-xs border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Payment Transactions</CardTitle>
              <CardDescription className="text-xs">
                Verified tuition and registration receipts
              </CardDescription>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              Financial ledger <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {(payments?.slice(0, 5) || []).map((pay) => (
                <div key={pay.id} className="flex items-center justify-between px-4 py-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">
                      {pay.student?.user.name || "Student"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {pay.transactionId} • {pay.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="font-semibold text-foreground font-mono">
                      ৳{pay.amount.toLocaleString()}
                    </span>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      PAID
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  trend: string;
  icon: React.ElementType;
  color: "emerald" | "primary" | "amber" | "indigo" | "violet" | "rose";
  href: string;
}) {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    primary: "text-primary bg-primary/10 border-primary/20",
    amber: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    indigo: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
    violet: "text-violet-600 bg-violet-500/10 border-violet-500/20",
    rose: "text-rose-600 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <Link href={href}>
      <Card className="h-full border-border/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardDescription className="text-xs font-medium text-muted-foreground">
            {title}
          </CardDescription>
          <div className={cn("size-8 flex items-center justify-center rounded-lg border", colorMap[color])}>
            <Icon className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
            <span>{subtitle}</span>
            <span className="font-medium text-foreground">{trend}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickModuleCard({
  title,
  desc,
  href,
  icon: Icon,
  count,
}: {
  title: string;
  desc: string;
  href: string;
  icon: React.ElementType;
  count: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full border-border/70 shadow-xs hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="size-8 rounded-md bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icon className="size-4" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full">
              {count}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {desc}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ── Quick Action Modals ────────────────────────────────────────────────────────

function QuickActionModals() {
  const [openStudent, setOpenStudent] = useState(false);
  const [openFaculty, setOpenFaculty] = useState(false);
  const [openEnroll, setOpenEnroll] = useState(false);
  const queryClient = useQueryClient();

  // New Student State
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    password: "Pass@1234",
    phone: "01711000000",
    departmentId: "dept-cse",
    programId: "prog-bsc-cse",
    admissionYear: 2026,
    currentYear: 1,
    currentSemester: 1,
    gender: "Male",
    dateOfBirth: "2003-04-10",
    address: "45 University Ave",
  });

  // Force Enroll State
  const [enrollForm, setEnrollForm] = useState({
    studentId: "student-1",
    sectionId: "sec-1",
  });

  const studentMutation = useMutation({
    mutationFn: () => createAdminStudent(studentForm),
    onSuccess: (data) => {
      toast.success(`Student created: ${data.user.name} (${data.studentId})`);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setOpenStudent(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create student"),
  });

  const forceEnrollMutation = useMutation({
    mutationFn: () => forceEnrollStudent(enrollForm),
    onSuccess: () => {
      toast.success("Student force-enrolled into section successfully");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setOpenEnroll(false);
    },
    onError: (err: any) => toast.error(err.message || "Force enroll failed"),
  });

  return (
    <div className="flex items-center gap-2">
      {/* Quick Force Enroll */}
      <Dialog open={openEnroll} onOpenChange={setOpenEnroll}>
        <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5 text-xs cursor-pointer" />}>
          <UserCheck className="size-3.5" /> Force Enroll
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Force Enroll Student</DialogTitle>
            <DialogDescription>
              Directly assign a student to a section, overriding capacity limits.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Select Student / ID</Label>
              <Input
                placeholder="Student UUID or ID"
                value={enrollForm.studentId}
                onChange={(e) => setEnrollForm((p) => ({ ...p, studentId: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Select Section</Label>
              <select
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={enrollForm.sectionId}
                onChange={(e) => setEnrollForm((p) => ({ ...p, sectionId: e.target.value }))}
              >
                {mockAdminSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.course?.code} — {s.course?.title} (Sec {s.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setOpenEnroll(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => forceEnrollMutation.mutate()}
                disabled={forceEnrollMutation.isPending}
              >
                {forceEnrollMutation.isPending ? "Enrolling..." : "Confirm Enrollment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Add Student */}
      <Dialog open={openStudent} onOpenChange={setOpenStudent}>
        <DialogTrigger render={<Button size="sm" className="gap-1.5 text-xs cursor-pointer" />}>
          <UserPlus className="size-3.5" /> New Student
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register Student</DialogTitle>
            <DialogDescription>
              Create an authentication account and academic profile for a new student.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  placeholder="Ali Rahman"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="ali@student.edu"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Temporary Password *</Label>
                <Input
                  type="password"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm((p) => ({ ...p, password: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input
                  placeholder="01711000000"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Department *</Label>
                <select
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={studentForm.departmentId}
                  onChange={(e) => setStudentForm((p) => ({ ...p, departmentId: e.target.value }))}
                >
                  {mockAdminDepartments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Program *</Label>
                <select
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={studentForm.programId}
                  onChange={(e) => setStudentForm((p) => ({ ...p, programId: e.target.value }))}
                >
                  {mockAdminPrograms.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.code} — {pr.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Admission Year</Label>
                <Input
                  type="number"
                  value={studentForm.admissionYear}
                  onChange={(e) => setStudentForm((p) => ({ ...p, admissionYear: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Current Year</Label>
                <Input
                  type="number"
                  value={studentForm.currentYear}
                  onChange={(e) => setStudentForm((p) => ({ ...p, currentYear: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Current Semester</Label>
                <Input
                  type="number"
                  value={studentForm.currentSemester}
                  onChange={(e) => setStudentForm((p) => ({ ...p, currentSemester: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <select
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={studentForm.gender}
                  onChange={(e) => setStudentForm((p) => ({ ...p, gender: e.target.value }))}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={studentForm.dateOfBirth}
                  onChange={(e) => setStudentForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input
                placeholder="45 University Ave"
                value={studentForm.address}
                onChange={(e) => setStudentForm((p) => ({ ...p, address: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" size="sm" onClick={() => setOpenStudent(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => studentMutation.mutate()}
                disabled={studentMutation.isPending}
              >
                {studentMutation.isPending ? "Creating..." : "Create Student"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
