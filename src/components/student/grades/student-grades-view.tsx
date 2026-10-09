"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Info,
  Loader2,
  RefreshCw,
  Star,
  TrendingUp,
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { StudentResult } from "@/services/student-grades.service";
import {
  fetchStudentGrades,
  getGradeColor,
  mockGradesData,
  toGPAHistory,
} from "@/services/student-grades.service";
import { GPAChart } from "../dashboard/gpa-chart";
import { GradeDistributionChart } from "../dashboard/grade-distribution-chart";

// ─── Grade badge ──────────────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const colorClass = getGradeColor(grade);
  let bgClass =
    "bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/15";
  if (grade === "A-" || grade === "B+")
    bgClass = "bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/15";
  else if (grade === "B" || grade === "B-")
    bgClass = "bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/15";
  else if (grade.startsWith("C"))
    bgClass = "bg-orange-500/10 border-orange-500/20 dark:bg-orange-500/15";
  else if (grade.startsWith("D") || grade === "F")
    bgClass = "bg-red-500/10 border-red-500/20 dark:bg-red-500/15";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-bold",
        colorClass,
        bgClass,
      )}
    >
      {grade}
    </span>
  );
}

// ─── Exam type badge ──────────────────────────────────────────────────────────

function ExamTypeBadge({ type }: { type: string }) {
  if (type === "MIDTERM")
    return (
      <Badge variant="secondary" className="text-[10px] font-medium">
        Midterm
      </Badge>
    );
  if (type === "QUIZ")
    return (
      <Badge
        variant="outline"
        className="text-[10px] font-medium border-amber-500/40 text-amber-600 dark:text-amber-400"
      >
        Quiz
      </Badge>
    );
  return (
    <Badge
      variant="secondary"
      className="text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
    >
      Final
    </Badge>
  );
}

// ─── Result detail modal ──────────────────────────────────────────────────────

