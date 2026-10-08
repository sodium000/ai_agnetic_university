"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  ClipboardList,
  GraduationCap,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  fetchFacultyProfile,
  fetchFacultySections,
  fetchFacultyStudents,
  mockAssignments,
  mockExams,
  mockFacultyProfile,
  mockSections,
} from "@/services/faculty.service";
import type { FacultyProfile, Section } from "@/types/faculty";

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  color = "primary",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  href?: string;
  color?: "primary" | "emerald" | "amber" | "violet";
}) {
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/20",
    emerald: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    violet: "text-violet-600 bg-violet-500/10 border-violet-500/20",
  };

  const card = (
    <Card
      className={cn(
        "border-border/80 shadow-xs transition-all duration-200 hover:shadow-md",
        href && "cursor-pointer hover:-translate-y-0.5",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardDescription>
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-lg border",
            colorMap[color],
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

// ── Section Row ───────────────────────────────────────────────────────────────

function SectionRow({ section }: { section: Section }) {
  const fill = Math.round((section.enrolledCount / section.capacity) * 100);
  const fillColor =
    fill >= 90
      ? "bg-destructive"
      : fill >= 75
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3.5 transition-colors hover:bg-muted/20">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <BookOpen className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-sm text-foreground">
            {section.course.code}
          </span>
          <Badge variant="secondary" className="text-xs">
            {section.name}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              section.semester.status === "ONGOING"
                ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                : "border-border",
            )}
          >
            {section.semester.name}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">
          {section.course.title}
        </p>
        {section.schedule && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {section.schedule}
            {section.room ? ` • ${section.room}` : ""}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", fillColor)}
              style={{ width: `${fill}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {section.enrolledCount}/{section.capacity} students
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Faculty Header ─────────────────────────────────────────────────────────────

function FacultyHeader({ profile }: { profile: FacultyProfile }) {
  const initials = profile.user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden border-border/80 shadow-xs">
      <CardContent className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-2 border-primary/20 sm:size-18">
            {profile.photoUrl || profile.user.photoUrl ? (
              <AvatarImage
                src={(profile.photoUrl || profile.user.photoUrl)!}
                alt={profile.user.name}
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                {profile.user.name}
              </h2>
              <Badge variant="secondary" className="font-mono text-xs">
                {profile.employeeId}
              </Badge>
            </div>
            <p className="text-sm font-medium text-foreground">
              {profile.designation}
            </p>
            <p className="text-xs text-muted-foreground">
              {profile.department.name}
              {profile.specialization ? ` • ${profile.specialization}` : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4 text-xs sm:text-sm sm:grid-cols-3 lg:border-t-0 lg:pt-0 lg:gap-8">
          <div className="space-y-0.5">
            <span className="text-muted-foreground">Department</span>
            <p className="font-medium text-foreground">
              {profile.department.code}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-muted-foreground">Email</span>
            <p className="truncate font-medium text-foreground text-xs">
              {profile.user.email}
            </p>
          </div>
          <div className="col-span-2 space-y-0.5 sm:col-span-1">
            <span className="text-muted-foreground">Phone</span>
            <p className="font-medium text-foreground">
              {profile.phone || profile.user.phone || "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export function FacultyDashboard() {
  const [demoProfile, setDemoProfile] = useState<FacultyProfile | null>(null);

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["faculty-profile"],
    queryFn: fetchFacultyProfile,
    retry: 1,
    staleTime: 30000,
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["faculty-sections"],
    queryFn: () => fetchFacultySections(),
    retry: 1,
    staleTime: 30000,
    enabled: !profileError || !!demoProfile,
  });

  const { data: students } = useQuery({
    queryKey: ["faculty-students"],
    queryFn: () => fetchFacultyStudents(),
    retry: 1,
    staleTime: 60000,
    enabled: !profileError || !!demoProfile,
  });

  const currentProfile = profile ?? demoProfile;
  const currentSections = sections ?? (demoProfile ? mockSections : []);
  const currentStudents = students ?? [];

  // ── Error / Demo ─────────────────────────────────────────────────────────────
  if (profileError && !demoProfile) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
        <Card className="border-destructive/30 bg-destructive/5 shadow-xs">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive mb-4">
              <AlertTriangle className="size-8" />
            </div>
            <h2 className="text-xl font-bold">Failed to Load Dashboard</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Unable to connect to the server. Check your network or authorization.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Button onClick={() => refetch()} disabled={isFetching} className="gap-2 text-xs">
                <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => setDemoProfile(mockFacultyProfile)}
                className="gap-2 text-xs border-primary/20 text-primary hover:bg-primary/5"
              >
                <Sparkles className="size-3.5" />
                Load Demo Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (profileLoading && !currentProfile) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </main>
    );
  }

  if (!currentProfile) return null;

  const firstName = currentProfile.user.name.split(" ")[0];
  const upcomingExams = demoProfile ? mockExams : [];
  const pendingAssignments = demoProfile ? mockAssignments : [];

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
      {/* Welcome + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="size-4 text-primary" />
            <span>Faculty Portal</span>
            <span>•</span>
            <span className="font-medium text-foreground">
              {currentProfile.department.code}
            </span>
            {demoProfile && (
              <Badge
                variant="outline"
                className="text-xs border-amber-500/40 text-amber-600 bg-amber-500/10"
              >
                Demo Mode
              </Badge>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your teaching overview for this semester.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Profile Banner */}
      <FacultyHeader profile={currentProfile} />

      {/* Stats Grid */}
      <section
        aria-label="Faculty overview statistics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Active Sections"
          value={currentSections.filter((s) => s.semester.status === "ONGOING").length}
          description="Course sections this semester"
          icon={BookOpen}
          href="/faculty/sections"
          color="primary"
        />
        <StatCard
          title="Total Students"
          value={currentStudents.length || currentSections.reduce((a, s) => a + s.enrolledCount, 0)}
          description="Students across all sections"
          icon={Users}
          href="/faculty/students"
          color="emerald"
        />
        <StatCard
          title="Assignments"
          value={pendingAssignments.length}
          description="Active assignments posted"
          icon={ClipboardList}
          href="/faculty/assignments"
          color="amber"
        />
        <StatCard
          title="Upcoming Exams"
          value={upcomingExams.length}
          description="Scheduled examinations"
          icon={GraduationCap}
          href="/faculty/exams"
          color="violet"
        />
      </section>

      {/* Sections + Quick Links */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* My Sections */}
        <div className="lg:col-span-8">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold sm:text-lg">
                  My Sections
                </CardTitle>
                <CardDescription>
                  Course sections assigned to you this semester
                </CardDescription>
              </div>
              <Link href="/faculty/sections">
                <Button variant="ghost" size="sm" className="text-xs cursor-pointer">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {sectionsLoading && !currentSections.length ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                ))
              ) : currentSections.length > 0 ? (
                currentSections.slice(0, 4).map((s) => (
                  <SectionRow key={s.id} section={s} />
                ))
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <BookOpen className="size-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No sections assigned this semester.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions + Upcoming */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              <CardDescription>Common faculty tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Take Attendance", href: "/faculty/attendance", icon: Users, color: "text-primary" },
                { label: "Post Assignment", href: "/faculty/assignments", icon: ClipboardList, color: "text-amber-600" },
                { label: "Schedule Exam", href: "/faculty/exams", icon: GraduationCap, color: "text-violet-600" },
                { label: "Post Results", href: "/faculty/results", icon: BookOpen, color: "text-emerald-600" },
              ].map(({ label, href, icon: Icon, color }) => (
                <Link key={label} href={href}>
                  <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30 cursor-pointer">
                    <div className={cn("size-8 flex items-center justify-center rounded-md bg-muted", color)}>
                      <Icon className="size-4" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Exams */}
          {upcomingExams.length > 0 && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Upcoming Exams</CardTitle>
                <CardDescription>Scheduled examinations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-start gap-2.5 rounded-lg border border-border/50 p-3"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-600">
                      <GraduationCap className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {exam.section?.course?.code} •{" "}
                        {new Date(exam.examDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <Badge variant="outline" className="mt-1 text-[10px] py-0">
                        {exam.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
