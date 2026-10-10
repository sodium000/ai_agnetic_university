"use client";

import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
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
import { forgotPassword } from "@/services/auth.service";
import { forgotPasswordSchema } from "@/validation/password-reset.validation";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Enter a valid email address.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const message = await forgotPassword(parsed.data.email);
      window.sessionStorage.setItem("passwordResetEmail", parsed.data.email);
      toast.success(message || "A password reset code has been sent.");
      router.push("/reset-password");
    } catch (cause: unknown) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Unable to send a password reset code. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center p-4">
      <Card className="w-full shadow-lg">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Forgot your password?
                </h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Enter the email address for your account. We’ll send a
                  verification code that expires in 5 minutes.
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="reset-email">Email address</FieldLabel>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(error)}
                />
                <FieldDescription>
                  Use the email address registered with your university account.
                </FieldDescription>
              </Field>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 size-4" />
                    Send reset code
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
        </CardContent>
      </Card>
    </div>
  );
}
