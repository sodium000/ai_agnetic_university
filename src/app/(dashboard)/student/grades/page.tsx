import { GradeDistributionChart } from "@/components/student/dashboard/grade-distribution-chart";
import { RecentResults } from "@/components/student/dashboard/recent-results";
import { buttonVariants } from "@/components/ui/button";
import { studentDashboardData } from "@/data/student-dashboard";
import { cn } from "cn";

import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Result | Student Dashboard",
  description:
    "View and manage all your registered courses for the current semester.",
};

export default function StudentGradesPage() {
  const initialData = studentDashboardData;
  const data = initialData;
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/student"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer",
              )}
            >
              <ArrowLeft className="size-3.5" />
              Back to Dashboard
            </Link>
            <span className="text-muted-foreground">•</span>
            <Badge variant="secondary" className="text-xs">
              Semester 6 • Fall 2026
            </Badge>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Results
          </h1>
        </div>
      </div>
      <section
        aria-label="Results and grade breakdown"
        className="grid gap-6 lg:grid-cols-7"
      >
        <div className="lg:col-span-4">
          <RecentResults results={data.results} />
        </div>

        <div className="lg:col-span-3">
          <GradeDistributionChart data={data.gradeDistribution} />
        </div>
      </section>
    </div>
  );
}
