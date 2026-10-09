"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  GraduationCap,
  Pencil,
  Plus,
  RefreshCw,
  Search,
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
  createAdminDepartment,
  fetchAdminDepartments,
  updateAdminDepartment,
} from "@/services/admin.service";
import type {
  AdminDepartment,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "@/types/admin";

export function AdminDepartmentsView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminDepartment | null>(null);

  const {
    data: departments = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "departments"],
    queryFn: fetchAdminDepartments,
  });

  const createMutation = useMutation({
    mutationFn: createAdminDepartment,
    onSuccess: (data) => {
      toast.success(`Department ${data.code} created successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      setCreateOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create department"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDepartmentPayload }) =>
      updateAdminDepartment(id, payload),
    onSuccess: (data) => {
      toast.success(`Department ${data.code} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
      setEditTarget(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to update department"),
  });

  const filteredDepts = departments.filter((d) => {
    return (
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      (d.facultyName && d.facultyName.toLowerCase().includes(search.toLowerCase()))
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
            Academic Departments
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage university faculties, academic divisions, codes, and institutional units.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2 text-xs cursor-pointer shadow-xs" />}>
            <Plus className="size-3.5" /> New Department
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Academic Department</DialogTitle>
              <DialogDescription>
                Define new department codes and associated faculty school.
              </DialogDescription>
            </DialogHeader>
            <DepartmentFormDialog
              onSubmit={(payload) => createMutation.mutate(payload)}
              isLoading={createMutation.isPending}
              onClose={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Search & Actions ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search department name, code, faculty..."
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

      {/* ── Department Grid ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
            Loading departments...
          </div>
        ) : filteredDepts.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Building2 className="size-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-medium text-foreground">No departments found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first department using the button above.
            </p>
          </div>
        ) : (
          filteredDepts.map((dept) => (
            <Card
              key={dept.id}
              className="border-border/80 shadow-xs hover:border-primary/50 transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground font-mono text-xs">
                        {dept.code}
                      </Badge>
                      <CardTitle className="text-base font-semibold">
                        {dept.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                      {dept.facultyName || "General Academic Faculty"}
                    </CardDescription>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditTarget(dept)}
                    className="size-8 cursor-pointer shrink-0"
                    title="Edit Department"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 border-t pt-3 mt-1 text-center">
                  <div className="space-y-0.5">
                    <div className="text-lg font-bold text-foreground font-mono">
                      {dept.programsCount ?? 3}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <BookOpen className="size-3" /> Programs
                    </div>
                  </div>
                  <div className="space-y-0.5 border-x">
                    <div className="text-lg font-bold text-foreground font-mono">
                      {dept.facultyCount ?? 24}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <GraduationCap className="size-3" /> Faculty
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-lg font-bold text-foreground font-mono">
                      {dept.studentsCount ?? 450}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                      <Users className="size-3" /> Students
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      {editTarget && (
        <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Update details for {editTarget.name} ({editTarget.code})
              </DialogDescription>
            </DialogHeader>
            <DepartmentFormDialog
              initialData={{
                name: editTarget.name,
                code: editTarget.code,
                facultyName: editTarget.facultyName || "",
              }}
              isLoading={updateMutation.isPending}
              onClose={() => setEditTarget(null)}
              onSubmit={(payload) => updateMutation.mutate({ id: editTarget.id, payload })}
            />
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}

function DepartmentFormDialog({
  initialData,
  onSubmit,
  isLoading,
  onClose,
}: {
  initialData?: CreateDepartmentPayload;
  onSubmit: (p: CreateDepartmentPayload) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateDepartmentPayload>(
    initialData || {
      name: "Computer Science & Engineering",
      code: "CSE",
      facultyName: "Faculty of Science & Technology",
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.facultyName) {
      toast.error("Please fill in all fields.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Department Name *</Label>
        <Input
          placeholder="Computer Science & Engineering"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Department Code *</Label>
        <Input
          placeholder="CSE"
          value={form.code}
          onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Faculty / School Name *</Label>
        <Input
          placeholder="Faculty of Science & Technology"
          value={form.facultyName}
          onChange={(e) => setForm((p) => ({ ...p, facultyName: e.target.value }))}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Save Changes" : "Create Department"}
        </Button>
      </div>
    </form>
  );
}
