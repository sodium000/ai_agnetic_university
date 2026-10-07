import { Calendar, CalendarDays, Clock3, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ExamType, UpcomingExam } from "@/types/student-dashboard";

function ExamTypeBadge({ type }: { type: ExamType }) {
  switch (type) {
    case "MIDTERM":
      return (
        <Badge
          variant="secondary"
          className="border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400"
        >
          Midterm
        </Badge>
      );
    case "FINAL":
      return (
        <Badge
          variant="secondary"
          className="border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400"
        >
          Final
        </Badge>
      );
    case "QUIZ":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 text-amber-700 dark:text-amber-400"
        >
          Quiz
        </Badge>
      );
    case "PRACTICAL":
      return (
        <Badge
          variant="secondary"
          className="border-teal-500/20 bg-teal-500/10 text-teal-700 dark:text-teal-400"
        >
          Practical
        </Badge>
      );
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

interface UpcomingExamsProps {
  exams: UpcomingExam[];
}

export function UpcomingExams({ exams }: UpcomingExamsProps) {
  const hasExams = exams && exams.length > 0;

  return (
    <Card className="flex flex-col border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold sm:text-lg">
              Upcoming Exams
            </CardTitle>
            {hasExams ? (
              <Badge variant="secondary" className="text-xs">
                {exams.length} Scheduled
              </Badge>
            ) : null}
          </div>
          <CardDescription>
            Scheduled midterms, quizzes, and practical assessments
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {hasExams ? (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-start gap-3.5 rounded-lg border border-border/60 p-3.5 transition-colors hover:bg-muted/30"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="size-5" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        {exam.courseCode}
                      </span>{" "}
                      • {exam.courseName}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center gap-2 sm:mt-0">
                    {exam.totalMarks ? (
                      <span className="text-xs text-muted-foreground">
                        {exam.totalMarks} Marks
                      </span>
                    ) : null}
                    <ExamTypeBadge type={exam.type} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground/80">
                    <Calendar className="size-3 text-muted-foreground" />
                    {exam.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 className="size-3 text-muted-foreground" />
                    {exam.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-muted-foreground" />
                    {exam.room}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <CalendarDays className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              No upcoming exams scheduled
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Exam routines will appear here once published by faculty.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
