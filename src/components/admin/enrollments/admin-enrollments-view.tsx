"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Filter,
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  fetchAdminEnrollments,
  fetchAdminSections,
  fetchAdminStudents,
  forceEnrollStudent,
} from "@/services/admin.service";
import type { AdminEnrollment, ForceEnrollPayload } from "@/types/admin";

export function AdminEnrollmentsView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ["admin", "students"],
    queryFn: () => fetchAdminStudents(),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["admin", "sections"],
    queryFn: fetchAdminSections,
  });

  const {
    data: enrollments = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "enrollments"],
    queryFn: fetchAdminEnrollments,
  });

  const forceEnrollMutation = useMutation({
    mutationFn: forceEnrollStudent,
    onSuccess: () => {
      toast.success("Student force enrolled successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "enrollments"] });
      setCreateOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to force enroll student"),
  });

  const filteredEnrollments = enrollments.filter((e) => {
    return (
      !search ||
      e.student?.user.name.toLowerCase().includes(search.toLowerCase()) ||
      e.student?.studentId.toLowerCase().includes(search.toLowerCase()) ||
      e.section?.course.code.toLowerCase().includes(search.toLowerCase()) ||
      e.section?.course.title.toLowerCase().includes(search.toLowerCase())
    );
  });

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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            System-Wide Enrollments
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor course registrations and perform administrative force-enrollments.
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
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button size="sm" className="gap-2 text-xs cursor-pointer shadow-xs" />}>
              <UserCheck className="size-3.5" /> Force Enroll Student
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Administrative Force Enrollment</DialogTitle>
                <DialogDescription>
                  Directly register a student into a designated course section.
                </DialogDescription>
              </DialogHeader>
              <ForceEnrollForm
                students={students}
                sections={sections}
                isLoading={forceEnrollMutation.isPending}
                onClose={() => setCreateOpen(false)}
                onSubmit={(payload) => forceEnrollMutation.mutate(payload)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Filter by student name, ID, or course code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 text-xs h-9"
        />
      </div>

      {/* ── Enrollments Table ─────────────────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Registration Records ({filteredEnrollments.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Institutional course enrollment status and timestamps
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground font-medium">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Course Code & Title</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">Instructor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Enrolled At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      Loading enrollment records...
                    </td>
                  </tr>
                ) : filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Users className="size-8 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="font-medium text-foreground">No enrollments found</p>
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {enr.student?.user.name || "Student"}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {enr.student?.studentId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground font-mono">
                          {enr.section?.course.code || "CSE301"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {enr.section?.course.title} ({enr.section?.course.credit} cr)
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px]">
                          {enr.section?.semester.name || "Fall 2026"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {enr.section?.faculty?.name || "Dr. Rahim"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            enr.status === "ENROLLED"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {enr.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                        {new Date(enr.enrolledAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function ForceEnrollForm({
  students,
  sections,
  onSubmit,
  isLoading,
  onClose,
}: {
  students: any[];
  sections: any[];
  onSubmit: (p: ForceEnrollPayload) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [studentId, setStudentId] = useState(students[0]?.id || "student-1");
  const [sectionId, setSectionId] = useState(sections[0]?.id || "sec-1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !sectionId) {
      toast.error("Please select a student and section.");
      return;
    }
    onSubmit({ studentId, sectionId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Select Student *</Label>
        <select
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.user.name} ({s.studentId})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>Select Course Section *</Label>
        <select
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
        >
          {sections.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.course?.code} — {sec.course?.title} ({sec.semester?.name})
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={isLoading}>
          {isLoading ? "Enrolling..." : "Force Enroll"}
        </Button>
      </div>
    </form>
  );
}
