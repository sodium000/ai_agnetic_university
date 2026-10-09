"use client";

import { useForm } from "@tanstack/react-form";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  resendRegistrationOtp,
  verifyRegistrationOtp,
} from "@/services/auth.service";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get("email");

  const [email, setEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  // OTP code validity: valid for 5 minutes (300 seconds)
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);

  // Initialize and synchronize email from query param or sessionStorage
  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("registrationEmail", queryEmail);
      }
      return;
    }

    if (typeof window !== "undefined") {
      const storedEmail = sessionStorage.getItem("registrationEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        setIsEditingEmail(true);
      }
    }
  }, [queryEmail]);

  // Countdown timer for 5-minute validity
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formattedTimeLeft = `${Math.floor(timeLeft / 60)}:${String(
    timeLeft % 60,
  ).padStart(2, "0")}`;

  const isExpired = timeLeft <= 0;

  const form = useForm({
    defaultValues: {
      otp: "",
    } as OtpFormValues,

    validators: {
      onSubmit: otpSchema,
    },

    onSubmit: async ({ value }) => {
      if (isExpired) {
        const msg =
          "This verification code has expired (5-minute limit). Please click 'Resend OTP' to get a new code.";
        setError(msg);
        toast.error(msg);
        return;
      }

      const targetEmail = email.trim();
      if (!targetEmail) {
        setError("Please provide your email address to verify.");
        setIsEditingEmail(true);
        return;
      }

      try {
        setError("");
        await verifyRegistrationOtp({
          email: targetEmail,
          otp: value.otp,
        });

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("registrationEmail");
        }

        toast.success("Account verified successfully! Please log in.");
        router.push("/login");
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Invalid or expired OTP. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    },
  });

  // Resend OTP can be called at ANY time
  const handleResendOtp = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      toast.error("Please enter an email address first.");
      setIsEditingEmail(true);
      return;
    }

    try {
      setIsResending(true);
      setError("");
      await resendRegistrationOtp(targetEmail);
      toast.success("A new verification code has been sent!");
      // Reset the 5-minute validity window
      setTimeLeft(5 * 60);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to resend OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 md:p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 md:p-8">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="size-6" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight">
                  Verify your email
                </h1>

                <p className="text-balance text-sm text-muted-foreground">
                  We sent a 6-digit verification code to
                </p>

                {/* Email Display / Edit */}
                {isEditingEmail ? (
                  <div className="flex w-full items-center gap-2 mt-1">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm h-9"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-9 text-xs"
                      onClick={() => {
                        if (email.trim()) {
                          if (typeof window !== "undefined") {
                            sessionStorage.setItem(
                              "registrationEmail",
                              email.trim(),
                            );
                          }
                          setIsEditingEmail(false);
                        }
                      }}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="break-all font-semibold text-foreground text-sm">
                      {email || "No email provided"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(true)}
                      className="text-xs text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      Change
                    </button>
                  </div>
                )}

                {/* 5-minute validity countdown banner */}
                {!isExpired ? (
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-muted/60 py-1 px-3 rounded-full border">
                    <Clock className="size-3.5 text-primary" />
                    <span>Code valid for:</span>
                    <span
                      className={cn(
                        "font-mono font-semibold",
                        timeLeft <= 60
                          ? "text-destructive animate-pulse"
                          : "text-foreground",
                      )}
                    >
                      {formattedTimeLeft}
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 w-full rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-center text-xs text-destructive flex items-center justify-center gap-1.5">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>
                      Code expired. Click <strong>Resend OTP</strong> below for
                      a new code.
                    </span>
                  </div>
                )}
              </div>

              {/* OTP Input */}
              <form.Field name="otp">
                {(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Verification code
                      </FieldLabel>

                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="000000"
                        className={cn(
                          "text-center text-xl tracking-[0.5em] font-mono h-12",
                          isExpired && "opacity-60 bg-muted/50",
                        )}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          const value = event.target.value.replace(/\D/g, "");
                          field.handleChange(value);
                        }}
                        aria-invalid={isInvalid}
                      />

                      {isInvalid && (
                        <FieldError>
                          {field.state.meta.errors.map((err) => (
                            <div key={err?.message}>{err?.message}</div>
                          ))}
                        </FieldError>
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              {/* Server error */}
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              {/* Action Button: Verify if valid, or Resend if expired */}
              <Field>
                {isExpired ? (
                  <Button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="w-full h-11 text-sm font-medium cursor-pointer"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Sending new code...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 size-4" />
                        Code Expired — Resend New OTP
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="w-full h-11 text-sm font-medium cursor-pointer"
                    disabled={form.state.isSubmitting}
                  >
                    {form.state.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Verifying code...
                      </>
                    ) : (
                      "Verify email"
                    )}
                  </Button>
                )}
              </Field>

              {/* Resend button — always accessible at any time */}
              <FieldDescription className="text-center text-xs flex items-center justify-center gap-1.5">
                <span>Didn&apos;t receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="font-semibold text-primary underline underline-offset-4 hover:opacity-80 disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend OTP"
                  )}
                </button>
              </FieldDescription>

              {/* Back links */}
              <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                <Link
                  href="/registration"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-3" />
                  Registration
                </Link>
                <Link
                  href="/login"
                  className="hover:text-foreground transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
