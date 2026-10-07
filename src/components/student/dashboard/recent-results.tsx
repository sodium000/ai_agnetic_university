import { Award, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Result } from "@/types/student-dashboard";

interface RecentResultsProps {
  results: Result[];
}

export function RecentResults({ results }: RecentResultsProps) {
  const hasResults = results && results.length > 0;

  return (
    <Card className="flex flex-col border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold sm:text-lg">
            Recent Results
          </CardTitle>
          <CardDescription>
            Grades and points evaluated in recent semester assessments
          </CardDescription>
        </div>

        <Button variant="ghost" size="sm" className="text-xs">
          Full Transcript
          <ChevronRight className="ml-1 size-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-0 sm:px-6 sm:pb-4">
        {hasResults ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="w-[45%] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Course
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Credit
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Marks
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Grade
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Point
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {results.map((result) => (
                  <TableRow
                    key={result.courseCode}
                    className="border-border/50 hover:bg-muted/30"
                  >
                    <TableCell className="py-3 font-medium">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground text-sm">
                          {result.courseCode}
                        </span>
                        <p className="truncate text-xs text-muted-foreground">
                          {result.courseName}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-center text-xs text-muted-foreground">
                      {result.credit}
                    </TableCell>

                    <TableCell className="py-3 text-center text-xs font-medium text-foreground">
                      {result.marks}
                    </TableCell>

                    <TableCell className="py-3 text-center">
                      <Badge
                        variant="secondary"
                        className="font-semibold text-xs"
                      >
                        {result.grade}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3 text-right font-semibold text-foreground text-sm">
                      {result.gradePoint.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Award className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              No results published yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Evaluated examination marks will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
