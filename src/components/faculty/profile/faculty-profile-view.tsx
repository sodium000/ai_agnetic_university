"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  RefreshCw,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  fetchFacultyProfile,
  mockFacultyProfile,
  updateFacultyProfile,
} from "@/services/faculty.service";
import type { FacultyProfile, UpdateFacultyProfilePayload } from "@/types/faculty";

type EditField = "phone" | "designation" | "specialization" | "photoUrl";

function ProfileField({
  label,
  value,
  fieldKey,
  activeField,
  onStartEdit,
  onSave,
  onCancel,
  isSaving,
}: {
  label: string;
  value?: string | null;
  fieldKey: EditField;
  activeField: EditField | null;
  onStartEdit: (f: EditField) => void;
  onSave: (f: EditField, v: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [draft, setDraft] = useState(value ?? "");
  const isEditing = activeField === fieldKey;
  const isLocked = activeField !== null && activeField !== fieldKey;

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-card p-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              className="h-8 text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs cursor-pointer" disabled={isSaving} onClick={() => onSave(fieldKey, draft)}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs cursor-pointer" onClick={onCancel}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm font-medium text-foreground">{value || <span className="text-muted-foreground italic">Not set</span>}</p>
        )}
      </div>
      {!isEditing && !isLocked && (
        <Button variant="ghost" size="sm" className="h-7 text-xs cursor-pointer shrink-0" onClick={() => { setDraft(value ?? ""); onStartEdit(fieldKey); }}>
          Edit
        </Button>
      )}
    </div>
  );
}

export function FacultyProfileView() {
  const queryClient = useQueryClient();
  const [demoProfile, setDemoProfile] = useState<FacultyProfile | null>(null);
  const [activeField, setActiveField] = useState<EditField | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["faculty-profile"],
    queryFn: fetchFacultyProfile,
    retry: 1,
    staleTime: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateFacultyProfilePayload) => {
      if (demoProfile) {
        await new Promise((r) => setTimeout(r, 500));
        return { ...demoProfile, ...payload };
      }
      return updateFacultyProfile(payload);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["faculty-profile"], updated);
      if (demoProfile) setDemoProfile(updated as FacultyProfile);
      setActiveField(null);
      toast.success("Profile updated successfully!");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed."),
  });

  const handleSave = (field: EditField, value: string) => {
    updateMutation.mutate({ [field]: value });
  };

  const profile = data ?? demoProfile;

  if (isError && !demoProfile) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-4xl mx-auto w-full">
        <Link href="/faculty" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1.5 px-2 text-xs text-muted-foreground w-fit cursor-pointer")}>
          <ArrowLeft className="size-3.5" /> Back to Dashboard
        </Link>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <h2 className="font-bold text-lg">Failed to Load Profile</h2>
            <div className="mt-4 flex gap-3">
              <Button onClick={() => refetch()} disabled={isFetching} className="gap-2 text-xs">
                <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} /> Retry
              </Button>
              <Button variant="outline" onClick={() => setDemoProfile(mockFacultyProfile)} className="gap-2 text-xs border-primary/20 text-primary">
                <Sparkles className="size-3.5" /> Load Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isLoading && !profile) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-4xl mx-auto w-full">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
      </main>
    );
  }

  if (!profile) return null;

  const initials = profile.user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-4xl mx-auto w-full">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Link href="/faculty" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1.5 px-2 text-xs text-muted-foreground cursor-pointer")}>
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
          {demoProfile && <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-600 bg-amber-500/10">Demo Mode</Badge>}
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Faculty Profile</h1>
      </div>

      {/* Banner */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="flex items-end gap-4 -mt-12 px-6 pb-6">
          <div className="size-20 rounded-xl border-4 border-background bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
            {initials}
          </div>
          <div className="pb-1 space-y-1">
            <h2 className="text-xl font-bold">{profile.user.name}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="font-mono text-xs">{profile.employeeId}</Badge>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10">{profile.user.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Read-only Info */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Academic Information</CardTitle>
          <CardDescription>Read-only institutional data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Department", value: profile.department.name },
            { label: "Employee ID", value: profile.employeeId },
            { label: "Email", value: profile.user.email },
            { label: "Joining Date", value: profile.joiningDate ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Editable Info */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Professional Details</CardTitle>
          <CardDescription>Click Edit on any field to update</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(["designation", "specialization", "phone"] as EditField[]).map((field) => (
            <ProfileField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={profile[field as keyof typeof profile] as string}
              fieldKey={field}
              activeField={activeField}
              onStartEdit={setActiveField}
              onSave={handleSave}
              onCancel={() => setActiveField(null)}
              isSaving={updateMutation.isPending}
            />
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
