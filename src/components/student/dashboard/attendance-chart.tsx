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
import { attendanceChartConfig } from "@/config/student-dashboard";
import type { AttendanceData } from "@/types/student-dashboard";

interface AttendanceChartProps {
  data: AttendanceData[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  const hasData = data && data.length > 0;
  const totalClasses = hasData
    ? data.reduce((sum, item) => sum + item.count, 0)
    : 0;

  return (
    <Card className="flex flex-col border-border/80 shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold sm:text-lg">
              Attendance Overview
            </CardTitle>
            <CardDescription>
              Class attendance records for current semester
            </CardDescription>
          </div>
          {totalClasses > 0 ? (
            <span className="text-xs font-medium text-muted-foreground">
              Total: {totalClasses} classes
            </span>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {hasData ? (
          <div className="space-y-4">
            <ChartContainer
              config={attendanceChartConfig}
              className="aspect-auto h-[220px] w-full"
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
                  dataKey="status"
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
                      formatter={(val) => [`${val} Classes`, "Count"]}
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

            <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center text-xs">
              {data.map((item) => (
                <div key={item.status} className="space-y-0.5">
                  <span className="text-muted-foreground">{item.status}</span>
                  <p className="font-semibold text-foreground">
                    {item.count}{" "}
                    <span className="text-[10px] text-muted-foreground font-normal">
                      (
                      {totalClasses > 0
                        ? Math.round((item.count / totalClasses) * 100)
                        : 0}
                      %)
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            No attendance records available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
