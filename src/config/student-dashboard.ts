import type { ChartConfig } from "@/components/ui/chart";

export const gpaChartConfig = {
  gpa: {
    label: "GPA",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const attendanceChartConfig = {
  count: {
    label: "Classes",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const gradeDistributionChartConfig = {
  count: {
    label: "Courses",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;
