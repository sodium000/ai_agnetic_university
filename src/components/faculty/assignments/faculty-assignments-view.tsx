"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  Edit3,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  XCircle,
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createAssignment,
  fetchFacultyAssignments,
  fetchFacultySections,
  mockAssignments,
  mockSections,
  updateAssignment,
} from "@/services/faculty.service";
import type {
  CreateAssignmentPayload,
  FacultyAssignment,
} from "@/types/faculty";

function formatDeadline(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isPast = d < now;
  return {
    label: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    isPast,
  };
}

function AssignmentCard({
  assignment,
  onEdit,
}: {
  assignment: FacultyAssignment;
  onEdit: (a: FacultyAssignment) => void;
}) {
  const { label, time, isPast } = formatDeadline(assignment.deadline);

  return (
    <Card className="border-border/80 shadow-xs hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-sm font-semibold truncate max-w-70">
                {assignment.title}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs shrink-0",
                  isPast
                    ? "border-destructive/30 text-destructive bg-destructive/10"
                    : "border-amber-500/30 text-amber-600 bg-amber-500/10",
                )}
              >
                {isPast ? "Closed" : "Open"}
              </Badge>
            </div>
            {assignment.section && (
              <p className="text-xs text-muted-foreground">
                {assignment.section.course?.code} • {assignment.section.name}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 cursor-pointer"
              onClick={() => onEdit(assignment)}
            >
              <Edit3 className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {assignment.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {assignment.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            {isPast ? (
              <XCircle className="size-3.5 text-destructive" />
            ) : (
              <Clock className="size-3.5 text-amber-500" />
            )}
            {label} at {time}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="size-3.5 text-primary" />
            {assignment.totalMarks} marks
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignmentFormDialog({
  sections,
  editTarget,
  onClose,
  onSuccess,
}: {
  sections: { id: string; name: string; course: { code: string } }[];
  editTarget?: FacultyAssignment;
  onClose: () => void;
  onSuccess: (a: FacultyAssignment) => void;
}) {
  const isEdit = Boolean(editTarget);
  const [form, setForm] = useState<Partial<CreateAssignmentPayload>>({
    sectionId: editTarget?.sectionId ?? sections[0]?.id ?? "",
    title: editTarget?.title ?? "",
    description: editTarget?.description ?? "",
    deadline: editTarget?.deadline
      ? new Date(editTarget.deadline).toISOString().slice(0, 16)
      : "",
    totalMarks: editTarget?.totalMarks ?? 100,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (
        !form.sectionId ||
        !form.title ||
        !form.deadline ||
        !form.totalMarks
      ) {
        throw new Error("Please fill in all required fields.");
      }
      const payload: CreateAssignmentPayload = {
        sectionId: form.sectionId!,
        title: form.title!,
        description: form.description,
        deadline: new Date(form.deadline!).toISOString(),
        totalMarks: Number(form.totalMarks),
      };
      if (isEdit && editTarget) {
        return updateAssignment(editTarget.id, payload);
      }
      return createAssignment(payload);
    },
    onSuccess: (data) => {
      toast.success(isEdit ? "Assignment updated!" : "Assignment created!");
      onSuccess(data);
      onClose();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to save assignment.",
      );
    },
  });

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="asgn-section">Section *</Label>
        <select
          id="asgn-section"
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
        <Label htmlFor="asgn-title">Title *</Label>
        <Input
          id="asgn-title"
          placeholder="Lab Report 1"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="asgn-desc">Description</Label>
        <Textarea
          id="asgn-desc"
          placeholder="Assignment details..."
          rows={3}
          value={form.description ?? ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="asgn-deadline">Deadline *</Label>
          <Input
            id="asgn-deadline"
            type="datetime-local"
            value={form.deadline ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, deadline: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="asgn-marks">Total Marks *</Label>
          <Input
            id="asgn-marks"
            type="number"
            min={1}
            placeholder="100"
            value={form.totalMarks ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, totalMarks: Number(e.target.value) }))
            }
          />
        </div>
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
          {mutation.isPending ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}

export function FacultyAssignmentsView() {
  const [demoData, setDemoData] = useState<FacultyAssignment[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FacultyAssignment | undefined>();
  const queryClient = useQueryClient();

  const { data: sections } = useQuery({
    queryKey: ["faculty-sections"],
    queryFn: () => fetchFacultySections(),
    retry: 1,
  });

  const { data: apiAssignments } = useQuery({
    queryKey: ["faculty-assignments"],
    queryFn: fetchFacultyAssignments,
    retry: 1,
  });

  const assignments = demoData ?? apiAssignments ?? mockAssignments;
  const sectionList = sections ?? mockSections;

  const handleSaved = (a: FacultyAssignment) => {
    queryClient.invalidateQueries({ queryKey: ["faculty-assignments"] });
    setDemoData((prev) => {
      const base = prev ?? apiAssignments ?? [];
      const idx = base.findIndex((x) => x.id === a.id);
      if (idx >= 0) {
        const next = [...base];
        next[idx] = a;
        return next;
      }
      return [a, ...base];
    });
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/faculty"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 gap-1.5 px-2 text-xs text-muted-foreground cursor-pointer",
              )}
            >
              <ArrowLeft className="size-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Assignments
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage assignments for your sections
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(v) => {
            setDialogOpen(v);
            if (!v) setEditTarget(undefined);
          }}
        >
          <DialogTrigger
            render={
              <Button
                size="sm"
                className="gap-2 text-xs cursor-pointer self-start sm:self-auto"
              />
            }
          >
            <Plus className="size-3.5" /> New Assignment
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editTarget ? "Edit Assignment" : "Create Assignment"}
              </DialogTitle>
              <DialogDescription>
                {editTarget
                  ? "Update the assignment details below."
                  : "Fill in the details to post a new assignment."}
              </DialogDescription>
            </DialogHeader>
            <AssignmentFormDialog
              sections={sectionList.map((s) => ({
                id: s.id,
                name: s.name,
                course: { code: s.course.code },
              }))}
              editTarget={editTarget}
              onClose={() => {
                setDialogOpen(false);
                setEditTarget(undefined);
              }}
              onSuccess={handleSaved}
            />
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onEdit={(target) => {
                setEditTarget(target);
                setDialogOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="border-border/80">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <ClipboardList className="size-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm font-medium">No assignments yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first assignment using the button above.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
