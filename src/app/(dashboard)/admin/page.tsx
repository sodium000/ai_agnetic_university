import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/dashboard/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Console | University Management System",
  description: "System-wide administrative dashboard, metrics, and academic institutional controls.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
