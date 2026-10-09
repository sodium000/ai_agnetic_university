import type { Metadata } from "next";
import { AdminSectionsView } from "@/components/admin/sections/admin-sections-view";

export const metadata: Metadata = {
  title: "Course Sections | University Admin",
  description: "Manage class cohorts, faculty assignments, classrooms, and weekly schedules.",
};

export default function AdminSectionsPage() {
  return <AdminSectionsView />;
}
