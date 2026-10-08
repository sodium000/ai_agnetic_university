import type { Metadata } from "next";
import { StudentPaymentsView } from "@/components/student/payments/student-payments-view";

export const metadata: Metadata = {
  title: "Billing & Tuition Payments | Student Dashboard",
  description:
    "View semester invoices, pay fees securely via Stripe checkout, and track payment receipts.",
};

export default function StudentPaymentsPage() {
  return <StudentPaymentsView />;
}
