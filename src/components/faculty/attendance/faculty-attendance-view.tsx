"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Check, Users, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  fetchFacultySections,
  fetchFacultyStudents,
  mockSections,
  recordAttendance,
} from "@/services/faculty.service";
import type { AttendanceStatus, TaughtStudent } from "@/types/faculty";

type AttendanceMap = Record<string, AttendanceStatus>;

const statusColor: Record<AttendanceStatus, string> = {
  PRESENT: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  ABSENT: "bg-destructive/10 text-destructive border-destructive/30",
  LATE: "bg-amber-500/10 text-amber-600 border-amber-500/30",
};

function AttendanceContent() {
  const searchParams = useSearchParams();
  const initSection = searchParams.get("sectionId") ?? "";

  const { data: sections } = useQuery({
    queryKey: ["faculty-sections"],
    queryFn: () => fetchFacultySections(),
    retry: 1,
  });

  const sectionList = sections ?? mockSections;
  const [selectedSection, setSelectedSection] = useState(initSection || sectionList[0]?.id || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: students, isLoading } = useQuery({
    queryKey: ["faculty-students", selectedSection],
    queryFn: () => fetchFacultyStudents({ sectionId: selectedSection }),
    enabled: Boolean(selectedSection),
    retry: 1,
  });

  const studentList: TaughtStudent[] = students ?? [];

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const all: AttendanceMap = {};
    studentList.forEach((s) => { all[s.id] = status; });
    setAttendance(all);
  };

  const mutation = useMutation({
    mutationFn: () => {
      const records = studentList.map((s) => ({
        studentId: s.id,
        status: attendance[s.id] ?? "PRESENT",
      }));
      return recordAttendance(selectedSection, { date, records });
    },
    onSuccess: (data) => {
      toast.success(`Attendance recorded for ${data.recorded} students on ${data.date}`);
      setSubmitted(true);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to record attendance."),
  });

  const sectionInfo = sectionList.find((s) => s.id === selectedSection);
  const presentCount = Object.values(attendance).filter((v) => v === "PRESENT").length;
  const absentCount = Object.values(attendance).filter((v) => v === "ABSENT").length;
  const lateCount = Object.values(attendance).filter((v) => v === "LATE").length;

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-5xl mx-auto w-full">
      <div className="space-y-1">
        <Link href="/faculty" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1.5 px-2 text-xs text-muted-foreground cursor-pointer")}>
          <ArrowLeft className="size-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Attendance</h1>
        <p className="text-sm text-muted-foreground">Record student attendance for your sections</p>
      </div>

      {/* Controls */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Session Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="att-section">Section</Label>
            <select
              id="att-section"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedSection}
              onChange={(e) => { setSelectedSection(e.target.value); setAttendance({}); setSubmitted(false); }}
            >
              {sectionList.map((s) => (
                <option key={s.id} value={s.id}>{s.course.code} — {s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="att-date">Date</Label>
            <Input
              id="att-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Students */}
      {selectedSection && (
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  {sectionInfo?.course.code} — {sectionInfo?.name}
                </CardTitle>
                <CardDescription>
                  {studentList.length} students • {date}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {Object.keys(attendance).length > 0 && (
                  <>
                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 bg-emerald-500/10">P: {presentCount}</Badge>
                    <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 bg-amber-500/10">L: {lateCount}</Badge>
                    <Badge variant="outline" className="text-xs border-destructive/30 text-destructive bg-destructive/10">A: {absentCount}</Badge>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => markAll("PRESENT")} className="text-xs h-8 gap-1 cursor-pointer">
                  <Check className="size-3.5" /> All Present
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
              ))
            ) : studentList.length > 0 ? (
              studentList.map((student) => {
                const current = attendance[student.id];
                return (
                  <div key={student.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card p-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {student.user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{student.user.name}</p>
                        <p className="text-xs text-muted-foreground">{student.studentId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(["PRESENT", "LATE", "ABSENT"] as AttendanceStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(student.id, s)}
                          className={cn(
                            "rounded-md border px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer",
                            current === s
                              ? statusColor[s]
                              : "border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30",
                          )}
                        >
                          {s === "PRESENT" ? "P" : s === "ABSENT" ? "A" : "L"}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <Users className="size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No students found for this section.</p>
              </div>
            )}

            {studentList.length > 0 && (
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending || submitted}
                  className="gap-2 text-xs cursor-pointer"
                >
                  {submitted ? (
                    <><Check className="size-3.5" /> Submitted</>
                  ) : mutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <><Calendar className="size-3.5" /> Submit Attendance</>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}

export function FacultyAttendanceView() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center p-10"><div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
      <AttendanceContent />
    </Suspense>
  );
}
