"use client";

import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { StudentProfile } from "@/types/student-profile";

interface ProfileHeaderProps {
  profile: StudentProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const currentPhoto = profile.photoUrl || profile.user?.photoUrl || undefined;
  const studentName = profile.user?.name || "Student";
  const studentId = profile.studentId || "N/A";
  const deptName = profile.department?.name || "Department";
  const deptCode = profile.department?.code || "";
  const programName = profile.program?.name || "Academic Program";
  const role = profile.user?.role || "STUDENT";

  // Check which editable fields might be missing if incomplete
  const missingFields: string[] = [];
  if (!profile.phone && !profile.user?.phone) missingFields.push("Phone");
  if (!profile.dateOfBirth) missingFields.push("Date of Birth");
  if (!profile.gender) missingFields.push("Gender");
  if (!profile.address) missingFields.push("Address");
  if (!profile.photoUrl && !profile.user?.photoUrl) missingFields.push("Photo");

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card via-card to-muted/20 shadow-xs">
      <div className="h-24 sm:h-32 w-full bg-gradient-to-r from-primary/15 via-primary/5 to-muted border-b border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {profile.isProfileComplete ? (
            <Badge
              variant="outline"
              className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium px-3 py-1 shadow-xs"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Profile Complete</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium px-3 py-1 shadow-xs"
            >
              <AlertCircle className="size-3.5" />
              <span>Profile Incomplete</span>
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="relative px-6 pb-6 pt-0">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end -mt-12 sm:-mt-14">
          {/* Avatar */}
          <Avatar className="size-24 sm:size-28 rounded-2xl border-4 border-background shadow-lg ring-1 ring-border/50">
            <AvatarImage
              src={currentPhoto}
              alt={studentName}
              className="object-cover"
            />
            <AvatarFallback className="rounded-2xl text-2xl font-bold bg-primary/10 text-primary">
              {getInitials(studentName)}
            </AvatarFallback>
          </Avatar>

          {/* Name & Academic Meta */}
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {studentName}
              </h1>
              <Badge
                variant="secondary"
                className="font-mono text-xs font-semibold"
              >
                {studentId}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs bg-primary/5 text-primary border-primary/20"
              >
                {role}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                <GraduationCap className="size-4 text-primary shrink-0" />
                <span>{programName}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Building2 className="size-3.5 shrink-0" />
                <span>
                  {deptName} {deptCode ? `(${deptCode})` : ""}
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" />
                <span>
                  Year {profile.currentYear}, Semester {profile.currentSemester}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Missing fields notice if profile is not complete */}
        {!profile.isProfileComplete && missingFields.length > 0 && (
          <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-medium">
                Please complete your profile information.
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Pending editable items:{" "}
                <span className="font-semibold">
                  {missingFields.join(", ")}
                </span>
                . You can update each field independently below.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
