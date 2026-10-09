"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
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
  createAdminFaculty,
  fetchAdminDepartments,
  fetchAdminFaculty,
} from "@/services/admin.service";
import type { AdminFacultyMember, CreateFacultyPayload } from "@/types/admin";

export function AdminFacultyView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: departments = [] } = useQuery({
    queryKey: ["admin", "departments"],
    queryFn: fetchAdminDepartments,
  });

  const {
    data: facultyList = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "faculty"],
    queryFn: fetchAdminFaculty,
  });

  const createMutation = useMutation({
    mutationFn: createAdminFaculty,
    onSuccess: (data) => {
      toast.success(`Faculty ${data.name} appointed successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin", "faculty"] });
      setCreateOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create faculty"),
  });

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.designation.toLowerCase().includes(search.toLowerCase()) ||
      (f.specialization && f.specialization.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = !deptFilter || f.departmentId === deptFilter;
    return matchesSearch && matchesDept;
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
            Faculty Directory
          </h1>
          <p className="text-sm text-muted-foreground">
            Appoint professors, assign academic ranks, and manage department staffing.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2 text-xs cursor-pointer shadow-xs" />}>
            <Plus className="size-3.5" /> Appoint Faculty
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Appoint New Faculty Member</DialogTitle>
              <DialogDescription>
                Create faculty credentials and academic profile record.
              </DialogDescription>
            </DialogHeader>
            <FacultyFormDialog
              departments={departments}
              isLoading={createMutation.isPending}
              onClose={() => setCreateOpen(false)}
              onSubmit={(payload) => createMutation.mutate(payload)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Filter Controls ──────────────────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, designation, specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>
            <div>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs"
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setDeptFilter("");
                }}
                className="text-xs h-9 w-full cursor-pointer"
              >
                Clear Filters
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                className="size-9 shrink-0 cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Faculty Cards Grid ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
            Loading faculty records...
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <GraduationCap className="size-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-medium text-foreground">No faculty members found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add a new faculty appointment using the button above.
            </p>
          </div>
        ) : (
          filteredFaculty.map((member) => (
            <Card
              key={member.id}
              className="border-border/80 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold text-foreground">
                      {member.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-primary">
                      {member.designation}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0">
                    {member.department?.code || "FACULTY"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate text-foreground font-mono">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.specialization && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                    <span className="line-clamp-1">{member.specialization}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t pt-2 mt-2 text-[11px]">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="size-3" /> Joined: {member.joiningDate || "2026-01-15"}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {member.employeeId || "ACTIVE"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}

function FacultyFormDialog({
  departments,
  onSubmit,
  isLoading,
  onClose,
}: {
  departments: any[];
  onSubmit: (p: CreateFacultyPayload) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateFacultyPayload>({
    name: "Dr. Rahim",
    email: "rahim@university.edu",
    password: "FacPass@123",
    phone: "01811000000",
    departmentId: departments[0]?.id || "dept-cse",
    designation: "Associate Professor",
    specialization: "Artificial Intelligence",
    joiningDate: "2026-01-15",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.departmentId || !form.designation) {
      toast.error("Please fill in required fields.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Full Name *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Official Email *</Label>
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
          <Label>Temporary Password *</Label>
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
          <Label>Academic Designation *</Label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            value={form.designation}
            onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
          >
            <option value="Professor">Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Assistant Professor">Assistant Professor</option>
            <option value="Senior Lecturer">Senior Lecturer</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Adjunct Faculty">Adjunct Faculty</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Specialization *</Label>
          <Input
            placeholder="e.g. Artificial Intelligence"
            value={form.specialization}
            onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Joining Date *</Label>
          <Input
            type="date"
            value={form.joiningDate}
            onChange={(e) => setForm((p) => ({ ...p, joiningDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={isLoading}>
          {isLoading ? "Appointing..." : "Confirm Appointment"}
        </Button>
      </div>
    </form>
  );
}