function ResultDetailModal({
  result,
  open,
  onClose,
}: {
  result: StudentResult | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!result) return null;
  const percentage = Math.min(100, (result.marks / 100) * 100);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4 text-primary" />
            {result.courseCode} — Result Details
          </DialogTitle>
          <DialogDescription>{result.courseName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Grade highlight */}
          <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Grade Achieved</p>
              <p
                className={cn(
                  "text-3xl font-black",
                  getGradeColor(result.grade),
                )}
              >
                {result.grade}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Grade Point</p>
              <p className="text-2xl font-bold text-foreground">
                {result.gradePoint.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Marks progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Marks Obtained</span>
              <span className="font-semibold text-foreground">
                {result.marks} / 100
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className="text-right text-[10px] text-muted-foreground">
              {percentage.toFixed(0)}%
            </p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Course Code", value: result.courseCode },
              { label: "Credit Hours", value: `${result.credit} Credit` },
              { label: "Semester", value: result.semester },
              { label: "Exam Type", value: result.type },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-xs font-semibold text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stats card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <Card className="border-border/80 shadow-xs">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            color,
          )}
        >
          <Icon className="size-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {sub && (
            <p className="truncate text-[10px] text-muted-foreground">{sub}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GradesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["cgpa", "gpa", "credits", "results"].map((k) => (
          <Skeleton key={k} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <Skeleton className="h-80 rounded-xl lg:col-span-4" />
        <Skeleton className="h-80 rounded-xl lg:col-span-3" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function StudentGradesView() {
  const queryClient = useQueryClient();
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>("all");

  // ── Query ────────────────────────────────────────────────────────────────────
  const {
    data: apiData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["student-grades"],
    queryFn: fetchStudentGrades,
    retry: 1,
    staleTime: 60000,
  });

  const isOffline = isError && !apiData;
  const gradesData = apiData ?? (isError ? mockGradesData : undefined);

  // ── Refresh ──────────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["student-grades"] });
      await refetch();
      toast.success("Grades refreshed");
    } catch {
      toast.error("Could not refresh grades");
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────────
  const semesters = useMemo(() => {
    if (!gradesData?.results) return [];
    const seen = new Set<string>();
    const list: string[] = [];
    for (const r of gradesData.results) {
      if (!seen.has(r.semester)) {
        seen.add(r.semester);
        list.push(r.semester);
      }
    }
    return list;
  }, [gradesData?.results]);

  const filteredResults = useMemo(() => {
    if (!gradesData?.results) return [];
    if (selectedSemester === "all") return gradesData.results;
    return gradesData.results.filter((r) => r.semester === selectedSemester);
  }, [gradesData?.results, selectedSemester]);

  const semesterStats = useMemo(() => {
    if (!filteredResults.length) return null;
    const totalCredits = filteredResults.reduce((s, r) => s + r.credit, 0);
    const totalPoints = filteredResults.reduce(
      (s, r) => s + r.gradePoint * r.credit,
      0,
    );
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return { gpa, totalCredits, count: filteredResults.length };
  }, [filteredResults]);

  const gpaHistory = useMemo(
    () => toGPAHistory(gradesData?.semesterGPA ?? []),
    [gradesData?.semesterGPA],
  );

  // ── Open detail modal ────────────────────────────────────────────────────────
  const openDetail = (result: StudentResult) => {
    setSelectedResult(result);
    setDetailOpen(true);
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isLoading) {
    return <GradesSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:gap-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/student"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground",
              )}
            >
              <ArrowLeft className="size-3.5" />
              Back to Dashboard
            </Link>
            <span className="text-muted-foreground">•</span>
            <Badge variant="secondary" className="text-xs">
              Semester 6 · Fall 2026
            </Badge>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Grades &amp; Results
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your full academic transcript and GPA progression
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Offline banner ──────────────────────────────────────────────────── */}
      {isOffline && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <span className="font-semibold">Demo mode — </span>
            backend unreachable. Showing sample grades data.
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 shrink-0 text-xs text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
            onClick={handleRefresh}
          >
            Retry
          </Button>
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Star}
          label="CGPA"
          value={gradesData?.cgpa?.toFixed(2) ?? "—"}
          sub="Cumulative Grade Point Average"
          color="bg-primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Semester GPA"
          value={gradesData?.semesterGPA?.at(-1)?.gpa?.toFixed(2) ?? "—"}
          sub="Current semester"
          color="bg-emerald-500"
        />
        <StatCard
          icon={GraduationCap}
          label="Credits Earned"
          value={`${gradesData?.totalCreditsEarned ?? 0}`}
          sub={`of ${gradesData?.totalCreditsRequired ?? 160} required`}
          color="bg-blue-500"
        />
        <StatCard
          icon={Award}
          label="Results Published"
          value={`${gradesData?.results?.length ?? 0}`}
          sub="Across all semesters"
          color="bg-violet-500"
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <section
        aria-label="GPA and grade distribution charts"
        className="grid gap-6 lg:grid-cols-7"
      >
        <div className="lg:col-span-4">
          <GPAChart data={gpaHistory} />
        </div>
        <div className="lg:col-span-3">
          <GradeDistributionChart data={gradesData?.gradeDistribution ?? []} />
        </div>
      </section>

      {/* ── Semester GPA table ───────────────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold sm:text-lg">
            Semester-wise GPA
          </CardTitle>
          <CardDescription>
            GPA and CGPA progression per semester
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:px-6 sm:pb-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  {["Semester", "GPA", "CGPA", "Credits Earned"].map((h) => (
                    <TableHead
                      key={h}
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(gradesData?.semesterGPA ?? []).map((s, i) => {
                  const isLatest =
                    i === (gradesData?.semesterGPA.length ?? 1) - 1;
                  return (
                    <TableRow
                      key={s.semester}
                      className={cn(
                        "border-border/50 hover:bg-muted/30",
                        isLatest && "bg-muted/20",
                      )}
                    >
                      <TableCell className="py-3 font-medium">
                        <div className="flex items-center gap-2">
                          {s.semester}
                          {isLatest && (
                            <Badge variant="secondary" className="text-[10px]">
                              Current
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          className={cn(
                            "font-bold text-sm",
                            getGradeColor(
                              s.gpa >= 3.75
                                ? "A+"
                                : s.gpa >= 3.5
                                  ? "A"
                                  : s.gpa >= 3.25
                                    ? "A-"
                                    : "B+",
                            ),
                          )}
                        >
                          {s.gpa.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-sm font-medium text-foreground">
                        {s.cgpa.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-muted-foreground">
                        {s.creditsEarned} credits
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Results table ───────────────────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-semibold sm:text-lg">
              Course Results
            </CardTitle>
            <CardDescription>
              Click any row for detailed breakdown
            </CardDescription>
          </div>

          {/* Semester filter */}
          <div className="flex flex-wrap gap-1.5">
            <Button
              id="grades-filter-all"
              variant={selectedSemester === "all" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setSelectedSemester("all")}
            >
              All Semesters
            </Button>
            {semesters.map((sem) => (
              <Button
                key={sem}
                id={`grades-filter-${sem.replace(/\s/g, "-")}`}
                variant={selectedSemester === sem ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedSemester(sem)}
              >
                {sem}
              </Button>
            ))}
          </div>
        </CardHeader>

        {/* Semester summary pill */}
        {semesterStats && selectedSemester !== "all" && (
          <div className="mx-6 mb-3 flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs">
            <Info className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              {selectedSemester} —{" "}
              <span className="font-semibold text-foreground">
                {semesterStats.count} courses
              </span>
              , GPA{" "}
              <span
                className={cn(
                  "font-bold",
                  getGradeColor(semesterStats.gpa >= 3.5 ? "A" : "B+"),
                )}
              >
                {semesterStats.gpa.toFixed(2)}
              </span>
              , {semesterStats.totalCredits} credits
            </span>
          </div>
        )}

        <CardContent className="p-0 sm:px-6 sm:pb-4">
          {filteredResults.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="w-[40%] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Course
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Semester
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Credit
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Marks
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Grade
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      GP
                    </TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow
                      key={result.id}
                      className="cursor-pointer border-border/50 hover:bg-muted/30"
                      onClick={() => openDetail(result)}
                    >
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground text-sm">
                              {result.courseCode}
                            </span>
                            <ExamTypeBadge type={result.type} />
                          </div>
                          <p className="truncate text-xs text-muted-foreground max-w-[220px]">
                            {result.courseName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {result.semester}
                      </TableCell>
                      <TableCell className="py-3 text-center text-xs text-muted-foreground">
                        {result.credit}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className="text-xs font-medium text-foreground">
                          {result.marks}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          /100
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <GradeBadge grade={result.grade} />
                      </TableCell>
                      <TableCell className="py-3 text-right font-bold text-sm text-foreground">
                        {result.gradePoint.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-3">
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Award className="size-7 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No results published
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Evaluated marks will appear here once published.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Detail Modal ────────────────────────────────────────────────────── */}
      <ResultDetailModal
        result={selectedResult}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
