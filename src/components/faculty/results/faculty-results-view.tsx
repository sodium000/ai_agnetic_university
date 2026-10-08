"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Award, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { postResult } from "@/services/faculty.service";
import type { FacultyResult, PostResultPayload } from "@/types/faculty";

const gradeColors: Record<string, string> = {
  "A+": "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
  A: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
  "A-": "border-emerald-500/20 text-emerald-500 bg-emerald-500/5",
  "B+": "border-blue-500/30 text-blue-600 bg-blue-500/10",
  B: "border-blue-500/30 text-blue-600 bg-blue-500/10",
  "B-": "border-blue-500/20 text-blue-500 bg-blue-500/5",
  C: "border-amber-500/30 text-amber-600 bg-amber-500/10",
  D: "border-orange-500/30 text-orange-600 bg-orange-500/10",
  F: "border-destructive/30 text-destructive bg-destructive/10",
};

function PostResultDialog({ onSuccess }: { onSuccess: (r: FacultyResult) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<PostResultPayload>>({ enrollmentId: "", examId: "", marks: undefined });

  const mutation = useMutation({
    mutationFn: () => {
      if (!form.enrollmentId || !form.examId || form.marks === undefined) {
        throw new Error("Please fill in all fields.");
      }
      return postResult({ enrollmentId: form.enrollmentId!, examId: form.examId!, marks: Number(form.marks) });
    },
    onSuccess: (data) => {
      toast.success(`Result posted — Grade: ${data.grade} (${data.gradePoint} GP)`);
      onSuccess(data);
      setOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to post result."),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-2 text-xs cursor-pointer" />}>
        <Plus className="size-3.5" /> Post Result
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Post Result</DialogTitle>
          <DialogDescription>Enter the student enrollment ID, exam ID, and marks to post a result.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="res-enroll">Enrollment ID *</Label>
            <Input id="res-enroll" placeholder="enrollment_uuid" value={form.enrollmentId} onChange={(e) => setForm((p) => ({ ...p, enrollmentId: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="res-exam">Exam ID *</Label>
            <Input id="res-exam" placeholder="exam_uuid" value={form.examId} onChange={(e) => setForm((p) => ({ ...p, examId: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="res-marks">Marks *</Label>
            <Input id="res-marks" type="number" min={0} max={100} placeholder="78" value={form.marks ?? ""} onChange={(e) => setForm((p) => ({ ...p, marks: Number(e.target.value) }))} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => setOpen(false)} className="text-xs cursor-pointer">Cancel</Button>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="text-xs cursor-pointer">
              {mutation.isPending ? "Posting..." : "Post Result"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FacultyResultsView() {
  const [results, setResults] = useState<FacultyResult[]>([]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href="/faculty" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1.5 px-2 text-xs text-muted-foreground cursor-pointer")}>
            <ArrowLeft className="size-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Results</h1>
          <p className="text-sm text-muted-foreground">Post and manage academic results for your students</p>
        </div>
        <PostResultDialog onSuccess={(r) => setResults((prev) => [r, ...prev])} />
      </div>

      {results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((r, i) => (
            <Card key={`${r.id}-${i}`} className="border-border/80 shadow-xs">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Award className="size-7 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{r.marks}</span>
                    <Badge variant="outline" className={cn("text-sm font-bold", gradeColors[r.grade] ?? "")}>
                      {r.grade}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Grade Point: {r.gradePoint.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Award className="size-12 text-muted-foreground/40 mb-4" />
            <p className="text-sm font-medium">No results posted yet</p>
            <p className="text-xs text-muted-foreground mt-1">Use the &quot;Post Result&quot; button to enter student grades.</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
