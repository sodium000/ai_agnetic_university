import type { Metadata } from "next";
import { AdminReportsView } from "@/components/admin/reports/admin-reports-view";

export const metadata: Metadata = {
  title: "Reports & Audits | University Admin",
  description: "Generate and inspect system-wide academic and financial reports.",
};

export default function AdminReportsPage() {
  return <AdminReportsView />;
}
