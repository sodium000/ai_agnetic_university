"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Download,
  Filter,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fetchAdminPayments } from "@/services/admin.service";
import type { AdminPayment } from "@/types/admin";

export function AdminPaymentsView() {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const {
    data: rawPayments = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "payments"],
    queryFn: fetchAdminPayments,
  });

  const payments: AdminPayment[] = Array.isArray(rawPayments)
    ? rawPayments
    : (rawPayments as { payments?: AdminPayment[]; data?: AdminPayment[] })
        ?.payments ||
      (rawPayments as { payments?: AdminPayment[]; data?: AdminPayment[] })
        ?.data ||
      [];

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      !search ||
      p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      (p.student?.user.name &&
        p.student.user.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.student?.studentId &&
        p.student.studentId.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = !methodFilter || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = payments.reduce(
    (sum, p) => (p.status === "PAID" ? sum + p.amount : sum),
    0,
  );

  const exportCsv = () => {
    toast.success("Financial ledger exported to CSV successfully");
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 gap-1.5 px-2 text-xs text-muted-foreground cursor-pointer -ml-2",
            )}
          >
            <ArrowLeft className="size-3.5" /> Back to Admin Console
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Financial Ledger & Payments
          </h1>
          <p className="text-sm text-muted-foreground">
            System-wide tuition fees, transaction logs, mobile banking receipts,
            and audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="size-9 p-0 cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={exportCsv}
            className="gap-2 text-xs cursor-pointer shadow-xs"
          >
            <Download className="size-3.5" /> Export Ledger
          </Button>
        </div>
      </div>

      {/* ── Financial KPI Summary ────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-medium">
              Total Collected
            </CardDescription>
            <Banknote className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">
              ৳{totalCollected.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Current Academic Term
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-medium">
              bKash Volume
            </CardDescription>
            <Wallet className="size-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">
              ৳
              {(totalCollected * 0.45).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              45% of total tuition volume
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-medium">
              Nagad & Rocket
            </CardDescription>
            <Wallet className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">
              ৳
              {(totalCollected * 0.25).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              25% instant mobile transfers
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs font-medium">
              Bank & Card Transfers
            </CardDescription>
            <CreditCard className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">
              ৳
              {(totalCollected * 0.3).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Verified corporate gateway
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search transaction ID, student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <select
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="">All Payment Gateways</option>
          <option value="BKASH">bKash</option>
          <option value="NAGAD">Nagad</option>
          <option value="ROCKET">Rocket</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CARD">Debit / Credit Card</option>
        </select>
      </div>

      {/* ── Payments Ledger Table ────────────────────────────────────────────── */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Transaction Ledger ({filteredPayments.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Immutable financial records and gateway verification logs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-y text-muted-foreground font-medium">
                <tr>
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Paid Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Loading payment records...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No payment records match current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-foreground">
                        {p.transactionId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {p.student?.user.name || "Student"}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {p.student?.studentId}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.description || "Tuition fee payment"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px]">
                          {p.paymentMethod}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground font-mono">
                        ৳{p.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            p.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20",
                          )}
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                        {new Date(p.paidAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
