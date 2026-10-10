"use client";

import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotPassword, resetPassword } from "@/services/auth.service";
import { resetPasswordSchema } from "@/validation/password-reset.validation";

export function ResetPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setEmail(window.sessionStorage.getItem("passwordResetEmail") ?? "");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsed = resetPasswordSchema.safeParse({
      email,
      otp,
      newPassword,
      confirmPassword,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the entered details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const message = await resetPassword({
        email: parsed.data.email,
        otp: parsed.data.otp,
        newPassword: parsed.data.newPassword,
      });
      window.sessionStorage.removeItem("passwordResetEmail");
      setIsComplete(true);
      toast.success(message || "Your password has been reset.");
    } catch (cause: unknown) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Unable to reset your password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    const parsedEmail = email.trim();
    if (!parsedEmail) {
      setError("Enter your account email before requesting a new code.");
      return;
    }

    setError("");
    setIsResending(true);
    try {
      const message = await forgotPassword(parsedEmail);
      window.sessionStorage.setItem("passwordResetEmail", parsedEmail);
      toast.success(message || "A new password reset code has been sent.");
    } catch (cause: unknown) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Unable to resend the code. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center p-4">
      <Card className="w-full shadow-lg">
        <CardContent className="p-6 md:p-8">
          {isComplete ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-6" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Password updated
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your password has been changed. Sign in with your new
                  password.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => router.replace("/login")}
              >
                Continue to login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <KeyRound className="size-6" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Reset your password
                  </h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    Enter the 6-digit code from your email and choose a new
                    password. The code expires in 5 minutes.
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="reset-email">Email address</FieldLabel>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="reset-otp">Verification code</FieldLabel>
                  <Input
                    id="reset-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    placeholder="000000"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                  <FieldDescription>
                    The code was sent to the email address above.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="new-password">New password</FieldLabel>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                  <FieldDescription>
                    At least 8 characters, including uppercase, lowercase,
                    number, and special character.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm new password
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </Field>

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendCode}
                  disabled={isResending || isSubmitting}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending new code...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 size-4" />
                      Resend code
                    </>
                  )}
                </Button>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Back to login
                </Link>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
