"use client";

import {
  Check,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  EnrolledCourseEnrollment,
  SectionData,
} from "@/types/student-course-enrollment";

interface CourseSectionCardProps {
  section: SectionData;
  enrollmentRecord?: EnrolledCourseEnrollment;
  isEnrolledThisSection: boolean;
  isEnrolledOtherSection: boolean;
  isEnrolling: boolean;
  isDropping: boolean;
  onEnroll: (sectionId: string) => Promise<void>;
  onDrop: (enrollmentId: string) => Promise<void>;
}

export function CourseSectionCard({
  section,
  enrollmentRecord,
  isEnrolledThisSection,
  isEnrolledOtherSection,
  isEnrolling,
  isDropping,
  onEnroll,
  onDrop,
}: CourseSectionCardProps) {
  const [showDropConfirm, setShowDropConfirm] = useState(false);

  const isFull =
    section.capacity !== undefined &&
    section.enrolledCount !== undefined &&
    section.enrolledCount >= section.capacity;

  const handleEnrollClick = async () => {
    if (
      isEnrolledThisSection ||
      isEnrolledOtherSection ||
      isFull ||
      isEnrolling
    ) {
      return;
    }
    await onEnroll(section.id);
  };

  const handleConfirmDrop = async () => {
    if (!enrollmentRecord) return;
    await onDrop(enrollmentRecord.id);
    setShowDropConfirm(false);
  };

  return (
    <Card
      className={cn(
        "group flex flex-col justify-between overflow-hidden border transition-all duration-200",
        isEnrolledThisSection
          ? "border-emerald-500/40 bg-emerald-500/5 shadow-xs ring-1 ring-emerald-500/20"
          : isEnrolledOtherSection
            ? "border-border/60 bg-muted/20 opacity-80"
            : "border-border/60 bg-card hover:border-border hover:shadow-xs",
      )}
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="font-mono text-xs font-bold bg-background"
                >
                  {section.course.code}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {section.course.credit} Credits
                </Badge>
                {section.course.department && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-muted-foreground"
                  >
                    {section.course.department}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base font-semibold leading-snug pt-1 text-foreground">
                {section.course.title}
              </CardTitle>
            </div>

            {/* Status Badges */}
            <div className="shrink-0">
              {isEnrolledThisSection ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold text-xs"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Enrolled</span>
                </Badge>
              ) : isEnrolledOtherSection ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs"
                >
                  <Info className="size-3.5" />
                  <span>Other Section</span>
                </Badge>
              ) : isFull ? (
                <Badge variant="destructive" className="text-xs">
                  Section Full
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground border-border/80"
                >
                  Available
                </Badge>
              )}
            </div>
          </div>

          {section.course.description && (
            <CardDescription className="line-clamp-2 text-xs pt-1">
              {section.course.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-3 pb-3 text-xs text-muted-foreground">
          {/* Section & Faculty */}
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2.5">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground/80 block">
                Section
              </span>
              <span className="font-medium text-foreground text-xs">
                {section.name}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground/80 block">
                Instructor
              </span>
              <span
                className="font-medium text-foreground text-xs truncate block"
                title={section.faculty?.user?.name}
              >
                {section.faculty?.user?.name || "Faculty Member"}
              </span>
            </div>
          </div>

          {/* Schedule & Venue */}
          <div className="space-y-1.5 pt-1">
            {section.schedule && (
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 text-primary shrink-0" />
                <span className="text-foreground/90">{section.schedule}</span>
              </div>
            )}
            {section.room && (
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span>{section.room}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5 text-muted-foreground shrink-0" />
                <span>
                  {section.enrolledCount ?? 0} / {section.capacity} seats filled
                </span>
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {Math.max(0, section.capacity - (section.enrolledCount ?? 0))}{" "}
                seats left
              </span>
            </div>
          </div>

          {/* Enrolled Details if already enrolled */}
          {isEnrolledThisSection && enrollmentRecord && (
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-2 text-[11px] text-emerald-700 dark:text-emerald-300">
              <p className="font-medium flex items-center gap-1">
                <Check className="size-3" />
                You are registered in this section for{" "}
                {section.semester?.name || "current term"}.
              </p>
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="pt-2 border-t border-border/40">
        {/* Drop Confirmation Mode */}
        {showDropConfirm ? (
          <div className="w-full space-y-2">
            <p className="text-xs text-destructive font-medium text-center">
              Drop this enrollment?
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDropConfirm(false)}
                disabled={isDropping}
                className="flex-1 h-8 text-xs cursor-pointer"
              >
                <X className="size-3.5 mr-1" />
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDrop}
                disabled={isDropping}
                className="flex-1 h-8 text-xs cursor-pointer"
              >
                {isDropping ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1" />
                    Dropping...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5 mr-1" />
                    Confirm Drop
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between gap-2">
            {isEnrolledThisSection ? (
              <>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" />
                  Enrolled
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDropConfirm(true)}
                  disabled={isDropping}
                  className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Drop Course
                </Button>
              </>
            ) : isEnrolledOtherSection ? (
              <div className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="w-full h-8 text-xs opacity-60 cursor-not-allowed"
                >
                  Enrolled in Another Section
                </Button>
              </div>
            ) : isFull ? (
              <div className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled
                  className="w-full h-8 text-xs opacity-60 cursor-not-allowed"
                >
                  Section Full
                </Button>
              </div>
            ) : (
              <div className="w-full">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleEnrollClick}
                  disabled={isEnrolling}
                  className="w-full h-8 gap-1.5 text-xs font-medium cursor-pointer"
                >
                  {isEnrolling ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-3.5" />
                      <span>Enroll in Section</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
