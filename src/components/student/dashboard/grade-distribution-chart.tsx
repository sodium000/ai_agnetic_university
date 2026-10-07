"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { gradeDistributionChartConfig } from "@/config/student-dashboard";
import type { GradeDistribution } from "@/types/student-dashboard";

interface GradeDistributionChartProps {
  data: GradeDistribution[];
}

export function GradeDistributionChart({ data }: GradeDistributionChartProps) {
  const hasData = data && data.length > 0;
  const totalCourses = hasData
    ? data.reduce((sum, item) => sum + item.count, 0)
    : 0;

  return (
    <Card className="flex flex-col border-border/80 shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold sm:text-lg">
              Grade Distribution
            </CardTitle>
            <CardDescription>
              Cumulative course grades achieved across completed terms
            </CardDescription>
          </div>
          {totalCourses > 0 ? (
            <span className="text-xs font-medium text-muted-foreground">
              {totalCourses} Graded Courses
            </span>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {hasData ? (
          <ChartContainer
            config={gradeDistributionChartConfig}
            className="aspect-auto h-[240px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{
                left: 0,
                right: 0,
                top: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="grade"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={32}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)/0.3" }}
                content={
                  <ChartTooltipContent
                    formatter={(val) => [`${val} Courses`, "Achieved"]}
                  />
                }
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
            No grade distribution data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
