import type { Metadata } from "next";
import { AdminFacultyView } from "@/components/admin/faculty/admin-faculty-view";

export const metadata: Metadata = {
  title: "Faculty Management | University Admin",
  description: "Manage academic faculty, designations, departments, and teaching appointments.",
};

export default function AdminFacultyPage() {
  return <AdminFacultyView />;
}
