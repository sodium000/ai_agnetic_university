"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, GraduationCap, Plus, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  createExam,
  fetchFacultyExams,
  fetchFacultySections,
  mockExams,
  mockSections,
} from "@/services/faculty.service";
import type { CreateExamPayload, ExamType, FacultyExam } from "@/types/faculty";

const EXAM_TYPES: ExamType[] = ["MIDTERM", "FINAL", "QUIZ", "PRACTICAL"];

const examTypeColors: Record<ExamType, string> = {
  MIDTERM: "border-blue-500/30 text-blue-600 bg-blue-500/10",
  FINAL: "border-destructive/30 text-destructive bg-destructive/10",
  QUIZ: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
  PRACTICAL: "border-violet-500/30 text-violet-600 bg-violet-500/10",
};

function ExamCard({ exam }: { exam: FacultyExam }) {
  const date = new Date(exam.examDate);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const isPast = now !== null && date.getTime() < now;
  const timeZone = now === null ? "UTC" : undefined;

  return (
    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-sm font-semibold">
                {exam.title}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn("text-xs", examTypeColors[exam.type])}
              >
                {exam.type}
              </Badge>
            </div>
            {exam.section && (
              <CardDescription>
                {exam.section.course?.code} • {exam.section.name}
              </CardDescription>
            )}
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
            <GraduationCap className="size-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Date</span>
          <span
            className={cn(
              "font-medium",
              isPast ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone,
            })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Time</span>
          <span className="font-medium text-foreground">
            {date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone,
            })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total Marks</span>
          <span className="font-medium text-foreground">{exam.totalMarks}</span>
        </div>
        <Badge
          variant={isPast ? "secondary" : "outline"}
          className="mt-1 text-[10px]"
        >
          {isPast ? "Completed" : "Upcoming"}
        </Badge>
      </CardContent>
    </Card>
  );
}

function ExamFormDialog({
  sections,
  onClose,
  onSuccess,
}: {
  sections: { id: string; name: string; course: { code: string } }[];
  onClose: () => void;
  onSuccess: (e: FacultyExam) => void;
}) {
  const [form, setForm] = useState<Partial<CreateExamPayload>>({
    sectionId: sections[0]?.id ?? "",
    title: "",
    type: "MIDTERM",
    examDate: "",
    totalMarks: 50,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (
        !form.sectionId ||
        !form.title ||
        !form.examDate ||
        !form.totalMarks
      ) {
        throw new Error("Please fill in all required fields.");
      }
      return createExam({
        sectionId: form.sectionId!,
        title: form.title!,
        type: form.type as ExamType,
        examDate: new Date(form.examDate!).toISOString(),
        totalMarks: Number(form.totalMarks),
      });
    },
    onSuccess: (data) => {
      toast.success("Exam scheduled successfully!");
      onSuccess(data);
      onClose();
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to schedule exam.",
      ),
  });

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="exam-section">Section *</Label>
        <select
          id="exam-section"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={form.sectionId}
          onChange={(e) =>
            setForm((p) => ({ ...p, sectionId: e.target.value }))
          }
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.course.code} — {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-title">Title *</Label>
        <Input
          id="exam-title"
          placeholder="Midterm Exam 2026"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="exam-type">Type *</Label>
          <select
            id="exam-type"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={form.type}
            onChange={(e) =>
              setForm((p) => ({ ...p, type: e.target.value as ExamType }))
            }
          >
            {EXAM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="exam-marks">Total Marks *</Label>
          <Input
            id="exam-marks"
            type="number"
            min={1}
            value={form.totalMarks ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, totalMarks: Number(e.target.value) }))
            }
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="exam-date">Exam Date & Time *</Label>
        <Input
          id="exam-date"
          type="datetime-local"
          value={form.examDate ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, examDate: e.target.value }))}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="text-xs cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="text-xs cursor-pointer"
        >
          {mutation.isPending ? "Scheduling..." : "Schedule Exam"}
        </Button>
      </div>
    </div>
  );
}

export function FacultyExamsView() {
  const [demoData, setDemoData] = useState<FacultyExam[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: sections } = useQuery({
    queryKey: ["faculty-sections"],
    queryFn: () => fetchFacultySections(),
    retry: 1,
  });

  const { data: apiExams } = useQuery({
    queryKey: ["faculty-exams"],
    queryFn: fetchFacultyExams,
    retry: 1,
  });

  const exams = demoData ?? apiExams ?? mockExams;
  const sectionList = sections ?? mockSections;

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/faculty"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 gap-1.5 px-2 text-xs text-muted-foreground cursor-pointer",
            )}
          >
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Exams
          </h1>
          <p className="text-sm text-muted-foreground">
            Schedule and manage examinations for your sections
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                className="gap-2 text-xs cursor-pointer self-start sm:self-auto"
              />
            }
          >
            <Plus className="size-3.5" /> Schedule Exam
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule Exam</DialogTitle>
              <DialogDescription>
                Create a new exam for one of your course sections.
              </DialogDescription>
            </DialogHeader>
            <ExamFormDialog
              sections={sectionList.map((s) => ({
                id: s.id,
                name: s.name,
                course: { code: s.course.code },
              }))}
              onClose={() => setDialogOpen(false)}
              onSuccess={(e) =>
                setDemoData((prev) => [e, ...(prev ?? apiExams ?? [])])
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      {exams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => (
            <ExamCard key={e.id} exam={e} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <GraduationCap className="size-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm font-medium">No exams scheduled</p>
            <p className="text-xs text-muted-foreground mt-1">
              Schedule your first exam using the button above.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
