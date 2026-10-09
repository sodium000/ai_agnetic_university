"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  RefreshCw,
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
  createAdminSemester,
  fetchAdminSemesters,
} from "@/services/admin.service";
import type { AdminSemester, CreateSemesterPayload, SemesterStatus } from "@/types/admin";

export function AdminSemestersView() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const {
    data: semesters = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "semesters"],
    queryFn: fetchAdminSemesters,
  });

  const createMutation = useMutation({
    mutationFn: createAdminSemester,
    onSuccess: (data) => {
      toast.success(`Semester ${data.name} created successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin", "semesters"] });
      setCreateOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create semester"),
  });

  const statusStyles: Record<SemesterStatus, { badge: string; text: string }> = {
    ACTIVE: {
      badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      text: "Active & Ongoing",
    },
    UPCOMING: {
      badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      text: "Upcoming Term",
    },
    COMPLETED: {
      badge: "bg-muted text-muted-foreground border-border",
      text: "Term Concluded",
    },
  };

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
            Semesters & Academic Terms
          </h1>
          <p className="text-sm text-muted-foreground">
            Schedule academic terms, registration deadlines, and activate university semesters.
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
              <Plus className="size-3.5" /> New Semester
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Academic Semester</DialogTitle>
                <DialogDescription>
                  Define dates and term status (UPCOMING | ACTIVE | COMPLETED).
                </DialogDescription>
              </DialogHeader>
              <SemesterFormDialog
                isLoading={createMutation.isPending}
                onClose={() => setCreateOpen(false)}
                onSubmit={(payload) => createMutation.mutate(payload)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Semesters Grid ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
            Loading semesters...
          </div>
        ) : semesters.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Calendar className="size-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-medium text-foreground">No semesters found</p>
          </div>
        ) : (
          semesters.map((sem) => {
            const style = statusStyles[sem.status] || statusStyles.UPCOMING;
            return (
              <Card
                key={sem.id}
                className="border-border/80 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold">
                        {sem.name}
                      </CardTitle>
                      <CardDescription className="text-xs font-mono">
                        Year {sem.year}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", style.badge)}>
                      {sem.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <div className="space-y-1.5 border-t pt-2.5">
                    <div className="flex items-center justify-between">
                      <span>Start Date</span>
                      <span className="font-medium text-foreground font-mono">
                        {sem.startDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>End Date</span>
                      <span className="font-medium text-foreground font-mono">
                        {sem.endDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Layers className="size-3 text-muted-foreground" /> Sections
                    </span>
                    <span className="font-semibold text-foreground font-mono">
                      {sem.sectionsCount ?? 42} Active
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </main>
  );
}

function SemesterFormDialog({
  onSubmit,
  isLoading,
  onClose,
}: {
  onSubmit: (p: CreateSemesterPayload) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateSemesterPayload>({
    name: "Fall 2026",
    year: 2026,
    status: "UPCOMING",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.year || !form.startDate || !form.endDate) {
      toast.error("Please fill in all fields.");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Semester Name *</Label>
          <Input
            placeholder="Fall 2026"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Year *</Label>
          <Input
            type="number"
            min={2020}
            max={2035}
            value={form.year}
            onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Status *</Label>
        <select
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as SemesterStatus }))}
        >
          <option value="UPCOMING">UPCOMING</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Start Date *</Label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>End Date *</Label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Create Semester"}
        </Button>
      </div>
    </form>
  );
}
