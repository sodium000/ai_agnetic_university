"use client";

import { Camera, Check, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { extractErrorMessage } from "@/services/student-profile.service";

interface ProfileAvatarProps {
  photoUrl?: string | null;
  studentName: string;
  studentId: string;
  onUpdatePhoto: (photoUrl: string) => Promise<void>;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function ProfileAvatar({
  photoUrl,
  studentName,
  studentId,
  onUpdatePhoto,
  disabled = false,
}: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInitials = (name: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate mime type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      const err = "Please upload a valid image file (JPEG, PNG, WEBP, or GIF).";
      setError(err);
      toast.error(err);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      const err = "Image file size exceeds the 4MB limit.";
      setError(err);
      toast.error(err);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreviewUrl(reader.result);
        setSelectedFileName(file.name);
      }
    };
    reader.onerror = () => {
      const err = "Failed to read selected image file.";
      setError(err);
      toast.error(err);
    };
    reader.readAsDataURL(file);
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    setSelectedFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSavePhoto = async () => {
    if (!previewUrl) return;

    try {
      setIsUploading(true);
      setError(null);
      await onUpdatePhoto(previewUrl);
      toast.success("Profile photo updated successfully");
      handleCancelPreview();
    } catch (err: unknown) {
      const msg = extractErrorMessage(
        err,
        "Unable to update profile photo. Please try again.",
      );
      setError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const currentDisplayPhoto = previewUrl || photoUrl || undefined;

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3 text-center sm:text-left">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Profile Photo
          </CardTitle>
          {previewUrl && (
            <Badge
              variant="secondary"
              className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400"
            >
              Unsaved Preview
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Update your student profile picture independently. Maximum file size
          is 4MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5 pt-2">
        {/* Avatar Display */}
        <div className="relative group">
          <Avatar className="size-28 sm:size-32 rounded-2xl border-2 border-border shadow-md ring-2 ring-background transition-transform duration-200 group-hover:scale-[1.02]">
            <AvatarImage
              src={currentDisplayPhoto}
              alt={studentName}
              className="object-cover"
            />
            <AvatarFallback className="rounded-2xl text-xl font-bold bg-primary/10 text-primary">
              {getInitials(studentName)}
            </AvatarFallback>
          </Avatar>

          {previewUrl && (
            <div className="absolute -bottom-2 -right-2 rounded-full bg-primary p-1 text-primary-foreground shadow-sm">
              <Camera className="size-4" />
            </div>
          )}
        </div>

        {/* Student Name & ID */}
        <div className="text-center">
          <h3 className="font-semibold text-foreground text-base">
            {studentName}
          </h3>
          <p className="text-xs font-mono text-muted-foreground">{studentId}</p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Action Controls */}
        {!previewUrl ? (
          <div className="flex flex-col items-center gap-2 w-full max-w-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="w-full gap-2 text-xs font-medium cursor-pointer"
            >
              <Camera className="size-3.5" />
              <span>Change Photo</span>
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Supports JPEG, PNG, WEBP up to 4MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 w-full max-w-xs">
            {selectedFileName && (
              <p className="text-xs text-muted-foreground truncate max-w-full">
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {selectedFileName}
                </span>
              </p>
            )}

            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}

            <div className="flex items-center gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelPreview}
                disabled={isUploading}
                className="flex-1 gap-1.5 text-xs cursor-pointer"
              >
                <X className="size-3.5" />
                <span>Cancel</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSavePhoto}
                disabled={isUploading}
                className="flex-1 gap-1.5 text-xs cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    <span>Save Photo</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
