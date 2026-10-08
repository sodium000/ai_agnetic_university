"use client";

import { Lock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EditableFieldKey, StudentProfile } from "@/types/student-profile";
import { EditableProfileField } from "./editable-profile-field";

interface PersonalInformationProps {
  profile: StudentProfile;
  activeEditingField: EditableFieldKey | null;
  onStartEdit: (field: EditableFieldKey) => void;
  onCancelEdit: () => void;
  onSaveField: (field: EditableFieldKey, value: string) => Promise<void>;
}

function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateValue(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toISOString().split("T")[0];
}

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

export function PersonalInformation({
  profile,
  activeEditingField,
  onStartEdit,
  onCancelEdit,
  onSaveField,
}: PersonalInformationProps) {
  const isAnyEditing = activeEditingField !== null;

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-1.5 text-primary">
            <User className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Personal Information
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your personal identification details. Official credentials
              are locked by administration.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Read-only: Name */}
        <div className="group rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name
              </span>
              <p className="text-sm font-medium text-foreground sm:text-base">
                {profile.user?.name || "N/A"}
              </p>
            </div>
            <Badge
              variant="outline"
              className="h-6 gap-1 px-2 text-[10px] text-muted-foreground border-border/60"
            >
              <Lock className="size-2.5" />
              <span>Read-only</span>
            </Badge>
          </div>
        </div>

        {/* Read-only: Email */}
        <div className="group rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </span>
              <p className="text-sm font-medium text-foreground sm:text-base break-all">
                {profile.user?.email || "N/A"}
              </p>
            </div>
            <Badge
              variant="outline"
              className="h-6 gap-1 px-2 text-[10px] text-muted-foreground border-border/60"
            >
              <Lock className="size-2.5" />
              <span>Read-only</span>
            </Badge>
          </div>
        </div>

        {/* Read-only: Role */}
        <div className="group rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account Role
              </span>
              <p className="text-sm font-medium text-foreground sm:text-base">
                {profile.user?.role || "STUDENT"}
              </p>
            </div>
            <Badge
              variant="outline"
              className="h-6 gap-1 px-2 text-[10px] text-muted-foreground border-border/60"
            >
              <Lock className="size-2.5" />
              <span>Read-only</span>
            </Badge>
          </div>
        </div>

        {/* Editable: Gender */}
        <EditableProfileField
          label="Gender"
          fieldName="gender"
          value={profile.gender || ""}
          type="select"
          options={genderOptions}
          placeholder="Select gender"
          description="Your official gender identity"
          isEditing={activeEditingField === "gender"}
          isAnyEditing={isAnyEditing && activeEditingField !== "gender"}
          onStartEdit={() => onStartEdit("gender")}
          onCancelEdit={onCancelEdit}
          onSave={onSaveField}
        />

        {/* Editable: Date of Birth */}
        <EditableProfileField
          label="Date of Birth"
          fieldName="dateOfBirth"
          value={formatDateValue(profile.dateOfBirth)}
          displayValue={formatDateDisplay(profile.dateOfBirth)}
          type="date"
          placeholder="YYYY-MM-DD"
          description="Recorded in standard international date format"
          isEditing={activeEditingField === "dateOfBirth"}
          isAnyEditing={isAnyEditing && activeEditingField !== "dateOfBirth"}
          onStartEdit={() => onStartEdit("dateOfBirth")}
          onCancelEdit={onCancelEdit}
          onSave={onSaveField}
        />
      </CardContent>
    </Card>
  );
}
