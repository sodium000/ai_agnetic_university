"use client";

import { useForm } from "@tanstack/react-form";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { registerUser } from "@/services/auth.service";
import {
  type RegisterFormValues,
  registerSchema,
} from "@/validation/registration.validation";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    } as RegisterFormValues,

    validators: {
      onSubmit: registerSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        await registerUser({
          name: value.name,
          email: value.email,
          phone: value.phone,
          password: value.password,
        });

        if (typeof window !== "undefined") {
          sessionStorage.setItem("registrationEmail", value.email);
        }

        toast.success("Verification code sent! Please check your email.");
        router.push(`/otp?email=${encodeURIComponent(value.email)}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Registration failed";
        toast.error(msg);
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
            className="p-6 md:p-8"
          >
            <FieldGroup>
              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>

                <p className="text-balance text-muted-foreground">
                  Register for your University Management System account
                </p>
              </div>

              {/* Name */}
              <form.Field name="name">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Enter your name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    />

                    {field.state.meta.isTouched &&
                      !field.state.meta.isValid && (
                        <FieldError>
                          {field.state.meta.errors.map((error) => (
                            <div key={error?.message}>{error?.message}</div>
                          ))}
                        </FieldError>
                      )}
                  </Field>
                )}
              </form.Field>

              {/* Email */}
              <form.Field name="email">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="m@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    />

                    {field.state.meta.isTouched &&
                      !field.state.meta.isValid && (
                        <FieldError>
                          {field.state.meta.errors.map((error) => (
                            <div key={error?.message}>{error?.message}</div>
                          ))}
                        </FieldError>
                      )}
                  </Field>
                )}
              </form.Field>

              {/* Phone */}
              <form.Field name="phone">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Phone</FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                    />

                    {field.state.meta.isTouched &&
                      !field.state.meta.isValid && (
                        <FieldError>
                          {field.state.meta.errors.map((error) => (
                            <div key={error?.message}>{error?.message}</div>
                          ))}
                        </FieldError>
                      )}
                  </Field>
                )}
              </form.Field>

              {/* Password */}
              <form.Field name="password">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>

                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        aria-invalid={
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        }
                      />

                      <button
                        className="absolute top-1/2 right-1 z-10 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeClosed aria-hidden="true" className="size-4" />
                        ) : (
                          <Eye aria-hidden="true" className="size-4" />
                        )}
                      </button>
                    </div>

                    {field.state.meta.isTouched &&
                      !field.state.meta.isValid && (
                        <FieldError>
                          {field.state.meta.errors.map((error) => (
                            <div key={error?.message}>{error?.message}</div>
                          ))}
                        </FieldError>
                      )}
                  </Field>
                )}
              </form.Field>

              {/* Submit */}
              <Field>
                <Button type="submit" disabled={form.state.isSubmitting}>
                  {form.state.isSubmitting
                    ? "Creating account..."
                    : "Create account"}
                </Button>
              </Field>

              {/* Login */}
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* Image */}
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.svg"
              alt="University registration"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By creating an account, you agree to our{" "}
        <a href="/terms" className="underline underline-offset-4">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
