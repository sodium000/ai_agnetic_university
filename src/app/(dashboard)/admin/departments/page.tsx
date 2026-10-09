import type { Metadata } from "next";
import { AdminDepartmentsView } from "@/components/admin/departments/admin-departments-view";

export const metadata: Metadata = {
  title: "Departments | University Admin",
  description: "Academic departments, codes, and institutional school units.",
};

export default function AdminDepartmentsPage() {
  return <AdminDepartmentsView />;
}
