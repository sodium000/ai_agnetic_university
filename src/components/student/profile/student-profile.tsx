"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  extractErrorMessage,
  fetchStudentProfile,
  initialMockProfile,
  updateStudentProfileField,
} from "@/services/student-profile.service";
import type {
  EditableFieldKey,
  StudentProfile as IStudentProfile,
  UpdateStudentProfilePayload,
} from "@/types/student-profile";
import { AcademicInformation } from "./academic-information";
import { ContactInformation } from "./contact-information";
import { PersonalInformation } from "./personal-information";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileHeader } from "./profile-header";
import { ProfileLoading } from "./profile-loading";

export function StudentProfile() {
  const queryClient = useQueryClient();
  const [activeEditingField, setActiveEditingField] =
    useState<EditableFieldKey | null>(null);
  const [demoFallbackProfile, setDemoFallbackProfile] =
    useState<IStudentProfile | null>(null);

  const {
    data: profileData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["student-profile"],
    queryFn: fetchStudentProfile,
    retry: 1,
    staleTime: 30000,
  });

  // Profile Mutation for single-field updates
  const updateFieldMutation = useMutation({
    mutationFn: async (payload: UpdateStudentProfilePayload) => {
      // If we are using the demo fallback, emulate mutation locally
      if (demoFallbackProfile) {
        await new Promise((res) => setTimeout(res, 600));
        const updated: IStudentProfile = {
          ...demoFallbackProfile,
          ...payload,
          user: {
            ...demoFallbackProfile.user,
            phone: payload.phone ?? demoFallbackProfile.user?.phone,
            photoUrl: payload.photoUrl ?? demoFallbackProfile.user?.photoUrl,
          },
        };
        setDemoFallbackProfile(updated);
        return updated;
      }
      return updateStudentProfileField(payload);
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["student-profile"], updatedProfile);
    },
  });

  // Handler for single field updates (sends ONLY the changed field in payload)
  const handleSaveField = async (field: EditableFieldKey, value: string) => {
    const payload: UpdateStudentProfilePayload = {
      [field]: value,
    };
    await updateFieldMutation.mutateAsync(payload);
  };

  // Handler for independent photo update
  const handleUpdatePhoto = async (photoUrl: string) => {
    const payload: UpdateStudentProfilePayload = {
      photoUrl,
    };
    await updateFieldMutation.mutateAsync(payload);
  };

  // Active profile instance
  const currentProfile = profileData || demoFallbackProfile;

  // 1. Loading State
  if (isLoading && !currentProfile) {
    return <ProfileLoading />;
  }

  // 2. Error State (No fake data shown on failure, retry available, dev demo toggle provided)
  if (isError && !currentProfile) {
    const errMessage = extractErrorMessage(
      error,
      "Unable to fetch student profile from server.",
    );

    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
        {/* Header Breadcrumb */}
        <div>
          <Link
            href="/student"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer",
            )}
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <Card className="border-destructive/30 bg-destructive/5 shadow-xs">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive mb-4">
              <AlertTriangle className="size-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Failed to Load Profile
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {errMessage}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please verify your network connection and student authorization
              session.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-2 cursor-pointer text-xs"
              >
                <RefreshCw
                  className={cn("size-3.5", isFetching && "animate-spin")}
                />
                <span>{isFetching ? "Retrying..." : "Retry Connection"}</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => setDemoFallbackProfile(initialMockProfile)}
                className="gap-2 cursor-pointer text-xs border-primary/20 text-primary hover:bg-primary/5"
              >
                <Sparkles className="size-3.5" />
                <span>Load Development Demo Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!currentProfile) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/student"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer",
              )}
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-muted-foreground">•</span>
            <Badge variant="secondary" className="text-xs font-mono">
              {currentProfile.studentId}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Student Profile
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {demoFallbackProfile && (
            <Badge
              variant="outline"
              className="text-xs border-amber-500/40 text-amber-600 bg-amber-500/10"
            >
              Demo Preview Mode
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            title="Refresh profile data"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Profile Header Banner */}
      <ProfileHeader profile={currentProfile} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Photo Upload Section (4 columns on lg) */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileAvatar
            photoUrl={currentProfile.photoUrl || currentProfile.user?.photoUrl}
            studentName={currentProfile.user?.name || "Student"}
            studentId={currentProfile.studentId}
            onUpdatePhoto={handleUpdatePhoto}
            disabled={activeEditingField !== null}
          />
        </div>

        {/* Right Column: Academic, Personal & Contact Information (8 columns on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Read-Only Academic Information */}
          <AcademicInformation profile={currentProfile} />

          {/* Personal Information (Name, Email, Role read-only; DOB & Gender editable) */}
          <PersonalInformation
            profile={currentProfile}
            activeEditingField={activeEditingField}
            onStartEdit={(field) => setActiveEditingField(field)}
            onCancelEdit={() => setActiveEditingField(null)}
            onSaveField={handleSaveField}
          />

          {/* Contact Information (Phone & Address single-field editable) */}
          <ContactInformation
            profile={currentProfile}
            activeEditingField={activeEditingField}
            onStartEdit={(field) => setActiveEditingField(field)}
            onCancelEdit={() => setActiveEditingField(null)}
            onSaveField={handleSaveField}
          />
        </div>
      </div>
    </main>
  );
}
