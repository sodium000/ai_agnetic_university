"use client";

import {
  BookOpen,
  Building,
  Calendar,
  GraduationCap,
  Hash,
  Layers,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StudentProfile } from "@/types/student-profile";

interface AcademicInformationProps {
  profile: StudentProfile;
}

export function AcademicInformation({ profile }: AcademicInformationProps) {
  const items = [
    {
      label: "Student ID",
      value: profile.studentId || "N/A",
      icon: <Hash className="size-4 text-primary" />,
      highlight: true,
    },
    {
      label: "Department",
      value: profile.department?.name || "N/A",
      icon: <Building className="size-4 text-primary" />,
    },
    {
      label: "Department Code",
      value: profile.department?.code || "N/A",
      icon: <Layers className="size-4 text-primary" />,
      isCode: true,
    },
    {
      label: "Academic Program",
      value: profile.program?.name || "N/A",
      icon: <GraduationCap className="size-4 text-primary" />,
    },
    {
      label: "Program Code",
      value: profile.program?.code || "N/A",
      icon: <BookOpen className="size-4 text-primary" />,
      isCode: true,
    },
    {
      label: "Admission Year",
      value: profile.admissionYear ? profile.admissionYear.toString() : "N/A",
      icon: <Calendar className="size-4 text-primary" />,
    },
    {
      label: "Current Academic Year",
      value: `Year ${profile.currentYear || 1}`,
      icon: <Calendar className="size-4 text-primary" />,
    },
    {
      label: "Current Semester",
      value: `Semester ${profile.currentSemester || 1}`,
      icon: <Calendar className="size-4 text-primary" />,
    },
  ];

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5 text-primary">
              <GraduationCap className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Academic Information
              </CardTitle>
              <CardDescription className="text-xs">
                Official institutional enrollment data registered with the
                university registrar.
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className="h-6 gap-1 px-2 text-[10px] text-muted-foreground border-border/60"
          >
            <Lock className="size-2.5" />
            <span>Institutional Record</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col justify-between rounded-xl border border-border/50 bg-muted/20 p-3.5 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-muted-foreground/60">{item.icon}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                {item.isCode ? (
                  <Badge
                    variant="secondary"
                    className="font-mono text-xs font-semibold"
                  >
                    {item.value}
                  </Badge>
                ) : item.highlight ? (
                  <span className="font-mono text-base font-bold text-foreground">
                    {item.value}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-foreground sm:text-base">
                    {item.value}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
