import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Receipt,
  Wallet,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  FeeSummaryData,
  InvoiceStatus,
  Payment,
} from "@/types/student-dashboard";

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  switch (status) {
    case "PAID":
      return (
        <Badge
          variant="secondary"
          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2 className="mr-1 size-3" />
          Paid
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 size-3" />
          Cancelled
        </Badge>
      );
    case "OVERDUE":
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 size-3" />
          Overdue
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 text-amber-700 dark:text-amber-400"
        >
          <Clock3 className="mr-1 size-3" />
          Pending
        </Badge>
      );
  }
}

interface FeeSummaryProps {
  feeSummary: FeeSummaryData;
  recentPayments?: Payment[];
}

export function FeeSummary({
  feeSummary,
  recentPayments = [],
}: FeeSummaryProps) {
  const { total, paid, pending, items = [] } = feeSummary;
  const paidPercentage = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <Card className="flex flex-col border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold sm:text-lg">
            Fee & Tuition Summary
          </CardTitle>
          <CardDescription>
            Semester billing status, invoice dues, and receipts
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-5">
        {/* Metric summary */}
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-center sm:p-4">
          <div className="space-y-0.5">
            <span className="text-xs text-muted-foreground">Total Fee</span>
            <p className="text-sm font-bold text-foreground sm:text-base">
              ৳{total.toLocaleString()}
            </p>
          </div>

          <div className="space-y-0.5 border-x border-border/60">
            <span className="text-xs text-muted-foreground">Total Paid</span>
            <p className="text-sm font-bold text-emerald-600 sm:text-base dark:text-emerald-400">
              ৳{paid.toLocaleString()}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs text-muted-foreground">Due Balance</span>
            <p className="text-sm font-bold text-destructive sm:text-base">
              ৳{pending.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payment progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Payment Completion</span>
            <span className="font-medium text-foreground">
              {paidPercentage}% Cleared
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>

        {/* Invoices list */}
        {items.length > 0 ? (
          <div className="space-y-2.5">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Receipt className="size-3.5 text-primary" />
              Recent Invoices
            </h4>

            <div className="space-y-2">
              {items.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-2 rounded-lg border border-border/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {invoice.invoiceNo}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {invoice.title}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Due: {invoice.dueDate}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="font-semibold text-foreground text-sm">
                      ৳{invoice.amount.toLocaleString()}
                    </span>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Recent payments */}
        {recentPayments.length > 0 ? (
          <div className="space-y-2.5">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Wallet className="size-3.5 text-primary" />
              Recent Payment Transactions
            </h4>

            <div className="space-y-2">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <CreditCard className="size-3.5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {payment.invoiceNo}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {payment.date} • {payment.method}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 font-semibold text-emerald-600 dark:text-emerald-400">
                    +৳{payment.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <Button variant="outline" className="w-full text-xs">
          <Receipt className="mr-2 size-3.5" />
          View All Invoices & Receipts
        </Button>
      </CardContent>
    </Card>
  );
}
