"use client";

import { useForm } from "@tanstack/react-form";
import { Check, Edit3, Loader2, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ZodType } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/services/student-profile.service";
import type { EditableFieldKey } from "@/types/student-profile";
import {
  addressSchema,
  dateOfBirthSchema,
  genderSchema,
  phoneSchema,
} from "@/validation/student-profile.validation";

export interface SelectOption {
  label: string;
  value: string;
}

interface EditableProfileFieldProps {
  label: string;
  fieldName: EditableFieldKey;
  value: string;
  displayValue?: string;
  type?: "text" | "phone" | "date" | "select" | "textarea";
  options?: SelectOption[];
  placeholder?: string;
  description?: string;
  isEditing: boolean;
  isAnyEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (field: EditableFieldKey, value: string) => Promise<void>;
}

export function EditableProfileField({
  label,
  fieldName,
  value,
  displayValue,
  type = "text",
  options = [],
  placeholder,
  description,
  isEditing,
  isAnyEditing,
  onStartEdit,
  onCancelEdit,
  onSave,
}: EditableProfileFieldProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pick validation schema based on field name
  const getValidationSchema = (): ZodType<string> | undefined => {
    switch (fieldName) {
      case "phone":
        return phoneSchema;
      case "dateOfBirth":
        return dateOfBirthSchema;
      case "gender":
        return genderSchema as ZodType<string>;
      case "address":
        return addressSchema;
      default:
        return undefined;
    }
  };

  const validatorSchema = getValidationSchema();

  const form = useForm({
    defaultValues: {
      fieldValue: value || "",
    },
    validators: validatorSchema
      ? {
          onSubmit: ({ value: val }) => {
            const result = validatorSchema.safeParse(val.fieldValue);
            if (!result.success) {
              return result.error.issues[0]?.message || "Invalid input";
            }
            return undefined;
          },
        }
      : undefined,
    onSubmit: async ({ value: val }) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);
        await onSave(fieldName, val.fieldValue);
        toast.success(`${label} updated successfully`);
        onCancelEdit();
      } catch (err: unknown) {
        const msg = extractErrorMessage(
          err,
          `Unable to update ${label.toLowerCase()}. Please try again.`,
        );
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    },
  });

  const handleStart = () => {
    form.setFieldValue("fieldValue", value || "");
    setErrorMessage(null);
    onStartEdit();
  };

  const handleCancel = () => {
    form.setFieldValue("fieldValue", value || "");
    setErrorMessage(null);
    onCancelEdit();
  };

  const formattedDisplay = displayValue !== undefined ? displayValue : value;

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-4 transition-all duration-200",
        isEditing
          ? "border-primary/50 bg-primary/5 shadow-xs ring-1 ring-primary/20"
          : "border-border/60 bg-card hover:border-border hover:bg-muted/30",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            {isEditing && (
              <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                Editing
              </span>
            )}
          </div>

          {!isEditing ? (
            <div className="pt-0.5">
              {formattedDisplay ? (
                <p className="text-sm font-medium text-foreground sm:text-base break-words">
                  {formattedDisplay}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  Not provided
                </p>
              )}
              {description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          ) : (
            <div className="pt-2">
              <form.Field name="fieldValue">
                {(field) => {
                  const clientError = field.state.meta.errors?.[0];
                  const clientErrorText = clientError
                    ? String(clientError)
                    : null;
                  const hasClientError = Boolean(clientErrorText);

                  return (
                    <div className="space-y-2">
                      {type === "textarea" ? (
                        <Textarea
                          id={`field-${fieldName}`}
                          rows={3}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder={
                            placeholder || `Enter ${label.toLowerCase()}...`
                          }
                          disabled={isSaving}
                          className="w-full bg-background"
                        />
                      ) : type === "select" ? (
                        <Select
                          value={field.state.value}
                          onValueChange={(val) => {
                            if (val) field.handleChange(val);
                          }}
                          disabled={isSaving}
                        >
                          <SelectTrigger className="w-full bg-background">
                            <SelectValue
                              placeholder={
                                placeholder || `Select ${label.toLowerCase()}`
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={`field-${fieldName}`}
                          type={
                            type === "date"
                              ? "date"
                              : type === "phone"
                                ? "tel"
                                : "text"
                          }
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder={
                            placeholder || `Enter ${label.toLowerCase()}...`
                          }
                          disabled={isSaving}
                          className="w-full bg-background"
                        />
                      )}

                      {/* Client validation error */}
                      {hasClientError && clientErrorText && (
                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                          <TriangleAlert className="size-3.5 shrink-0" />
                          <span>{clientErrorText}</span>
                        </p>
                      )}

                      {/* Server/API error feedback */}
                      {errorMessage && (
                        <div className="flex items-start gap-1.5 rounded-md border border-destructive/20 bg-destructive/10 p-2 text-xs text-destructive">
                          <TriangleAlert className="size-3.5 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{errorMessage}</p>
                            <p className="text-[11px] opacity-80">
                              Please review your input and click Save to retry.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              </form.Field>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="shrink-0 pt-0.5">
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleStart}
              disabled={isAnyEditing}
              className={cn(
                "h-8 gap-1.5 px-3 text-xs transition-opacity cursor-pointer",
                isAnyEditing && "opacity-50 cursor-not-allowed",
              )}
              title={
                isAnyEditing
                  ? "Another field is currently being edited"
                  : `Edit ${label}`
              }
            >
              <Edit3 className="size-3.5" />
              <span>Edit</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-8 gap-1 px-2.5 text-xs cursor-pointer"
              >
                <X className="size-3.5" />
                <span>Cancel</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => form.handleSubmit()}
                disabled={isSaving}
                className="h-8 gap-1.5 px-3 text-xs font-medium cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    <span>Save</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
