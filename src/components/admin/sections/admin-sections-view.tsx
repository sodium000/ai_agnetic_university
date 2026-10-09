"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
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
  createAdminSection,
  fetchAdminCourses,
  fetchAdminFaculty,
  fetchAdminSections,
  fetchAdminSemesters,
} from "@/services/admin.service";
import type {
  AdminSection,
  CreateSectionPayload,
  DayOfWeek,
  SectionSchedule,
} from "@/types/admin";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export function AdminSectionsView() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: fetchAdminCourses,
  });

  const { data: semesters = [] } = useQuery({
    queryKey: ["admin", "semesters"],
    queryFn: fetchAdminSemesters,
  });

  const { data: faculty = [] } = useQuery({
    queryKey: ["admin", "faculty"],
    queryFn: fetchAdminFaculty,
  });

  const {
    data: sections = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "sections"],
    queryFn: fetchAdminSections,
  });

  const createMutation = useMutation({
    mutationFn: createAdminSection,
    onSuccess: () => {
      toast.success("Course section created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "sections"] });
      setCreateOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create section"),
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
            Course Sections & Timetable
          </h1>
          <p className="text-sm text-muted-foreground">
            Schedule section cohorts, classroom rooms, building allocations, and faculty lecturers.
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
              <Plus className="size-3.5" /> Create Section
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Course Section</DialogTitle>
                <DialogDescription>
                  Configure section capacity, assigned instructor, and weekly class timetable.
                </DialogDescription>
              </DialogHeader>
              <SectionFormDialog
                courses={courses}
                semesters={semesters}
                faculty={faculty}
                isLoading={createMutation.isPending}
                onClose={() => setCreateOpen(false)}
                onSubmit={(payload) => createMutation.mutate(payload)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Sections Grid ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
            Loading course sections...
          </div>
        ) : sections.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <Layers className="size-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-medium text-foreground">No course sections scheduled</p>
          </div>
        ) : (
          sections.map((sec) => (
            <Card
              key={sec.id}
              className="border-border/80 shadow-xs hover:border-primary/50 transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="font-mono text-xs bg-primary text-primary-foreground">
                        {sec.course?.code || "COURSE"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {sec.semester?.name || "Fall 2026"}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold mt-1">
                      {sec.course?.title || "Academic Course"}
                    </CardTitle>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-foreground font-mono">
                      {sec.enrolledCount ?? 0} / {sec.capacity}
                    </span>
                    <p className="text-[10px] text-muted-foreground">Capacity</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between border-t pt-2.5">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <GraduationCap className="size-3.5 text-primary" />
                    {sec.faculty?.name || "Dr. Rahim"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {sec.faculty?.designation || "Instructor"}
                  </span>
                </div>

                {/* Schedules */}
                <div className="space-y-1.5 bg-muted/40 p-2.5 rounded-lg border">
                  <div className="text-[11px] font-medium text-foreground flex items-center gap-1">
                    <Clock className="size-3 text-muted-foreground" /> Timetable Schedules
                  </div>
                  {sec.schedules && sec.schedules.length > 0 ? (
                    <div className="space-y-1">
                      {sec.schedules.map((sch, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-[11px] text-muted-foreground"
                        >
                          <span className="font-medium text-foreground">
                            {sch.dayOfWeek} {sch.startTime} – {sch.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" /> {sch.room}, {sch.building}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted-foreground italic">
                      Mon, Wed 09:00 - 10:30 (Room 301, CSE Bldg)
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}

function SectionFormDialog({
  courses,
  semesters,
  faculty,
  onSubmit,
  isLoading,
  onClose,
}: {
  courses: any[];
  semesters: any[];
  faculty: any[];
  onSubmit: (p: CreateSectionPayload) => void;
  isLoading: boolean;
  onClose: () => void;
}) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "course-cse301");
  const [semesterId, setSemesterId] = useState(semesters[0]?.id || "sem-fall-2026");
  const [facultyId, setFacultyId] = useState(faculty[0]?.id || "fac-1");
  const [capacity, setCapacity] = useState(40);

  const [schedules, setSchedules] = useState<SectionSchedule[]>([
    {
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "10:30",
      room: "Room 301",
      building: "CSE Building",
    },
  ]);

  const addSchedule = () => {
    setSchedules((prev) => [
      ...prev,
      {
        dayOfWeek: "WEDNESDAY",
        startTime: "09:00",
        endTime: "10:30",
        room: "Room 301",
        building: "CSE Building",
      },
    ]);
  };

  const removeSchedule = (index: number) => {
    if (schedules.length === 1) return;
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: keyof SectionSchedule, val: any) => {
    setSchedules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !semesterId || !facultyId || capacity <= 0) {
      toast.error("Please fill in required fields.");
      return;
    }
    onSubmit({
      courseId,
      semesterId,
      facultyId,
      capacity,
      schedules,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Select Course *</Label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Semester Term *</Label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            value={semesterId}
            onChange={(e) => setSemesterId(e.target.value)}
          >
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Assigned Faculty *</Label>
          <select
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
          >
            {faculty.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.designation})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Seat Capacity *</Label>
          <Input
            type="number"
            min={1}
            max={150}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            required
          />
        </div>
      </div>

      {/* Schedules Section */}
      <div className="space-y-2 border-t pt-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Weekly Schedules</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSchedule}
            className="text-[11px] h-7 gap-1 cursor-pointer"
          >
            <Plus className="size-3" /> Add Schedule Slot
          </Button>
        </div>

        <div className="space-y-3">
          {schedules.map((sch, idx) => (
            <div key={idx} className="p-3 border rounded-md bg-muted/30 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-foreground">
                  Slot #{idx + 1}
                </span>
                {schedules.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeSchedule(idx)}
                    className="size-6 text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px]">Day</Label>
                  <select
                    className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                    value={sch.dayOfWeek}
                    onChange={(e) => updateSchedule(idx, "dayOfWeek", e.target.value as DayOfWeek)}
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[10px]">Start Time</Label>
                  <Input
                    type="time"
                    className="h-8 text-xs"
                    value={sch.startTime}
                    onChange={(e) => updateSchedule(idx, "startTime", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">End Time</Label>
                  <Input
                    type="time"
                    className="h-8 text-xs"
                    value={sch.endTime}
                    onChange={(e) => updateSchedule(idx, "endTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Room</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="Room 301"
                    value={sch.room}
                    onChange={(e) => updateSchedule(idx, "room", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Building</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="CSE Building"
                    value={sch.building}
                    onChange={(e) => updateSchedule(idx, "building", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Create Section"}
        </Button>
      </div>
    </form>
  );
}
