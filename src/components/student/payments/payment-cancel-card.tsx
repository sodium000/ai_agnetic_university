"use client";

import {
  AlertTriangle,
  ArrowLeft,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

export function PaymentCancelCard() {
  const searchParams = useSearchParams();
  const invoiceId =
    searchParams.get("invoice_id") || searchParams.get("invoiceId") || "";

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[70vh]">
      <Card className="w-full max-w-lg border-amber-500/30 bg-card shadow-lg ring-1 ring-amber-500/20 overflow-hidden">
        {/* Top Header Graphic */}
        <div className="h-28 w-full bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent flex items-center justify-center relative">
          <div className="rounded-full bg-amber-500/20 p-4 ring-8 ring-amber-500/10">
            <AlertTriangle className="size-12 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <CardHeader className="text-center pt-2 pb-4">
          <Badge
            variant="outline"
            className="mx-auto mb-2 border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold px-3 py-1 text-xs"
          >
            Checkout Cancelled
          </Badge>
          <CardTitle className="text-2xl font-bold text-foreground">
            Payment Not Completed
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            The checkout session was cancelled. No money was deducted from your
            credit card or bank account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">
                  Invoice Status Unchanged
                </p>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  Your fee invoice remains in{" "}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    PENDING
                  </span>{" "}
                  status. You can retry paying the invoice at any time before
                  the due date.
                </p>
              </div>
            </div>

            {invoiceId && (
              <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">
                  Invoice Reference:
                </span>
                <span className="font-mono text-foreground font-semibold">
                  {invoiceId}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-muted/30 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
            <HelpCircle className="size-3.5 text-primary shrink-0" />
            <span>
              Need assistance or having payment difficulties? Contact university
              accounts office.
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2.5 px-6 pt-2 pb-6">
          <Link
            href="/student/payments"
            className={cn(
              buttonVariants({ size: "default" }),
              "w-full gap-2 text-xs font-semibold cursor-pointer",
            )}
          >
            <RotateCcw className="size-4" />
            <span>Retry from Billing & Invoices</span>
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
