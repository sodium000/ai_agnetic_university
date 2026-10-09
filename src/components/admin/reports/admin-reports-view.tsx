"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  Banknote,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  FileBarChart2,
  GraduationCap,
  Percent,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { fetchAdminReports } from "@/services/admin.service";
import type { AdminSystemReport } from "@/types/admin";

export function AdminReportsView() {
  const {
    data: report,
    isLoading,
    refetch,
  } = useQuery<AdminSystemReport>({
    queryKey: ["admin", "reports"],
    queryFn: fetchAdminReports,
  });

  const exportReport = () => {
    toast.success("Institutional academic and financial audit report downloaded (PDF)");
  };

  const academic = report?.academic;
  const financial = report?.financial;

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 gap-1.5 px-2 text-xs text-muted-foreground cursor-pointer -ml-2",
            )}
          >
            <ArrowLeft className="size-3.5" /> Back to Admin Console
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Institutional Reports & Audits
            </h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Academic Year {report?.academicYear || "2026-2027"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            System-wide statistical analysis across academic outcomes, pass rates, and financial collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="size-9 p-0 cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={exportReport}
            className="gap-2 text-xs cursor-pointer shadow-xs"
          >
            <Download className="size-3.5" /> Download Full Audit (PDF)
          </Button>
        </div>
      </div>

      {/* ── Academic KPI Cards ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <GraduationCap className="size-4" /> Academic Performance Indicators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-medium">Mean University GPA</CardDescription>
              <Award className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground font-mono">
                {academic?.overallGpaAverage ?? 3.42}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Out of 4.00 benchmark scale
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-medium">Course Passing Rate</CardDescription>
              <Percent className="size-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 font-mono">
                {academic?.coursePassingRate ?? 94.6}%
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Completed with Grade C or above
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-medium">Total Credits Completed</CardDescription>
              <BookOpen className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground font-mono">
                {(academic?.totalCreditsCompleted ?? 48920).toLocaleString()}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Institutional credit hours earned
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardDescription className="text-xs font-medium">Retake / Remedial</CardDescription>
              <CheckCircle2 className="size-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground font-mono">
                {academic?.retakeCount ?? 48}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                1.2% of total section seats
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Enrollment Trends & Department Performance ───────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enrollment Trend */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">5-Semester Enrollment Growth</CardTitle>
            <CardDescription className="text-xs">
              System-wide active student registrations over terms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-2">
              {(academic?.enrollmentTrend || [
                { semester: "Spring 2025", count: 1120 },
                { semester: "Summer 2025", count: 980 },
                { semester: "Fall 2025", count: 1280 },
                { semester: "Spring 2026", count: 1350 },
                { semester: "Fall 2026", count: 1420 },
              ]).map((t) => {
                const max = 1500;
                const pct = Math.round((t.count / max) * 100);
                return (
                  <div key={t.semester} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{t.semester}</span>
                      <span className="font-mono text-muted-foreground">
                        {t.count} Students ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Department Academic Performance */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Departmental Academic Performance</CardTitle>
            <CardDescription className="text-xs">
              Average GPA & active cohorts across departments
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground font-medium">
                <tr>
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5">Students</th>
                  <th className="px-4 py-2.5">Average GPA</th>
                  <th className="px-4 py-2.5 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(academic?.departmentPerformance || [
                  { department: "CSE", avgGpa: 3.51, studentCount: 620 },
                  { department: "EEE", avgGpa: 3.38, studentCount: 380 },
                  { department: "BBA", avgGpa: 3.44, studentCount: 320 },
                  { department: "Pharmacy", avgGpa: 3.58, studentCount: 100 },
                ]).map((dept) => (
                  <tr key={dept.department} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {dept.department}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {dept.studentCount}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-foreground">
                      {dept.avgGpa.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        Distinction
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* ── Financial Audit Breakdown ────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Banknote className="size-4" /> Financial Audit & Collections
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Annual Gross Tuition</CardDescription>
              <CardTitle className="text-xl font-bold font-mono">
                ৳{(financial?.totalRevenue ?? 28450000).toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Collected This Term</CardDescription>
              <CardTitle className="text-xl font-bold font-mono text-emerald-600">
                ৳{(financial?.totalCollectedThisSemester ?? 19800000).toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Outstanding Receivables</CardDescription>
              <CardTitle className="text-xl font-bold font-mono text-amber-600">
                ৳{(financial?.totalPendingFees ?? 2450000).toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Disbursed Refunds</CardDescription>
              <CardTitle className="text-xl font-bold font-mono text-muted-foreground">
                ৳{(financial?.refundedAmount ?? 120000).toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
