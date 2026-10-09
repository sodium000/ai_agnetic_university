"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Building2,
  Layers,
  Plus,
  RefreshCw,
  Search,
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
  createAdminCourse,
  fetchAdminCourses,
  fetchAdminDepartments,
  fetchAdminPrograms,
} from "@/services/admin.service";
import type { AdminCourse, CreateCoursePayload } from "@/types/admin";

export function AdminCoursesView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: departments = [] } = useQuery({
    queryKey: ["admin", "departments"],
    queryFn: fetchAdminDepartments,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ["admin", "programs"],
    queryFn: fetchAdminPrograms,
  });

  const {
    data: courses = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: fetchAdminCourses,
  });

  const createMutation = useMutation({
    mutationFn: createAdminCourse,
    onSuccess: (data) => {
      toast.success(`Course ${data.code} created successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin", "courses"] });
      setCreateOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create course"),
  });

  const filteredCourses = courses.filter((c) => {
    return (
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
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
            Course Catalog
          </h1>
          <p className="text-sm text-muted-foreground">
            Curriculum course offerings, credit allocations, and academic descriptions.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2 text-xs cursor-pointer shadow-xs" />}>
            <Plus className="size-3.5" /> Create Course
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Course to Catalog</DialogTitle>
              <DialogDescription>
                Define new academic course code, credits, and syllabus outline.
              </DialogDescription>
            </DialogHeader>
            <CourseFormDialog
              departments={departments}
              programs={programs}
              isLoading={createMutation.isPending}
              onClose={() => setCreateOpen(false)}
              onSubmit={(payload) => createMutation.mutate(payload)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Search & Filter ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by code or title (e.g. CSE301)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          className="size-9 shrink-0 cursor-pointer"
        >
          <RefreshCw className="size-3.5" />
        </Button>
      </div>

      {/* ── Courses Grid ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
            Loading course catalog...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <BookOpen className="size-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-medium text-foreground">No courses found</p>
          </div>
        ) : (
          filteredCourses.map((c) => (
            <Card
              key={c.id}
              className="border-border/80 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-2.5">
                <div className="flex items-start justify-between gap-2">
                  <Badge className="font-mono text-xs bg-primary text-primary-foreground">
                    {c.code}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {c.credit.toFixed(1)} Credits
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold mt-2 text-foreground">
                  {c.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <p className="line-clamp-2 text-muted-foreground/90 leading-relaxed">
                  {c.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between border-t pt-2.5 text-[11px]">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Building2 className="size-3 text-muted-foreground" />
                    {c.department?.code || "CSE"}
                  </span>
                  <span className="text-muted-foreground">
                    {c.program?.name || "B.Sc. Degree"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}

function CourseFormDialog({
  departments,
  programs,
  onSubmit,
  isLoading,
  onClose,
}: {
  departments: any[];
  programs: any[];
  onSubmit: (p: CreateCoursePayload) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateCoursePayload>({
    code: "CSE301",
    title: "Data Structures",
    description: "Fundamental data structures and algorithms",
    credit: 3.0,
    departmentId: departments[0]?.id || "dept-cse",
    programId: programs[0]?.id || "prog-bsc-cse",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.title || !form.departmentId || !form.programId) {
      toast.error("Please fill in required fields.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Course Code *</Label>
          <Input
            placeholder="CSE301"
            value={form.code}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Credit Value *</Label>
          <Input
            type="number"
            step="0.5"
            min={1}
            max={6}
            value={form.credit}
            onChange={(e) => setForm((p) => ({ ...p, credit: Number(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Course Title *</Label>
        <Input
          placeholder="Data Structures"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Description / Syllabus Outline</Label>
        <textarea
          rows={3}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Fundamental data structures and algorithms..."
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Department *</Label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            value={form.departmentId}
            onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Degree Program *</Label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            value={form.programId}
            onChange={(e) => setForm((p) => ({ ...p, programId: e.target.value }))}
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Create Course"}
        </Button>
      </div>
    </form>
  );
}
