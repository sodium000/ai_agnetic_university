import type { Metadata } from "next";
import { AdminCoursesView } from "@/components/admin/courses/admin-courses-view";

export const metadata: Metadata = {
  title: "Course Catalog | University Admin",
  description: "Manage curriculum courses, credits, syllabus, and program affiliations.",
};

export default function AdminCoursesPage() {
  return <AdminCoursesView />;
}
