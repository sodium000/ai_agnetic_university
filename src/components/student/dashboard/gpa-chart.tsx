"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
import { gpaChartConfig } from "@/config/student-dashboard";
import type { GPAHistory } from "@/types/student-dashboard";

interface GPAChartProps {
  data: GPAHistory[];
}

export function GPAChart({ data }: GPAChartProps) {
  const hasData = data && data.length > 0;

  return (
    <Card className="flex flex-col border-border/80 shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-semibold sm:text-lg">
          GPA Progression
        </CardTitle>
        <CardDescription>
          Semester-wise academic GPA trend across semesters
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {hasData ? (
          <ChartContainer
            config={gpaChartConfig}
            className="aspect-auto h-[260px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={data}
              margin={{
                left: 0,
                right: 12,
                top: 12,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="semester"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value: string) =>
                  value.replace("20", "'").slice(0, 9)
                }
              />
              <YAxis
                domain={[2.5, 4.0]}
                tickLine={false}
                axisLine={false}
                width={36}
                tickCount={5}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(val) => [
                      typeof val === "number" ? val.toFixed(2) : val,
                      "GPA",
                    ]}
                  />
                }
              />
              <Line
                dataKey="gpa"
                type="monotone"
                stroke="var(--color-gpa)"
                strokeWidth={2.5}
                dot={{
                  fill: "var(--color-gpa)",
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            No GPA records found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
