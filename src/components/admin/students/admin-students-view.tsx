"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserX,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createAdminStudent,
  deleteAdminStudent,
  fetchAdminDepartments,
  fetchAdminPrograms,
  fetchAdminStudents,
  fetchPendingStudentRegistrations,
  approveStudentRegistration,
  updateAdminStudent,
} from "@/services/admin.service";
import type {
  AdminStudent,
  ApproveStudentRegistrationPayload,
  CreateStudentPayload,
  PendingStudentRegistration,
  UpdateStudentPayload,
} from "@/types/admin";

export function AdminStudentsView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [progFilter, setProgFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminStudent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminStudent | null>(null);
  const [hardDelete, setHardDelete] = useState(false);
  const [approvalTarget, setApprovalTarget] =
    useState<PendingStudentRegistration | null>(null);
  const [approvalForm, setApprovalForm] =
    useState<ApproveStudentRegistrationPayload>({
      departmentId: "",
      programId: "",
      admissionYear: new Date().getFullYear(),
      currentYear: 1,
      currentSemester: 1,
    });

  // Queries
  const { data: departments = [] } = useQuery({
    queryKey: ["admin", "departments"],
    queryFn: fetchAdminDepartments,
  });

  const { data: programs = [] } = useQuery({
    queryKey: ["admin", "programs"],
    queryFn: fetchAdminPrograms,
  });

  const pendingRegistrationsQuery = useQuery({
    queryKey: ["admin", "pending-student-registrations"],
    queryFn: fetchPendingStudentRegistrations,
  });
  const pendingRegistrations = pendingRegistrationsQuery.data ?? [];

  const {
    data: students = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "students", { search, deptFilter, progFilter }],
    queryFn: () =>
      fetchAdminStudents({
        search: search || undefined,
        departmentId: deptFilter || undefined,
        programId: progFilter || undefined,
      }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createAdminStudent,
    onSuccess: (data) => {
      toast.success(`Student ${data.user.name} created successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      setCreateOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create student"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStudentPayload }) =>
      updateAdminStudent(id, payload),
    onSuccess: (data) => {
      toast.success(`Student ${data.user.name} updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      setEditTarget(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to update student"),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, hard }: { id: string; hard: boolean }) =>
      deleteAdminStudent(id, hard),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete student"),
  });

  const approveMutation = useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: ApproveStudentRegistrationPayload;
    }) => approveStudentRegistration(userId, payload),
    onSuccess: (student) => {
      toast.success(
        `Student account for ${student.user.name} has been approved.`,
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "pending-student-registrations"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      setApprovalTarget(null);
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to approve student registration.",
      ),
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
            Student Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Search, enroll, update, and manage student academic accounts system-wide.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2 text-xs cursor-pointer shadow-xs" />}>
            <Plus className="size-3.5" /> Register Student
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Student</DialogTitle>
              <DialogDescription>
                Fulfill mandatory university profile and create system login credentials.
              </DialogDescription>
            </DialogHeader>
            <StudentFormDialog
              departments={departments}
              programs={programs}
              onSubmit={(payload) => createMutation.mutate(payload)}
              isLoading={createMutation.isPending}
              onClose={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Pending Student Registrations ({pendingRegistrations.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Assign each applicant an academic program to create their student profile and activate access.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {pendingRegistrationsQuery.isLoading ? (
            <p className="py-5 text-center text-sm text-muted-foreground">
              Loading registration requests...
            </p>
          ) : pendingRegistrationsQuery.isError ? (
            <div className="flex flex-col items-center gap-2 py-5 text-center">
              <p className="text-sm text-destructive">
                {pendingRegistrationsQuery.error instanceof Error
                  ? pendingRegistrationsQuery.error.message
                  : "Could not load student registration requests."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pendingRegistrationsQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : pendingRegistrations.length === 0 ? (
            <p className="py-5 text-center text-sm text-muted-foreground">
              No student registrations are waiting for approval.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-y bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2.5">Applicant</th>
                    <th className="px-3 py-2.5">Phone</th>
                    <th className="px-3 py-2.5">Account Status</th>
                    <th className="px-3 py-2.5">Registered</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {pendingRegistrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-3 py-3">
                        <div className="font-medium">{registration.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {registration.email}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {registration.phone || "—"}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="outline">{registration.status}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        {new Date(registration.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            setApprovalTarget(registration);
                            setApprovalForm({
                              departmentId: "",
                              programId: "",
                              admissionYear: new Date().getFullYear(),
                              currentYear: 1,
                              currentSemester: 1,
                            });
                          }}
                        >
                          <UserCheck className="size-3.5" />
                          Assign & Approve
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={approvalTarget !== null}
        onOpenChange={(open) => {
          if (!open && !approveMutation.isPending) setApprovalTarget(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve Student Registration</DialogTitle>
            <DialogDescription>
              {approvalTarget
                ? `Assign academic details for ${approvalTarget.name}. This creates the student profile and activates the account.`
                : "Assign academic details to activate this student account."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="approval-department">Department</Label>
              <select
                id="approval-department"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={approvalForm.departmentId}
                onChange={(event) =>
                  setApprovalForm((form) => ({
                    ...form,
                    departmentId: event.target.value,
                    programId: "",
                  }))
                }
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.code} — {department.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="approval-program">Program</Label>
              <select
                id="approval-program"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={approvalForm.programId}
                disabled={!approvalForm.departmentId}
                onChange={(event) =>
                  setApprovalForm((form) => ({
                    ...form,
                    programId: event.target.value,
                  }))
                }
              >
                <option value="">Select program</option>
                {programs
                  .filter(
                    (program) =>
                      program.departmentId === approvalForm.departmentId,
                  )
                  .map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.code} — {program.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="approval-admission-year">Admission Year</Label>
                <Input
                  id="approval-admission-year"
                  type="number"
                  min={1900}
                  value={approvalForm.admissionYear}
                  onChange={(event) =>
                    setApprovalForm((form) => ({
                      ...form,
                      admissionYear: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="approval-current-year">Current Year</Label>
                <Input
                  id="approval-current-year"
                  type="number"
                  min={1}
                  value={approvalForm.currentYear}
                  onChange={(event) =>
                    setApprovalForm((form) => ({
                      ...form,
                      currentYear: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="approval-current-semester">Semester</Label>
                <Input
                  id="approval-current-semester"
                  type="number"
                  min={1}
                  value={approvalForm.currentSemester}
                  onChange={(event) =>
                    setApprovalForm((form) => ({
                      ...form,
                      currentSemester: Number(event.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="approval-student-id">Student ID (optional)</Label>
              <Input
                id="approval-student-id"
                value={approvalForm.studentId ?? ""}
                placeholder="Generated automatically if left blank"
                onChange={(event) =>
                  setApprovalForm((form) => ({
                    ...form,
                    studentId: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setApprovalTarget(null)}
                disabled={approveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                disabled={
                  approveMutation.isPending ||
                  !approvalTarget ||
                  !approvalForm.departmentId ||
                  !approvalForm.programId ||
                  approvalForm.admissionYear < 1900 ||
                  approvalForm.currentYear < 1 ||
                  approvalForm.currentSemester < 1
                }
                onClick={() => {
                  if (!approvalTarget) return;
                  approveMutation.mutate({
                    userId: approvalTarget.id,
                    payload: {
                      ...approvalForm,
                      studentId: approvalForm.studentId?.trim() || undefined,
                    },
                  });
                }}
              >
                {approveMutation.isPending ? "Approving..." : "Approve Student"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Filter Controls ──────────────────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:ring-1 focus:ring-ring"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} — {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus:ring-1 focus:ring-ring"
                value={progFilter}
                onChange={(e) => setProgFilter(e.target.value)}
              >
                <option value="">All Programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setDeptFilter("");
                  setProgFilter("");
                }}
                className="text-xs h-9 w-full cursor-pointer"
              >
                Reset Filters
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                className="size-9 shrink-0 cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Students Table ───────────────────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Enrolled Students ({students.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Showing filtered results based on current search and department criteria
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground font-medium">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Department & Program</th>
                  <th className="px-4 py-3">Year / Term</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      Loading students directory...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Users className="size-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="font-medium text-foreground">No students found</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Try adjusting your search criteria or register a new student above.
                      </p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-foreground">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{student.user.name}</div>
                        <div className="text-[11px] text-muted-foreground">{student.gender}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{student.user.email}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {student.user.phone || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {student.department?.code || "CSE"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {student.program?.name || "B.Sc."}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px]">
                          Year {student.currentYear} • Sem {student.currentSemester}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            student.user.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20",
                          )}
                        >
                          {student.user.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button size="icon" variant="ghost" className="size-7 cursor-pointer" />}>
                            <MoreVertical className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem
                              onClick={() => setEditTarget(student)}
                              className="cursor-pointer gap-2"
                            >
                              <Pencil className="size-3.5" /> Edit Record
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setDeleteTarget(student);
                                setHardDelete(false);
                              }}
                              className="text-amber-600 focus:text-amber-600 cursor-pointer gap-2"
                            >
                              <UserX className="size-3.5" /> Deactivate Account
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDeleteTarget(student);
                                setHardDelete(true);
                              }}
                              className="text-destructive focus:text-destructive cursor-pointer gap-2"
                            >
                              <Trash2 className="size-3.5" /> Hard Delete (Permanent)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Edit Student Modal ───────────────────────────────────────────────── */}
      {editTarget && (
        <Dialog open={!!editTarget} onOpenChange={(v) => !v && setEditTarget(null)}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Update Student Record</DialogTitle>
              <DialogDescription>
                Modify profile details for {editTarget.user.name} ({editTarget.studentId})
              </DialogDescription>
            </DialogHeader>
            <EditStudentForm
              student={editTarget}
              departments={departments}
              programs={programs}
              isLoading={updateMutation.isPending}
              onClose={() => setEditTarget(null)}
              onSubmit={(payload) => updateMutation.mutate({ id: editTarget.id, payload })}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* ── Delete / Deactivate Confirmation Modal ───────────────────────────── */}
      {deleteTarget && (
        <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className={hardDelete ? "text-destructive" : ""}>
                {hardDelete ? "Permanently Delete Student" : "Deactivate Student"}
              </DialogTitle>
              <DialogDescription>
                {hardDelete
                  ? `Are you sure you want to permanently delete ${deleteTarget.user.name}? This action cannot be undone.`
                  : `Are you sure you want to deactivate ${deleteTarget.user.name}'s account? They will lose access to the student portal.`}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2 py-3 border-y my-2">
              <input
                type="checkbox"
                id="hard-delete-toggle"
                checked={hardDelete}
                onChange={(e) => setHardDelete(e.target.checked)}
                className="rounded border-input text-destructive focus:ring-destructive cursor-pointer"
              />
              <Label htmlFor="hard-delete-toggle" className="text-xs cursor-pointer">
                Hard delete (?hard=true) — Permanent removal from database
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant={hardDelete ? "destructive" : "default"}
                size="sm"
                onClick={() => deleteMutation.mutate({ id: deleteTarget.id, hard: hardDelete })}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending
                  ? "Processing..."
                  : hardDelete
                    ? "Delete Permanently"
                    : "Confirm Deactivation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}

// ── Forms ─────────────────────────────────────────────────────────────────────

function StudentFormDialog({
  departments,
  programs,
  onSubmit,
  isLoading,
  onClose,
}: {
  departments: any[];
  programs: any[];
  onSubmit: (p: CreateStudentPayload) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateStudentPayload>({
    name: "Ali Rahman",
    email: "ali@student.edu",
    password: "Pass@1234",
    phone: "01711000000",
    departmentId: departments[0]?.id || "dept-cse",
    programId: programs[0]?.id || "prog-bsc-cse",
    admissionYear: 2026,
    currentYear: 1,
    currentSemester: 1,
    gender: "Male",
    dateOfBirth: "2003-04-10",
    address: "45 University Ave",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.departmentId || !form.programId) {
      toast.error("Please fill in required fields.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Name *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email *</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Password *</Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Phone *</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
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
          <Label>Program *</Label>
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

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Admission Year</Label>
          <Input
            type="number"
            value={form.admissionYear}
            onChange={(e) => setForm((p) => ({ ...p, admissionYear: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Current Year</Label>
          <Input
            type="number"
            value={form.currentYear}
            onChange={(e) => setForm((p) => ({ ...p, currentYear: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Current Semester</Label>
          <Input
            type="number"
            value={form.currentSemester}
            onChange={(e) => setForm((p) => ({ ...p, currentSemester: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            value={form.gender}
            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
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
            value={form.dateOfBirth}
            onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Address</Label>
        <Input
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Create Student Account"}
        </Button>
      </div>
    </form>
  );
}

function EditStudentForm({
  student,
  departments,
  programs,
  onSubmit,
  isLoading,
  onClose,
}: {
  student: AdminStudent;
  departments: any[];
  programs: any[];
  onSubmit: (p: UpdateStudentPayload) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<UpdateStudentPayload>({
    name: student.user.name,
    email: student.user.email,
    phone: student.user.phone || "",
    departmentId: student.departmentId,
    programId: student.programId,
    currentYear: student.currentYear,
    currentSemester: student.currentSemester,
    gender: student.gender,
    address: student.address || "",
    status: student.user.status,
  });

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Current Year</Label>
          <Input
            type="number"
            value={form.currentYear}
            onChange={(e) => setForm((p) => ({ ...p, currentYear: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Current Semester</Label>
          <Input
            type="number"
            value={form.currentSemester}
            onChange={(e) => setForm((p) => ({ ...p, currentSemester: Number(e.target.value) }))}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Status</Label>
        <select
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => onSubmit(form)} disabled={isLoading}>
          {isLoading ? "Updating..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
