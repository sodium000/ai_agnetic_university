import type { Metadata } from "next";
import { AdminSemestersView } from "@/components/admin/semesters/admin-semesters-view";

export const metadata: Metadata = {
  title: "Semesters & Terms | University Admin",
  description: "Manage academic semesters, terms, schedules, and active statuses.",
};

export default function AdminSemestersPage() {
  return <AdminSemestersView />;
}
