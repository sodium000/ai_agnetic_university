import { Building2, CalendarCheck, Clock3, MapPin, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TodayClass } from "@/types/student-dashboard";

interface TodayClassesProps {
  classes: TodayClass[];
}

export function TodayClasses({ classes }: TodayClassesProps) {
  const hasClasses = classes && classes.length > 0;

  return (
    <Card className="flex flex-col border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold sm:text-lg">
              Today&apos;s Schedule
            </CardTitle>
            {hasClasses ? (
              <Badge variant="secondary" className="text-xs">
                {classes.length} Sessions
              </Badge>
            ) : null}
          </div>
          <CardDescription>
            Lectures and lab sessions scheduled for today
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {hasClasses ? (
          classes.map((item, index) => {
            const isLast = index === classes.length - 1;

            return (
              <div key={item.id} className="relative flex gap-3.5">
                {/* Timeline connector */}
                {!isLast ? (
                  <div className="absolute left-[7px] top-6 h-[calc(100%+0.5rem)] w-px bg-border/80" />
                ) : null}

                {/* Timeline dot */}
                <div className="relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2 border-background bg-primary shadow-xs ring-2 ring-primary/20" />

                <div className="min-w-0 flex-1 rounded-lg border border-border/60 bg-card p-3.5 shadow-2xs transition-colors hover:bg-muted/30">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {item.courseCode}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="truncate text-xs font-medium text-muted-foreground">
                          {item.courseName}
                        </span>
                      </div>

                      {item.faculty ? (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="size-3" />
                          {item.faculty}
                        </p>
                      ) : null}
                    </div>

                    <Badge
                      variant="outline"
                      className="mt-1 w-fit shrink-0 font-medium text-xs sm:mt-0"
                    >
                      <Clock3 className="mr-1 size-3 text-muted-foreground" />
                      {item.startTime}
                    </Badge>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/50 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground/80">
                      <Clock3 className="size-3 text-muted-foreground" />
                      {item.startTime} - {item.endTime}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground" />
                      {item.room}
                    </span>

                    {item.building ? (
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3 text-muted-foreground" />
                        {item.building}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <CalendarCheck className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              No classes scheduled for today
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Enjoy your free time or prepare for upcoming assessments.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
