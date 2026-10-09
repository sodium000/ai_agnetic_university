import type { Metadata } from "next";
import { AdminStudentsView } from "@/components/admin/students/admin-students-view";

export const metadata: Metadata = {
  title: "Student Management | University Admin",
  description: "Manage student accounts, registrations, academic records, and status.",
};

export default function AdminStudentsPage() {
  return <AdminStudentsView />;
}
