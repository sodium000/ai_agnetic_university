import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  MoreHorizontal,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Assignment, AssignmentStatus } from "@/types/student-dashboard";

function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  switch (status) {
    case "SUBMITTED":
      return (
        <Badge
          variant="secondary"
          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2 className="mr-1 size-3" />
          Submitted
        </Badge>
      );
    case "LATE":
    case "OVERDUE":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 size-3" />
          {status === "OVERDUE" ? "Overdue" : "Late"}
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 text-amber-700 dark:text-amber-400"
        >
          <Clock3 className="mr-1 size-3" />
          Pending
        </Badge>
      );
  }
}

interface AssignmentsCardProps {
  assignments: Assignment[];
}

export function AssignmentsCard({ assignments }: AssignmentsCardProps) {
  const hasAssignments = assignments && assignments.length > 0;
  const pendingCount = hasAssignments
    ? assignments.filter((a) => a.status === "PENDING").length
    : 0;

  return (
    <Card className="flex flex-col border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold sm:text-lg">
              Coursework & Assignments
            </CardTitle>
            {pendingCount > 0 ? (
              <Badge variant="outline" className="text-xs">
                {pendingCount} Pending
              </Badge>
            ) : null}
          </div>
          <CardDescription>
            Upcoming submissions, project reports, and homework
          </CardDescription>
        </div>

        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Assignment actions</span>
        </Button>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {hasAssignments ? (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-col gap-3 rounded-lg border border-border/60 p-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {assignment.title}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {assignment.course}
                  </span>{" "}
                  • {assignment.marks} Total Marks
                </p>

                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3 text-muted-foreground" />
                  Due {assignment.deadline}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end">
                <AssignmentStatusBadge status={assignment.status} />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileCheck2 className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              No assignments found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              You are all caught up on submissions!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
