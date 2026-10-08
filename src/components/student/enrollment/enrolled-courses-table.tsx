"use client";

import { Clock, GraduationCap, Loader2, MapPin, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EnrolledCourseEnrollment } from "@/types/student-course-enrollment";

interface EnrolledCoursesTableProps {
  enrollments: EnrolledCourseEnrollment[];
  onDrop: (enrollmentId: string) => Promise<void>;
  isDropping: boolean;
}

export function EnrolledCoursesTable({
  enrollments,
  onDrop,
  isDropping,
}: EnrolledCoursesTableProps) {
  const [droppingId, setDroppingId] = useState<string | null>(null);

  const handleConfirmDrop = async (id: string) => {
    await onDrop(id);
    setDroppingId(null);
  };

  if (!enrollments.length) {
    return (
      <Card className="border-border/60 shadow-xs">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
          <div className="rounded-full bg-muted p-3 mb-3">
            <GraduationCap className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground text-base">
            No courses enrolled yet
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            You haven't registered for any course sections this semester. Switch
            to the Course Catalog tab to browse and enroll.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              My Registered Courses ({enrollments.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Official courses you are registered in for the current academic
              session.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-xs border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
          >
            {enrollments.reduce(
              (acc, e) => acc + (e.section?.course?.credit || 3),
              0,
            )}{" "}
            Total Credits
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {enrollments.map((enr) => {
          const isCurrentDropping = droppingId === enr.id;

          return (
            <div
              key={enr.id}
              className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-xs font-bold bg-background"
                  >
                    {enr.section?.course?.code || "COURSE"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {enr.section?.name || "Section"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {enr.section?.course?.credit || 3} Credits
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]"
                  >
                    {enr.status}
                  </Badge>
                </div>

                <h4 className="font-semibold text-foreground text-sm sm:text-base pt-0.5">
                  {enr.section?.course?.title || "Course Title"}
                </h4>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                  {enr.section?.faculty?.user?.name && (
                    <span>
                      Instructor:{" "}
                      <strong className="font-medium text-foreground">
                        {enr.section.faculty.user.name}
                      </strong>
                    </span>
                  )}
                  {enr.section?.schedule && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-primary" />
                      {enr.section.schedule}
                    </span>
                  )}
                  {enr.section?.room && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-primary" />
                      {enr.section.room}
                    </span>
                  )}
                </div>
              </div>

              {/* Drop Action */}
              <div className="shrink-0 pt-2 sm:pt-0">
                {isCurrentDropping ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDroppingId(null)}
                      disabled={isDropping}
                      className="h-8 text-xs cursor-pointer"
                    >
                      <X className="size-3.5 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleConfirmDrop(enr.id)}
                      disabled={isDropping}
                      className="h-8 text-xs cursor-pointer"
                    >
                      {isDropping ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin mr-1" />
                          Dropping...
                        </>
                      ) : (
                        "Confirm"
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDroppingId(enr.id)}
                    disabled={isDropping}
                    className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    Drop
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
