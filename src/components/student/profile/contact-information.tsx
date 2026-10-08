"use client";

import { PhoneCall } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EditableFieldKey, StudentProfile } from "@/types/student-profile";
import { EditableProfileField } from "./editable-profile-field";

interface ContactInformationProps {
  profile: StudentProfile;
  activeEditingField: EditableFieldKey | null;
  onStartEdit: (field: EditableFieldKey) => void;
  onCancelEdit: () => void;
  onSaveField: (field: EditableFieldKey, value: string) => Promise<void>;
}

export function ContactInformation({
  profile,
  activeEditingField,
  onStartEdit,
  onCancelEdit,
  onSaveField,
}: ContactInformationProps) {
  const isAnyEditing = activeEditingField !== null;
  const currentPhone = profile.phone || profile.user?.phone || "";
  const currentAddress = profile.address || "";

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-1.5 text-primary">
            <PhoneCall className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Contact Information
            </CardTitle>
            <CardDescription className="text-xs">
              Keep your contact details up to date for university announcements
              and emergency notices.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Editable: Phone */}
        <EditableProfileField
          label="Phone Number"
          fieldName="phone"
          value={currentPhone}
          type="phone"
          placeholder="e.g. 01800000000 or +8801800000000"
          description="Bangladeshi mobile number or international phone format"
          isEditing={activeEditingField === "phone"}
          isAnyEditing={isAnyEditing && activeEditingField !== "phone"}
          onStartEdit={() => onStartEdit("phone")}
          onCancelEdit={onCancelEdit}
          onSave={onSaveField}
        />

        {/* Editable: Address */}
        <EditableProfileField
          label="Mailing Address"
          fieldName="address"
          value={currentAddress}
          type="textarea"
          placeholder="e.g. 123 Campus Road, Dhanmondi, Dhaka"
          description="Your current residential or mailing address"
          isEditing={activeEditingField === "address"}
          isAnyEditing={isAnyEditing && activeEditingField !== "address"}
          onStartEdit={() => onStartEdit("address")}
          onCancelEdit={onCancelEdit}
          onSave={onSaveField}
        />
      </CardContent>
    </Card>
  );
}
