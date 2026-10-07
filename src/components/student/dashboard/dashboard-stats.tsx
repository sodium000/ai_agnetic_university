import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  NotebookPen,
} from "lucide-react";
import type { ElementType } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { DashboardStats as DashboardStatsType } from "@/types/student-dashboard";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: ElementType;
  badgeText?: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  badgeText,
}: StatCardProps) {
  return (
    <Card className="border-border/80 shadow-xs transition-shadow hover:shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardDescription>

        <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
          <Icon className="size-4 text-primary" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </span>
          {badgeText ? (
            <span className="text-xs font-medium text-muted-foreground">
              {badgeText}
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const creditPercentage = Math.round(
    (stats.completedCredits / stats.totalCredits) * 100,
  );

  const statsItems: StatCardProps[] = [
    {
      title: "Current CGPA",
      value: stats.cgpa.toFixed(2),
      badgeText: "/ 4.00",
      description: "Overall academic performance",
      icon: GraduationCap,
    },
    {
      title: "Completed Credits",
      value: `${stats.completedCredits} / ${stats.totalCredits}`,
      badgeText: `${creditPercentage}%`,
      description: `${creditPercentage}% of degree requirements met`,
      icon: BookOpen,
    },
    {
      title: "Current Courses",
      value: String(stats.currentCourses),
      badgeText: "courses",
      description: "Active courses enrolled this semester",
      icon: NotebookPen,
    },
    {
      title: "Overall Attendance",
      value: `${stats.attendance}%`,
      description:
        stats.attendance >= 80
          ? "Satisfactory attendance record"
          : "Action required to meet threshold",
      icon: CheckCircle2,
    },
  ];

  return (
    <section
      aria-label="Academic statistics overview"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {statsItems.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </section>
  );
}
