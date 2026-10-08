"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  History,
  Loader2,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  createStripeCheckoutSession,
  extractErrorMessage,
  fetchStudentInvoices,
  fetchStudentPayments,
  initialMockInvoices,
  initialMockPayments,
} from "@/services/student-payment.service";
import type {
  InvoiceStatus,
  StudentInvoice,
  StudentPayment,
} from "@/types/student-payment";

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  switch (status) {
    case "PAID":
      return (
        <Badge
          variant="secondary"
          className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium text-xs"
        >
          <CheckCircle2 className="size-3" />
          Paid
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="destructive" className="gap-1 text-xs">
          <XCircle className="size-3" />
          Cancelled
        </Badge>
      );
    case "OVERDUE":
      return (
        <Badge variant="destructive" className="gap-1 text-xs">
          <AlertCircle className="size-3" />
          Overdue
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium text-xs"
        >
          <Clock className="size-3" />
          Pending
        </Badge>
      );
  }
}

export function StudentPaymentsView() {
  const _queryClient = useQueryClient();
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  // Fallback demo state if backend server port 5000 is not running
  const [localFallbackMode, setLocalFallbackMode] = useState(false);
  const [demoInvoices, _setDemoInvoices] =
    useState<StudentInvoice[]>(initialMockInvoices);
  const [demoPayments, _setDemoPayments] =
    useState<StudentPayment[]>(initialMockPayments);

  // Query Invoices: GET /api/v1/student/me/invoices
  const {
    data: apiInvoices,
    isLoading: isLoadingInvoices,
    isError: isErrorInvoices,
    refetch: refetchInvoices,
    isFetching: isFetchingInvoices,
  } = useQuery({
    queryKey: ["student-invoices"],
    queryFn: () => fetchStudentInvoices(),
    retry: 1,
    staleTime: 30000,
  });

  // Query Payments: GET /api/v1/student/me/payments
  const {
    data: apiPayments,
    isLoading: isLoadingPayments,
    isError: isErrorPayments,
    refetch: refetchPayments,
    isFetching: isFetchingPayments,
  } = useQuery({
    queryKey: ["student-payments"],
    queryFn: () => fetchStudentPayments(),
    retry: 1,
    staleTime: 30000,
  });

  // Effective Invoices & Payments (Live API vs Interactive Demo)
  const invoices: StudentInvoice[] = useMemo(() => {
    if (localFallbackMode) return demoInvoices;
    return apiInvoices || (isErrorInvoices ? initialMockInvoices : []);
  }, [localFallbackMode, demoInvoices, apiInvoices, isErrorInvoices]);

  const payments: StudentPayment[] = useMemo(() => {
    if (localFallbackMode) return demoPayments;
    return apiPayments || (isErrorPayments ? initialMockPayments : []);
  }, [localFallbackMode, demoPayments, apiPayments, isErrorPayments]);

  // Financial Computations
  const { totalAmount, paidAmount, pendingAmount } = useMemo(() => {
    let total = 0;
    let paid = 0;
    let pending = 0;

    invoices.forEach((inv) => {
      total += inv.amount;
      if (inv.status === "PAID") {
        paid += inv.amount;
      } else if (inv.status === "PENDING" || inv.status === "OVERDUE") {
        pending += inv.amount;
      }
    });

    return { totalAmount: total, paidAmount: paid, pendingAmount: pending };
  }, [invoices]);

  const paidPercentage =
    totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  // Mutation: Checkout Session (POST /api/v1/student/me/payments/checkout)
  const checkoutMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      setPayingInvoiceId(invoiceId);

      // If local demo mode, simulate checkout redirect
      if (localFallbackMode) {
        await new Promise((res) => setTimeout(res, 800));
        return {
          checkoutUrl: `/student/payments/success?session_id=cs_test_demo_${Date.now()}&invoice_id=${invoiceId}`,
          sessionId: `cs_test_demo_${Date.now()}`,
        };
      }

      return createStripeCheckoutSession(invoiceId);
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info("Redirecting to Stripe secure checkout...");
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Checkout session URL was not returned");
      }
    },
    onError: (err: unknown) => {
      const msg = extractErrorMessage(
        err,
        "Failed to initialize Stripe checkout",
      );
      toast.error(msg);
    },
    onSettled: () => {
      setPayingInvoiceId(null);
    },
  });

  const isInitialLoading =
    (isLoadingInvoices || isLoadingPayments) && !localFallbackMode;

  if (isInitialLoading) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full animate-pulse">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:gap-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
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
            <Badge variant="secondary" className="text-xs">
              Semester 6 • Fall 2026
            </Badge>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Billing & Tuition Payments
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your semester invoices, pay fees securely via Stripe, and
            download payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {localFallbackMode && (
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
            onClick={() => {
              refetchInvoices();
              refetchPayments();
            }}
            disabled={isFetchingInvoices || isFetchingPayments}
            className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                (isFetchingInvoices || isFetchingPayments) && "animate-spin",
              )}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Offline notice */}
      {isErrorInvoices && !localFallbackMode && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Backend connection unavailable (port 5000 offline)
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing development mock invoices. You can launch interactive
                  demo mode to test Stripe checkout redirection.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setLocalFallbackMode(true)}
              className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shrink-0"
            >
              <Sparkles className="size-3.5 mr-1" />
              Interactive Demo Mode
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Billed */}
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Invoiced
              </span>
              <p className="text-2xl font-bold text-foreground">
                ৳{totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Receipt className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Paid Amount */}
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Paid
              </span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ৳{paidAmount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Amount */}
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Due Balance
              </span>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                ৳{pendingAmount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>

        {/* Payment Progress */}
        <Card className="border-border/60 bg-card shadow-xs">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Settlement
              </span>
              <span className="text-xs font-bold text-foreground">
                {paidPercentage}%
              </span>
            </div>
            <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${paidPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Invoices Section */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: All Invoices (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Fee Invoices ({invoices.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Review pending tuition charges and checkout securely.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  Stripe Checkout Enabled
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              {invoices.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No invoices issued.
                </div>
              ) : (
                invoices.map((inv) => {
                  const isCurrentPaying = payingInvoiceId === inv.id;
                  const isPayable =
                    inv.status === "PENDING" || inv.status === "OVERDUE";

                  return (
                    <div
                      key={inv.id}
                      className={cn(
                        "rounded-xl border p-4 transition-all duration-200 space-y-3",
                        isPayable
                          ? "border-border/80 bg-card hover:border-primary/40 shadow-xs"
                          : "border-border/50 bg-muted/20 opacity-90",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {inv.invoiceNo}
                            </span>
                            <InvoiceStatusBadge status={inv.status} />
                          </div>
                          <h4 className="font-semibold text-foreground text-sm pt-0.5">
                            {inv.title || "University Tuition & Academic Fee"}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5">
                            <Clock className="size-3 text-muted-foreground/70" />
                            Due Date:{" "}
                            <span className="font-medium text-foreground/90">
                              {inv.dueDate}
                            </span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold text-foreground block">
                            ৳{inv.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Pay Action */}
                      <div className="flex items-center justify-between border-t border-border/40 pt-3">
                        <span className="text-[11px] text-muted-foreground">
                          {isPayable
                            ? "Pay online using credit or debit card"
                            : "Settled transaction"}
                        </span>

                        {isPayable && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => checkoutMutation.mutate(inv.id)}
                            disabled={isCurrentPaying}
                            className="h-8 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 cursor-pointer shadow-xs"
                          >
                            {isCurrentPaying ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>Connecting Stripe...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="size-3.5" />
                                <span>Pay with Stripe</span>
                                <ExternalLink className="size-3 opacity-70" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Payment History (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
                  <History className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    Payment Receipts ({payments.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Confirmed transactions recorded by registrar.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              {payments.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No payment records found.
                </div>
              ) : (
                payments.map((pay) => (
                  <div
                    key={pay.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-semibold text-foreground truncate">
                          {pay.invoiceNo ||
                            `Invoice Ref: ${pay.invoiceId?.slice(0, 8)}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {pay.date ||
                            (pay.createdAt
                              ? new Date(pay.createdAt).toLocaleDateString()
                              : "Recent")}{" "}
                          • {pay.method}
                        </p>
                        {pay.transactionId && (
                          <p className="font-mono text-[10px] text-muted-foreground/80 truncate max-w-[180px]">
                            {pay.transactionId}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        +৳{pay.amount.toLocaleString()}
                      </span>
                      <Badge
                        variant="secondary"
                        className="block mt-0.5 text-[9px] uppercase"
                      >
                        {pay.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
