import type { Metadata } from "next";
import { AdminPaymentsView } from "@/components/admin/payments/admin-payments-view";

export const metadata: Metadata = {
  title: "Payments & Financials | University Admin",
  description: "System-wide tuition revenue, receipts, payment gateways, and accounting ledger.",
};

export default function AdminPaymentsPage() {
  return <AdminPaymentsView />;
}
