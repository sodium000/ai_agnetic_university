"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  BookMarked,
  Building2,
  Calendar,
  CheckCircle,
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
  createAdminProgram,
  fetchAdminDepartments,
  fetchAdminPrograms,
} from "@/services/admin.service";
import type { AdminProgram, CreateProgramPayload } from "@/types/admin";

export function AdminProgramsView() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: departments = [] } = useQuery({
    queryKey: ["admin", "departments"],
    queryFn: fetchAdminDepartments,
  });

  const {
    data: programs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "programs"],
    queryFn: fetchAdminPrograms,
  });

  const createMutation = useMutation({
    mutationFn: createAdminProgram,
    onSuccess: (data) => {
      toast.success(`Degree program ${data.code} created successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin", "programs"] });
      setCreateOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create program"),
  });

  const filteredPrograms = programs.filter((p) => {
    return (
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
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
            Degree Programs
          </h1>
          <p className="text-sm text-muted-foreground">
            Accredited undergraduate and postgraduate degree curricula and graduation criteria.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-2 text-xs cursor-pointer shadow-xs" />}>
            <Plus className="size-3.5" /> New Degree Program
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Degree Program</DialogTitle>
              <DialogDescription>
                Establish degree codes, curriculum length, and credit benchmarks.
              </DialogDescription>
            </DialogHeader>
            <ProgramFormDialog
              departments={departments}
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
            placeholder="Search programs by code or title..."
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

      {/* ── Programs List ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
            Loading degree programs...
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <BookMarked className="size-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-medium text-foreground">No degree programs found</p>
          </div>
        ) : (
          filteredPrograms.map((prog) => (
            <Card
              key={prog.id}
              className="border-border/80 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold text-foreground">
                      {prog.name}
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                      {prog.code}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between border-t pt-2.5">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> Duration
                  </span>
                  <span className="font-semibold text-foreground">
                    {prog.durationYears} Years
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Award className="size-3.5" /> Total Credits
                  </span>
                  <span className="font-semibold text-foreground font-mono">
                    {prog.totalCredits} Credits
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-3.5" /> Department
                  </span>
                  <span className="font-medium text-foreground">
                    {prog.department?.code || "CSE"}
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

function ProgramFormDialog({
  departments,
  onSubmit,
  isLoading,
  onClose,
}: {
  departments: any[];
  onSubmit: (p: CreateProgramPayload) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateProgramPayload>({
    name: "B.Sc. in Computer Science",
    code: "BSC-CSE",
    departmentId: departments[0]?.id || "dept-cse",
    durationYears: 4,
    totalCredits: 140,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.departmentId) {
      toast.error("Please fill in required fields.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Program Title *</Label>
        <Input
          placeholder="B.Sc. in Computer Science"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Program Code *</Label>
        <Input
          placeholder="BSC-CSE"
          value={form.code}
          onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Hosting Department *</Label>
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Duration (Years) *</Label>
          <Input
            type="number"
            min={1}
            max={6}
            value={form.durationYears}
            onChange={(e) => setForm((p) => ({ ...p, durationYears: Number(e.target.value) }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Total Credits *</Label>
          <Input
            type="number"
            min={10}
            max={250}
            value={form.totalCredits}
            onChange={(e) => setForm((p) => ({ ...p, totalCredits: Number(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Create Program"}
        </Button>
      </div>
    </form>
  );
}
