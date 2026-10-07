
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
})

type OtpFormValues = z.infer<typeof otpSchema>

export default function VerifyOtpPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [timeLeft, setTimeLeft] = useState(5*60)
  const [error, setError] = useState("")
  const formattedTimeLeft = `${Math.floor(timeLeft / 60)}:${String(
    timeLeft % 60
  ).padStart(2, "0")}`

//   useEffect(() => {
//     const registeredEmail =
//       sessionStorage.getItem("registrationEmail")

//     if (!registeredEmail) {
//       router.replace("/register")
//       return
//     }

//     setEmail(registeredEmail)
//   }, [router])

  useEffect(() => {
    if (timeLeft <= 0) {
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const form = useForm({
    defaultValues: {
      otp: "",
    } as OtpFormValues,

    validators: {
      onSubmit: otpSchema,
    },

    onSubmit: async ({ value }) => {
      try {
        setError("")

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-registration-otp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              otp: value.otp,
            }),
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || "Invalid OTP"
          )
        }

        sessionStorage.removeItem("registrationEmail")

        router.push("/login")
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        )
      }
    },
  })

  const handleResendOtp = async () => {
    if (timeLeft > 0) {
      return
    }

    try {
      setError("")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/resend-registration-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to resend OTP"
        )
      }

      setTimeLeft(60)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to resend OTP"
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 md:p-8">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              form.handleSubmit()
            }}
          >
            <FieldGroup>
              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xl">✉</span>
                </div>

                <h1 className="text-2xl font-bold">
                  Verify your email
                </h1>

                <p className="text-balance text-sm text-muted-foreground">
                  We sent a 6-digit verification code to
                </p>

                <p className="break-all font-medium">
                  {email}
                </p>
              </div>

              {/* OTP */}
              <form.Field name="otp">
                {(field) => (
                  <Field>
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
                      className="text-center text-lg tracking-[0.5em]"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const value =
                          event.target.value.replace(
                            /\D/g,
                            ""
                          )

                        field.handleChange(value)
                      }}
                      aria-invalid={
                        field.state.meta.isTouched &&
                        !field.state.meta.isValid
                      }
                    />

                    {field.state.meta.isTouched &&
                      !field.state.meta.isValid && (
                        <FieldError>
                          {field.state.meta.errors.map(
                            (error) => (
                              <div key={error?.message}>
                                {error?.message}
                              </div>
                            )
                          )}
                        </FieldError>
                      )}
                  </Field>
                )}
              </form.Field>

              {/* Server error */}
              {error && (
                <p className="text-center text-sm text-destructive">
                  {error}
                </p>
              )}

              {/* Verify */}
              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.state.isSubmitting}
                >
                  {form.state.isSubmitting
                    ? "Verifying..."
                    : "Verify email"}
                </Button>
              </Field>

              {/* Resend */}
              <FieldDescription className="text-center">
                Didn't receive the code?{" "}
                {timeLeft > 0 ? (
                  <span>
                    Resend in{" "}
                    <span className="font-medium">
                      {formattedTimeLeft}
                    </span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    Resend OTP
                  </button>
                )}
              </FieldDescription>

              {/* Change email */}
              <FieldDescription className="text-center">
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Use a different email
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
