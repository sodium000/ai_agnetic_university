import type { Metadata } from "next";
import { AdminEnrollmentsView } from "@/components/admin/enrollments/admin-enrollments-view";

export const metadata: Metadata = {
  title: "Enrollments | University Admin",
  description: "System-wide student enrollments, registration logs, and force registration.",
};

export default function AdminEnrollmentsPage() {
  return <AdminEnrollmentsView />;
}
