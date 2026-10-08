import type { Metadata } from "next";
import { FacultyDashboard } from "@/components/faculty/dashboard/faculty-dashboard";

export const metadata: Metadata = {
  title: "Faculty Dashboard | University Management System",
  description: "Overview of your teaching assignments, sections, students, and academic tasks.",
};

export default function FacultyDashboardPage() {
  return <FacultyDashboard />;
}
