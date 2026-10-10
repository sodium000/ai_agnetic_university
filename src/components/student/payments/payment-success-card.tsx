"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  extractErrorMessage,
  verifyStripePayment,
} from "@/services/student-payment.service";
import type { VerifyPaymentResult } from "@/types/student-payment";

export function PaymentSuccessCard() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get("session_id") || searchParams.get("sessionId") || "";

  const [isVerifying, setIsVerifying] = useState(Boolean(sessionId));
  const [verificationResult, setVerificationResult] =
    useState<VerifyPaymentResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(
    sessionId ? null : "No Stripe checkout session was returned.",
  );

  useEffect(() => {
    if (!sessionId) {
      setIsVerifying(false);
      setVerificationResult(null);
      setVerifyError("No Stripe checkout session was returned.");
      return;
    }

    let isMounted = true;

    async function handleVerify() {
      try {
        setIsVerifying(true);
        setVerifyError(null);
        const result = await verifyStripePayment(sessionId);
        if (isMounted) {
          setVerificationResult(result);
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["student-invoices"] }),
            queryClient.invalidateQueries({ queryKey: ["student-payments"] }),
          ]);
        }
      } catch (err: unknown) {
        if (isMounted) {
          // If in local development or server returned error, provide simulated verification details
          const msg = extractErrorMessage(
            err,
            "Could not verify session automatically with server.",
          );
          setVerifyError(msg);
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    handleVerify();

    return () => {
      isMounted = false;
    };
  }, [queryClient, sessionId]);

  const isConfirmed = verificationResult?.invoiceStatus === "PAID";
  const displayAmount = verificationResult?.payment?.amount;
  const displayTransactionId = verificationResult?.payment?.transactionId;

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[70vh]">
      <Card
        className={`w-full max-w-lg bg-card shadow-lg overflow-hidden ${
          isConfirmed
            ? "border-emerald-500/30 ring-1 ring-emerald-500/20"
            : "border-amber-500/30 ring-1 ring-amber-500/20"
        }`}
      >
        {/* Top Celebration Header */}
        <div className="h-28 w-full bg-linear-to-b from-emerald-500/20 via-emerald-500/10 to-transparent flex items-center justify-center relative">
          <div className="rounded-full bg-emerald-500/20 p-4 ring-8 ring-emerald-500/10">
            {isConfirmed ? (
              <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="size-12 text-amber-600 dark:text-amber-400" />
            )}
          </div>
        </div>

        <CardHeader className="text-center pt-2 pb-4">
          <Badge
            variant="outline"
            className={`mx-auto mb-2 font-semibold px-3 py-1 text-xs ${
              isConfirmed
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400"
            }`}
          >
            {isVerifying
              ? "Verifying Payment"
              : isConfirmed
                ? "Payment Confirmed"
                : "Payment Not Verified"}
          </Badge>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isVerifying
              ? "Checking your payment..."
              : isConfirmed
                ? "Payment Successful!"
                : "We could not confirm your payment"}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isConfirmed
              ? "Your payment has been verified and recorded."
              : "Do not assume your payment is complete until Stripe verification succeeds. Check your billing page or contact the accounts office if money was taken."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6">
          {/* Verification Status */}
          {isVerifying ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Verifying transaction with Stripe gateway...</span>
            </div>
          ) : verifyError ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              <p className="font-semibold">Payment verification failed</p>
              <p className="text-[11px] opacity-90 mt-0.5">{verifyError}</p>
            </div>
          ) : isConfirmed ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                Verified & Fulfilled
              </span>
              <Badge variant="secondary" className="text-[10px] bg-background">
                Invoice Status: PAID
              </Badge>
            </div>
          ) : null}

          {/* Receipt Breakdown Card */}
          {isConfirmed && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <span className="text-xs text-muted-foreground uppercase font-medium">
                  Amount Paid
                </span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ৳{displayAmount?.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <CreditCard className="size-3.5 text-primary" />
                    Stripe Online Checkout
                  </span>
                </div>

                {displayTransactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Transaction ID
                    </span>
                    <span
                      className="font-mono text-[11px] text-foreground truncate max-w-50"
                      title={displayTransactionId}
                    >
                      {displayTransactionId}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date & Time</span>
                  <span className="font-medium text-foreground">
                    {new Date().toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2.5 px-6 pt-2 pb-6">
          <Link
            href="/student/payments"
            className={cn(
              buttonVariants({ size: "default" }),
              "w-full gap-2 text-xs font-semibold cursor-pointer",
            )}
          >
            <Receipt className="size-4" />
            <span>View Invoices & Payment History</span>
          </Link>

          <Link
            href="/student"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full gap-1.5 text-xs cursor-pointer",
            )}
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
